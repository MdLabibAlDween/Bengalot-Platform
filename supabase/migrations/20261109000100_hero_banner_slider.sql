-- Wide hero banner slider slots. Each slot is one slide, in order. Upload a
-- landscape image at roughly 1920x700 or larger; the storefront crops with
-- object-cover on mobile and desktop.

insert into public.admin_media (slot_key, label, group_label, sort)
values
  ('hero-banner-1', 'Hero banner 1 — wide', 'Homepage', 1),
  ('hero-banner-2', 'Hero banner 2 — wide', 'Homepage', 2),
  ('hero-banner-3', 'Hero banner 3 — wide', 'Homepage', 3),
  ('hero-banner-4', 'Hero banner 4 — wide', 'Homepage', 4),
  ('hero-banner-5', 'Hero banner 5 — wide', 'Homepage', 5)
on conflict (slot_key) do nothing;

update public.admin_media set sort = 11 where slot_key = 'hero-main';
update public.admin_media set sort = 12 where slot_key = 'hero-side-a';
update public.admin_media set sort = 13 where slot_key = 'hero-side-b';
