-- Private digital delivery for JDV Marketplace.
-- This migration is intentionally isolated to Marketplace and Storage bucket policies.
begin;

create table if not exists public.marketplace_digital_assets (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists marketplace_digital_assets_listing_idx
  on public.marketplace_digital_assets(listing_id, created_at);

alter table public.marketplace_digital_assets enable row level security;
grant select, insert, delete on public.marketplace_digital_assets to authenticated;

drop policy if exists marketplace_digital_assets_seller_read on public.marketplace_digital_assets;
create policy marketplace_digital_assets_seller_read
on public.marketplace_digital_assets for select to authenticated
using (
  exists (
    select 1 from public.marketplace_listings l
    join public.marketplace_sellers s on s.id = l.seller_id
    where l.id = listing_id and s.user_id = (select auth.uid())
  )
  or exists (
    select 1 from public.marketplace_order_items oi
    join public.marketplace_orders o on o.id = oi.order_id
    where oi.listing_id = listing_id
      and o.buyer_id = (select auth.uid())
      and o.order_status in ('paid','confirmed','preparing','ready','in_transit','delivered')
  )
);

drop policy if exists marketplace_digital_assets_seller_insert on public.marketplace_digital_assets;
create policy marketplace_digital_assets_seller_insert
on public.marketplace_digital_assets for insert to authenticated
with check (
  uploaded_by = (select auth.uid())
  and exists (
    select 1 from public.marketplace_listings l
    join public.marketplace_sellers s on s.id = l.seller_id
    where l.id = listing_id and s.user_id = (select auth.uid())
      and l.is_digital = true
  )
);

drop policy if exists marketplace_digital_assets_seller_delete on public.marketplace_digital_assets;
create policy marketplace_digital_assets_seller_delete
on public.marketplace_digital_assets for delete to authenticated
using (
  exists (
    select 1 from public.marketplace_listings l
    join public.marketplace_sellers s on s.id = l.seller_id
    where l.id = listing_id and s.user_id = (select auth.uid())
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'jdv-marketplace-digital',
  'jdv-marketplace-digital',
  false,
  104857600,
  array[
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'audio/mpeg',
    'audio/mp4',
    'video/mp4',
    'video/webm'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists jdv_marketplace_digital_upload_own_listing on storage.objects;
create policy jdv_marketplace_digital_upload_own_listing
on storage.objects for insert to authenticated
with check (
  bucket_id = 'jdv-marketplace-digital'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.marketplace_listings l
    join public.marketplace_sellers s on s.id = l.seller_id
    where l.id = ((storage.foldername(name))[2])::uuid
      and s.user_id = (select auth.uid())
      and l.is_digital = true
  )
);

drop policy if exists jdv_marketplace_digital_read_entitled on storage.objects;
create policy jdv_marketplace_digital_read_entitled
on storage.objects for select to authenticated
using (
  bucket_id = 'jdv-marketplace-digital'
  and (
    (
      (storage.foldername(name))[1] = (select auth.uid())::text
      and exists (
        select 1 from public.marketplace_listings l
        join public.marketplace_sellers s on s.id = l.seller_id
        where l.id = ((storage.foldername(name))[2])::uuid
          and s.user_id = (select auth.uid())
      )
    )
    or exists (
      select 1
      from public.marketplace_digital_assets a
      join public.marketplace_order_items oi on oi.listing_id = a.listing_id
      join public.marketplace_orders o on o.id = oi.order_id
      where a.storage_path = name
        and o.buyer_id = (select auth.uid())
        and o.order_status in ('paid','confirmed','preparing','ready','in_transit','delivered')
    )
  )
);

drop policy if exists jdv_marketplace_digital_delete_own_listing on storage.objects;
create policy jdv_marketplace_digital_delete_own_listing
on storage.objects for delete to authenticated
using (
  bucket_id = 'jdv-marketplace-digital'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.marketplace_listings l
    join public.marketplace_sellers s on s.id = l.seller_id
    where l.id = ((storage.foldername(name))[2])::uuid
      and s.user_id = (select auth.uid())
  )
);

commit;
