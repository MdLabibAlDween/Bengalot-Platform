-- Homepage offer campaign editor. The table existed in the original homepage
-- migration but was missing from the live database, so this migration is
-- idempotent and also seeds the launch campaign.

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
  status text not null default 'draft' check (status in ('draft','published','ended')),
  theme text not null default 'royal' check (theme in ('royal','magenta','gold','teal')),
  sort integer not null default 0,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offer_campaigns_status_window_idx
  on public.offer_campaigns (status, starts_at, ends_at, sort);

drop trigger if exists offer_campaigns_set_updated_at on public.offer_campaigns;
create trigger offer_campaigns_set_updated_at
  before update on public.offer_campaigns
  for each row execute function public.set_updated_at();

alter table public.offer_campaigns enable row level security;

drop policy if exists "Active offer campaigns are public" on public.offer_campaigns;
create policy "Active offer campaigns are public"
  on public.offer_campaigns for select
  to anon, authenticated
  using (
    status = 'published'
    and starts_at <= now()
    and (ends_at is null or ends_at > now())
  );

drop policy if exists staff_offer_campaigns on public.offer_campaigns;
create policy staff_offer_campaigns on public.offer_campaigns
  for all to authenticated
  using (public.bengalot_is_staff())
  with check (public.bengalot_is_staff());

insert into public.offer_campaigns
  (id, eyebrow, title, accent_word, description, coupon_code, cta_label, cta_href, starts_at, ends_at, status, theme, sort, is_demo)
values
  ('gold-hour', 'Current offer', 'The Gold Hour', 'Hour',
   'A seasonal collection with a little extra off. Use the code at checkout.',
   'BENGALOT10', 'Shop the offer', '/collections/sale',
   '2026-10-01T00:00:00+06:00', '2026-12-31T23:59:59+06:00',
   'published', 'royal', 1, true)
on conflict (id) do nothing;
