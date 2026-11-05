-- Category/subcategory placeholder images. Department images remain in
-- admin_media (department.<slug>), and category circles read this column first.

alter table public.store_categories
  add column if not exists image_url text;
