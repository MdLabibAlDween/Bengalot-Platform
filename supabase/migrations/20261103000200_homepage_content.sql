-- Bengalot — homepage content, admin controls and demo-data cleanup.
--
-- This migration is additive and defensive: it can run against a fresh
-- database or one that already has the earlier Bengalot migrations.
--
-- Storefront mapping:
--   homepage_sections        -> lib/homepage.ts HOMEPAGE_SECTIONS + SECTION_COPY
--   hero_slides              -> HERO_SLIDES
--   homepage_feature_cards   -> WHY_CARDS
--   featured_categories      -> FEATURED_CATEGORIES
--   featured_collections     -> FEATURED_COLLECTIONS
--   offer_campaigns          -> OFFER_CAMPAIGNS
--   social_posts             -> SOCIAL_STRIP.posts
--   store_settings           -> lib/settings.ts STORE_SETTINGS

begin;

-- ---------------------------------------------------------------------------
-- 1. Demo flags on every seeded record type.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.products') is not null then
    alter table public.products
      add column if not exists is_demo boolean not null default false;
  end if;

  if to_regclass('public.categories') is not null then
    alter table public.categories
      add column if not exists is_demo boolean not null default false;
  end if;

  if to_regclass('public.reviews') is not null then
    alter table public.reviews
      add column if not exists is_demo boolean not null default false;
  end if;

  if to_regclass('public.collections') is not null then
    alter table public.collections
      add column if not exists is_demo boolean not null default false;
  end if;

  if to_regclass('public.coupons') is not null then
    alter table public.coupons
      add column if not exists is_demo boolean not null default false;
  end if;

  if to_regclass('public.bundles') is not null then
    alter table public.bundles
      add column if not exists is_demo boolean not null default false;
  end if;

  if to_regclass('public.reels') is not null then
    alter table public.reels
      add column if not exists is_demo boolean not null default false;
  end if;
end $$;

-- Mark the original catalogue seeds so the launch toggle can hide them.
do $$
begin
  if to_regclass('public.bundles') is not null then
    update public.bundles
      set is_demo = true
      where slug in ('men-dusk-set', 'women-heirloom-set', 'kids-starlight-set')
        and is_demo = false;
  end if;

  if to_regclass('public.collections') is not null then
    update public.collections
      set is_demo = true
      where slug in (
        'new-arrivals',
        'best-sellers',
        'sale',
        'royal-collection',
        'heirloom-collection'
      )
        and is_demo = false;
  end if;

  if to_regclass('public.coupons') is not null then
    update public.coupons
      set is_demo = true
      where code in ('BENGALOT10', 'FREESHIP')
        and is_demo = false;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Storefront settings used by the header, hero, footer and newsletter.
-- ---------------------------------------------------------------------------
alter table if exists public.store_settings
  add column if not exists delivery_inside numeric(12, 2) not null default 70,
  add column if not exists delivery_outside numeric(12, 2) not null default 130,
  add column if not exists cod_enabled boolean not null default true,
  add column if not exists exchange_window_enabled boolean not null default false,
  add column if not exists exchange_window_days integer not null default 0
    check (exchange_window_days >= 0),
  add column if not exists show_coming_soon_categories boolean not null default false,
  add column if not exists announcement_messages jsonb not null default '[]'::jsonb,
  add column if not exists trust_items jsonb not null default '[
    "Cash on Delivery",
    "Quality Checked",
    "Delivery across Bangladesh",
    "WhatsApp Support"
  ]'::jsonb,
  add column if not exists newsletter_enabled boolean not null default true,
  add column if not exists newsletter_eyebrow text not null default 'Newsletter',
  add column if not exists newsletter_heading text not null default 'Stay in the loop.',
  add column if not exists newsletter_accent text not null default 'loop.',
  add column if not exists newsletter_body text not null default
    'New collections and occasional studio notes, straight to your inbox.',
  add column if not exists newsletter_button_label text not null default 'Subscribe',
  add column if not exists newsletter_note text not null default
    'No noise. Unsubscribe anytime.',
  add column if not exists social_links jsonb not null default '{}'::jsonb,
  add column if not exists social_strip_enabled boolean not null default false;

alter table if exists public.store_settings
  alter column hide_demo_content set default true;

update public.store_settings
set hide_demo_content = true,
    announcement_messages = case
      when announcement_messages = '[]'::jsonb
        then '["Cash on Delivery · ৳70 Faridpur · ৳130 outside"]'::jsonb
      else announcement_messages
    end,
    seal_text = 'Saltha, Faridpur'
where id = true;

-- ---------------------------------------------------------------------------
-- 3. Homepage sections (order + visibility + section copy).
-- ---------------------------------------------------------------------------
create table if not exists public.homepage_sections (
  key text primary key,
  label text not null,
  eyebrow text,
  title text,
  accent text,
  description text,
  link_label text,
  link_href text,
  content jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  sort integer not null default 0,
  is_demo boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.homepage_sections
  (key, label, eyebrow, title, accent, description, link_label, link_href, enabled, sort)
values
  ('announcement', 'Announcement bar', null, null, null, null, null, null, true, 0),
  ('hero', 'Hero', null, null, null, null, null, null, true, 1),
  ('trust', 'Trust strip', null, null, null, null, null, null, true, 2),
  ('departments', 'Shop by department', 'Shop by department', 'Find your world', 'world',
   'Six departments, each with its own point of view.', 'All departments', '/shop', true, 3),
  ('products', 'New arrivals & selected pieces', 'The latest', 'New arrivals', null,
   'Fresh pieces from across the house.', 'View all', '/collections/new-arrivals', true, 4),
  ('bundles', 'Complete outfits', 'Complete outfits', 'One look, every piece', 'piece',
   'Ready-made outfits, priced as one.', 'All outfits', '/shop', true, 5),
  ('categories', 'Shop by category', 'Shop by category', 'The pieces you wear most', null,
   'A quicker way to the right shelf.', 'Browse everything', '/shop', true, 6),
  ('collections', 'Featured collections', 'Featured collections', 'Stories in color', 'color',
   'Seasonal collections worth exploring.', 'All collections', '/collections', true, 7),
  ('offer', 'Offer banner', null, null, null, null, null, null, true, 8),
  ('why', 'Why Bengalot', 'Why Bengalot', 'The service behind every order', null,
   'Clear promises, kept quietly.', null, null, true, 9),
  ('story', 'Brand story', 'The house', 'Cloth, considered', null, null, null, null, true, 10),
  ('reviews', 'Customer reviews', 'Customer reviews', 'Reviews from customers', 'customers',
   'Real reviews will appear here once they are submitted and approved.', null, null, true, 11),
  ('social', 'Social strip', 'From the studio', 'Follow along', null,
   'New pieces, behind the scenes and studio notes.', 'Instagram', null, true, 12),
  ('newsletter', 'Newsletter', null, null, null, null, null, null, true, 13),
  ('recentlyViewed', 'Recently viewed', 'Continue browsing', 'Recently viewed', null,
   'Pick up where you left off.', null, null, true, 14)
on conflict (key) do nothing;

-- Story copy and list limits are stored as JSON so the admin can edit every
-- line without a schema change. Existing admin edits are preserved.
update public.homepage_sections
set content = '{
  "paragraphs": [
    "Bengalot is an online fashion house built around considered clothing, clear pricing and dependable delivery.",
    "We keep the range focused, the details quiet and the service personal."
  ],
  "points": [
    {"title": "A focused range", "text": "Fewer, better pieces instead of endless choice."},
    {"title": "Everyday wear", "text": "Clothing designed to move through the week."},
    {"title": "Direct service", "text": "Order online, pay on delivery, message us on WhatsApp."}
  ],
  "buttonLabel": "Read our story",
  "buttonHref": "/about",
  "productSlugs": ["heirloom-jamdani-saree", "golden-hour-jute-tote"]
}'::jsonb
where key = 'story' and content = '{}'::jsonb;

update public.homepage_sections
set content = '{"limit": 8, "tabs": ["new", "best"]}'::jsonb
where key = 'products' and content = '{}'::jsonb;

update public.homepage_sections
set content = '{"limit": 3}'::jsonb
where key in ('bundles', 'collections') and content = '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- 4. Hero slides (up to five published slides).
-- ---------------------------------------------------------------------------
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  headline text not null,
  accent_word text not null,
  supporting text not null default '',
  primary_label text not null default 'Shop Now',
  primary_href text not null default '/shop',
  secondary_label text not null default 'Explore Collections',
  secondary_href text not null default '/collections',
  accent_color text not null default '#3B2A8C',
  accent_deep text not null default '#241A63',
  tint text not null default '#ECE8FB',
  product_slugs text[] not null default '{}',
  collection_slug text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  sort integer not null default 0,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hero_slides_status_sort_idx
  on public.hero_slides (status, sort);

insert into public.hero_slides
  (slug, label, headline, accent_word, supporting, primary_label, primary_href,
   secondary_label, secondary_href, accent_color, accent_deep, tint, product_slugs,
   collection_slug, status, sort, is_demo)
values
  (
    'the-festive-collection', 'The festive collection', 'Dress like', 'royalty.',
    'Occasion-ready panjabis, jamdani and gold-toned finishing touches.',
    'Shop Now', '/collections/royal-collection', 'Explore Collections', '/collections',
    '#3B2A8C', '#241A63', '#ECE8FB',
    array['royal-nocturne-panjabi','heirloom-jamdani-saree','royal-bengal-watch'],
    'royal-collection', 'published', 1, true
  ),
  (
    'the-handloom-collection', 'The handloom collection', 'Heritage, worn', 'lightly.',
    'Handloom textures and modern cuts for everyday celebrations.',
    'Shop Now', '/collections/heirloom-collection', 'Explore Collections', '/collections',
    '#C2255C', '#7A1238', '#FBE7EE',
    array['heirloom-jamdani-saree','rosewood-handloom-kurti','peacock-silk-hijab'],
    'heirloom-collection', 'published', 2, true
  ),
  (
    'the-everyday-collection', 'The everyday collection', 'Everyday,', 'elevated.',
    'Easy cotton, clean lines and leather pieces that go everywhere.',
    'Shop Now', '/collections/best-sellers', 'Explore Collections', '/collections',
    '#0E8F8A', '#075F5C', '#E3F4F2',
    array['midnight-oversized-tee','charcoal-tailored-chino','rajshahi-leather-sneaker'],
    'best-sellers', 'published', 3, true
  ),
  (
    'the-gift-collection', 'The gift collection', 'Small things, kept', 'close.',
    'Watches, attar and jute pieces made for giving.',
    'Shop Now', '/collections/new-arrivals', 'Explore Collections', '/collections',
    '#B47A15', '#7A5009', '#FBF0D9',
    array['royal-bengal-watch','amber-oud-attar','golden-hour-jute-tote'],
    'new-arrivals', 'published', 4, true
  )
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 5. Why Bengalot cards. `value` is admin-entered; empty values are hidden.
-- ---------------------------------------------------------------------------
create table if not exists public.homepage_feature_cards (
  id text primary key,
  icon text not null default 'quality',
  title text not null,
  text text not null default '',
  value text not null default '',
  label text not null default '',
  enabled boolean not null default true,
  sort integer not null default 0,
  is_demo boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.homepage_feature_cards
  (id, icon, title, text, value, label, enabled, sort, is_demo)
values
  ('cod', 'cod', 'Cash on Delivery', 'Pay the courier when your order arrives.',
   'COD', 'Payment on delivery', true, 1, true),
  ('quality', 'quality', 'Checked by hand', 'Every order is reviewed before it is packed.',
   'QC', 'Quality check', true, 2, true),
  ('delivery', 'delivery', 'Across Bangladesh',
   'Delivery to Faridpur and every other district.',
   'BD', 'Delivery coverage', true, 3, true),
  ('support', 'support', 'WhatsApp support', 'Message 01341739202 for help with an order.',
   'WA', 'Direct support', true, 4, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 6. Featured categories and collections.
-- ---------------------------------------------------------------------------
create table if not exists public.featured_categories (
  id text primary key,
  department text not null,
  category_slug text not null,
  icon text not null,
  enabled boolean not null default true,
  sort integer not null default 0,
  is_demo boolean not null default false
);

create table if not exists public.featured_collections (
  id text primary key,
  collection_slug text not null,
  icon text not null,
  enabled boolean not null default true,
  sort integer not null default 0,
  is_demo boolean not null default false
);

insert into public.featured_categories
  (id, department, category_slug, icon, enabled, sort, is_demo)
values
  ('women-sarees', 'women', 'sarees', 'saree', true, 1, true),
  ('men-panjabi', 'men', 'panjabi-fatua', 'panjabi', true, 2, true),
  ('women-kurtis', 'women', 'kurtis-tunics', 'kurti', true, 3, true),
  ('footwear-sneakers', 'footwear', 'sneakers', 'sneaker', true, 4, true),
  ('bags-jute', 'bags', 'jute-bags', 'jute', true, 5, true),
  ('accessories-watches', 'accessories', 'watches', 'watch', true, 6, true),
  ('women-hijabs', 'women', 'hijabs-scarves', 'hijab', true, 7, true),
  ('men-shirts', 'men', 'shirts', 'shirt', true, 8, true)
on conflict (id) do nothing;

insert into public.featured_collections
  (id, collection_slug, icon, enabled, sort, is_demo)
values
  ('royal-collection', 'royal-collection', 'panjabi', true, 1, true),
  ('heirloom-collection', 'heirloom-collection', 'saree', true, 2, true),
  ('new-arrivals', 'new-arrivals', 'kurti', true, 3, true),
  ('best-sellers', 'best-sellers', 'sneaker', true, 4, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 7. Offer campaigns (coupon amount / minimum come from the coupon record).
-- ---------------------------------------------------------------------------
create table if not exists public.offer_campaigns (
  id text primary key,
  eyebrow text not null default 'Current offer',
  title text not null,
  accent_word text,
  description text not null default '',
  coupon_code text not null,
  cta_label text not null default 'Shop the offer',
  cta_href text not null default '/collections/sale',
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'ended')),
  theme text not null default 'royal'
    check (theme in ('royal', 'magenta', 'gold', 'teal')),
  sort integer not null default 0,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.offer_campaigns
  (id, eyebrow, title, accent_word, description, coupon_code, cta_label, cta_href,
   starts_at, ends_at, status, theme, sort, is_demo)
values
  (
    'gold-hour', 'Current offer', 'The Gold Hour', 'Hour',
    'A seasonal collection with a little extra off. Use the code at checkout.',
    'BENGALOT10', 'Shop the offer', '/collections/sale',
    '2026-10-01T00:00:00+06:00', '2026-12-31T23:59:59+06:00',
    'published', 'royal', 1, true
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 8. Social strip images (only real, admin-connected media are shown).
-- ---------------------------------------------------------------------------
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  href text,
  alt text not null default '',
  enabled boolean not null default true,
  sort integer not null default 0,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 9. updated_at triggers.
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

drop trigger if exists homepage_sections_set_updated_at on public.homepage_sections;
create trigger homepage_sections_set_updated_at
  before update on public.homepage_sections
  for each row execute function public.bengalot_set_updated_at();

drop trigger if exists hero_slides_set_updated_at on public.hero_slides;
create trigger hero_slides_set_updated_at
  before update on public.hero_slides
  for each row execute function public.bengalot_set_updated_at();

drop trigger if exists homepage_feature_cards_set_updated_at on public.homepage_feature_cards;
create trigger homepage_feature_cards_set_updated_at
  before update on public.homepage_feature_cards
  for each row execute function public.bengalot_set_updated_at();

drop trigger if exists offer_campaigns_set_updated_at on public.offer_campaigns;
create trigger offer_campaigns_set_updated_at
  before update on public.offer_campaigns
  for each row execute function public.bengalot_set_updated_at();

-- ---------------------------------------------------------------------------
-- 10. RLS.
-- ---------------------------------------------------------------------------
alter table public.homepage_sections enable row level security;
alter table public.hero_slides enable row level security;
alter table public.homepage_feature_cards enable row level security;
alter table public.featured_categories enable row level security;
alter table public.featured_collections enable row level security;
alter table public.offer_campaigns enable row level security;
alter table public.social_posts enable row level security;

drop policy if exists "Enabled homepage sections are public" on public.homepage_sections;
create policy "Enabled homepage sections are public"
  on public.homepage_sections for select
  to anon, authenticated
  using (enabled);

drop policy if exists "Published hero slides are public" on public.hero_slides;
create policy "Published hero slides are public"
  on public.hero_slides for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Enabled feature cards are public" on public.homepage_feature_cards;
create policy "Enabled feature cards are public"
  on public.homepage_feature_cards for select
  to anon, authenticated
  using (enabled);

drop policy if exists "Enabled featured categories are public" on public.featured_categories;
create policy "Enabled featured categories are public"
  on public.featured_categories for select
  to anon, authenticated
  using (enabled);

drop policy if exists "Enabled featured collections are public" on public.featured_collections;
create policy "Enabled featured collections are public"
  on public.featured_collections for select
  to anon, authenticated
  using (enabled);

drop policy if exists "Active offer campaigns are public" on public.offer_campaigns;
create policy "Active offer campaigns are public"
  on public.offer_campaigns for select
  to anon, authenticated
  using (
    status = 'published'
    and starts_at <= now()
    and (ends_at is null or ends_at > now())
  );

drop policy if exists "Enabled social posts are public" on public.social_posts;
create policy "Enabled social posts are public"
  on public.social_posts for select
  to anon, authenticated
  using (enabled);

-- Admin management for all new tables.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'homepage_sections',
    'hero_slides',
    'homepage_feature_cards',
    'featured_categories',
    'featured_collections',
    'offer_campaigns',
    'social_posts'
  ] loop
    execute format('drop policy if exists "Admins manage %I" on public.%I', table_name, table_name);
    execute format(
      'create policy "Admins manage %I" on public.%I for all to authenticated using ((auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'') with check ((auth.jwt() -> ''app_metadata'' ->> ''role'') = ''admin'')',
      table_name,
      table_name
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 11. Remove all demo data (admin-only RPC for the admin settings button).
--     Call from the admin UI: supabase.rpc('remove_demo_data')
-- ---------------------------------------------------------------------------
create or replace function public.remove_demo_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') <> 'admin' then
    raise exception 'Admin role required';
  end if;

  if to_regclass('public.social_posts') is not null then
    delete from public.social_posts where is_demo;
  end if;
  if to_regclass('public.offer_campaigns') is not null then
    delete from public.offer_campaigns where is_demo;
  end if;
  if to_regclass('public.homepage_feature_cards') is not null then
    delete from public.homepage_feature_cards where is_demo;
  end if;
  if to_regclass('public.hero_slides') is not null then
    delete from public.hero_slides where is_demo;
  end if;
  if to_regclass('public.featured_categories') is not null then
    delete from public.featured_categories where is_demo;
  end if;
  if to_regclass('public.featured_collections') is not null then
    delete from public.featured_collections where is_demo;
  end if;

  if to_regclass('public.reviews') is not null then
    delete from public.reviews where is_demo;
  end if;
  if to_regclass('public.coupons') is not null then
    delete from public.coupons where is_demo;
  end if;

  if to_regclass('public.bundle_items') is not null
     and to_regclass('public.bundles') is not null then
    delete from public.bundle_items
      where bundle_id in (select id from public.bundles where is_demo);
    delete from public.bundles where is_demo;
  end if;

  if to_regclass('public.collection_products') is not null
     and to_regclass('public.collections') is not null then
    delete from public.collection_products
      where collection_id in (select id from public.collections where is_demo);
    delete from public.collections where is_demo;
  end if;

  if to_regclass('public.products') is not null then
    begin
      delete from public.products where is_demo;
    exception
      when foreign_key_violation then
        -- Keep demo products that are still referenced by real orders or bundles.
        null;
    end;
  end if;

  if to_regclass('public.categories') is not null then
    begin
      delete from public.categories where is_demo;
    exception
      when foreign_key_violation then
        null;
    end;
  end if;

  if to_regclass('public.store_settings') is not null then
    update public.store_settings set hide_demo_content = true where id = true;
  end if;
end;
$$;

revoke all on function public.remove_demo_data() from public;
grant execute on function public.remove_demo_data() to authenticated;

-- Public and admin reads already have RLS; ensure the settings row is public.
alter table if exists public.store_settings enable row level security;

drop policy if exists "Store settings are public" on public.store_settings;
create policy "Store settings are public"
  on public.store_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage store settings" on public.store_settings;
create policy "Admins manage store settings"
  on public.store_settings for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

commit;
