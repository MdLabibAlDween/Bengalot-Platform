-- Bengalot — complete outfits (bundles).
--
-- A bundle belongs to exactly one department and references real catalogue
-- products by slug. Stock, colors and sizes always come from the product
-- tables; the bundle only stores the composition + commercial terms.
--
-- Assumptions:
--   * `public.products` exists and has a unique `slug` column.
--   * `public.orders` / `public.order_items` exist by the time this runs;
--     the additive columns are skipped when those tables are not present yet.
--
-- The public demo catalogue currently lives in `lib/bundles.ts`. This migration
-- is the persistence layer for the admin/Supabase phase.

begin;

-- ---------------------------------------------------------------------------
-- 1. Bundles.
-- ---------------------------------------------------------------------------
create table if not exists public.bundles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_bn text,
  department text not null
    check (department in ('men', 'women', 'kids')),
  short_description text not null default '',
  description text not null default '',
  cover_art text not null default 'jacket',
  cover_palette text[] not null default array['#12101F', '#3B2B5E'],
  discount_type text not null default 'none'
    check (discount_type in ('none', 'percent', 'fixed')),
  discount_value numeric(12, 2) not null default 0
    check (discount_value >= 0),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  allow_partial_purchase boolean not null default false,
  seo_title text,
  seo_description text,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bundles_department_status_idx
  on public.bundles (department, status, sort);
create index if not exists bundles_featured_idx
  on public.bundles (featured)
  where status = 'published';

-- ---------------------------------------------------------------------------
-- 2. Bundle composition.
-- ---------------------------------------------------------------------------
create table if not exists public.bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.bundles(id) on delete cascade,
  product_slug text not null,
  quantity integer not null default 1 check (quantity > 0),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  unique (bundle_id, product_slug)
);

create index if not exists bundle_items_bundle_idx
  on public.bundle_items (bundle_id, sort);
create index if not exists bundle_items_product_idx
  on public.bundle_items (product_slug);

-- Attach the product FK only when the catalogue really exposes a unique slug.
do $$
begin
  if to_regclass('public.products') is not null
     and exists (
       select 1
       from pg_index i
       join pg_class c on c.oid = i.indrelid
       join pg_namespace n on n.oid = c.relnamespace
       join pg_attribute a
         on a.attrelid = c.oid and a.attnum = i.indkey[0]
       where n.nspname = 'public'
         and c.relname = 'products'
         and i.indisunique
         and i.indnkeyatts = 1
         and a.attname = 'slug'
     )
     and not exists (
       select 1 from pg_constraint
       where conname = 'bundle_items_product_slug_fkey'
         and conrelid = 'public.bundle_items'::regclass
     ) then
    alter table public.bundle_items
      add constraint bundle_items_product_slug_fkey
      foreign key (product_slug) references public.products(slug)
      on update cascade on delete restrict;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Order snapshots — bundles must survive later edits/deletes.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.orders') is not null then
    alter table public.orders
      add column if not exists bundle_savings numeric(12, 2) not null default 0;
  end if;

  if to_regclass('public.order_items') is not null then
    alter table public.order_items add column if not exists bundle_id uuid;
    alter table public.order_items add column if not exists bundle_name text;
    create index if not exists order_items_bundle_idx
      on public.order_items (bundle_id);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. updated_at trigger.
-- ---------------------------------------------------------------------------
create or replace function public.bengalot_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bundles_set_updated_at on public.bundles;
create trigger bundles_set_updated_at
  before update on public.bundles
  for each row execute function public.bengalot_set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. RLS: published bundles are public, admins manage.
-- ---------------------------------------------------------------------------
alter table public.bundles enable row level security;
alter table public.bundle_items enable row level security;

drop policy if exists "Published bundles are public" on public.bundles;
create policy "Published bundles are public"
  on public.bundles for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Admins manage bundles" on public.bundles;
create policy "Admins manage bundles"
  on public.bundles for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Published bundle items are public" on public.bundle_items;
create policy "Published bundle items are public"
  on public.bundle_items for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.bundles b
      where b.id = bundle_items.bundle_id
        and b.status = 'published'
    )
  );

drop policy if exists "Admins manage bundle items" on public.bundle_items;
create policy "Admins manage bundle items"
  on public.bundle_items for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- 6. Demo seed — one bundle per department, matching lib/bundles.ts.
--    Items are inserted only when the referenced product slugs exist, so this
--    migration never invents catalogue rows.
-- ---------------------------------------------------------------------------
insert into public.bundles
  (slug, name, name_bn, department, short_description, description, cover_art,
   cover_palette, discount_type, discount_value, status, featured,
   allow_partial_purchase, seo_title, seo_description, sort, created_at)
values
  (
    'men-dusk-set',
    'The Dusk Set',
    'দ্য ডাস্ক সেট',
    'men',
    'A complete evening look — an easy polo, tailored chino and a matte bomber for after dark.',
    'Built around the Dusk Bomber, this set pairs a deep-indigo polo with our tapered charcoal chino. Pick a size and color for each piece and the complete outfit arrives as one considered parcel.',
    'jacket',
    array['#12101F', '#3B2B5E'],
    'percent', 10, 'published', true, false,
    'The Dusk Set — Complete men''s outfit',
    'A complete Bengalot men''s outfit: indigo polo, charcoal tailored chino and dusk bomber. Save 10% on the complete set.',
    1, '2026-10-20'
  ),
  (
    'women-heirloom-set',
    'The Heirloom Set',
    'দ্য হেরিলুম সেট',
    'women',
    'Handloom rosewood, breezy terracotta and a silk peacock hijab — an effortless complete look.',
    'A considered everyday outfit in three parts: our rosewood handloom kurti, the wide-leg terracotta palazzo and a peacock silk hijab. Select the fit for each piece and we will send the complete set together.',
    'kurti',
    array['#3D1024', '#8A224B'],
    'fixed', 500, 'published', true, false,
    'The Heirloom Set — Complete women''s outfit',
    'A complete Bengalot women''s outfit: rosewood handloom kurti, terracotta palazzo and peacock silk hijab. Save ৳500 on the complete set.',
    2, '2026-10-22'
  ),
  (
    'kids-starlight-set',
    'The Little Starlight Set',
    'দ্য লিটল স্টারলাইট সেট',
    'kids',
    'A soft hoodie, an easy play tee and cosy nightwear — one happy little wardrobe in three pieces.',
    'Made for the days that run from playtime to bedtime. The mini Bengal hoodie layers over the junior play tee, while the starry-night set waits for the evening. Choose sizes for all three and save on the set.',
    'hoodie',
    array['#2A1020', '#7A2348'],
    'percent', 15, 'published', true, false,
    'The Little Starlight Set — Complete kids'' outfit',
    'A complete Bengalot kids'' outfit: mini Bengal hoodie, junior play tee and starry night set. Save 15% on the complete set.',
    3, '2026-10-25'
  )
on conflict (slug) do nothing;

-- Item rows are only seeded against products that are already in the catalogue.
do $$
begin
  if to_regclass('public.products') is not null then
    insert into public.bundle_items (bundle_id, product_slug, quantity, sort)
    select b.id, v.product_slug, v.quantity, v.sort
    from public.bundles b
    join (values
      ('men-dusk-set', 'indigo-polo-club', 1, 1),
      ('men-dusk-set', 'charcoal-tailored-chino', 1, 2),
      ('men-dusk-set', 'dusk-bomber-jacket', 1, 3),
      ('women-heirloom-set', 'rosewood-handloom-kurti', 1, 1),
      ('women-heirloom-set', 'terracotta-palazzo', 1, 2),
      ('women-heirloom-set', 'peacock-silk-hijab', 1, 3),
      ('kids-starlight-set', 'mini-bengal-hoodie', 1, 1),
      ('kids-starlight-set', 'junior-play-tee', 1, 2),
      ('kids-starlight-set', 'starry-night-set', 1, 3)
    ) as v(bundle_slug, product_slug, quantity, sort)
      on v.bundle_slug = b.slug
    join public.products p on p.slug = v.product_slug
    on conflict (bundle_id, product_slug) do nothing;
  end if;
end $$;

commit;
