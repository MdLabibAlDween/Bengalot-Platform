-- Seed the editable catalogue structure from the original storefront defaults.

insert into public.store_categories (slug, name, name_bn, department, icon, tagline, sort)
values
  ('t-shirts', 'T-Shirts', 'টি-শার্ট', 'men', 'tshirt', 'Everyday cotton, cut just right.', 1),
  ('polo-shirts', 'Polo Shirts', 'পোলো শার্ট', 'men', 'polo', 'A collar that means business.', 2),
  ('shirts', 'Shirts', 'শার্ট', 'men', 'shirt', 'Linen, poplin and everything between.', 3),
  ('hoodies-sweatshirts', 'Hoodies & Sweatshirts', 'হুডি', 'men', 'hoodie', 'Soft structure for slow days.', 4),
  ('jackets', 'Jackets', 'জ্যাকেট', 'men', 'jacket', 'The layer that finishes it.', 5),
  ('panjabi-fatua', 'Panjabi & Fatua', 'পাঞ্জাবি', 'men', 'panjabi', 'Festivity, without the fuss.', 6),
  ('pants-chinos', 'Pants & Chinos', 'প্যান্ট', 'men', 'pants', 'Clean lines, easy movement.', 7),
  ('shorts', 'Shorts', 'শর্টস', 'men', 'shorts', 'Warm-weather ease.', 8),
  ('joggers', 'Joggers', 'জগার', 'men', 'joggers', 'Off-duty, but considered.', 9),
  ('innerwear', 'Innerwear', 'ইনারওয়্যার', 'men', 'innerwear', 'The quiet foundation.', 10),
  ('socks', 'Socks', 'মোজা', 'men', 'socks', 'Small comfort, good cotton.', 11),
  ('kurtis-tunics', 'Kurtis & Tunics', 'কুর্তি', 'women', 'kurti', 'The modern everyday staple.', 12),
  ('three-piece', 'Three-Piece', 'থ্রি-পিস', 'women', 'dress', 'Occasion-ready sets.', 13),
  ('sarees', 'Sarees', 'শাড়ি', 'women', 'saree', 'Handloom heirlooms.', 14),
  ('tops-tees', 'Tops & Tees', 'টপস', 'women', 'tshirt', 'Easy tops, thoughtful cuts.', 15),
  ('hoodies', 'Hoodies', 'হুডি', 'women', 'hoodie', 'Warmth with a little polish.', 16),
  ('palazzo-pants', 'Palazzo & Pants', 'প্যালাজো', 'women', 'pants', 'Breezy, beautiful bottoms.', 17),
  ('borka-abaya', 'Borka & Abaya', 'বোরকা', 'women', 'dress', 'Modest, modern silhouettes.', 18),
  ('hijabs-scarves', 'Hijabs & Scarves', 'হিজাব', 'women', 'hijab', 'Color for every mood.', 19),
  ('modest-wear', 'Modest Wear', 'মডেস্ট ওয়্যার', 'women', 'dress', 'Covered, never compromised.', 20),
  ('innerwear', 'Innerwear', 'ইনারওয়্যার', 'women', 'innerwear', 'Softness where it matters.', 21),
  ('hand-socks', 'Hand Socks', 'হ্যান্ড সকস', 'women', 'socks', 'Soft, warm and made to layer.', 22),
  ('boys-wear', 'Boys Wear', 'ছেলেদের পোশাক', 'kids', 'tshirt', 'Play-proof pieces.', 23),
  ('girls-wear', 'Girls Wear', 'মেয়েদের পোশাক', 'kids', 'dress', 'Little celebrations.', 24),
  ('baby-essentials', 'Baby Essentials', 'শিশুর পোশাক', 'kids', 'onesie', 'Gentle on new skin.', 25),
  ('hoodies', 'Hoodies', 'হুডি', 'kids', 'hoodie', 'Cosy little layers.', 26),
  ('panjabi-ethnic', 'Panjabi & Ethnic', 'পাঞ্জাবি', 'kids', 'panjabi', 'Festive, made tiny.', 27),
  ('nightwear', 'Nightwear', 'নাইটওয়্যার', 'kids', 'nightwear', 'Sweet dreams included.', 28),
  ('sneakers', 'Sneakers', 'স্নিকার্স', 'footwear', 'sneaker', 'Leather, laced and easy.', 29),
  ('sandals', 'Sandals', 'স্যান্ডেল', 'footwear', 'sandal', 'Off-duty feet.', 30),
  ('slippers', 'Slippers', 'স্লিপার', 'footwear', 'slipper', 'Cushion for the house.', 31),
  ('formal', 'Formal', 'ফরমাল', 'footwear', 'formal', 'Polished, never stiff.', 32),
  ('womens-footwear', 'Women''s Footwear', 'নারীদের জুতা', 'footwear', 'heel', 'A little lift.', 33),
  ('kids-footwear', 'Kids Footwear', 'শিশুদের জুতা', 'footwear', 'sneaker', 'Built for running.', 34),
  ('jute-bags', 'Jute Bags', 'পাটের ব্যাগ', 'bags', 'jute', 'Our golden fibre.', 35),
  ('backpacks', 'Backpacks', 'ব্যাকপ্যাক', 'bags', 'backpack', 'For the daily carry.', 36),
  ('tote-bags', 'Tote Bags', 'টোট ব্যাগ', 'bags', 'tote', 'Everything, beautifully.', 37),
  ('wallets', 'Wallets', 'ওয়ালেট', 'bags', 'wallet', 'Small, considered goods.', 38),
  ('travel-bags', 'Travel Bags', 'ট্রাভেল ব্যাগ', 'bags', 'duffel', 'Weekend, packed well.', 39),
  ('caps-hats', 'Caps & Hats', 'ক্যাপ', 'accessories', 'cap', 'Sun-smart finishing.', 40),
  ('watches', 'Watches', 'ঘড়ি', 'accessories', 'watch', 'Time, well kept.', 41),
  ('belts', 'Belts', 'বেল্ট', 'accessories', 'belt', 'The quiet structure.', 42),
  ('sunglasses', 'Sunglasses', 'সানগ্লাস', 'accessories', 'sunglasses', 'Golden-hour armour.', 43),
  ('jewelry', 'Jewelry', 'জুয়েলারি', 'accessories', 'jewelry', 'A little heritage, daily.', 44),
  ('perfumes-attar', 'Perfumes & Attar', 'আতর', 'accessories', 'perfume', 'Scent as memory.', 45),
  ('mufflers-gloves', 'Mufflers & Gloves', 'মাফলার', 'accessories', 'muffler', 'Winter, softly.', 46)
on conflict (department, slug) do nothing;

insert into public.store_collections
  (slug, eyebrow, title, accent, description, palette, note, closing_title, closing_text, meta_title, meta_description, kind, is_demo, sort)
values
  ('new-arrivals', 'Just landed', 'The New', 'Arrivals.', 'The freshest pieces from the atelier — small runs, honest fabrics and the kind of details you notice later.', array['var(--color-teal-luminous)','var(--color-teal)'], 'Updated this week', 'Newness, without the noise.', 'We add pieces in small batches rather than a whole season at once. Explore the latest collection.', 'New Arrivals — The latest from the atelier', 'The newest pieces from Bengalot — jamdani, panjabis, kurtis, footwear and accessories.', 'new', true, 1),
  ('best-sellers', 'Selected pieces', 'The Selected', 'Pieces.', 'A cross-section of the current collection, gathered for easy browsing.', array['var(--color-indigo)','var(--color-gold-ink)'], 'Selected pieces', 'A considered selection.', 'A simple cross-section of pieces across departments — nothing ranked, nothing claimed.', 'The Selected Pieces — Bengalot', 'A selected collection of Bengalot pieces across departments.', 'best', true, 2),
  ('sale', 'The archive', 'The Quiet', 'Sale.', 'A few last pieces, a few last sizes. Considered reductions on small-run collections.', array['var(--color-magenta)','var(--color-indigo)'], 'Sale pieces exchange for size only', 'A good piece is never wasted.', 'These are the last of their runs, not a separate quality. See the return policy for what applies to sale pieces.', 'Sale — The Bengalot archive', 'Last pieces and quiet reductions from Bengalot. Limited runs and final sizes, delivered with care.', 'sale', true, 3),
  ('royal-collection', 'The Royal Collection', 'The Royal', 'Collection.', 'Deep indigo, gold thread and celebration-ready silhouettes. A considered collection of festive pieces for the moments that deserve a little ceremony.', array['var(--color-indigo)','var(--color-indigo-luminous)'], 'Festive pieces · small runs', 'Made for the moments you keep.', 'Jewel tones, hand-finished details and pieces that move from celebration to everyday without missing a step.', 'The Royal Collection — Festive collections from Bengalot', 'Explore the Royal Collection: hand-finished panjabis, jamdani, jewellery and festive pieces from Bengalot.', 'royal', true, 4),
  ('heirloom-collection', 'The Heirloom Collection', 'The Heirloom', 'Collection.', 'Handloom sarees, hand-finished panjabis and pieces made slowly by people whose names we know. Cloth with a memory, made to be kept.', array['var(--color-magenta)','var(--color-terracotta)'], 'Handloom · hand-finished', 'Made by hand. Kept for years.', 'A quiet collection of heirloom pieces, selected for the way they wear over time.', 'The Heirloom Collection — Handloom craft from Bengal', 'Handwoven jamdani, hand-finished panjabis and heirloom pieces made in small batches by Bengalot.', 'heirloom', true, 5)
on conflict (slug) do nothing;

insert into public.store_bundles
  (slug, name, name_bn, department, short_description, description, cover_art, cover_palette, discount_type, discount_value, status, featured, allow_partial_purchase, items, seo_title, seo_description, is_demo, sort, created_at)
values
  ('men-dusk-set', 'The Dusk Set', 'দ্য ডাস্ক সেট', 'men', 'A complete evening look — an easy polo, tailored chino and a matte bomber for after dark.', 'Built around the Dusk Bomber, this set pairs a deep-indigo polo with our tapered charcoal chino. The proportions are considered as a whole: a clean shoulder, an easy break at the trouser and a jacket that finishes at the hip. Pick a size and color for each piece and the complete outfit arrives as one considered parcel.', 'jacket', array['var(--color-indigo)','var(--color-indigo-luminous)'], 'percent', 10, 'published', true, false, '[{"productSlug":"indigo-polo-club","quantity":1,"sort":1},{"productSlug":"charcoal-tailored-chino","quantity":1,"sort":2},{"productSlug":"dusk-bomber-jacket","quantity":1,"sort":3}]'::jsonb, 'The Dusk Set — Complete men''s outfit', 'A complete Bengalot men''s outfit: indigo polo, charcoal tailored chino and dusk bomber. Save 10% on the complete set.', true, 1, '2026-10-20'),
  ('women-heirloom-set', 'The Heirloom Set', 'দ্য হেরিলুম সেট', 'women', 'Handloom rosewood, breezy terracotta and a silk peacock hijab — an effortless complete look.', 'A considered everyday outfit in three parts: our rosewood handloom kurti, the wide-leg terracotta palazzo and a peacock silk hijab. Together they balance color and drape without asking anything of the wearer. Select the fit for each piece and we will send the complete set together.', 'kurti', array['var(--color-magenta)','var(--color-magenta-luminous)'], 'fixed', 500, 'published', true, false, '[{"productSlug":"rosewood-handloom-kurti","quantity":1,"sort":1},{"productSlug":"terracotta-palazzo","quantity":1,"sort":2},{"productSlug":"peacock-silk-hijab","quantity":1,"sort":3}]'::jsonb, 'The Heirloom Set — Complete women''s outfit', 'A complete Bengalot women''s outfit: rosewood handloom kurti, terracotta palazzo and peacock silk hijab. Save ৳500 on the complete set.', true, 2, '2026-10-22'),
  ('kids-starlight-set', 'The Little Starlight Set', 'দ্য লিটল স্টারলাইট সেট', 'kids', 'A soft hoodie, an easy play tee and cosy nightwear — one happy little wardrobe in three pieces.', 'Made for the days that run from playtime to bedtime. The mini Bengal hoodie layers over the junior play tee, while the starry-night set waits for the evening. Every piece is soft, washable and cut with room to grow. Choose sizes for all three and save on the set.', 'hoodie', array['var(--color-terracotta)','var(--color-terracotta-luminous)'], 'percent', 15, 'published', true, false, '[{"productSlug":"mini-bengal-hoodie","quantity":1,"sort":1},{"productSlug":"junior-play-tee","quantity":1,"sort":2},{"productSlug":"starry-night-set","quantity":1,"sort":3}]'::jsonb, 'The Little Starlight Set — Complete kids'' outfit', 'A complete Bengalot kids'' outfit: mini Bengal hoodie, junior play tee and starry night set. Save 15% on the complete set.', true, 3, '2026-10-25')
on conflict (slug) do nothing;
