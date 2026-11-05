-- Bengalot — credential-free customer modules.
-- Gift-card requests/transactions, contact inbox, newsletter, addresses,
-- returns, support messages, reviews, coupons and order timeline events.

begin;

alter table public.gift_cards
  add column if not exists issued_by uuid,
  add column if not exists note text,
  add column if not exists is_demo boolean not null default false,
  add column if not exists source text not null default 'admin';

create table if not exists public.gift_card_transactions (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid not null references public.gift_cards(id) on delete cascade,
  order_no text,
  kind text not null check (kind in ('issue','redeem','refund','void','adjustment')),
  amount integer not null default 0,
  balance_after integer,
  note text,
  actor_email text,
  created_at timestamptz not null default now()
);
create index if not exists gift_card_transactions_card_idx on public.gift_card_transactions (gift_card_id, created_at desc);

create table if not exists public.gift_card_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  amount integer not null check (amount between 500 and 50000),
  recipient_name text not null,
  recipient_contact text not null,
  sender_name text not null,
  message text,
  delivery text not null default 'whatsapp' check (delivery in ('email','whatsapp')),
  status text not null default 'pending' check (status in ('pending','contacted','paid','issued','cancelled')),
  admin_note text,
  gift_card_id uuid references public.gift_cards(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists gift_card_requests_status_idx on public.gift_card_requests (status, created_at desc);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null default 'General question',
  message text not null,
  status text not null default 'new' check (status in ('new','read','replied','closed')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contact_messages_status_idx on public.contact_messages (status, created_at desc);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'subscribed' check (status in ('subscribed','unsubscribed')),
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Home',
  recipient_name text not null,
  phone text not null,
  district text not null,
  thana text not null,
  address text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists customer_addresses_profile_idx on public.customer_addresses (profile_id, is_default desc);

create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  order_no text not null,
  customer_name text not null,
  phone text not null,
  email text,
  reason text not null,
  details text,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'requested' check (status in ('requested','approved','rejected','received','refunded','closed')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists return_requests_status_idx on public.return_requests (status, created_at desc);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  subject text not null default 'Support request',
  message text not null,
  order_no text,
  status text not null default 'new' check (status in ('new','open','replied','closed')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists support_messages_status_idx on public.support_messages (status, created_at desc);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  location text,
  rating integer not null check (rating between 1 and 5),
  title text not null,
  body text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  verified boolean not null default false,
  helpful integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reviews_product_idx on public.reviews (product_slug, status, created_at desc);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  type text not null check (type in ('percent','fixed','shipping')),
  value integer not null default 0,
  min_spend integer not null default 0,
  expires_at date,
  status text not null default 'active' check (status in ('active','inactive')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.coupons (code, title, description, type, value, min_spend, expires_at, status, is_demo)
values
  ('BENGALOT10', '10% off your first order', 'A little welcome from the house. Applies sitewide on orders over ৳2,000.', 'percent', 10, 2000, '2026-12-31', 'active', true),
  ('FREESHIP', 'Complimentary delivery', 'Delivery on us, anywhere in Bangladesh.', 'shipping', 0, 0, '2026-12-31', 'active', true)
on conflict (code) do nothing;

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  order_no text not null,
  status text not null,
  note text,
  actor_email text,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events (order_no, created_at);

do $$
declare t text;
begin
  foreach t in array array['gift_card_requests','contact_messages','newsletter_subscribers','customer_addresses','return_requests','support_messages','reviews','coupons']
  loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

alter table public.gift_card_transactions enable row level security;
alter table public.gift_card_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.return_requests enable row level security;
alter table public.support_messages enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.order_events enable row level security;

do $$
declare t text;
begin
  foreach t in array array['gift_card_transactions','gift_card_requests','contact_messages','newsletter_subscribers','customer_addresses','return_requests','support_messages','reviews','coupons','order_events']
  loop
    execute format('drop policy if exists staff_%I on public.%I', t, t);
    execute format('create policy staff_%I on public.%I for all to authenticated using (public.bengalot_is_staff()) with check (public.bengalot_is_staff())', t, t);
  end loop;
end $$;

drop policy if exists public_approved_reviews on public.reviews;
create policy public_approved_reviews on public.reviews
  for select to anon, authenticated using (status = 'approved');

drop policy if exists customer_addresses_self on public.customer_addresses;
create policy customer_addresses_self on public.customer_addresses
  for all to authenticated using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists customer_returns_self on public.return_requests;
create policy customer_returns_self on public.return_requests
  for select to authenticated using (auth.uid() = profile_id);

drop policy if exists customer_support_self on public.support_messages;
create policy customer_support_self on public.support_messages
  for select to authenticated using (auth.uid() = profile_id);

commit;
