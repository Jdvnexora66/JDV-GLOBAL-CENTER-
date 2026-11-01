-- JDV PAY — secure public receipt verification credentials.
-- pgcrypto is already installed in schema extensions on the target project.

create table if not exists public.pay_receipt_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.wallet_transactions(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint pay_receipt_token_max_lifetime check (expires_at <= created_at + interval '90 days')
);

create index if not exists pay_receipt_tokens_transaction_idx
  on public.pay_receipt_verification_tokens(transaction_id, created_at desc);
create index if not exists pay_receipt_tokens_expiry_idx
  on public.pay_receipt_verification_tokens(expires_at);

alter table public.pay_receipt_verification_tokens enable row level security;
revoke all on public.pay_receipt_verification_tokens from anon, authenticated;
grant insert (transaction_id, owner_user_id, token_hash, expires_at)
  on public.pay_receipt_verification_tokens to authenticated;
grant select on public.pay_receipt_verification_tokens to authenticated;
grant update (revoked_at) on public.pay_receipt_verification_tokens to authenticated;
grant all on public.pay_receipt_verification_tokens to service_role;

drop policy if exists pay_receipt_tokens_owner_select on public.pay_receipt_verification_tokens;
create policy pay_receipt_tokens_owner_select
  on public.pay_receipt_verification_tokens for select to authenticated
  using (owner_user_id = (select auth.uid()));

drop policy if exists pay_receipt_tokens_owner_insert on public.pay_receipt_verification_tokens;
create policy pay_receipt_tokens_owner_insert
  on public.pay_receipt_verification_tokens for insert to authenticated
  with check (
    owner_user_id = (select auth.uid())
    and exists (
      select 1
      from public.wallet_transactions wt
      join public.wallets w on w.id = wt.wallet_id
      where wt.id = transaction_id
        and w.user_id = (select auth.uid())
        and wt.transaction_status::text = 'completed'
    )
    and expires_at > now()
    and expires_at <= now() + interval '90 days'
  );

drop policy if exists pay_receipt_tokens_owner_update on public.pay_receipt_verification_tokens;
create policy pay_receipt_tokens_owner_update
  on public.pay_receipt_verification_tokens for update to authenticated
  using (owner_user_id = (select auth.uid()))
  with check (owner_user_id = (select auth.uid()));

-- Prevent owners from changing token identity, hash, transaction or expiry after issuance.
create or replace function public.jdv_pay_guard_receipt_token_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id
    or new.transaction_id is distinct from old.transaction_id
    or new.owner_user_id is distinct from old.owner_user_id
    or new.token_hash is distinct from old.token_hash
    or new.expires_at is distinct from old.expires_at
    or new.created_at is distinct from old.created_at then
    raise exception 'Les caractéristiques du jeton ne sont pas modifiables';
  end if;
  if old.revoked_at is not null and new.revoked_at is distinct from old.revoked_at then
    raise exception 'Un jeton révoqué ne peut pas être réactivé';
  end if;
  return new;
end;
$$;

revoke all on function public.jdv_pay_guard_receipt_token_update() from public, anon, authenticated;
drop trigger if exists jdv_pay_guard_receipt_token_update on public.pay_receipt_verification_tokens;
create trigger jdv_pay_guard_receipt_token_update
  before update on public.pay_receipt_verification_tokens
  for each row execute function public.jdv_pay_guard_receipt_token_update();

-- Authenticated caller can issue only for their own completed wallet transaction.
-- RLS validates owner and status; token table privileges permit only the required operations.
create or replace function public.jdv_pay_issue_receipt_verification_token(p_transaction_id uuid)
returns table(token text, expires_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_token text;
  v_expires_at timestamptz := now() + interval '90 days';
begin
  if v_user_id is null then
    raise exception 'Authentification requise' using errcode = '28000';
  end if;

  if not exists (
    select 1
    from public.wallet_transactions wt
    join public.wallets w on w.id = wt.wallet_id
    where wt.id = p_transaction_id
      and w.user_id = v_user_id
      and wt.transaction_status::text = 'completed'
  ) then
    raise exception 'Transaction introuvable ou non éligible' using errcode = '42501';
  end if;

  update public.pay_receipt_verification_tokens
    set revoked_at = now()
    where transaction_id = p_transaction_id
      and owner_user_id = v_user_id
      and revoked_at is null;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.pay_receipt_verification_tokens
    (transaction_id, owner_user_id, token_hash, expires_at)
  values
    (p_transaction_id, v_user_id, encode(extensions.digest(v_token, 'sha256'), 'hex'), v_expires_at);

  return query select v_token, v_expires_at;
end;
$$;

-- Public verification is deliberately callable only by the server's service-role client.
create or replace function public.jdv_pay_verify_receipt_token(p_token text)
returns table(
  is_valid boolean,
  public_reference text,
  transaction_date timestamptz,
  amount numeric,
  currency_code text,
  transaction_status text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    (t.revoked_at is null and t.expires_at > now() and wt.transaction_status::text = 'completed') as is_valid,
    wt.reference as public_reference,
    wt.created_at as transaction_date,
    wt.amount,
    c.code as currency_code,
    wt.transaction_status::text as transaction_status
  from public.pay_receipt_verification_tokens t
  join public.wallet_transactions wt on wt.id = t.transaction_id
  join public.currencies c on c.id = wt.currency_id
  where p_token is not null
    and length(p_token) = 64
    and t.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  limit 1;
$$;

revoke all on function public.jdv_pay_issue_receipt_verification_token(uuid) from public, anon;
grant execute on function public.jdv_pay_issue_receipt_verification_token(uuid) to authenticated;
revoke all on function public.jdv_pay_verify_receipt_token(text) from public, anon, authenticated;
grant execute on function public.jdv_pay_verify_receipt_token(text) to service_role;
revoke all on function public.jdv_pay_guard_receipt_token_update() from public, anon, authenticated;

comment on table public.pay_receipt_verification_tokens is
  'JDV PAY opaque receipt verification credentials; stores SHA-256 token hashes only.';
