-- Bengalot — final polish: policy review, page short names and service settings.
--
-- Run after 20261103000200_homepage_content.sql. Additive and defensive.

begin;

-- ---------------------------------------------------------------------------
-- 1. Store settings used by the final storefront polish.
-- ---------------------------------------------------------------------------
alter table if exists public.store_settings
  add column if not exists delivery_time_inside text not null default '1–2 days',
  add column if not exists delivery_time_outside text not null default '2–4 days',
  add column if not exists order_cutoff text not null default '2pm',
  add column if not exists inspect_before_paying boolean not null default false,
  add column if not exists return_cost_rule text not null default '',
  add column if not exists damage_report_window_days integer not null default 0
    check (damage_report_window_days >= 0),
  add column if not exists support_hours text not null default '',
  add column if not exists policy_updated date not null default current_date,
  add column if not exists reviews_enabled boolean not null default true,
  add column if not exists rewards_enabled boolean not null default false,
  add column if not exists coupons_enabled boolean not null default false,
  add column if not exists bkash_enabled boolean not null default false;

-- ---------------------------------------------------------------------------
-- 2. Policy pages need a review flag until the owner confirms them.
-- ---------------------------------------------------------------------------
create table if not exists public.policy_pages (
  slug text primary key,
  short_name text not null,
  needs_review boolean not null default true,
  last_updated date not null default current_date,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.policy_pages (slug, short_name, needs_review)
values
  ('shipping-policy', 'Shipping policy', true),
  ('return-policy', 'Return policy', true),
  ('terms', 'Terms & conditions', true),
  ('privacy-policy', 'Privacy policy', true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Short breadcrumb names, editable by the admin later.
-- ---------------------------------------------------------------------------
create table if not exists public.page_short_names (
  path text primary key,
  short_name text not null,
  updated_at timestamptz not null default now()
);

insert into public.page_short_names (path, short_name)
values
  ('/', 'Home'),
  ('/about', 'Our story'),
  ('/account', 'My account'),
  ('/collections', 'Collections'),
  ('/shop', 'Shop'),
  ('/track', 'Track order'),
  ('/search', 'Search'),
  ('/faq', 'FAQ'),
  ('/contact', 'Contact'),
  ('/shipping-policy', 'Shipping policy'),
  ('/return-policy', 'Return policy'),
  ('/terms', 'Terms & conditions'),
  ('/privacy-policy', 'Privacy policy')
on conflict (path) do nothing;

-- ---------------------------------------------------------------------------
-- 4. Defensive demo flags on customer-facing tables when they exist.
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.addresses') is not null then
    alter table public.addresses
      add column if not exists is_demo boolean not null default false;
  end if;

  if to_regclass('public.customers') is not null then
    alter table public.customers
      add column if not exists is_demo boolean not null default false;
  end if;

  if to_regclass('public.orders') is not null then
    alter table public.orders
      add column if not exists is_demo boolean not null default false;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Timestamps and RLS.
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

drop trigger if exists policy_pages_set_updated_at on public.policy_pages;
create trigger policy_pages_set_updated_at
  before update on public.policy_pages
  for each row execute function public.bengalot_set_updated_at();

drop trigger if exists page_short_names_set_updated_at on public.page_short_names;
create trigger page_short_names_set_updated_at
  before update on public.page_short_names
  for each row execute function public.bengalot_set_updated_at();

alter table public.policy_pages enable row level security;
alter table public.page_short_names enable row level security;

drop policy if exists "Policy pages are public" on public.policy_pages;
create policy "Policy pages are public"
  on public.policy_pages for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage policy pages" on public.policy_pages;
create policy "Admins manage policy pages"
  on public.policy_pages for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Page short names are public" on public.page_short_names;
create policy "Page short names are public"
  on public.page_short_names for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage page short names" on public.page_short_names;
create policy "Admins manage page short names"
  on public.page_short_names for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

commit;
