# Project plan

Hotel booking platform for a single hotel with multiple room types. Guests
browse rooms, check availability for their dates, pay with Stripe and manage
their bookings. Staff manage rooms, prices and bookings from an admin
dashboard.

This file is updated at the end of every phase.

## Status

| #  | Phase                                 | Status      |
| -- | ------------------------------------- | ----------- |
| 1  | Foundation                            | Done        |
| 2  | Database schema + seed                | Next        |
| 3  | Design system                         | Not started |
| 4  | Auth + roles                          | Not started |
| 5  | Public browsing                       | Not started |
| 6  | Availability + pricing engine         | Not started |
| 7  | Booking + Stripe payments             | Not started |
| 8  | Guest account                         | Not started |
| 9  | Admin dashboard                       | Not started |
| 10 | Production readiness + tests + deploy | Not started |
| 11 | Final UI/UX polish                    | Not started |

## Architecture

- **Framework:** Next.js 16 App Router with TypeScript. Server Components by
  default; a Client Component only where interactivity needs it.
- **Styling:** Tailwind CSS 4 with theme tokens defined in
  `src/app/globals.css`. The design system is documented in `docs/DESIGN.md`
  (written in phase 3).
- **Data:** PostgreSQL on Neon through Prisma 7. The client is generated into
  `src/generated/prisma` and connects with the `@prisma/adapter-pg` driver
  adapter. All database access goes through the singleton in
  `src/lib/prisma.ts`.
- **Connections:** the Prisma CLI (migrations, seed, studio) uses the direct
  connection in `DATABASE_URL`. The app uses the pooled connection in
  `DATABASE_URL_POOLED` and falls back to `DATABASE_URL`.
- **Mutations:** Server Actions. Every input is validated with Zod and every
  action checks authorisation on the server.
- **Auth:** Auth.js (NextAuth) with two roles, guest and admin.
- **Payments:** Stripe Checkout. A webhook route handler confirms payment and
  is the only place a booking becomes paid.
- **Data rules:** money is stored as integer cents; check-in and check-out are
  stored as `@db.Date`.
- **Tests:** Vitest, focused on the availability and pricing logic.

## Folder conventions

```
src/app            Routes, layouts, pages, route handlers
src/components     Shared React components
src/lib            Server utilities, validation schemas, domain logic
src/generated      Generated Prisma client (not committed)
prisma/            schema.prisma, migrations, seed.ts
prisma7.config.ts  Prisma CLI configuration
docs/              PLAN.md, DESIGN.md
```

Application code lives only in `src/app`, `src/components`, `src/lib` and
`prisma/`. Secrets live in `.env`, which is never committed; `.env.example`
lists every variable the app needs.

## Phases

### 1. Foundation (done)

- Next.js starter content removed; placeholder home page.
- Prisma 7.10.0 (`prisma`, `@prisma/client`, `@prisma/adapter-pg`) with
  `prisma7.config.ts`, an empty schema and a generated client.
- Prisma client singleton in `src/lib/prisma.ts`.
- `db:*` npm scripts; `prisma generate` runs on `npm install`.
- `.env.example`, README setup steps, this plan.

### 2. Database schema + seed

Models for users, room types, rooms, bookings and payments; the first
migration; realistic seed data.

### 3. Design system

`docs/DESIGN.md`, theme tokens for light and dark mode, typography, and the
base components (button, input, card, skeleton, empty and error states).

### 4. Auth + roles

Sign up, sign in and sign out with Auth.js; guest and admin roles; protected
routes and server-side authorisation helpers.

### 5. Public browsing

Home page, room type listing and room type detail pages.

### 6. Availability + pricing engine

Date-range availability that prevents double bookings, and price calculation
per stay. Covered by unit tests.

### 7. Booking + Stripe payments

Booking flow, Stripe Checkout session, webhook confirmation, and handling of
abandoned or failed payments.

### 8. Guest account

Upcoming and past bookings, booking detail, cancellation.

### 9. Admin dashboard

Manage room types, rooms, prices and bookings.

### 10. Production readiness + tests + deploy

Error handling, security review, test coverage, deployment.

### 11. Final UI/UX polish

Full pass against the UI review checklist in `CLAUDE.md`, accessibility and
Lighthouse targets.
