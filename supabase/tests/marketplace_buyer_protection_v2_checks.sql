-- JDV Marketplace Buyer Protection v2 — non-destructive staging checks
-- Run only after reviewing/applying the migration on a staging database.

do $$
begin
  if to_regclass('public.marketplace_safety_reports') is null then
    raise exception 'Missing marketplace_safety_reports';
  end if;
end $$;

select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'marketplace_safety_reports';

select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'marketplace_safety_reports'
order by policyname;

-- Expected: INSERT and SELECT policies only; no client UPDATE/DELETE policies.
select count(*) as client_mutation_policies
from pg_policies
where schemaname = 'public'
  and tablename = 'marketplace_safety_reports'
  and cmd in ('UPDATE','DELETE','ALL');
