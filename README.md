# BroadcastGFX

Broadcast and event graphics packages for webinars, livestreams, and conferences —
a digital storefront with user accounts, a cart, one-time purchases, and a
subscription membership, built with Next.js, Prisma, NextAuth, and Stripe.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Prisma + Postgres** for data (built against [Neon](https://neon.tech), works with any Postgres host)
- **NextAuth (Auth.js) v5** — email/password (Credentials) + Google OAuth
- **Stripe Checkout** — one-time package purchases and recurring membership subscriptions, fulfilled via webhook

## Getting started

1. Create a free Postgres database (e.g. [Neon](https://console.neon.tech)) and copy its connection string into `DATABASE_URL` in `.env`.
2. Install deps and set up the schema:

```bash
npm install
npx prisma migrate dev --name init   # applies the schema to your Postgres database
npm run db:seed                      # seeds categories, products, and membership plans
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env` (already done for local dev) and fill in:

| Variable | Where to get it |
| --- | --- |
| `AUTH_SECRET` | `openssl rand -base64 32` (a default dev value is already set) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials). Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI. |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` | [Stripe Dashboard → API keys](https://dashboard.stripe.com/test/apikeys) (test mode) |
| `STRIPE_WEBHOOK_SECRET` | Created when you register the webhook endpoint (see below) |

Until Stripe keys are set, checkout buttons show a clear "payments aren't
configured yet" error instead of failing silently — everything else
(browsing, auth, cart) works without Stripe.

### Stripe webhook (local dev)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`. The webhook
handles `checkout.session.completed` (fulfills one-time orders and activates
subscriptions) and `customer.subscription.updated/deleted` (keeps membership
status in sync).

No Stripe Products/Prices need to be pre-created in the dashboard — line
items are built dynamically from the database at checkout time.

## How the store works

- **Catalog** — `Product`/`Category` in [prisma/schema.prisma](prisma/schema.prisma), seeded via [prisma/seed.ts](prisma/seed.ts).
- **Auth** — [src/auth.ts](src/auth.ts): Credentials (bcrypt-hashed passwords) + Google, JWT sessions.
- **Cart** — stored per-user in the database ([src/app/api/cart/route.ts](src/app/api/cart/route.ts)); sign-in is required to add to cart.
- **Checkout** — [src/app/api/checkout/route.ts](src/app/api/checkout/route.ts) (one-time) and [src/app/api/checkout/subscribe/route.ts](src/app/api/checkout/subscribe/route.ts) (membership) create Stripe Checkout Sessions.
- **Fulfillment** — [src/app/api/webhooks/stripe/route.ts](src/app/api/webhooks/stripe/route.ts) marks orders paid and activates subscriptions.
- **Downloads** — [src/app/api/downloads/[assetId]/route.ts](src/app/api/downloads/%5BassetId%5D/route.ts) gates every file behind a purchase or active membership check. Files in this demo are generated placeholder text files — swap in real asset storage (e.g. S3 signed URLs) for production.
- **Account dashboard** — `/account` and `/account/orders` show membership status, order history, and download links; `/api/billing-portal` opens the Stripe customer portal for self-serve plan management/cancellation.

## Product images

Product cover art is generated locally as SVG mockups (`scripts/generate-placeholders.mjs` → `public/products/`) so the storefront has no external image dependency. Replace with real renders before shipping.

## Deploying (Vercel + Neon)

1. **Database** — create a Neon project at [console.neon.tech](https://console.neon.tech), copy the pooled connection string.
2. **Push the code to GitHub** — this repo isn't connected to a remote yet:
   ```bash
   git remote add origin <your-empty-github-repo-url>
   git push -u origin main
   ```
3. **Import into Vercel** — [vercel.com/new](https://vercel.com/new), import the GitHub repo. Framework preset (Next.js) is auto-detected.
4. **Set environment variables** in the Vercel project (Settings → Environment Variables) — same keys as `.env.example`:
   - `DATABASE_URL` — the Neon connection string
   - `AUTH_SECRET` — generate a new one for production: `openssl rand -base64 32`
   - `NEXTAUTH_URL` and `APP_URL` — your production URL, e.g. `https://your-app.vercel.app`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — add `https://your-app.vercel.app/api/auth/callback/google` as an authorized redirect URI in Google Cloud Console
   - `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` — Stripe keys (test or live)
   - `STRIPE_WEBHOOK_SECRET` — see next step
5. **Deploy.** The build runs `prisma migrate deploy` automatically (see `package.json`), applying the schema to Neon on every deploy — no separate migration step needed.
6. **Register the Stripe webhook** — in the [Stripe Dashboard](https://dashboard.stripe.com/webhooks), add an endpoint at `https://your-app.vercel.app/api/webhooks/stripe`, subscribe to `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`, then copy the signing secret into `STRIPE_WEBHOOK_SECRET` in Vercel and redeploy.
7. **Seed the production database** (once): run locally with the production `DATABASE_URL` set: `DATABASE_URL="<neon-url>" npm run db:seed`.

Custom domains, preview deployments, and rollbacks are all handled by Vercel once connected.
