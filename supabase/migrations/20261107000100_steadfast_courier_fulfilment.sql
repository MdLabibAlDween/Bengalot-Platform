-- Steadfast courier fulfilment, webhook events and the Returning order state.

alter table public.orders
  add column if not exists courier_status text,
  add column if not exists courier_consignment_id bigint,
  add column if not exists courier_tracking_link text,
  add column if not exists courier_last_synced_at timestamptz;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in (
    'Pending','Confirmed','Processing','Handed to Courier','In Transit',
    'Delivered','Returning','Cancelled','Returned','Failed Delivery','Refunded'
  ));

create index if not exists orders_courier_consignment_idx
  on public.orders (courier_consignment_id);

create table if not exists public.courier_shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  order_no text not null,
  provider text not null default 'steadfast',
  consignment_id bigint,
  tracking_code text,
  tracking_link text,
  courier_status text,
  cod_amount integer not null default 0,
  delivery_charge integer,
  booked_at timestamptz not null default now(),
  last_synced_at timestamptz,
  last_webhook_at timestamptz,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, order_id),
  unique (provider, consignment_id)
);
create index if not exists courier_shipments_status_idx
  on public.courier_shipments (provider, courier_status, updated_at desc);

create table if not exists public.courier_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid references public.courier_shipments(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  order_no text not null,
  provider text not null default 'steadfast',
  notification_type text not null default 'delivery_status',
  courier_status text,
  message text,
  payload jsonb,
  idempotency_key text,
  signature_status text,
  source text not null default 'webhook',
  created_at timestamptz not null default now()
);
create index if not exists courier_events_order_idx
  on public.courier_events (order_no, created_at desc);
create unique index if not exists courier_events_dedupe_idx
  on public.courier_events (provider, idempotency_key)
  where idempotency_key is not null;

alter table public.courier_shipments enable row level security;
alter table public.courier_events enable row level security;

drop policy if exists staff_courier_shipments on public.courier_shipments;
create policy staff_courier_shipments on public.courier_shipments
  for all to authenticated using (public.bengalot_is_staff()) with check (public.bengalot_is_staff());

drop policy if exists staff_courier_events on public.courier_events;
create policy staff_courier_events on public.courier_events
  for all to authenticated using (public.bengalot_is_staff()) with check (public.bengalot_is_staff());

do $$
declare t text;
begin
  foreach t in array array['courier_shipments']
  loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;
