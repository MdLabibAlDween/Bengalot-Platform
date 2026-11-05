-- Bengalot — audience, demo flags and storefront settings.
--
-- This migration is intentionally defensive: the preview currently runs on
-- local data, while the admin/Supabase schema is still being connected. Apply
-- with the earlier migrations once the project is linked.

begin;

-- Categories and products share an audience so recommendations can stay
-- within the same customer group.
alter table if exists public.categories
  add column if not exists audience text
    check (audience in ('men', 'women', 'kids', 'unisex')),
  add column if not exists is_demo boolean not null default false;

alter table if exists public.products
  add column if not exists audience text
    check (audience in ('men', 'women', 'kids', 'unisex')),
  add column if not exists is_demo boolean not null default false,
  add column if not exists badge_is_demo boolean not null default false;

alter table if exists public.reviews
  add column if not exists is_demo boolean not null default false,
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'approved'));

alter table if exists public.collections
  add column if not exists is_demo boolean not null default false;

alter table if exists public.coupons
  add column if not exists is_demo boolean not null default false;

-- Single-row storefront settings. The preview reads defaults from
-- lib/settings.ts; connecting these values is part of the admin phase.
create table if not exists public.store_settings (
  id boolean primary key default true check (id),
  free_delivery_enabled boolean not null default false,
  free_delivery_threshold numeric(12, 2) not null default 5000,
  seal_text text not null default 'House of Bengalot · Saltha, Faridpur',
  reply_time text not null default 'Average reply: under 2 hours, 7 days a week',
  hide_demo_content boolean not null default false,
  loyalty_enabled boolean not null default false,
  loyalty_credit numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id)
values (true)
on conflict (id) do nothing;

create or replace function public.bengalot_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists store_settings_set_updated_at on public.store_settings;
create trigger store_settings_set_updated_at
  before update on public.store_settings
  for each row execute function public.bengalot_set_updated_at();

alter table public.store_settings enable row level security;

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
