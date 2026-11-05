-- Transactional email delivery log and idempotency keys.

create table if not exists public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  dedupe_key text unique,
  to_email text not null,
  subject text not null,
  kind text not null default 'transactional',
  status text not null default 'sending' check (status in ('sending','sent','failed','skipped')),
  provider_message_id text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists email_deliveries_created_idx
  on public.email_deliveries (created_at desc);
create index if not exists email_deliveries_status_idx
  on public.email_deliveries (status, created_at desc);

alter table public.email_deliveries enable row level security;
drop policy if exists staff_email_deliveries on public.email_deliveries;
create policy staff_email_deliveries on public.email_deliveries
  for all to authenticated using (public.bengalot_is_staff()) with check (public.bengalot_is_staff());

drop trigger if exists email_deliveries_set_updated_at on public.email_deliveries;
create trigger email_deliveries_set_updated_at before update on public.email_deliveries
  for each row execute function public.set_updated_at();
