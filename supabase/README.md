# Bengalot database migrations

Run in filename order with the Supabase CLI:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Or apply manually:

```bash
psql "$DATABASE_URL" -f supabase/migrations/20261102000100_collections_rename.sql
psql "$DATABASE_URL" -f supabase/migrations/20261102000200_bundles.sql
psql "$DATABASE_URL" -f supabase/migrations/20261102000300_product_editor_fields.sql
psql "$DATABASE_URL" -f supabase/migrations/20261102000400_audience_demo_settings.sql
psql "$DATABASE_URL" -f supabase/migrations/20261103000100_reels.sql
psql "$DATABASE_URL" -f supabase/migrations/20261103000200_homepage_content.sql
psql "$DATABASE_URL" -f supabase/migrations/20261103000300_final_polish.sql
psql "$DATABASE_URL" -f supabase/migrations/20261104000100_gift_cards.sql
psql "$DATABASE_URL" -f supabase/migrations/20261104000200_homepage_gift_cards_reels.sql
psql "$DATABASE_URL" -f supabase/migrations/20261104000300_admin_control_center.sql
psql "$DATABASE_URL" -f supabase/migrations/20261104000400_orders_admin.sql
```

## What they do

1. `20261102000100_collections_rename.sql`
   - renames legacy `edits` → `collections` and `edit_products` → `collection_products` when those tables exist;
   - adds/normalises the collection columns used by the storefront;
   - seeds the five collections currently rendered from `lib/collections.ts`;
   - enables RLS: public reads published collections, `app_metadata.role = "admin"` manages them.

2. `20261102000200_bundles.sql`
   - creates `bundles` and `bundle_items` (one department per bundle, real product slugs, quantity and sort order);
   - adds `bundle_savings` to `orders` and `bundle_id` / `bundle_name` snapshots to `order_items` when those tables exist;
   - seeds the three demo outfits (Men, Women, Kids) and only inserts item rows for product slugs that already exist;
   - enables RLS: public reads published bundles, admins manage.

3. `20261102000300_product_editor_fields.sql`
   - adds optional product-editor fields: collection slug/note, highlights, material lines, care lines and fit note;
   - creates `product_images` for ordered gallery media per color;
   - enables public reads and admin management for product media.

4. `20261102000400_audience_demo_settings.sql`
   - adds `audience` and `is_demo` flags to categories, products, reviews and collections;
   - adds `badge_is_demo` to products;
   - creates the single-row `store_settings` table for free delivery, seal text, reply time, demo-content visibility and loyalty settings;
   - enables public reads and admin management for store settings.

5. `20261103000100_reels.sql`
   - creates `reels` for homepage model walks and Instagram/YouTube/TikTok posts;
   - stores the direct video or post URL, optional poster, linked product, draft/published status and sort order;
   - enables RLS: the public reads published reels, admins manage them.

6. `20261103000200_homepage_content.sql`
   - adds `is_demo` to bundles, coupons, reviews, collections and products;
   - extends `store_settings` with delivery/COD/exchange switches, announcement messages, trust items, newsletter copy, social links and coming-soon visibility;
   - creates `homepage_sections`, `hero_slides`, `homepage_feature_cards`, `featured_categories`, `featured_collections`, `offer_campaigns` and `social_posts`;
   - seeds up to five hero slides, section order, Why cards, featured content and one demo campaign (all marked `is_demo`);
   - adds RLS so only enabled/published rows are public and admins manage everything;
   - adds `public.remove_demo_data()` for the admin “Remove all demo data” button.

7. `20261103000300_final_polish.sql`
   - adds delivery-time, cut-off, inspection, return-cost, damage-window, support-hours and policy-update settings;
   - adds feature flags for reviews, rewards, coupons and bKash;
   - creates `policy_pages` with `needs_review = true` for Shipping, Returns, Terms and Privacy;
   - creates editable `page_short_names` for breadcrumbs;
   - adds defensive `is_demo` flags to addresses/customers/orders when those tables exist.

8. `20261104000100_gift_cards.sql`
   - creates private `gift_cards` records with code, value, remaining balance, recipient, delivery method, expiry and status;
   - keeps codes off the public anon API (RLS) and lets admins manage them.

9. `20261104000200_homepage_gift_cards_reels.sql`
   - adds the Gift cards and Model reels entries to `homepage_sections` and keeps the newer section order stable.

10. `20261104000300_admin_control_center.sql`
   - adds public settings/media/redirect read grants and the `admin_media` and `admin_redirects` tables;
   - seeds the control-center settings, media slots and physical gift-card defaults.

11. `20261104000400_orders_admin.sql`
   - creates the durable guest-order table used by the admin order desk and checkout mirror.

## Homepage admin wiring

`lib/homepage.ts` is the typed bridge for the tables above. When the admin shell
is connected:

- edit section order and visibility in `homepage_sections`;
- create/update hero slides in `hero_slides` (status `published`, `sort` 1–5);
- add Why cards in `homepage_feature_cards` (empty `value` hides the card);
- choose the category/collection tiles in `featured_categories` / `featured_collections`;
- create an offer in `offer_campaigns` linked to a coupon code; the banner only
  renders while the campaign is published and inside its real start/end window;
- connect social images in `social_posts` and set `store_settings.social_strip_enabled`;
- call `public.remove_demo_data()` from the admin settings button. The function
  checks `app_metadata.role = "admin"` and removes only rows where `is_demo = true`.

## Admin access

Admin policies check the Supabase JWT claim:

```json
{ "app_metadata": { "role": "admin" } }
```

Set it on the admin user with the service role, for example:

```ts
await supabase.auth.admin.updateUserById(userId, {
  app_metadata: { role: "admin" },
});
```

The storefront currently runs on the local demo catalogue in `lib/data.ts`,
`lib/bundles.ts` and `lib/homepage.ts`. The Bundles and homepage admin UIs are
intentionally not faked against localStorage: they will read/write these tables
once the Supabase project and admin shell are connected. Until then, these
migrations are the source of truth for the production schema and the storefront
keeps a typed local fallback so it can be reviewed without credentials.
