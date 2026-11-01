-- JDV PAY — public receipt verification tokens.
-- Apply only after reviewing the migration and confirming pgcrypto availability.
-- This file is NOT executed against Supabase by this commit.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.pay_receipt_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.wallet_transactions(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists pay_receipt_verification_tokens_transaction_idx
  on public.pay_receipt_verification_tokens(transaction_id, created_at desc);
create index if not exists pay_receipt_verification_tokens_expiry_idx
  on public.pay_receipt_verification_tokens(expires_at);

alter table public.pay_receipt_verification_tokens enable row level security;
revoke all on public.pay_receipt_verification_tokens from anon, authenticated;
grant select, insert, update, delete on public.pay_receipt_verification_tokens to service_role;

-- Issue/renew: authenticated owner only; only completed transactions.
-- The raw token is returned once and must never be logged or persisted by the client.
create or replace function public.jdv_pay_issue_receipt_verification_token(p_transaction_id uuid)
returns table(token text, expires_at timestamptz)
language plpgsql
security definer
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

-- Public verification: opaque token only; never accepts transaction UUID/reference as credential.
-- Status is read live, so refunds/cancellations invalidate the receipt's positive status.
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
security definer
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

revoke all on function public.jdv_pay_verify_receipt_token(text) from public;
grant execute on function public.jdv_pay_verify_receipt_token(text) to anon, authenticated;

comment on table public.pay_receipt_verification_tokens is
  'JDV PAY opaque receipt verification credentials; stores SHA-256 token hashes only.';
