-- JDV Marketplace Trust & Safety v1
-- This migration is committed for review only. It is NOT applied to the remote Supabase project.

create table if not exists public.marketplace_seller_kyc_documents (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.marketplace_sellers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null check (document_type in ('national_id','passport','drivers_license','residence_permit','business_registration')),
  storage_path text not null,
  document_number_last4 text,
  issued_at date,
  expires_at date,
  document_status text not null default 'submitted'
    check (document_status in ('submitted','analyzing','accepted','rejected','review_required')),
  quality_status text not null default 'pending'
    check (quality_status in ('pending','readable','unreadable','unclear','tampered_suspected')),
  rejection_reason text,
  ai_analysis jsonb not null default '{}'::jsonb,
  analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_kyc_storage_path_owner check (storage_path like user_id::text || '/%')
);

create index if not exists idx_marketplace_seller_kyc_user on public.marketplace_seller_kyc_documents(user_id, created_at desc);
create index if not exists idx_marketplace_seller_kyc_status on public.marketplace_seller_kyc_documents(document_status, expires_at);

alter table public.marketplace_seller_kyc_documents enable row level security;
drop policy if exists marketplace_seller_kyc_read_own on public.marketplace_seller_kyc_documents;
create policy marketplace_seller_kyc_read_own on public.marketplace_seller_kyc_documents
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists marketplace_seller_kyc_submit_own on public.marketplace_seller_kyc_documents;
create policy marketplace_seller_kyc_submit_own on public.marketplace_seller_kyc_documents
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and document_status = 'submitted'
    and quality_status = 'pending'
    and analyzed_at is null
    and rejection_reason is null
    and exists (
      select 1 from public.marketplace_sellers s
      where s.id = seller_id and s.user_id = (select auth.uid())
    )
  );

create or replace function public.marketplace_enforce_kyc_document_rules()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();

  -- Expired identity documents are rejected automatically, without waiting for AI review.
  if new.document_type in ('national_id','passport','drivers_license','residence_permit')
     and (new.expires_at is null or new.expires_at < current_date) then
    new.document_status := 'rejected';
    new.rejection_reason := case
      when new.expires_at is null then 'EXPIRY_DATE_MISSING'
      else 'DOCUMENT_EXPIRED'
    end;
  elsif new.quality_status in ('unreadable','unclear') then
    new.document_status := 'rejected';
    new.rejection_reason := case
      when new.quality_status = 'unreadable' then 'DOCUMENT_UNREADABLE'
      else 'DOCUMENT_UNCLEAR'
    end;
  elsif new.quality_status = 'tampered_suspected' then
    new.document_status := 'review_required';
    new.rejection_reason := 'POSSIBLE_DOCUMENT_TAMPERING';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_marketplace_enforce_kyc_document_rules on public.marketplace_seller_kyc_documents;
create trigger trg_marketplace_enforce_kyc_document_rules
before insert or update on public.marketplace_seller_kyc_documents
for each row execute function public.marketplace_enforce_kyc_document_rules();

create table if not exists public.marketplace_product_traceability (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null unique references public.marketplace_listings(id) on delete cascade,
  seller_id uuid not null references public.marketplace_sellers(id) on delete cascade,
  origin_country_id uuid references public.countries(id),
  manufacturer_name text,
  supplier_name text,
  source_type text not null default 'reseller'
    check (source_type in ('manufacturer','authorized_distributor','importer','reseller','artisan','other')),
  serial_number text,
  batch_number text,
  invoice_storage_path text,
  certificate_storage_path text,
  warranty_details text,
  seller_declaration boolean not null default false,
  verification_status text not null default 'submitted'
    check (verification_status in ('submitted','analyzing','verified','rejected','review_required')),
  verification_notes text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_marketplace_traceability_seller on public.marketplace_product_traceability(seller_id, created_at desc);
create index if not exists idx_marketplace_traceability_serial on public.marketplace_product_traceability(serial_number) where serial_number is not null;
create index if not exists idx_marketplace_traceability_batch on public.marketplace_product_traceability(batch_number) where batch_number is not null;

alter table public.marketplace_product_traceability enable row level security;
drop policy if exists marketplace_traceability_read_published on public.marketplace_product_traceability;
create policy marketplace_traceability_read_published on public.marketplace_product_traceability
  for select to anon, authenticated using (
    verification_status = 'verified'
    and exists (select 1 from public.marketplace_listings l where l.id = listing_id and l.listing_status::text = 'published')
  );
drop policy if exists marketplace_traceability_read_own on public.marketplace_product_traceability;
create policy marketplace_traceability_read_own on public.marketplace_product_traceability
  for select to authenticated using (
    exists (select 1 from public.marketplace_sellers s where s.id = seller_id and s.user_id = (select auth.uid()))
  );
drop policy if exists marketplace_traceability_insert_own on public.marketplace_product_traceability;
create policy marketplace_traceability_insert_own on public.marketplace_product_traceability
  for insert to authenticated with check (
    verification_status = 'submitted'
    and verified_at is null
    and exists (select 1 from public.marketplace_sellers s where s.id = seller_id and s.user_id = (select auth.uid()))
    and exists (select 1 from public.marketplace_listings l where l.id = listing_id and l.seller_id = seller_id)
  );
drop policy if exists marketplace_traceability_update_own on public.marketplace_product_traceability;
create policy marketplace_traceability_update_own on public.marketplace_product_traceability
  for update to authenticated using (
    verification_status in ('submitted','rejected')
    and exists (select 1 from public.marketplace_sellers s where s.id = seller_id and s.user_id = (select auth.uid()))
  ) with check (
    verification_status = 'submitted'
    and verified_at is null
    and exists (select 1 from public.marketplace_sellers s where s.id = seller_id and s.user_id = (select auth.uid()))
  );

create table if not exists public.marketplace_security_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  subject_user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  event_type text not null,
  severity text not null default 'info' check (severity in ('info','warning','high','critical')),
  reason_code text,
  details jsonb not null default '{}'::jsonb,
  source text not null default 'system',
  created_at timestamptz not null default now()
);
create index if not exists idx_marketplace_security_events_subject on public.marketplace_security_events(subject_user_id, created_at desc);
create index if not exists idx_marketplace_security_events_severity on public.marketplace_security_events(severity, created_at desc);

alter table public.marketplace_security_events enable row level security;
drop policy if exists marketplace_security_events_read_own on public.marketplace_security_events;
create policy marketplace_security_events_read_own on public.marketplace_security_events
  for select to authenticated using (subject_user_id = (select auth.uid()));
-- No client INSERT/UPDATE/DELETE policy: events must be written by trusted server-side workflows only.

comment on table public.marketplace_seller_kyc_documents is 'Private seller identity/business documents; expiry and AI quality outcomes are enforced server-side.';
comment on table public.marketplace_product_traceability is 'Seller-declared provenance and evidence for a marketplace listing; public read is limited to verified records.';
comment on table public.marketplace_security_events is 'Append-only marketplace fraud, KYC, moderation and safety audit trail.';
