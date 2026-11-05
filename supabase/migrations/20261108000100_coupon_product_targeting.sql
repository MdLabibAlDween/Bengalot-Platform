-- Coupon product targeting. An empty product_slugs array means the coupon
-- applies to the whole catalogue; a non-empty array limits it to those products.

alter table public.coupons
  add column if not exists product_slugs text[] not null default '{}'::text[];

create index if not exists coupons_product_slugs_idx
  on public.coupons using gin (product_slugs);
