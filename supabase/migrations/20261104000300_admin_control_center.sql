-- Bengalot admin control center
-- Adds the settings/media/redirect storage used by /admin. Idempotent.

begin;

alter table public.settings enable row level security;

drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read"
  on public.settings for select
  to anon, authenticated
  using (is_public = true);

create table if not exists public.admin_media (
  id uuid primary key default gen_random_uuid(),
  slot_key text not null unique,
  label text not null,
  group_label text not null default 'General',
  url text,
  alt text,
  sort integer not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists admin_media_group_sort_idx
  on public.admin_media (group_label, sort);

drop trigger if exists admin_media_set_updated_at on public.admin_media;
create trigger admin_media_set_updated_at
  before update on public.admin_media
  for each row execute function public.set_updated_at();

alter table public.admin_media enable row level security;

drop policy if exists "Active media is public" on public.admin_media;
create policy "Active media is public"
  on public.admin_media for select
  to anon, authenticated
  using (is_active = true);

create table if not exists public.admin_redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique,
  destination_url text not null,
  status_code integer not null default 301 check (status_code in (301, 302, 307, 308)),
  enabled boolean not null default true,
  note text,
  sort integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists admin_redirects_enabled_sort_idx
  on public.admin_redirects (enabled, sort);

drop trigger if exists admin_redirects_set_updated_at on public.admin_redirects;
create trigger admin_redirects_set_updated_at
  before update on public.admin_redirects
  for each row execute function public.set_updated_at();

alter table public.admin_redirects enable row level security;

drop policy if exists "Enabled redirects are public" on public.admin_redirects;
create policy "Enabled redirects are public"
  on public.admin_redirects for select
  to anon, authenticated
  using (enabled = true);

grant usage on schema public to anon, authenticated;
grant select on public.settings to anon, authenticated;
grant select on public.admin_redirects to anon, authenticated;
grant select on public.admin_media to anon, authenticated;

insert into public.settings (key, value, description, is_public)
values
  ('store_profile', '{"brandName":"Bengalot","legalName":"Bengalot","tagline":"Premium fashion from Bengal","address":"Saltha, Faridpur, Bangladesh","whatsapp":"01341739202","supportEmail":"support@bengalot.com","infoEmail":"info@bengalot.com","currency":"BDT","deliveryInside":70,"deliveryOutside":130,"socials":{"facebook":"https://facebook.com/bengalot","instagram":"","youtube":"","tiktok":""}}'::jsonb, 'Public store contact and delivery profile', true),
  ('feature_flags', '{"giftCards":true,"reels":true,"lookbook":true,"offers":true,"reviews":true,"wishlist":true,"darkMode":false,"whatsapp":true,"newsletter":true,"search":true,"trackOrder":true,"account":true,"sizeGuide":true,"cod":true,"bkash":false}'::jsonb, 'Storefront feature switches', true),
  ('page_visibility', '{"/":true,"/shop":true,"/collections":true,"/lookbook":true,"/offers":true,"/gift-cards":true,"/about":true,"/contact":true,"/faq":true,"/track":true,"/wishlist":true,"/search":true,"/cart":true,"/checkout":true}'::jsonb, 'Public page visibility switches', true),
  ('gift_card_settings', '{"enabled":true,"mode":"physical","virtualEnabled":false,"denominations":[1000,2000,5000,10000],"minAmount":500,"maxAmount":50000,"expiryMonths":12,"deliveryMethods":["whatsapp","email"],"physicalNote":"Physical gift card delivered with your order. Payment: Cash on Delivery.","virtualNote":"Pay online, then receive the gift card code instantly."}'::jsonb, 'Gift card product and delivery mode', true),
  ('homepage_control', '{"sections":[{"key":"hero","label":"Hero","enabled":true,"sort":1},{"key":"trust","label":"Trust strip","enabled":true,"sort":2},{"key":"departments","label":"Shop by department","enabled":true,"sort":3},{"key":"products","label":"New arrivals","enabled":true,"sort":4},{"key":"bundles","label":"Complete outfits","enabled":true,"sort":5},{"key":"categories","label":"Shop by category","enabled":true,"sort":6},{"key":"collections","label":"Featured collections","enabled":true,"sort":7},{"key":"offer","label":"Offer banner","enabled":true,"sort":8},{"key":"giftcards","label":"Gift cards","enabled":true,"sort":9},{"key":"why","label":"Why Bengalot","enabled":true,"sort":10},{"key":"story","label":"Brand story","enabled":true,"sort":11},{"key":"reviews","label":"Customer reviews","enabled":true,"sort":12},{"key":"reels","label":"Model reels","enabled":true,"sort":13},{"key":"social","label":"Social strip","enabled":true,"sort":14},{"key":"newsletter","label":"Newsletter","enabled":true,"sort":15},{"key":"recentlyViewed","label":"Recently viewed","enabled":true,"sort":16}],"reels":[]}'::jsonb, 'Homepage section order and reel records', true),
  ('invoice_settings', '{"senderName":"Bengalot","senderEmail":"info@bengalot.com","replyTo":"support@bengalot.com","prefix":"BG","footer":"Thank you for shopping with Bengalot. Questions? support@bengalot.com","redirectUrl":"/order-success/{orderNo}","autoSend":false}'::jsonb, 'Invoice sender identity and redirect', false),
  ('seo_settings', '{"title":"Bengalot — Premium Fashion from Bengal","description":"Heirloom-inspired fashion from Bangladesh.","ogImage":"","analyticsId":"","pixelId":""}'::jsonb, 'SEO defaults', true),
  ('integrations_config', '{"smtp":{"enabled":false,"host":"","port":587,"secure":false,"fromName":"Bengalot"},"sms":{"enabled":false,"senderId":""},"steadfast":{"enabled":false},"bkash":{"enabled":false,"mode":"sandbox"},"tawk":{"enabled":false,"propertyId":"","widgetId":""},"discord":{"enabled":false}}'::jsonb, 'Non-secret integration switches', false)
on conflict (key) do nothing;

insert into public.admin_media (slot_key, label, group_label, sort)
values
  ('hero-main', 'Hero main card', 'Homepage', 1),
  ('hero-side-a', 'Hero side card A', 'Homepage', 2),
  ('hero-side-b', 'Hero side card B', 'Homepage', 3),
  ('gift-card-art', 'Gift card artwork', 'Homepage', 4),
  ('lookbook-jamdani', 'Lookbook — Jamdani', 'Homepage', 5),
  ('lookbook-midnight', 'Lookbook — Midnight', 'Homepage', 6),
  ('lookbook-golden', 'Lookbook — Golden fibre', 'Homepage', 7),
  ('lookbook-everyday', 'Lookbook — Everyday', 'Homepage', 8),
  ('department-men', 'Department — Men', 'Departments', 10),
  ('department-women', 'Department — Women', 'Departments', 11),
  ('department-kids', 'Department — Kids', 'Departments', 12),
  ('department-footwear', 'Department — Footwear', 'Departments', 13),
  ('department-bags', 'Department — Bags', 'Departments', 14),
  ('department-accessories', 'Department — Accessories', 'Departments', 15),
  ('category-default', 'Default category artwork', 'Categories', 20),
  ('product-default', 'Default product artwork', 'Products', 30),
  ('product-hover-default', 'Default product hover artwork', 'Products', 31),
  ('reel-poster-default', 'Default reel poster', 'Reels', 40)
on conflict (slot_key) do nothing;

commit;
