# Bengalot — Bring a lot to learning.

A premium academic learning and productivity storefront for Bangladesh. Bengalot sells Notion templates, printed study cards, printed planners, focus tools and bundles — with a customer learning library, a working cart and checkout, and an admin studio.

## Stack

- Next.js 16 App Router, React 19 and strict TypeScript
- Tailwind CSS 4 with a white-first design-token system
- Motion for choreographed interactions, with reduced-motion support
- Supabase for auth, catalogue, orders, entitlements and settings
- Fraunces, Manrope and Anek Bangla via `next/font`
- Original SVG product artwork — no photographs of people, no stock product photography

## Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open <http://localhost:3000>.

The live Supabase project is already seeded. The SQL schema and catalogue seed live in `supabase/migrations/` — `0001_academic_store.sql` creates the store, and `0002_printed_planners.sql` updates the planner collection to physical printed editions.

## Accounts and studio access

Customers create their own account from `/register`, then keep digital purchases in `/account/library`. Sign-in, forgot-password, reset-password and address-book pages all use real Supabase Auth data.

Studio access is managed from **Admin → Users**. Accounts themselves are created only in **Supabase → Authentication → Users** (or by customers at `/register`); the studio never creates auth accounts. Once the profile appears, the owner can assign roles, send password-reset links, delete accounts, and grant, refresh or revoke each customer's library access. New registrations are always created as `customer` — studio roles are only assigned inside the owner-only Users screen.

The original demo customer has been removed. The bootstrap demo owner account (`admin@bengalot.com`) should be replaced: sign in, create your own owner account from Users, sign in with it, then delete the demo owner from the same screen.

## What is included

- Editorial homepage with a layered product hero, asymmetric category bento, featured product rail, brand story, flashcard preview, four-step explainer, editable promotion banners, reviews and journal.
- Shop with search, category, format and sort controls.
- Product pages with interactive galleries, a flashcard front/back preview, specs, contents and related products. Every content block — title, Bangla title, story copy, type, format, SKU, specs, contents, requirements, tags, artwork, sort order and the advanced preview JSON — is editable in the studio.
- Bundles are first-class products: the studio lets you choose which digital components a bundle unlocks in the customer library, and printed components are described in "What you get".
- Promo codes at checkout: percentage or fixed discounts with an optional minimum subtotal, discount cap and expiry. A code can apply to the whole bag or only selected products; product-specific discounts are calculated on the eligible items only and re-validated on the server when the order is placed.
- Journal, Our Story and FAQ are editable in the studio Content section, along with the announcement bar and footer social links. Article bodies, FAQ items, announcement copy and social URLs can all change without a deploy.
- Homepage promotion banners are fully editable, including an optional uploaded image that replaces the generated artwork on the right side of the card.
- Customer accounts include a saved address book. Addresses can be added, edited, made default or removed in `/account/addresses`, and checkout fills the whole delivery form with one click.
- The owner-only Users screen manages real customer and studio profiles: assign roles, send reset links, delete accounts, and grant, refresh or revoke each customer's digital library access. Auth accounts are created only in Supabase Authentication or public registration.
- Digital products can carry a delivery PDF uploaded in the studio. The customer receives it in their account library only after payment is confirmed — use it for the Notion template link, download link or setup instructions.
- Transactional email through Purelymail SMTP: order receipts, contact auto-replies and newsletter welcomes. Email is optional — when credentials are blank the storefront keeps working and sends are skipped.
- ZiniPay hosted checkout for digital orders: bKash, Nagad, Rocket and Upay. Invoices are created server-side, verified before fulfilment, and digital access is only released after ZiniPay confirms the payment. Unpaid orders can retry from the confirmation page.
- Persistent cart and a responsive cart drawer, guest checkout for physical orders, validated checkout, delivery pricing, promo codes and an order-confirmation page. Guest confirmation pages need an http-only access cookie that is issued when the order is placed.
- Customer dashboard with a digital library, order tracking, profile editing and password reset.
- Admin studio with analytics, revenue chart, product table and live product editor, orders with status updates, and a promotion editor with live preview and accent colours. Cancelling an order restores physical stock, and a delivered cash-on-delivery order is marked paid automatically.
- Account and admin routes are protected and excluded from search indexing.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Start the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Generate route types and run TypeScript |
| `pnpm verify:flows` | Place and clean up test COD + promo orders against a running server |
| `pnpm verify:images` | Upload a test photo, create and clean up a temp product |
| `pnpm verify:mail` | Check the Purelymail SMTP login and send a test email |
| `pnpm verify:zinipay` | Check the ZiniPay key; optionally create a sandbox invoice |
| `pnpm verify:content` | Save and restore page content, then verify a delivery PDF + entitlement |
| `pnpm verify:users` | Create/role/reset/grant/revoke/delete a temp user, plus address + social checks |
| `pnpm verify:promotions` | Upload a banner image, verify the homepage, then restore the banner |

`pnpm verify:flows` creates two temporary cash-on-delivery orders (one plain, one bundle with a promo code), checks the stored totals, marks one delivered and then cancels it to restore stock. Run it while `pnpm dev` is active. `pnpm verify:images` uploads a generated photo, creates a temporary product with it, checks the product page, shop and studio render the photo, then deletes everything.

## Product photos

Photos are uploaded in the studio product editor (drag and drop or file picker) and stored in the public `product-images` Supabase Storage bucket, which is created automatically on first upload. The first photo is the cover and is used across the shop, cart, search and product page; the original SVG artwork remains the fallback while a product has no photos. Removing a photo in the editor and saving deletes the file from storage.

Digital delivery files follow the same pattern in the `product-resources` bucket. Upload a PDF in the product editor, give the library button a label, and it is attached to the entitlement only after a confirmed payment. Replacing the PDF deletes the old file when the product is saved.

## Environment

Supabase connection details and optional email credentials belong in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Purelymail SMTP (optional — a mailbox without a password is skipped)
MAIL_HOST=smtp.purelymail.com
MAIL_PORT=465
MAIL_SECURE=true

MAIL_SUPPORT_USER=support@bengalot.com
MAIL_SUPPORT_PASS=
MAIL_SUPPORT_FROM="Bengalot Support <support@bengalot.com>"
MAIL_SUPPORT_REPLY_TO=support@bengalot.com

MAIL_INFO_USER=info@bengalot.com
MAIL_INFO_PASS=
MAIL_INFO_FROM="Bengalot <info@bengalot.com>"
MAIL_INFO_REPLY_TO=info@bengalot.com

MAIL_SUPPORT_EMAIL=support@bengalot.com
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. It is used by order creation and admin route handlers after server-side role checks. Never expose it to the browser. `MAIL_*` values are also server-only. Create both mailboxes in Purelymail and add their SMTP passwords, then run `pnpm verify:mail`.

Add the ZiniPay brand key for online payments:

```env
ZINIPAY_API_KEY=
ZINIPAY_BASE_URL=https://api.zinipay.com
ZINIPAY_WEBHOOK_SECRET=
```

`ZINIPAY_WEBHOOK_SECRET` is optional — webhook tokens fall back to `APP_ENCRYPTION_KEY`. The webhook payload is never trusted on its own: every callback calls the ZiniPay verify endpoint before an order is marked paid.

Mailbox split:
- **support@bengalot.com** — order receipts and contact auto-replies.
- **info@bengalot.com** — newsletter welcomes and contact-form notifications.

## ZiniPay payments

Digital orders are paid through ZiniPay's hosted invoice page. The flow is:

1. Checkout creates the order (unpaid) and a ZiniPay invoice.
2. The customer is redirected to ZiniPay and pays with bKash, Nagad, Rocket or Upay.
3. ZiniPay redirects back to `/api/payments/zinipay/return`, or calls `/api/payments/zinipay/webhook`.
4. The server calls ZiniPay's verify endpoint and checks the paid amount.
5. Only then is the order marked paid, stock is adjusted, the library access is granted and the receipt email is sent.

Physical-only orders keep cash on delivery. If a digital order is abandoned, the confirmation page offers a retry button that creates a fresh invoice for the same order. Digital access is never granted from the browser or from the webhook payload alone.

In the ZiniPay dashboard, add the site domain to the brand and make sure the redirect URLs (`https://bengalot.com`, or your preview domain) match. For sandbox testing:

```bash
pnpm verify:zinipay
VERIFY_ZINIPAY_CREATE=true pnpm verify:zinipay
```

The second command creates a small invoice without paying it. Use the sandbox brand key while testing.

## Design notes

- Pure white is the base; cool paper, lavender, teal, coral and butter provide section contrast without warm brown surfaces.
- Product art is original browser-rendered SVG/CSS scenes in `components/product/product-art.tsx`.
- Digital downloads and sample PDFs live in `public/resources/`.
- All storefront motion honours `prefers-reduced-motion`; MotionConfig applies the user setting globally and CSS motion is disabled in the reduced-motion media query.
- Automated axe audits were run across storefront, account and admin pages with no WCAG A/AA violations.

## Before launch

- Replace the demo accounts and reset the exposed setup keys.
- Connect a real bKash/payment workflow; the current flow records orders and grants library access for signed-in digital purchases.
- Review the privacy and terms copy with the owner.
- Review the seeded promo codes in `/admin/promo-codes` before going live.
- Fill both Purelymail passwords (`MAIL_SUPPORT_PASS`, `MAIL_INFO_PASS`) and run `pnpm verify:mail` before taking real orders.
- Add the production ZiniPay brand key, confirm the brand domain, and run a sandbox payment before launch.
- Upload the delivery PDF for every digital product before switching the announcement bar to live mode.
- Add real product photography only when the owner supplies it; the art system is designed to work without photos.
