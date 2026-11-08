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

## Demo accounts

These accounts exist for reviewing the experience:

| Role | Email | Password |
| --- | --- | --- |
| Customer | `nadia@bengalot.com` | `BengalotStudy!2026` |
| Owner / admin | `admin@bengalot.com` | `BengalotAdmin!2026` |

The sign-in page also has compact demo-fill buttons. Remove or change these accounts before a real launch.

## What is included

- Editorial homepage with a layered product hero, asymmetric category bento, featured product rail, brand story, flashcard preview, four-step explainer, editable promotion banners, reviews and journal.
- Shop with search, category, format and sort controls.
- Product pages with interactive galleries, a flashcard front/back preview, specs, contents and related products.
- Printed planners with paper, page count and delivery details, plus a printed + digital Student Starter Bundle.
- Persistent cart and a responsive cart drawer, guest checkout for physical orders, validated checkout, delivery pricing and an order-confirmation page.
- Customer dashboard with a digital library, order tracking, profile editing and password reset.
- Admin studio with analytics, revenue chart, product table and live product editor, orders with status updates, and a promotion editor with live preview and accent colours.
- Account and admin routes are protected and excluded from search indexing.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Start the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Generate route types and run TypeScript |

## Environment

Only Supabase connection details belong in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. It is used by order creation and admin route handlers after server-side role checks. Never expose it to the browser.

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
- Add real product photography only when the owner supplies it; the art system is designed to work without photos.
