-- Replace paper-weight (GSM) language in product specs with quality-focused copy.
-- Safe to run on an existing catalogue: only the affected spec values change.

update public.products
set specs = replace(
  replace(
    replace(specs::text, '120 · 350 GSM', '120 · durable stock'),
    '90 · 350 GSM', '90 · durable stock'
  ),
  '100 GSM warm-white', 'Warm-white, quality paper'
)::jsonb
where specs::text like '%GSM%';
