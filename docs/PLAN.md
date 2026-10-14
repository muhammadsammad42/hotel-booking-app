# Project plan

A hotel booking marketplace in the style of Airbnb and Booking.com: many
hotels, each with multiple room types. Guests browse hotels, check
availability for their dates, pay with Stripe and manage their bookings. A
single ADMIN role manages every hotel, room type, rate and reservation.

This file is updated at the end of every phase.

## Status

| #  | Phase                                 | Status      |
| -- | ------------------------------------- | ----------- |
| 1  | Foundation                            | Done        |
| 2  | Database schema + seed                | Done        |
| 3  | Design system                         | Done        |
| 4  | Auth + roles                          | Done        |
| 5  | Public browsing                       | Done        |
| 6  | Availability + pricing engine         | Done        |
| 7  | Booking + Stripe payments             | Next        |
| 8  | Guest account                         | Not started |
| 9  | Admin dashboard                       | Not started |
| 10 | Production readiness + tests + deploy | Not started |
| 11 | Final UI/UX polish                    | Not started |

## Architecture

- **Framework:** Next.js 16 App Router with TypeScript. Server Components by
  default; a Client Component only where interactivity needs it.
- **Styling:** Tailwind CSS 4 with theme tokens defined in
  `src/app/globals.css`, light and dark themes, and Radix-based components
  from shadcn/ui restyled for the brand. The design system is documented in
  `docs/DESIGN.md` and shown live at `/design`.
- **Brand:** the app is called Sarai. Editorial pages (home, search, hotel
  pages) use the serif display type and generous spacing; the booking flow,
  account and admin use the sans type, tighter spacing and one clear primary
  action.
- **Data:** PostgreSQL on Neon through Prisma 7. The client is generated into
  `src/generated/prisma` and connects with the `@prisma/adapter-pg` driver
  adapter. All database access goes through the singleton in
  `src/lib/prisma.ts`.
- **Connections:** the Prisma CLI (migrations, seed, studio) uses the direct
  connection in `DATABASE_URL`. The app uses the pooled connection in
  `DATABASE_URL_POOLED` and falls back to `DATABASE_URL`.
- **Mutations:** Server Actions. Every input is validated with Zod and every
  action checks authorisation on the server.
- **Auth:** Auth.js v5 (`next-auth@5.0.0-beta.32`) with the Prisma adapter,
  email and password sign-in, JWT sessions carrying the user id and role,
  and two roles, GUEST and ADMIN. Passwords are hashed with bcrypt
  (`src/lib/password.ts`). `src/proxy.ts` makes optimistic redirects; every
  protected page, server action and route handler checks again with the
  helpers in `src/lib/auth/guards.ts`, and admin checks re-read the role from
  the database.
- **Payments:** Stripe Checkout. A webhook route handler confirms payment and
  is the only place a booking becomes paid.
- **Search:** filters live in the URL (`src/lib/search/params.ts`), so
  results can be shared and restored. Destination, stars, amenities and
  guests filter in the database; price and rating are applied in memory.
- **Booking engine:** pure functions in `src/lib/booking/engine.ts` and
  `stay.ts` (nightly prices, availability, quote, stay rules), fed by
  `data.ts`, which loads overrides, blocks and bookings in three queries.
  The same functions run on the server and, for instant quotes on the hotel
  page, in the browser; the server always recalculates before booking.
  Rates and limits are in `src/lib/booking/config.ts`.
- **Maps:** Leaflet with OpenStreetMap tiles, loaded only in the browser.
- **Images:** hotel and room photos are remote URLs (Unsplash in the demo
  data), rendered with `next/image`. A custom loader
  (`src/lib/image-loader.ts`) has the Unsplash CDN resize them, so they do not
  pass through the Next.js image optimizer.
- **Tests:** Vitest (`npm test`), focused on pure logic: redirects,
  validation, and the availability and pricing engine.

## Data model

The schema is in `prisma/schema.prisma`.

| Area         | Models                                              |
| ------------ | --------------------------------------------------- |
| Users, auth  | `User`, `Account`, `Session`, `VerificationToken`   |
| Catalogue    | `Hotel`, `HotelImage`, `RoomType`, `RoomImage`, `Amenity` |
| Pricing      | `RateOverride`, `AvailabilityBlock`                 |
| Bookings     | `Booking`, `Payment`                                |
| Social       | `Review`, `Wishlist`                                |

Rules the rest of the app relies on:

- **Money** is an integer in the smallest currency unit (cents). The platform
  sells in one currency, USD; `Booking` and `Payment` record it.
- **Stay dates** are calendar dates (`@db.Date`) and `checkOut` is exclusive:
  a stay from the 10th to the 12th occupies the nights of the 10th and 11th.
- **Inventory** is per room type: `RoomType.totalInventory` identical rooms
  can be sold each night. A night's availability is that number, minus
  `AvailabilityBlock.roomsBlocked`, minus the rooms held by bookings that
  overlap the night and are `CONFIRMED`, `CHECKED_IN`, or `PENDING` and not
  yet past `expiresAt`.
- **Price** for a night is `RateOverride.price` when a row exists for that
  room type and date, otherwise `RoomType.basePrice`.
- **Holds:** a new booking is `PENDING` with an `expiresAt`. Payment makes it
  `CONFIRMED`; a hold that lapses becomes `EXPIRED`.
- **Reviews:** one per booking, so only guests who stayed can review.
- **Deletes:** bookings and payments are financial records. A user or room
  type with bookings cannot be deleted; hotels and room types are hidden with
  `isActive` instead.
- **Value ranges** (ratings 1-5, `checkOut > checkIn`, non-negative prices and
  counts) are CHECK constraints in the init migration, because the Prisma
  schema cannot express them. Zod still validates all input first.

## Demo data

`npm run db:seed` replaces the catalogue, bookings, reviews and wishlists
with a demo set and upserts the demo users. It refuses to run when
`NODE_ENV` is `production`.

- 1 admin (from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`) and 12 guests
  who share `SEED_GUEST_PASSWORD`.
- 9 fictional hotels: beach (Maldives, Santorini, Bali), city (Karachi,
  Tokyo, Istanbul), mountain (Hunza, Dolomites) and desert (Dubai), with 31
  room types and 39 amenities.
- Weekend (+20%) and holiday-season (+35% city, +50% elsewhere) rate
  overrides for the next 120 nights.
- 56 bookings covering every status, and 45 reviews: 5 per hotel, each from
  a different guest.

## Folder conventions

```
src/app            Routes, layouts, pages, route handlers
  (site)/          Pages with the site header and footer
  (auth)/          Split-screen sign-in and sign-up pages
src/proxy.ts       Optimistic route protection (Next.js proxy)
src/components     Shared React components
  ui/              Building blocks (buttons, inputs, dialogs...)
  layout/          Header, footer, page container
  brand/           Logo
  motion/          Animation helpers
  design/          Demos used only by the /design page
  auth/            Sign-in and sign-up forms
  booking/         Booking pieces shared by several pages
  home/            Home page sections
  hotel/           Hotel cards, hotel page and the booking card
  search/          Search form, filters, results
  map/             Leaflet map (browser only)
src/lib            Utilities, hooks, validation schemas, domain logic
src/generated      Generated Prisma client (not committed)
prisma/            schema.prisma, migrations, seed.ts, seed-data/
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
  `prisma7.config.ts` and a generated client.
- Prisma client singleton in `src/lib/prisma.ts`.
- `db:*` npm scripts; `prisma generate` runs on `npm install`.
- `.env.example`, README setup steps, this plan.

### 2. Database schema + seed (done)

- 15 models and the `init` migration, with indexes for availability lookups,
  booking status, hotel city and wishlists.
- Password hashing helper in `src/lib/password.ts`.
- Demo data seed in `prisma/seed.ts` and `prisma/seed-data/`.
- Unsplash photos used for the demo catalogue.

### 3. Design system (done)

- Brand: the name Sarai, the archway logo, wordmark and favicon.
- Theme tokens for colour, type, radius, shadow, spacing and motion, in
  light and dark, with a theme toggle.
- Components: button, field, input, textarea, select, checkbox, badge, card,
  rating stars, price tag, skeletons, empty state, dialog, sheet, popover,
  tooltip, tabs, avatar, stepper, toasts, date range picker, and an image
  gallery with a fullscreen lightbox.
- App shell: header that turns solid on scroll, mobile menu, footer, skip
  link, and a not-found page.
- `/design` review page and `docs/DESIGN.md`.

### 4. Auth + roles (done)

- Auth.js v5 with the Prisma adapter and a credentials provider; Zod
  validation; constant-time rejection of unknown emails.
- `/login` and `/register`: split screen with an editorial photo, inline
  validation, password strength meter, show/hide password, loading state and
  toasts. Users return to the page they came from, including mid-booking.
- Proxy plus server-side guards for `/account/*`, `/wishlist`, `/book/*`
  (signed in) and `/admin/*` (ADMIN, checked against the database).
- Header: Sign in link and a user menu (My trips, Wishlist, Admin dashboard
  for admins, theme, Sign out); the mobile menu has the same.
- `/account/trips` lists the bookings of the signed-in guest; `/admin` shows headline
  numbers until the full dashboard in phase 9.
- Not done: Google sign-in (skipped for now; the provider can be added when
  `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` exist), password reset (needs
  email), and rate limiting of sign-in attempts (phase 10).

### 5. Public browsing (done)

- Home: full-bleed hero with a floating search card (destination
  suggestions, dates, guests), trending stays carousel, destination cards,
  why Sarai, testimonials from seeded reviews, closing call to action.
- `/search`: destination, dates, guests, price slider, amenities, hotel
  class and guest rating filters (sidebar on desktop, bottom sheet on
  mobile), sorting, animated result count, pagination, and a list and map
  split with price pins that highlight with the cards; full-screen map
  with a preview card on phones.
- Hotel cards with a photo carousel, wishlist heart and Guest favourite
  badge; `/destinations`; `/wishlist`.
- `/hotels/[slug]`: photo grid and lightbox, highlights, description with
  read more, amenities, room cards with Select, reviews with breakdown and
  sub-ratings, location map, sticky booking card and mobile booking bar.
- Skeletons, empty and error states, per-page metadata.
- Database pool tuned (5 long-lived connections) after Neon timed out
  authenticating bursts of new connections on a cold start.
- Not done here: prices for chosen dates and availability (phase 6), and
  the `/book` page that Reserve links to (phase 7). Public catalogue
  queries are not cached yet (phase 10).

### 6. Availability + pricing engine (done)

- `getNightlyPrices`, `getAvailability`, `quote`, `buildCalendar` and
  `validateStay`: UTC calendar dates, check-out exclusive, rate overrides,
  blocks, confirmed and in-house bookings and unexpired holds; taxes (10%)
  and service fee (5%) in integer cents; maximum stay 30 nights, bookings up
  to 365 days ahead, no past dates.
- 30 engine tests (52 in total) for overlapping bookings, expired holds,
  overrides, blocks, edge dates and validation.
- Search with dates shows only stays free for every night, priced for the
  dates; invalid dates are explained and ignored.
- Hotel page calendar: prices under each date, cheaper dates in green,
  sold-out nights struck through with a tooltip and refused in a stay,
  animated month changes; live, animated price breakdown; "Only N rooms
  left" badges; room cards priced for the dates.

### 7. Booking + Stripe payments

Booking flow with a timed hold, Stripe Checkout session, webhook
confirmation, and handling of abandoned or failed payments.

### 8. Guest account

Upcoming and past bookings, booking detail, cancellation, reviews.

### 9. Admin dashboard

Manage hotels, room types, rates, availability blocks and reservations.

### 10. Production readiness + tests + deploy

Error handling, security review, test coverage, deployment.

### 11. Final UI/UX polish

Full pass against the UI review checklist in `CLAUDE.md`, accessibility and
Lighthouse targets.
