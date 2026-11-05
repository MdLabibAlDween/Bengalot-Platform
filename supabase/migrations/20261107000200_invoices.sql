-- Invoice snapshots, unique numbering and immutable issued records.

begin;

create table if not exists public.invoice_counters (
  prefix text primary key,
  last_value bigint not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function public.bengalot_next_invoice_no(prefix_in text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_prefix text := upper(regexp_replace(coalesce(prefix_in, 'BG'), '[^A-Za-z0-9]', '', 'g'));
  next_value bigint;
begin
  if clean_prefix = '' then clean_prefix := 'BG'; end if;
  insert into public.invoice_counters (prefix, last_value)
  values (clean_prefix, 1)
  on conflict (prefix) do update
    set last_value = public.invoice_counters.last_value + 1,
        updated_at = now()
  returning last_value into next_value;
  return clean_prefix || '-' || to_char(now(), 'YYMM') || '-' || lpad(next_value::text, 4, '0');
end;
$$;

revoke all on function public.bengalot_next_invoice_no(text) from public, anon, authenticated;
grant execute on function public.bengalot_next_invoice_no(text) to service_role;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_no text not null unique,
  order_id uuid not null unique references public.orders(id) on delete cascade,
  order_no text not null,
  status text not null default 'issued' check (status in ('issued','void')),
  issued_at timestamptz not null default now(),
  seller jsonb not null default '{}'::jsonb,
  customer jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null default 0,
  discount integer not null default 0,
  delivery integer not null default 0,
  total integer not null default 0,
  payment text,
  payment_status text,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists invoices_order_idx on public.invoices (order_no);
create index if not exists invoices_issued_idx on public.invoices (issued_at desc);

alter table public.invoices enable row level security;
drop policy if exists staff_invoices on public.invoices;
create policy staff_invoices on public.invoices
  for all to authenticated using (public.bengalot_is_staff()) with check (public.bengalot_is_staff());

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();

commit;
