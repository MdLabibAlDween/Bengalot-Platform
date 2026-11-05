-- Bengalot — homepage reels.
--
-- Reels can point at an uploaded model walk (Supabase Storage) or at an
-- Instagram, YouTube or TikTok post. The storefront preview currently reads
-- demo rows from lib/reels.ts; this table is the persistence layer for the
-- admin/Supabase phase.
--
-- Apply after 20261102000400_audience_demo_settings.sql so the shared
-- updated_at helper exists.

begin;

create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  platform text not null default 'instagram'
    check (platform in ('instagram', 'youtube', 'tiktok', 'file')),
  video_url text,
  watch_url text,
  poster_url text,
  product_slug text,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  is_demo boolean not null default false,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.reels.video_url is
  'Direct MP4/WebM URL for uploaded reels, or the public Instagram/YouTube/TikTok post URL for embeds.';
comment on column public.reels.watch_url is
  'Fallback destination (for example the brand profile) when no embeddable video is attached yet.';

create index if not exists reels_status_sort_idx
  on public.reels (status, sort);

-- Attach the product FK only when the catalogue exposes a unique slug.
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
       where conname = 'reels_product_slug_fkey'
         and conrelid = 'public.reels'::regclass
     ) then
    alter table public.reels
      add constraint reels_product_slug_fkey
      foreign key (product_slug) references public.products(slug)
      on update cascade on delete set null;
  end if;
end $$;

create or replace function public.bengalot_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reels_set_updated_at on public.reels;
create trigger reels_set_updated_at
  before update on public.reels
  for each row execute function public.bengalot_set_updated_at();

alter table public.reels enable row level security;

drop policy if exists "Published reels are public" on public.reels;
create policy "Published reels are public"
  on public.reels for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Admins manage reels" on public.reels;
create policy "Admins manage reels"
  on public.reels for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

commit;
