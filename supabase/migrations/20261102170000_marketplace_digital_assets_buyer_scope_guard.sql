-- Restrict digital asset metadata to the owning seller or a buyer
-- with an eligible order for the exact listing. This restrictive policy
-- also guards against overly broad permissive policies already present.
begin;
create policy marketplace_digital_assets_read_scope_guard
on public.marketplace_digital_assets
as restrictive
for select
to authenticated
using (
  exists (
    select 1
    from public.marketplace_listings l
    join public.marketplace_sellers s on s.id = l.seller_id
    where l.id = marketplace_digital_assets.listing_id
      and s.user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.marketplace_order_items oi
    join public.marketplace_orders o on o.id = oi.order_id
    where oi.listing_id = marketplace_digital_assets.listing_id
      and o.buyer_id = (select auth.uid())
      and o.order_status in ('paid','confirmed','preparing','ready','in_transit','delivered')
  )
);
commit;
