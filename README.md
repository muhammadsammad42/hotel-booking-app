# Hotel Booking App

A full-stack booking platform for a single hotel with multiple room types.
Guests can browse rooms, check availability, and pay for their stay online.

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
   | `AUTH_SECRET`           | Auth.js secret (generate with `npx auth secret`)           |
   | `STRIPE_SECRET_KEY`     | Stripe secret key (test mode: `sk_test_...`)               |
   | `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`)                |

3. Start the development server:

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
| `npm run db:seed`     | Run `prisma/seed.ts`                                     |
| `npm run db:studio`   | Open Prisma Studio to browse the data                    |

The schema has no models yet, so there is nothing to migrate or seed.

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
