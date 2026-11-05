-- Bengalot — account notifications, rewards, session controls and editable
-- catalogue structure. Apply after 20261105000200_credential_free_store_modules.sql.

begin;

create table if not exists public.customer_notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'system' check (kind in ('order','account','offer','review','reward','gift_card','system')),
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  dedupe_key text,
  created_at timestamptz not null default now()
);
create index if not exists customer_notifications_profile_idx
  on public.customer_notifications (profile_id, created_at desc);
create unique index if not exists customer_notifications_dedupe_idx
  on public.customer_notifications (profile_id, dedupe_key)
  where dedupe_key is not null;

create table if not exists public.notification_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  order_updates boolean not null default true,
  offers_email boolean not null default false,
  offers_sms boolean not null default false,
  back_in_stock boolean not null default false,
  review_reminders boolean not null default false,
  newsletter boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.customer_notifications enable row level security;
alter table public.notification_preferences enable row level security;

drop policy if exists customer_notifications_self on public.customer_notifications;
create policy customer_notifications_self on public.customer_notifications
  for select to authenticated using (auth.uid() = profile_id);
drop policy if exists customer_notifications_self_update on public.customer_notifications;
create policy customer_notifications_self_update on public.customer_notifications
  for update to authenticated using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
drop policy if exists staff_customer_notifications on public.customer_notifications;
create policy staff_customer_notifications on public.customer_notifications
  for all to authenticated using (public.bengalot_is_staff()) with check (public.bengalot_is_staff());

drop policy if exists notification_preferences_self on public.notification_preferences;
create policy notification_preferences_self on public.notification_preferences
  for all to authenticated using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
drop policy if exists staff_notification_preferences on public.notification_preferences;
create policy staff_notification_preferences on public.notification_preferences
  for all to authenticated using (public.bengalot_is_staff()) with check (public.bengalot_is_staff());

create table if not exists public.reward_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('order','review','signup','adjustment','redemption','bonus')),
  points integer not null,
  reference text,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists reward_ledger_profile_idx
  on public.reward_ledger (profile_id, created_at desc);
create unique index if not exists reward_ledger_dedupe_idx
  on public.reward_ledger (profile_id, kind, reference)
  where reference is not null;

alter table public.reward_ledger enable row level security;
drop policy if exists reward_ledger_self on public.reward_ledger;
create policy reward_ledger_self on public.reward_ledger
  for select to authenticated using (auth.uid() = profile_id);
drop policy if exists staff_reward_ledger on public.reward_ledger;
create policy staff_reward_ledger on public.reward_ledger
  for all to authenticated using (public.bengalot_is_staff()) with check (public.bengalot_is_staff());

alter table public.coupons
  add column if not exists profile_id uuid references public.profiles(id) on delete cascade,
  add column if not exists is_reward boolean not null default false,
  add column if not exists reward_points integer;

create index if not exists coupons_profile_idx on public.coupons (profile_id, status);

insert into public.settings (key, value, is_public)
values (
  'rewards_config',
  '{
    "enabled": true,
    "pointsPerHundred": 1,
    "reviewPoints": 50,
    "signupPoints": 0,
    "tiers": [
      { "name": "Silver", "min": 0, "perk": "Birthday offer and early access" },
      { "name": "Gold", "min": 1000, "perk": "Free exchanges and a ৳100 birthday credit" },
      { "name": "Royal", "min": 2000, "perk": "Private previews and complimentary delivery" }
    ],
    "rewards": [
      { "key": "delivery", "label": "Complimentary delivery", "points": 300, "type": "shipping", "value": 0, "minSpend": 0, "description": "One order, any district", "expiresInDays": 90 },
      { "key": "credit-100", "label": "৳100 off", "points": 500, "type": "fixed", "value": 100, "minSpend": 1500, "description": "Any order over ৳1,500", "expiresInDays": 90 },
      { "key": "credit-500", "label": "৳500 off", "points": 2000, "type": "fixed", "value": 500, "minSpend": 4000, "description": "Any order over ৳4,000", "expiresInDays": 90 }
    ]
  }'::jsonb,
  true
)
on conflict (key) do nothing;

create table if not exists public.store_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  name_bn text,
  department text not null,
  icon text not null default 'tshirt',
  tagline text not null default '',
  status text not null default 'published' check (status in ('published','hidden')),
  is_demo boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (department, slug)
);
create index if not exists store_categories_department_idx
  on public.store_categories (department, status, sort);

create table if not exists public.store_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  eyebrow text not null default '',
  title text not null,
  accent text not null default '',
  description text not null default '',
  palette text[] not null default '{}',
  note text,
  closing_title text not null default '',
  closing_text text not null default '',
  meta_title text not null default '',
  meta_description text not null default '',
  kind text not null default 'new' check (kind in ('new','best','sale','royal','heirloom')),
  status text not null default 'published' check (status in ('published','hidden')),
  is_demo boolean not null default true,
  sort integer not null default 0,
  product_slugs text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists store_collections_status_idx
  on public.store_collections (status, sort);

create table if not exists public.store_bundles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_bn text,
  department text not null,
  short_description text not null default '',
  description text not null default '',
  cover_art text not null default 'jacket',
  cover_palette text[] not null default '{}',
  discount_type text not null default 'percent' check (discount_type in ('none','percent','fixed')),
  discount_value integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  featured boolean not null default false,
  allow_partial_purchase boolean not null default false,
  items jsonb not null default '[]'::jsonb,
  seo_title text not null default '',
  seo_description text not null default '',
  is_demo boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists store_bundles_department_idx
  on public.store_bundles (department, status, sort);

alter table public.store_categories enable row level security;
alter table public.store_collections enable row level security;
alter table public.store_bundles enable row level security;

drop policy if exists public_store_categories on public.store_categories;
create policy public_store_categories on public.store_categories
  for select to anon, authenticated using (status = 'published');
drop policy if exists staff_store_categories on public.store_categories;
create policy staff_store_categories on public.store_categories
  for all to authenticated using (public.bengalot_is_staff()) with check (public.bengalot_is_staff());

drop policy if exists public_store_collections on public.store_collections;
create policy public_store_collections on public.store_collections
  for select to anon, authenticated using (status = 'published');
drop policy if exists staff_store_collections on public.store_collections;
create policy staff_store_collections on public.store_collections
  for all to authenticated using (public.bengalot_is_staff()) with check (public.bengalot_is_staff());

drop policy if exists public_store_bundles on public.store_bundles;
create policy public_store_bundles on public.store_bundles
  for select to anon, authenticated using (status = 'published');
drop policy if exists staff_store_bundles on public.store_bundles;
create policy staff_store_bundles on public.store_bundles
  for all to authenticated using (public.bengalot_is_staff()) with check (public.bengalot_is_staff());

do $$
declare t text;
begin
  foreach t in array array['store_categories','store_collections','store_bundles']
  loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

create or replace function public.bengalot_my_sessions()
returns table (id uuid, created_at timestamptz, updated_at timestamptz, user_agent text, ip text, aal text)
language sql
stable
security definer
set search_path = ''
as $$
  select s.id, s.created_at, s.updated_at, s.user_agent, host(s.ip), s.aal::text
  from auth.sessions s
  where s.user_id = auth.uid()
  order by coalesce(s.updated_at, s.created_at) desc nulls last
$$;
revoke all on function public.bengalot_my_sessions() from public, anon;
grant execute on function public.bengalot_my_sessions() to authenticated;

create or replace function public.bengalot_revoke_session(target_session uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare removed integer;
begin
  if auth.uid() is null then return false; end if;
  delete from auth.sessions where id = target_session and user_id = auth.uid();
  get diagnostics removed = row_count;
  return removed > 0;
end;
$$;
revoke all on function public.bengalot_revoke_session(uuid) from public, anon;
grant execute on function public.bengalot_revoke_session(uuid) to authenticated;

commit;
