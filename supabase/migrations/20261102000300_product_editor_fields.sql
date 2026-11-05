-- Bengalot — product editor fields for the rebuilt product page.
--
-- These columns are additive and safe for existing products. The storefront
-- hides any storytelling block when its field is empty, so legacy rows keep
-- working without a backfill.
--
-- `product_images` stores ordered image URLs per color. The current demo
-- storefront uses generated product illustrations; when the media library is
-- connected these rows become the real gallery source.

begin;

alter table public.products
  add column if not exists collection_slug text,
  add column if not exists collection_note text,
  add column if not exists highlights jsonb not null default '[]'::jsonb,
  add column if not exists material_lines jsonb not null default '[]'::jsonb,
  add column if not exists care_lines jsonb not null default '[]'::jsonb,
  add column if not exists fit_note text;

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  color_name text,
  url text not null,
  alt text,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_images_product_sort_idx
  on public.product_images (product_slug, color_name, sort);

create or replace function public.bengalot_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists product_images_set_updated_at on public.product_images;
create trigger product_images_set_updated_at
  before update on public.product_images
  for each row execute function public.bengalot_set_updated_at();

alter table public.product_images enable row level security;

drop policy if exists "Product images are public" on public.product_images;
create policy "Product images are public"
  on public.product_images for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images"
  on public.product_images for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

commit;
