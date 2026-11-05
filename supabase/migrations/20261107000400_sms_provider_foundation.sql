-- Provider-neutral SMS delivery log. SMS stays disabled by default; email is
-- the active notification channel until a provider and sender ID are chosen.

create table if not exists public.sms_deliveries (
  id uuid primary key default gen_random_uuid(),
  dedupe_key text unique,
  to_phone text not null,
  provider text not null default 'generic',
  status text not null default 'sending' check (status in ('sending','sent','failed','skipped')),
  provider_message_id text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sms_deliveries_created_idx
  on public.sms_deliveries (created_at desc);

alter table public.sms_deliveries enable row level security;
drop policy if exists staff_sms_deliveries on public.sms_deliveries;
create policy staff_sms_deliveries on public.sms_deliveries
  for all to authenticated using (public.bengalot_is_staff()) with check (public.bengalot_is_staff());

drop trigger if exists sms_deliveries_set_updated_at on public.sms_deliveries;
create trigger sms_deliveries_set_updated_at before update on public.sms_deliveries
  for each row execute function public.set_updated_at();
