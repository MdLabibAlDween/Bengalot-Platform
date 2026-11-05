-- Media cleanup and category image slots.
-- 1. Remove the unused wide hero-banner slots left over from the reverted slider.
-- 2. Create one editable media slot for every category/subcategory.

delete from public.admin_media
where slot_key like 'hero-banner-%';

insert into public.admin_media (slot_key, label, group_label, sort)
select
  'category.' || department || '.' || slug || '.main',
  name || ' image',
  'Categories — ' || initcap(department),
  100 + row_number() over (order by department, sort, slug)
from public.store_categories
on conflict (slot_key) do nothing;
