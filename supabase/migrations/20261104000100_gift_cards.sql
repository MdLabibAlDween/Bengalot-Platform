-- Bengalot — gift cards.
--
-- Issued gift cards are private records: the storefront never lists them.
-- A checkout/server action should look up a code, reduce `balance` and flip
-- `status` to 'redeemed' when the balance reaches zero. The credential-free
-- preview mirrors this shape in lib/gift-cards.ts using localStorage.
--
-- Apply after 20261102000400_audience_demo_settings.sql so the shared
-- updated_at helper exists.

begin;

create table if not exists public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  amount integer not null check (amount between 500 and 50000),
  balance integer not null check (balance >= 0 and balance <= amount),
  recipient_name text not null,
  recipient_contact text not null,
  sender_name text not null,
  message text,
  delivery text not null default 'whatsapp'
    check (delivery in ('email', 'whatsapp')),
  status text not null default 'active'
    check (status in ('active', 'redeemed', 'expired', 'void')),
  expires_at timestamptz not null default (now() + interval '1 year'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.gift_cards.code is
  'Customer-facing code. Normalise to uppercase and store without spaces for lookups.';
comment on column public.gift_cards.balance is
  'Remaining value in BDT. Reduce atomically when an order is placed.';

create index if not exists gift_cards_status_expires_idx
  on public.gift_cards (status, expires_at);

create or replace function public.bengalot_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists gift_cards_set_updated_at on public.gift_cards;
create trigger gift_cards_set_updated_at
  before update on public.gift_cards
  for each row execute function public.bengalot_set_updated_at();

alter table public.gift_cards enable row level security;

-- Gift-card codes are bearer instruments. Do not expose them to anon users.
drop policy if exists "Admins manage gift cards" on public.gift_cards;
create policy "Admins manage gift cards"
  on public.gift_cards for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

commit;
