# Bengalot

Bengalot is a Next.js 16 storefront and admin control room backed by a
self-hosted Supabase project.

## Run

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm run start
```

## Environment

Copy `.env.example` to `.env.local` and fill:

```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase.example.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
APP_ENCRYPTION_KEY=... # base64, exactly 32 bytes
NEXT_PUBLIC_SITE_URL=https://bengalot.com
```

`SUPABASE_SERVICE_ROLE_KEY` is used only in server code. `APP_ENCRYPTION_KEY`
encrypts integration secrets; changing it makes existing secrets unreadable.

## What is live

- Storefront: home, departments, categories, collections, bundles, product
  pages, wishlist, search, policies, contact/newsletter and cart.
- Checkout: server-recalculated prices, stock validation/decrement, coupons,
  delivery from the admin store profile, gift-card redemption, order tracking
  and COD orders.
- Orders: durable `orders` table, admin order desk, stock restore on
  cancellation/return, gift-card refund on cancellation, printable reports and
  CSV export. Steadfast booking, tracking sync and signed webhook status updates
  are live through the Courier desk.
- Invoices: every invoice is a frozen snapshot with a unique, non-reused number,
  issued automatically on order creation/confirmation. Print or save any invoice
  as a PDF from Admin → Invoices, or email it from the invoice ledger. Automatic
  invoice email is configurable with the `autoSend` setting.
- Email: Purelymail SMTP powers order confirmations, order-status updates and
  invoice emails. Every send is verified, idempotent and logged in
  Admin → Integrations.
- Catalogue: Supabase-backed products, add/edit/delete, image upload, sizes,
  colours, per-size and per-colour variant stock, per-variant SKU/price,
  demo flag and SEO title/description. Categories, collections and bundles are
  also editable in Admin → Categories & collections, including manual product
  curation and bundle item ordering.
- Product editor: gallery uploads with alt text and colour linking, variant matrix
  with stock/SKU/price overrides, highlights, materials, care, fit notes, size
  guide, tags, collections, badges and SEO.
- Product-image prompts: `promt` contains the master ChatGPT prompt plus one
  colour block for every storefront colour, with product-preservation and
  negative-prompt rules.
- Gift cards and rewards are shipped but disabled by default. Their storefront
  entry points are hidden while disabled; the admin consoles remain available.
- SMS is a provider-neutral scaffold, disabled by default. Email is the live
  notification channel. Checkout still requires a phone number for delivery.
- Customers: Supabase Auth, protected account area, real profile updates,
  real password change, saved addresses, server-side order history, order
  tracking, verified reviews, in-app notifications, a rewards ledger with
  atomic coupon redemption, TOTP two-factor authentication, device-session
  management and self-service account deletion.
- Customer care: contact inbox, account support messages, return requests and
  newsletter subscribers in the admin Inbox. Status changes write real
  account notifications.
- Gift cards: public request flow, admin issuance, balance lookup, checkout
  redemption, cancellation refunds, transaction history and voiding.
- Offers: database-backed coupons, admin coupon builder, live offers page and
  server-side coupon validation at checkout.
- Admin: redesigned operations console with command palette (⌘K), live nav
  badges, collapsible sidebar, revenue dashboard, low-stock alerts, service
  health, orders, reports, catalogue, categories/collections/bundles, media,
  homepage/content (including the four policy pages), pages/features, redirects,
  gift cards, reviews, coupons, rewards & loyalty, invoices, integrations,
  customers, staff roles, settings and audit log.
- Discord alerts: test button, new-order and status-change alerts, delivery log.
- SEO: demo products are `noindex`, excluded from the sitemap and JSON-LD;
  real products are indexable.
- Meta Pixel and Google Analytics: set the production `pixelId` / `analyticsId`
  in Admin → Settings → SEO. Scripts are injected in production builds only.

## Demo catalogue

The 50 seeded products are marked **Demo**. They stay visible, show a Demo
badge and cannot be ordered. A demo product becomes orderable after an admin
opens it, replaces the content and unchecks **Demo product**.
Bundles made from demo pieces are also marked demo and cannot be ordered.

## Security

- Admin authorization uses Supabase Auth `app_metadata.role`, not the editable
  `profiles.role` column. `profiles.role` is display/legacy only.
- Admin APIs are role-gated and use the service role only after an authenticated
  staff check.
- Public writes are rate-limited and server-validated.
- RLS blocks anonymous access to orders, profiles, gift cards and secrets.
- Apply the migrations in `supabase/migrations/`:
  `20261105000100_lock_profile_privileges.sql`,
  `20261105000200_credential_free_store_modules.sql`,
  `20261105000300_revoke_trigger_function_rpc.sql`,
  `20261106000100_account_rewards_and_taxonomy.sql`,
  `20261106000150_seed_store_taxonomy.sql`,
  `20261106000200_reward_redemption.sql` and
  `20261107000100_steadfast_courier_fulfilment.sql`,
  `20261107000200_invoices.sql`,
  `20261107000300_email_deliveries.sql` and
  `20261107000400_sms_provider_foundation.sql`. The profile lock prevents
  authenticated users from changing their own `role`, `email` or
  `is_blacklisted` columns at the database level.

## Before launch checklist

1. Apply the migrations in `supabase/migrations/` (the profile lock and the
   credential-free store modules are already applied to the current project).
2. Configure SMTP for Supabase Auth (confirmation and password-reset emails).
   Then enable SMTP in Admin → Integrations to open registration and password
   reset in the app.
3. Configure the Supabase Auth Site URL, redirect allow-list and SMTP sender.
4. Create real customer accounts after SMTP is live (the sample account has been removed).
5. Enter the Meta Pixel ID in Admin → Settings → SEO and verify with the Meta
   Pixel Helper after deploying over HTTPS.
6. Back up `APP_ENCRYPTION_KEY` and the Supabase database.
7. Add real products, uncheck Demo on each, set stock/variants/SEO and test COD.

## Steadfast courier

The Steadfast integration is implemented end to end:

- API key + secret key are stored encrypted and used for booking and status lookups.
- Book a parcel from **Admin → Orders → open an order → Book with Steadfast**, or enable
  **Auto-book on Confirmed** in Integrations.
- Every booking is idempotent by the Bengalot order number, so a retry cannot create a
  second parcel.
- **Admin → Couriers** shows parcels, consignment IDs, tracking links, the latest courier
  status, webhook events and a manual **Sync active parcels** action.
- Delivered, partial-delivered, cancelled/returning and return-received courier events
  update the order status automatically. A cancelled parcel becomes **Returning**; stock is
  restocked only when Steadfast confirms the return was received.
- Customer order pages show the tracking code, courier status and a direct tracking link.

### One-time webhook setup

1. Open **Admin → Integrations → Steadfast** and press **Generate token**. Copy it once.
2. In Steadfast → Webhook, set:
   - **Callback URL**: `https://<your-domain>/api/webhooks/steadfast`
   - **Auth token**: the token from step 1
3. Save integrations. The API key and secret key are separate from this webhook token.
4. Send a test event from Steadfast and confirm it appears in **Admin → Couriers** with a
   valid signature. Then enable **Require X-Signature** if you want to reject unsigned
   events.

The endpoint verifies the Bearer token, checks `X-Signature` (hex HMAC-SHA256 of the raw
body, keyed by the auth token) when present, answers within Steadfast's five-second window
and de-duplicates retries using `Idempotency-Key`. Without an Auth token the endpoint
returns 503 rather than accepting unauthenticated events.

## Email

Purelymail SMTP is wired to the application sender:

- Order confirmation email is sent after a successful checkout.
- Order-status email is sent after every status change.
- Invoice email can be sent from Admin → Invoices, or automatically when
  `autoSend` is enabled in invoice settings.
- Every send is logged in Admin → Integrations with its status and safe error.
- Duplicate events use a dedupe key, so retries do not send the same email twice.
- Use **Verify & send test email** in Admin → Integrations to validate the
  mailbox. The test goes only to the signed-in owner.

Supabase Auth confirmation/password-reset emails use the SMTP settings inside
the Supabase server `.env`, not the app SMTP fields. Add the same Purelymail
mailbox there:

```env
SMTP_ADMIN_EMAIL=info@bengalot.com
SMTP_HOST=smtp.purelymail.com
SMTP_PORT=465
SMTP_USER=info@bengalot.com
SMTP_PASS=<purelymail password>
SMTP_SENDER_NAME=Bengalot
```

Then recreate the Supabase auth container (for the Docker self-hosted setup):

```bash
cd /path/to/supabase-project
sh run.sh recreate auth
```

Test one signup confirmation and one password-reset email. Only after both work,
open **Admin → Integrations → Purelymail SMTP** and enable **Supabase Auth email
is configured**. Registration and password reset stay disabled until that switch
is on, so customers are never sent into a broken confirmation flow.

## Credential-dependent modules

These are deliberately left for the owner to configure:

- SMS (BulkSMSBD), bKash and Tawk.to are credential-ready but not live. Discord
  is the live notification channel and in-app account notifications work without
  any external service. Steadfast booking, tracking and signed webhooks are live
  once the credentials and webhook token above are saved. Purelymail SMTP is live
  for app-sent order, status and invoice email.
- The SMS adapter supports a generic JSON HTTP provider or BulkSMSBD and is
  disabled by default until the owner chooses a provider and sender ID.
- Gift cards and the rewards programme are disabled by default. Enable them in
  Admin → Pages & features / Rewards & loyalty when needed.
- Supabase Auth SMTP controls registration confirmation and password reset.
- Email login alerts use the app SMTP when the sender is configured.
- Meta Pixel and Google Analytics IDs are entered in Admin → Settings → SEO.

Everything else in the storefront, account area and admin console is live and
database-backed.
