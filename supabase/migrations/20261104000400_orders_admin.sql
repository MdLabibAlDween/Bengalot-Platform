-- Bengalot order desk
-- Minimal durable order store used by the admin panel and the guest checkout.

begin;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  status text not null default 'Pending'
    check (status in ('Pending','Confirmed','Processing','Handed to Courier','In Transit','Delivered','Cancelled','Returned','Failed Delivery','Refunded')),
  payment text not null default 'Cash on Delivery',
  payment_status text not null default 'Unpaid'
    check (payment_status in ('Unpaid','Paid','Refunded')),
  customer text not null,
  phone text not null,
  email text,
  district text not null,
  address text not null,
  note text,
  subtotal integer not null default 0,
  discount integer not null default 0,
  bundle_savings integer not null default 0,
  gift_card_code text,
  gift_card_amount integer not null default 0,
  delivery integer not null default 0,
  total integer not null default 0,
  items jsonb not null default '[]'::jsonb,
  courier text,
  tracking_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_phone_idx on public.orders (phone);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
-- No public policies: inserts/reads go through server routes with the service role.

commit;
