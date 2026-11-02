-- JDV Marketplace Buyer Protection v2
-- Review-only migration. Do not apply to remote Supabase without explicit approval.

create table if not exists public.marketplace_safety_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid references public.marketplace_listings(id) on delete set null,
  seller_id uuid references public.marketplace_sellers(id) on delete set null,
  order_id uuid references public.marketplace_orders(id) on delete set null,
  report_type text not null check (report_type in (
    'counterfeit','misleading_listing','suspected_scam','seller_behavior',
    'unsafe_product','delivery_problem','order_dispute','other'
  )),
  details text not null check (char_length(trim(details)) between 30 and 5000),
  evidence_reference text,
  status text not null default 'received'
    check (status in ('received','triage','investigating','action_taken','closed','rejected')),
  severity text not null default 'normal'
    check (severity in ('normal','high','critical')),
  resolution_note text,
  assigned_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_safety_report_target check (
    listing_id is not null or seller_id is not null or order_id is not null
  )
);

create index if not exists idx_marketplace_safety_reports_reporter
  on public.marketplace_safety_reports(reporter_user_id, created_at desc);
create index if not exists idx_marketplace_safety_reports_status
  on public.marketplace_safety_reports(status, severity, created_at desc);
create index if not exists idx_marketplace_safety_reports_seller
  on public.marketplace_safety_reports(seller_id, created_at desc);
create index if not exists idx_marketplace_safety_reports_order
  on public.marketplace_safety_reports(order_id) where order_id is not null;

alter table public.marketplace_safety_reports enable row level security;

drop policy if exists marketplace_safety_reports_insert_own
  on public.marketplace_safety_reports;
create policy marketplace_safety_reports_insert_own
  on public.marketplace_safety_reports
  for insert to authenticated
  with check (
    reporter_user_id = (select auth.uid())
    and status = 'received'
    and severity = 'normal'
    and resolution_note is null
    and assigned_at is null
    and resolved_at is null
    and (
      order_id is null
      or exists (
        select 1 from public.marketplace_orders o
        where o.id = order_id and o.buyer_id = (select auth.uid())
      )
    )
    and (
      listing_id is null
      or seller_id is null
      or exists (
        select 1 from public.marketplace_listings l
        where l.id = listing_id and l.seller_id = seller_id
      )
    )
    and (
      seller_id is null
      or exists (select 1 from public.marketplace_sellers s where s.id = seller_id)
    )
    and (
      report_type <> 'order_dispute'
      or (order_id is not null and exists (
        select 1 from public.marketplace_orders o
        where o.id = order_id and o.buyer_id = (select auth.uid())
      ))
    )
  );

drop policy if exists marketplace_safety_reports_read_own
  on public.marketplace_safety_reports;
create policy marketplace_safety_reports_read_own
  on public.marketplace_safety_reports
  for select to authenticated
  using (
    reporter_user_id = (select auth.uid())
    or exists (
      select 1 from public.marketplace_sellers s
      where s.id = seller_id and s.user_id = (select auth.uid())
    )
  );

-- No client UPDATE/DELETE policy: moderation status and resolution are server/admin controlled.
comment on table public.marketplace_safety_reports is
  'Private buyer/seller safety reports and order disputes. Client users can submit and read relevant reports only; moderation is server controlled.';

-- Repair v1 KYC insert policy: allow the server trigger to persist an expired
-- identity as rejected, while preventing clients from inventing rejection reasons.
drop policy if exists marketplace_seller_kyc_submit_own
  on public.marketplace_seller_kyc_documents;
create policy marketplace_seller_kyc_submit_own
  on public.marketplace_seller_kyc_documents
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and quality_status = 'pending'
    and analyzed_at is null
    and exists (
      select 1 from public.marketplace_sellers s
      where s.id = seller_id and s.user_id = (select auth.uid())
    )
    and (
      (
        document_status = 'submitted'
        and rejection_reason is null
        and (
          document_type = 'business_registration'
          or (document_type in ('national_id','passport','drivers_license','residence_permit')
              and expires_at >= current_date)
        )
      )
      or
      (
        document_status = 'rejected'
        and document_type in ('national_id','passport','drivers_license','residence_permit')
        and (
          (expires_at is null and rejection_reason = 'EXPIRY_DATE_MISSING')
          or (expires_at < current_date and rejection_reason = 'DOCUMENT_EXPIRED')
        )
      )
    )
  );
