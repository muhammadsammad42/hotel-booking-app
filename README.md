<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/brand/sarai-logo-light.svg" />
    <img src="public/brand/sarai-logo.svg" alt="Sarai" height="56" />
  </picture>
</p>

<p align="center"><strong>Book remarkable hotels in minutes, from overwater villas to mountain lodges.</strong></p>

<p align="center">
  <a href="#">Live demo</a> ·
  <a href="#demo-accounts">Demo accounts</a> ·
  <a href="docs/PLAN.md">Architecture</a> ·
  <a href="docs/DESIGN.md">Design system</a>
</p>

<p align="center">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="Prisma 7" src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white" />
  <img alt="PostgreSQL on Neon" src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white" />
  <img alt="Stripe Checkout" src="https://img.shields.io/badge/Stripe-Checkout-635BFF?logo=stripe&logoColor=white" />
  <img alt="Auth.js v5" src="https://img.shields.io/badge/Auth.js-v5-EB5424" />
  <img alt="Tested with Vitest and Playwright" src="https://img.shields.io/badge/tests-Vitest_%2B_Playwright-6E9F18?logo=vitest&logoColor=white" />
</p>

Sarai is a full-stack hotel booking marketplace in the style of Airbnb and
Booking.com. Guests search nine hotels around the world, see real
availability and nightly prices for their dates, and pay with Stripe. An
admin runs everything from a dashboard: hotels, room types, rates, blocked
rooms and reservations.

> **Live demo:** _add your Vercel URL here_ · Payments run in Stripe test
> mode, so no real money moves.

## Screenshots

| Desktop | Phone |
| --- | --- |
| ![Home page on desktop](docs/screenshots/home-desktop.png) | ![Home page on a phone](docs/screenshots/home-mobile.png) |
| ![Hotel page on desktop](docs/screenshots/hotel-desktop.png) | ![Booking on a phone](docs/screenshots/booking-mobile.png) |
| ![Admin overview](docs/screenshots/admin-desktop.png) | ![My trips on a phone](docs/screenshots/trips-mobile.png) |

![From search to confirmation](docs/screenshots/booking-flow.gif)

_Placeholders: add the images to `docs/screenshots/`._

## Demo accounts

| Who | Email | Password |
| --- | --- | --- |
| Guest | `ayesha.khan@example.com` | _the `SEED_GUEST_PASSWORD` you set_ |
| Admin | _your `SEED_ADMIN_EMAIL`_ | _your `SEED_ADMIN_PASSWORD`_ |

Pay with the Stripe test card **4242 4242 4242 4242**, any future expiry
date and any CVC. The card **4000 0000 0000 0002** is declined, to try the
unhappy path. The payment page shows the test card while Stripe is in test
mode.

## Features

**For guests**

- Search by destination, dates and guests, with price, rating, class and
  amenity filters, sorting, and a list and map view.
- Hotel pages with a photo gallery, amenities, room types, reviews with
  category scores, a map, and a calendar that shows each night's price,
  cheaper dates and sold-out nights.
- Booking in three steps: guest details, a 30-minute hold with a live
  countdown, and Stripe Checkout. A confirmation page with the reference, a
  calendar file and confetti.
- My trips: a countdown to the next trip, upcoming, past and cancelled
  stays, a printable receipt, free cancellation up to 48 hours before
  check-in with an automatic refund, and reviews after a stay.
- Wishlist with undo, and a profile with name, photo and password.
- Light and dark themes, built for phones first, and accessible: keyboard
  support, visible focus, screen reader labels and AA contrast.

**For the admin**

- An overview with revenue, bookings, occupancy and average daily rate
  against last month, charts, and today's arrivals and departures with
  one-click check-in and check-out.
- Reservations with search, filters, sorting, a detail drawer, cancel with
  refund, and CSV export.
- Hotels and room types with photos (by URL, or uploads to Cloudinary),
  amenities and visibility.
- A rates calendar: drag across dates to set prices or block rooms in bulk.
- An occupancy heatmap, and a command palette (Ctrl+K) to jump anywhere.

**Under the hood**

- Rate limits, a Content-Security-Policy and security headers, signed
  Stripe webhooks, and role checks on the server for every action.
- Optional booking emails through Resend.
- Sitemap, robots.txt, canonical URLs and generated share images.
- Unit tests for the booking engine and the rules around it, and end-to-end
  tests in a real browser on desktop and phone sizes.

## How it works

```
Browser ──► Next.js App Router (React Server Components, Server Actions)
              │
              ├─ Booking engine (pure functions: prices, availability, quotes)
              ├─ Prisma 7 ──► PostgreSQL (Neon)
              ├─ Auth.js (credentials, JWT sessions, GUEST and ADMIN roles)
              └─ Stripe Checkout ──► webhook ──► confirm or refund
```

Pages are Server Components that read the database directly; interactive
parts are small Client Components. Every change goes through a Server
Action that validates its input with Zod and checks who is asking. The
details are in [docs/PLAN.md](docs/PLAN.md).

### Availability and double-booking prevention

- **One source of truth.** A room type has a number of identical rooms. A
  night's free rooms are that number, minus rooms blocked by the admin,
  minus rooms held by bookings that are confirmed, checked in, or pending
  and still inside their hold. The same pure functions in
  `src/lib/booking/engine.ts` answer this for search, the hotel calendar
  and the booking itself, and they are covered by unit tests.
- **Prices are never trusted from the browser.** The server recalculates the
  nightly rates, taxes and fee when the booking is made and stores that
  snapshot.
- **The last room cannot be sold twice.** Creating a booking runs in a
  database transaction that first locks the room type row
  (`SELECT ... FOR UPDATE`). Two guests reserving the last room at the same
  moment are served one after the other: the second one re-checks
  availability, sees the first one's hold and is told the room has just gone.
- **Holds expire.** A new booking holds its rooms for 30 minutes while the
  guest pays; the Stripe Checkout Session expires at the same moment. Lapsed
  holds stop counting at once, and a cron job tidies the records.
- **Payments are confirmed once.** The Stripe webhook and the success page
  both confirm through the same idempotent function, so a duplicate or
  late event changes nothing. A payment that arrives after its hold lapsed
  is accepted if the rooms are still free and refunded automatically if not.

## Local setup

### Prerequisites

- Node.js 20.19+, 22.12+ or 24+ (required by Prisma 7)
- A PostgreSQL database (for example, a free [Neon](https://neon.tech) project)

### Steps

1. Install dependencies. This also generates the Prisma client.

   ```bash
   npm install
   ```

2. Create your local environment file and fill in the values:

   ```bash
   cp .env.example .env
   ```

   | Variable                | Description                                                |
   | ----------------------- | ---------------------------------------------------------- |
   | `DATABASE_URL`          | Direct PostgreSQL connection string, used for migrations   |
   | `DATABASE_URL_POOLED`   | Pooled connection string, used by the app (optional)       |
   | `SEED_ADMIN_EMAIL`      | Email of the admin account created by the seed             |
   | `SEED_ADMIN_PASSWORD`   | Password of that admin account (at least 8 characters)     |
   | `SEED_GUEST_PASSWORD`   | Shared password for the demo guests (optional)             |
   | `AUTH_SECRET`           | Auth.js secret (generate with `npx auth secret`)           |
   | `STRIPE_SECRET_KEY`     | Stripe secret key (test mode: `sk_test_...`)               |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`)        |
   | `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`, see below)            |
   | `APP_URL`               | Public URL of the site (optional locally)                  |
   | `CRON_SECRET`           | Protects the hold clean-up route (required in production)  |
   | `RESEND_API_KEY`        | Optional. Sends booking and cancellation emails            |
   | `EMAIL_FROM`            | Sender for those emails, on a domain verified in Resend    |
   | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Optional. Photo uploads in the admin |

3. Create the database tables and load the demo data:

   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

   The seed takes about two minutes: it writes about 11,000 bookings, so the
   admin dashboard has a year of history. It replaces all hotels, bookings and
   reviews with the demo set, so do not run it against real data.

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Database (Prisma 7)

The schema is in `prisma/schema.prisma` and the Prisma CLI is configured in
`prisma7.config.ts`, which loads `.env`. The client is generated into
`src/generated/prisma` (not committed) and connects through the
`@prisma/adapter-pg` driver adapter. Import the shared client from
`src/lib/prisma.ts`:

```ts
import { prisma } from "@/lib/prisma";
```

| Command               | What it does                                             |
| --------------------- | -------------------------------------------------------- |
| `npm run db:generate` | Regenerate the Prisma client after a schema change       |
| `npm run db:migrate`  | Create and apply a migration in development              |
| `npm run db:push`     | Push the schema to the database without a migration      |
| `npm run db:seed`     | Reset the demo data (`prisma/seed.ts`)                   |
| `npm run db:studio`   | Open Prisma Studio to browse the data                    |

Use `npm run db:migrate` when you change the schema; it creates a new
migration. Use `npx prisma migrate deploy` to apply existing migrations to a
fresh database.

### Demo data

The seed creates one admin, twelve guests (for example
`ayesha.khan@example.com`; the full list is in `prisma/seed.ts`) and nine
fictional hotels across beach, city, mountain and desert destinations, with room types,
amenities, weekend and holiday rates for the next 120 nights, bookings in
every status, and reviews. Photos are from [Unsplash](https://unsplash.com).

The data model and its rules are described in
[docs/PLAN.md](docs/PLAN.md#data-model).

## Testing payments (Stripe test mode)

1. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and log in:

   ```bash
   stripe login
   ```

2. In a second terminal, forward webhooks to the app and copy the
   `whsec_...` secret it prints into `STRIPE_WEBHOOK_SECRET` in `.env`:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Restart `npm run dev`, sign in, pick dates on a hotel page and press
   Reserve. On the Stripe page, choose Card and use any future expiry date
   and any CVC:

   | Card                  | Result                                   |
   | --------------------- | ---------------------------------------- |
   | `4242 4242 4242 4242` | Paid; the booking is confirmed           |
   | `4000 0000 0000 0002` | Declined; Stripe shows the error         |
   | `4000 0025 0000 3155` | Asks for 3D Secure authentication        |

4. The `stripe listen` terminal shows `checkout.session.completed` with a
   `200` from the app.

The success page also confirms the booking from the Checkout Session, so a
booking completes even if the webhook is slow; both paths are idempotent.
Lapsed holds are released by `GET /api/cron/expire-holds` (schedule it, for
example every 10 minutes, with `Authorization: Bearer $CRON_SECRET`).

## Tests

| Command | What it does |
| --- | --- |
| `npm test` | Unit tests (Vitest): the booking engine, policies, metrics, validation, CSV and email templates |
| `npm run test:e2e` | End-to-end tests (Playwright) on a desktop and a phone viewport |
| `npm run lint` | ESLint |
| `npm run build` | Production build, including type checking |
| `npm run analyze` | Bundle analyzer (Turbopack), in the browser |

The end-to-end tests build the app, start it on port 3100 and use the real
database and Stripe in test mode, so `.env` needs the database URLs, the
Stripe test keys and the seed passwords. They use the Chrome installed on
your machine. They cover:

- search, hotel page, booking, payment with the test card 4242 4242 4242 4242,
  confirmation, then cancelling the trip for a refund;
- signing in in the middle of a booking and landing back on it;
- an admin changing a nightly rate and the hotel page charging it.

To test a server that is already running: `E2E_BASE_URL=http://localhost:3000 npm run test:e2e`.

## Deploying to Vercel and Neon

1. **Database.** In Neon, create a project and copy two connection strings:
   the direct one (`DATABASE_URL`) and the pooled one, whose host contains
   `-pooler` (`DATABASE_URL_POOLED`).

2. **Migrations.** From your machine, with `DATABASE_URL` pointing at the
   production database, apply the migrations:

   ```bash
   npx prisma migrate deploy
   ```

   Run it again whenever a release adds a migration. To have Vercel do it on
   every deploy instead, set the build command to
   `npx prisma migrate deploy && npm run build`.

3. **Demo data (optional).** With the same `.env`, run `npm run db:seed`.
   It replaces all hotels, bookings and reviews, so only do this on a demo
   database. It refuses to run when `NODE_ENV` is `production`.

4. **Project.** Import the GitHub repository in Vercel. The framework preset
   (Next.js) and the default build command are right; `prisma generate`
   runs on install.

5. **Environment variables.** In Vercel, under Settings, Environment
   Variables, add for Production:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL`, `DATABASE_URL_POOLED` | From Neon |
   | `AUTH_SECRET` | A new secret: `npx auth secret` |
   | `APP_URL` | The site address, e.g. `https://sarai.vercel.app` |
   | `STRIPE_SECRET_KEY` | `sk_test_...` for a demo, `sk_live_...` for real payments |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | The matching `pk_...` key |
   | `STRIPE_WEBHOOK_SECRET` | From step 6 |
   | `CRON_SECRET` | A long random string, e.g. `openssl rand -hex 32` |
   | `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_GUEST_PASSWORD` | Only if you seed from Vercel; not needed at runtime |
   | `RESEND_API_KEY`, `EMAIL_FROM` | Optional, for booking emails |
   | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Optional, for admin photo uploads |

6. **Stripe webhook.** In the Stripe Dashboard, under Developers, Webhooks,
   add an endpoint for `https://YOUR-DOMAIN/api/webhooks/stripe` with these
   events: `checkout.session.completed`, `checkout.session.expired`,
   `checkout.session.async_payment_succeeded` and
   `checkout.session.async_payment_failed`. Copy its signing secret
   (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` and redeploy.

7. **Cron.** `vercel.json` schedules `/api/cron/expire-holds` with Vercel
   Cron. Vercel sends `Authorization: Bearer $CRON_SECRET` automatically
   once `CRON_SECRET` is set; without it the route refuses to run in
   production. The schedule is daily (04:00 UTC), the most the Hobby plan
   allows. That is enough because availability already ignores lapsed holds;
   the job only tidies records and old rate-limit counters. On the Pro plan
   you can change it to `*/10 * * * *`.

   On Vercel, Auth.js trusts the host by itself. On any other host (or with
   `npm run start` locally), also set `AUTH_TRUST_HOST=true`.

8. **Deploy and check.** Open the site, sign in with the seeded admin, make a
   booking with the test card, and check that the Stripe webhook delivery
   shows `200` in the Dashboard.

## Security

- Every server action and route handler checks who is signed in and, for
  admin work, re-reads the role from the database. Every input is validated
  with Zod.
- Sign-in, sign-up, booking and account changes are rate limited (counts are
  kept in Postgres, so the limits hold across serverless instances).
- Security headers on every response: a Content-Security-Policy,
  `X-Frame-Options: DENY`, `nosniff`, a strict referrer policy, a
  permissions policy and HSTS in production.
- Stripe webhooks are verified with their signature; payments are confirmed
  idempotently and never trusted from the browser.

## Project structure

```
src/app         Routes, layouts, and pages (App Router)
src/components  Shared React components (ui, layout, brand)
src/lib         Utilities, hooks and the Prisma client
prisma/         Prisma schema, migrations, and seed script
docs/           Project plan and design system
```
