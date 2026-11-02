-- JDV Marketplace Trust & Safety v1 — non-destructive verification queries
-- Run only after the migration is reviewed and applied to a staging database.
-- These checks do not create or modify business data.

do $$
begin
  if to_regclass('public.marketplace_seller_kyc_documents') is null then
    raise exception 'Missing marketplace_seller_kyc_documents';
  end if;
  if to_regclass('public.marketplace_product_traceability') is null then
    raise exception 'Missing marketplace_product_traceability';
  end if;
  if to_regclass('public.marketplace_security_events') is null then
    raise exception 'Missing marketplace_security_events';
  end if;
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_marketplace_enforce_kyc_document_rules'
      and not tgisinternal
  ) then
    raise exception 'Missing KYC document enforcement trigger';
  end if;
end $$;

-- Confirm that all three tables have RLS enabled.
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'marketplace_seller_kyc_documents',
    'marketplace_product_traceability',
    'marketplace_security_events'
  )
order by c.relname;

-- Review effective policies. Security events must have no client write policies.
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in (
    'marketplace_seller_kyc_documents',
    'marketplace_product_traceability',
    'marketplace_security_events'
  )
order by tablename, policyname;

-- Confirm that no public/anonymous policy can read seller identity documents.
select count(*) as public_identity_document_read_policies
from pg_policies
where schemaname = 'public'
  and tablename = 'marketplace_seller_kyc_documents'
  and 'anon' = any(roles)
  and cmd in ('SELECT', 'ALL');
