-- Bengalot — homepage entries for gift cards and model reels.
--
-- The local bridge in lib/homepage.ts already exposes these keys so the
-- credential-free preview shows them. This migration keeps the Supabase
-- homepage editor in sync when the backend is connected.

begin;

insert into public.homepage_sections
  (key, label, eyebrow, title, accent, description, link_label, link_href, enabled, sort)
values
  ('giftcards', 'Gift cards', 'The gift of choice', 'Give the whole house', 'house',
   'A Bengalot gift card lets them choose the piece that feels like theirs — with a year to use it.',
   'Buy a gift card', '/gift-cards', true, 9),
  ('reels', 'Model reels', 'Model reels', 'See it in motion', 'motion',
   'Short films of the pieces on the move — shot by the people who wear them.',
   'See the looks', '/lookbook', true, 13)
on conflict (key) do nothing;

-- Keep the newer sections in a stable order around the two additions.
update public.homepage_sections
set sort = case key
  when 'why' then 10
  when 'story' then 11
  when 'reviews' then 12
  when 'reels' then 13
  when 'social' then 14
  when 'newsletter' then 15
  when 'recentlyViewed' then 16
  else sort
end
where key in ('why', 'story', 'reviews', 'reels', 'social', 'newsletter', 'recentlyViewed');

commit;
