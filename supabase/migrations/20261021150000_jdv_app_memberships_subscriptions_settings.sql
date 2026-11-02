-- JDV Marketplace: isolated application membership foundation.
-- Deliberately limited to Marketplace; no other branch tables or policies are changed.
-- Review and apply separately through the approved Supabase migration workflow.

begin;

create table if not exists public.app_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  app_key text not null check (app_key ~ '^[a-z][a-z0-9_]{1,63}$'),
  status text not null default 'active' check (status in ('active','suspended','revoked')),
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, app_key)
);

create index if not exists app_memberships_user_app_idx
  on public.app_memberships(user_id, app_key, status);

alter table public.app_memberships enable row level security;
grant select on public.app_memberships to authenticated;

drop policy if exists "Users can read their own app memberships" on public.app_memberships;
create policy "Users can read their own app memberships"
  on public.app_memberships for select to authenticated
  using (user_id = (select auth.uid()));

-- Signup only enrolls the application explicitly selected by the signup form.
-- The metadata value is validated against a strict allow-list.
create or replace function public.jdv_create_app_membership_on_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_app_key text;
begin
  v_app_key := coalesce(new.raw_user_meta_data ->> 'jdv_app_key', 'global_center');
  if v_app_key not in (
    'global_center', 'marketplace', 'agriculture', 'immo', 'health', 'academy',
    'social', 'media', 'pub', 'pay', 'tontine', 'travel', 'transport',
    'insurance', 'legal', 'energy', 'ai', 'business', 'transit', 'services',
    'procurement', 'accounting', 'inventory', 'hr', 'jobs', 'entertainment'
  ) then
    raise exception 'Unsupported JDV application key';
  end if;

  insert into public.app_memberships (user_id, app_key, status, role)
  values (new.id, v_app_key, 'active', 'member')
  on conflict (user_id, app_key) do nothing;

  return new;
end;
$$;

revoke all on function public.jdv_create_app_membership_on_signup() from public;
drop trigger if exists jdv_create_app_membership_after_signup on auth.users;
create trigger jdv_create_app_membership_after_signup
  after insert on auth.users
  for each row execute function public.jdv_create_app_membership_on_signup();

-- Existing authenticated users can explicitly join Marketplace. This RPC does
-- not grant membership in any other JDV application or create a paid subscription.
create or replace function public.jdv_join_application(p_app_key text)
returns public.app_memberships
language plpgsql
security definer
set search_path = ''
as $join$
declare
  v_user_id uuid := auth.uid();
  v_membership public.app_memberships;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_app_key not in (
    'global_center', 'marketplace', 'agriculture', 'immo', 'health', 'academy',
    'social', 'media', 'pub', 'pay', 'tontine', 'travel', 'transport',
    'insurance', 'legal', 'energy', 'ai', 'business', 'transit', 'services',
    'procurement', 'accounting', 'inventory', 'hr', 'jobs', 'entertainment'
  ) then
    raise exception 'Unsupported JDV application key';
  end if;

  insert into public.app_memberships (user_id, app_key, status, role)
  values (v_user_id, p_app_key, 'active', 'member')
  on conflict (user_id, app_key) do nothing;

  select * into v_membership
  from public.app_memberships
  where user_id = v_user_id and app_key = p_app_key;

  if v_membership.status <> 'active' then
    raise exception 'Application membership is not active';
  end if;
  return v_membership;
end;
$join$;

revoke all on function public.jdv_join_application(text) from public;
grant execute on function public.jdv_join_application(text) to authenticated;

-- Preserve the existing ownership policies; these restrictive policies add
-- the independent Marketplace enrollment requirement for seller operations.
do $marketplace_membership$
declare
  v_table text;
begin
  foreach v_table in array array['marketplace_sellers','marketplace_listings'] loop
    if to_regclass('public.' || v_table) is not null then
      execute format('drop policy if exists jdv_marketplace_membership_required on public.%I', v_table);
      execute format(
        'create policy jdv_marketplace_membership_required on public.%I as restrictive for all to authenticated using (public.is_super_admin() or exists (select 1 from public.app_memberships m where m.user_id = (select auth.uid()) and m.app_key = ''marketplace'' and m.status = ''active'')) with check (public.is_super_admin() or exists (select 1 from public.app_memberships m where m.user_id = (select auth.uid()) and m.app_key = ''marketplace'' and m.status = ''active''))',
        v_table
      );
    end if;
  end loop;
end;
$marketplace_membership$;

-- Guard order creation even when invoked through a SECURITY DEFINER RPC.
create or replace function public.jdv_require_marketplace_membership_for_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $order_guard$
begin
  if current_setting('request.jwt.claim.role', true) = 'service_role' then
    return new;
  end if;
  if auth.uid() is null or (
    not public.is_super_admin()
    and not exists (
      select 1 from public.app_memberships m
      where m.user_id = auth.uid()
        and m.app_key = 'marketplace'
        and m.status = 'active'
    )
  ) then
    raise exception 'JDV_MARKETPLACE_MEMBERSHIP_REQUIRED';
  end if;
  return new;
end;
$order_guard$;

revoke all on function public.jdv_require_marketplace_membership_for_order() from public;
drop trigger if exists jdv_marketplace_order_membership_required on public.marketplace_orders;
create trigger jdv_marketplace_order_membership_required
  before insert on public.marketplace_orders
  for each row execute function public.jdv_require_marketplace_membership_for_order();

commit;
