-- Bengalot — curated groups are now "Collections".
--
-- This migration is safe to run against:
--   * a database that still has the legacy `edits` / `edit_products` tables, or
--   * a fresh database where no curated-group tables exist yet.
--
-- It keeps the legacy rows, renames the tables, and adds any missing columns used
-- by the storefront collections. Product associations are stored by product slug;
-- the existing catalogue schema may use a different key, in which case only the
-- join table's key column needs adapting.
--
-- Assumes both legacy and new tables use `uuid` primary keys. If the legacy
-- `edits` table used a bigint/serial key, keep its existing join table as-is
-- instead of creating `collection_products` with a uuid FK.

begin;

-- ---------------------------------------------------------------------------
-- 1. Rename legacy tables (only when the new name is still free).
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.edits') is not null
     and to_regclass('public.collections') is null then
    alter table public.edits rename to collections;
  end if;
end $$;

do $$
begin
  if to_regclass('public.edit_products') is not null
     and to_regclass('public.collection_products') is null then
    alter table public.edit_products rename to collection_products;
  end if;
end $$;

-- If a legacy join table used `edit_id`, bring it in line with the new name.
do $$
begin
  if to_regclass('public.collection_products') is not null
     and exists (
       select 1 from information_schema.columns
       where table_schema = 'public'
         and table_name = 'collection_products'
         and column_name = 'edit_id'
     )
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public'
         and table_name = 'collection_products'
         and column_name = 'collection_id'
     ) then
    alter table public.collection_products rename column edit_id to collection_id;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Collections table (created only when there was no legacy table).
-- ---------------------------------------------------------------------------
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  eyebrow text,
  description text,
  palette text[] not null default array['#072F2D', '#0E8F8A'],
  note text,
  closing_title text,
  closing_text text,
  meta_title text,
  meta_description text,
  status text not null default 'published'
    check (status in ('draft', 'published', 'archived')),
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Normalise columns when the table came from the legacy `edits` rename.
alter table public.collections add column if not exists slug text;
alter table public.collections add column if not exists title text not null default '';
alter table public.collections add column if not exists eyebrow text;
alter table public.collections add column if not exists description text;
alter table public.collections add column if not exists palette text[] not null default array['#072F2D', '#0E8F8A'];
alter table public.collections add column if not exists note text;
alter table public.collections add column if not exists closing_title text;
alter table public.collections add column if not exists closing_text text;
alter table public.collections add column if not exists meta_title text;
alter table public.collections add column if not exists meta_description text;
alter table public.collections add column if not exists status text not null default 'published';
alter table public.collections add column if not exists sort integer not null default 0;
alter table public.collections add column if not exists created_at timestamptz not null default now();
alter table public.collections add column if not exists updated_at timestamptz not null default now();

create unique index if not exists collections_slug_key
  on public.collections (slug);
create index if not exists collections_status_sort_idx
  on public.collections (status, sort);

-- ---------------------------------------------------------------------------
-- 3. Collection ↔ product join.
-- ---------------------------------------------------------------------------
create table if not exists public.collection_products (
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_slug text not null,
  sort integer not null default 0,
  primary key (collection_id, product_slug)
);

create index if not exists collection_products_collection_idx
  on public.collection_products (collection_id, sort);
create index if not exists collection_products_product_idx
  on public.collection_products (product_slug);

-- ---------------------------------------------------------------------------
-- 4. Seed the five storefront collections (no product rows are guessed here;
--    existing admin data / the catalogue seed will populate the join table).
-- ---------------------------------------------------------------------------
insert into public.collections
  (slug, title, eyebrow, description, palette, note, closing_title, closing_text,
   meta_title, meta_description, status, sort)
values
  (
    'new-arrivals',
    'The New Arrivals',
    'Just landed',
    'The freshest pieces from the atelier — small runs, honest fabrics and the kind of details you notice later.',
    array['#072F2D', '#0E8F8A'],
    'Updated this week',
    'Newness, without the noise.',
    'We add a small collection most weeks rather than a season at once.',
    'New Arrivals — The latest from the atelier',
    'The newest pieces from Bengalot, added every Friday.',
    'published', 1
  ),
  (
    'best-sellers',
    'The Selected',
    'Selected pieces',
    'A cross-section of the current collection, gathered for easy browsing.',
    array['#3A2A0C', '#B9852A'],
    'Selected pieces',
    'A considered selection.',
    'A simple cross-section of pieces across departments — nothing ranked, nothing claimed.',
    'The Selected Pieces — A Bengalot edit',
    'A selected collection of Bengalot pieces across departments.',
    'published', 2
  ),
  (
    'sale',
    'The Quiet Sale',
    'The archive',
    'A few last pieces, a few last sizes. Considered reductions on small-run collections.',
    array['#3A0B20', '#B02258'],
    'Sale pieces exchange for size only',
    'A good piece is never wasted.',
    'These are the last of their runs, not a separate quality.',
    'Sale — The Bengalot archive',
    'Last pieces and quiet reductions from Bengalot.',
    'published', 3
  ),
  (
    'royal-collection',
    'The Royal Collection',
    'The Royal Collection',
    'Deep indigo, gold thread and celebration-ready silhouettes.',
    array['#140D32', '#4A35B8'],
    'Festive pieces · small runs',
    'Made for the moments you keep.',
    'Jewel tones, hand-finished details and pieces that move from celebration to everyday.',
    'The Royal Collection — Festive collections from Bengalot',
    'Explore hand-finished panjabis, jamdani, jewellery and festive pieces.',
    'published', 4
  ),
  (
    'heirloom-collection',
    'The Heirloom Collection',
    'The Heirloom Collection',
    'Handloom sarees, hand-finished panjabis and pieces made slowly by people whose names we know.',
    array['#2B0C1D', '#8A1F4B'],
    'Handloom · hand-finished',
    'Made by hand. Kept for years.',
    'A quiet collection of heirloom pieces from Rupganj, Narayanganj and Rajshahi.',
    'The Heirloom Collection — Handloom craft from Bengal',
    'Handwoven jamdani and heirloom pieces made in small batches by Bengalot.',
    'published', 5
  )
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 5. updated_at trigger.
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

drop trigger if exists collections_set_updated_at on public.collections;
create trigger collections_set_updated_at
  before update on public.collections
  for each row execute function public.bengalot_set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. Row level security.
--    Public storefront reads published collections; admins (app_metadata.role)
--    manage everything. The service role bypasses RLS as usual.
-- ---------------------------------------------------------------------------
alter table public.collections enable row level security;
alter table public.collection_products enable row level security;

drop policy if exists "Published collections are public" on public.collections;
create policy "Published collections are public"
  on public.collections for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Admins manage collections" on public.collections;
create policy "Admins manage collections"
  on public.collections for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Collection products are public" on public.collection_products;
create policy "Collection products are public"
  on public.collection_products for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_products.collection_id
        and c.status = 'published'
    )
  );

drop policy if exists "Admins manage collection products" on public.collection_products;
create policy "Admins manage collection products"
  on public.collection_products for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

commit;
