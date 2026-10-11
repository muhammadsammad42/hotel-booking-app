# Hotel Booking App

A full-stack hotel booking marketplace in the style of Airbnb and
Booking.com. Guests browse hotels around the world, check availability for
their dates, and pay for their stay online. An admin manages every hotel,
room type, rate and reservation.

**Tech stack:** Next.js (App Router, TypeScript), Tailwind CSS, Prisma 7,
PostgreSQL (Neon), Auth.js, Stripe Checkout, Zod, Vitest.

The architecture and roadmap are in [docs/PLAN.md](docs/PLAN.md).

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
   | `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`)                |

3. Create the database tables and load the demo data:

   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

   The seed takes a minute or two. It replaces all hotels, bookings and
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

## Other commands

| Command         | What it does               |
| --------------- | -------------------------- |
| `npm run build` | Production build           |
| `npm run lint`  | Lint the project           |

## Project structure

```
src/app         Routes, layouts, and pages (App Router)
src/components  Shared React components
src/lib         Server utilities (e.g. Prisma client)
prisma/         Prisma schema, migrations, and seed script
docs/           Project plan
```
