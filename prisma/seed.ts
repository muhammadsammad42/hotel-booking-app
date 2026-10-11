// Demo data. Run with `npm run db:seed`.
//
// The seed replaces the whole catalogue and every booking, review and
// wishlist with the demo set, so it refuses to run in production. Users are
// upserted by email and never deleted.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  type BookingStatus,
  type PaymentStatus,
} from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";
import { amenities } from "./seed-data/amenities";
import { hotels, type SeedHotel } from "./seed-data/hotels";

const RATE_OVERRIDE_DAYS = 120;
const WEEKEND_UPLIFT = 1.2;
const HOLIDAY_UPLIFT = { city: 1.35, beach: 1.5, mountain: 1.5, desert: 1.5 };
const DAY_MS = 86_400_000;

// Migrations and seeding use the direct connection, like the Prisma CLI.
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// --- Helpers ---------------------------------------------------------------

/** Deterministic random numbers, so every run produces the same data set. */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(20261011);

function randomInt(min: number, max: number) {
  return min + Math.floor(random() * (max - min + 1));
}

/** Stay dates are calendar dates, stored as midnight UTC. */
function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY_MS);
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** 20 December to 2 January. */
function isHolidaySeason(date: Date) {
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  return (month === 11 && day >= 20) || (month === 0 && day <= 2);
}

function isWeekendNight(date: Date) {
  const weekday = date.getUTCDay();
  return weekday === 5 || weekday === 6;
}

function roundToDollar(cents: number) {
  return Math.round(cents / 100) * 100;
}

function overridePrice(hotel: SeedHotel, basePrice: number, date: Date) {
  if (isHolidaySeason(date)) return roundToDollar(basePrice * HOLIDAY_UPLIFT[hotel.kind]);
  if (isWeekendNight(date)) return roundToDollar(basePrice * WEEKEND_UPLIFT);
  return null;
}

const usedReferences = new Set<string>();

function bookingReference() {
  // No 0/O or 1/I, so a reference is easy to read back over the phone.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (;;) {
    let code = "";
    for (let i = 0; i < 6; i++) code += alphabet[randomInt(0, alphabet.length - 1)];
    const reference = `HB-${code}`;
    if (!usedReferences.has(reference)) {
      usedReferences.add(reference);
      return reference;
    }
  }
}

function clampRating(value: number) {
  return Math.min(5, Math.max(1, value));
}

/** A sub-rating close to the overall rating. */
function subRating(rating: number) {
  const roll = random();
  if (roll < 0.2) return clampRating(rating - 1);
  if (roll > 0.8) return clampRating(rating + 1);
  return rating;
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set. Add it to .env (see .env.example).`);
  }
  return value;
}

// --- Seed steps ------------------------------------------------------------

async function seedUsers() {
  const adminEmail = requireEnv("SEED_ADMIN_EMAIL").toLowerCase();
  const adminPassword = requireEnv("SEED_ADMIN_PASSWORD");
  if (adminPassword.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
  }

  const adminHash = await hashPassword(adminPassword);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminHash, role: "ADMIN" },
    create: {
      name: "Site Admin",
      email: adminEmail,
      passwordHash: adminHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  // Guests can only sign in with a password when SEED_GUEST_PASSWORD is set.
  const guestPassword = process.env.SEED_GUEST_PASSWORD;
  const guestHash = guestPassword ? await hashPassword(guestPassword) : null;

  const guestProfiles = [
    { name: "Ayesha Khan", email: "ayesha.khan@example.com", phone: "+92 300 5550101" },
    { name: "Daniel Meyer", email: "daniel.meyer@example.com", phone: "+49 151 5550102" },
    { name: "Sofia Rossi", email: "sofia.rossi@example.com", phone: "+39 320 5550103" },
  ];

  const guests = [];
  for (const profile of guestProfiles) {
    const user = await prisma.user.upsert({
      where: { email: profile.email },
      update: { name: profile.name, passwordHash: guestHash, role: "GUEST" },
      create: {
        name: profile.name,
        email: profile.email,
        passwordHash: guestHash,
        role: "GUEST",
        emailVerified: new Date(),
      },
    });
    guests.push({ id: user.id, ...profile });
  }
  return guests;
}

type Guest = Awaited<ReturnType<typeof seedUsers>>[number];

async function clearDemoData() {
  await prisma.$transaction([
    prisma.review.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.wishlist.deleteMany(),
    prisma.availabilityBlock.deleteMany(),
    prisma.rateOverride.deleteMany(),
    prisma.roomImage.deleteMany(),
    prisma.hotelImage.deleteMany(),
    prisma.roomType.deleteMany(),
    prisma.hotel.deleteMany(),
    prisma.amenity.deleteMany(),
  ]);
}

async function seedCatalogue() {
  await prisma.amenity.createMany({ data: amenities.map((amenity) => ({ ...amenity })) });

  const created = [];
  for (const hotel of hotels) {
    const cover = hotel.images[0];
    const record = await prisma.hotel.create({
      data: {
        name: hotel.name,
        slug: hotel.slug,
        description: hotel.description,
        city: hotel.city,
        country: hotel.country,
        address: hotel.address,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        starRating: hotel.starRating,
        checkInTime: hotel.checkInTime,
        checkOutTime: hotel.checkOutTime,
        coverImageUrl: cover.url,
        coverImageAlt: cover.alt,
        isFeatured: hotel.isFeatured,
        amenities: { connect: hotel.amenities.map((name) => ({ name })) },
        images: {
          create: hotel.images.map((image, sortOrder) => ({ ...image, sortOrder })),
        },
        roomTypes: {
          create: hotel.roomTypes.map((roomType) => ({
            name: roomType.name,
            slug: roomType.slug,
            description: roomType.description,
            maxGuests: roomType.maxGuests,
            beds: roomType.beds,
            sizeSqm: roomType.sizeSqm,
            basePrice: roomType.basePrice,
            totalInventory: roomType.totalInventory,
            amenities: { connect: roomType.amenities.map((name) => ({ name })) },
            images: {
              create: roomType.images.map((image, sortOrder) => ({ ...image, sortOrder })),
            },
          })),
        },
      },
      include: { roomTypes: true },
    });
    created.push({ seed: hotel, record });
  }
  return created;
}

type Catalogue = Awaited<ReturnType<typeof seedCatalogue>>;

/** Weekend and holiday prices for the next 120 nights. */
async function seedRateOverrides(catalogue: Catalogue, today: Date) {
  const prices = new Map<string, number>();
  const rows = [];

  for (const { seed, record } of catalogue) {
    for (const roomType of record.roomTypes) {
      for (let offset = 0; offset < RATE_OVERRIDE_DAYS; offset++) {
        const date = addDays(today, offset);
        const price = overridePrice(seed, roomType.basePrice, date);
        if (price === null) continue;
        rows.push({ roomTypeId: roomType.id, date, price });
        prices.set(`${roomType.id}:${dateKey(date)}`, price);
      }
    }
  }

  await prisma.rateOverride.createMany({ data: rows });
  return prices;
}

async function seedAvailabilityBlocks(catalogue: Catalogue, today: Date) {
  const blocks = [
    { hotel: "caldera-blue-suites", room: "private-pool-villa", from: 30, nights: 7, rooms: 1, reason: "Pool resurfacing" },
    { hotel: "the-clifton-grand", room: "superior-king", from: 10, nights: 5, rooms: 3, reason: "Floor refurbishment" },
    { hotel: "baltit-heights-lodge", room: "summit-suite", from: 95, nights: 14, rooms: 2, reason: "Closed for winter maintenance" },
  ];

  const rows = blocks.flatMap((block) => {
    const roomType = findRoomType(catalogue, block.hotel, block.room);
    return Array.from({ length: block.nights }, (_, night) => ({
      roomTypeId: roomType.id,
      date: addDays(today, block.from + night),
      roomsBlocked: block.rooms,
      reason: block.reason,
    }));
  });

  await prisma.availabilityBlock.createMany({ data: rows });
}

function findRoomType(catalogue: Catalogue, hotelSlug: string, roomSlug: string) {
  const hotel = catalogue.find((entry) => entry.record.slug === hotelSlug);
  const roomType = hotel?.record.roomTypes.find((room) => room.slug === roomSlug);
  if (!hotel || !roomType) {
    throw new Error(`Unknown room type in seed data: ${hotelSlug}/${roomSlug}`);
  }
  return { ...roomType, hotelId: hotel.record.id };
}

type BookingInput = {
  guest: Guest;
  roomType: ReturnType<typeof findRoomType>;
  checkIn: Date;
  nights: number;
  guests: number;
  rooms?: number;
  status: BookingStatus;
  createdAt: Date;
  payment?: PaymentStatus;
  expiresAt?: Date;
  specialRequests?: string;
  review?: { rating: number; comment: string };
};

async function createBooking(input: BookingInput, prices: Map<string, number>) {
  const rooms = input.rooms ?? 1;
  const checkOut = addDays(input.checkIn, input.nights);

  let totalPrice = 0;
  for (let night = 0; night < input.nights; night++) {
    const date = addDays(input.checkIn, night);
    const nightly = prices.get(`${input.roomType.id}:${dateKey(date)}`) ?? input.roomType.basePrice;
    totalPrice += nightly * rooms;
  }

  const reference = bookingReference();
  const paid = input.payment === "SUCCEEDED" || input.payment === "REFUNDED";

  await prisma.booking.create({
    data: {
      reference,
      userId: input.guest.id,
      roomTypeId: input.roomType.id,
      checkIn: input.checkIn,
      checkOut,
      guests: input.guests,
      rooms,
      totalPrice,
      status: input.status,
      expiresAt: input.expiresAt,
      guestName: input.guest.name,
      guestEmail: input.guest.email,
      guestPhone: input.guest.phone,
      specialRequests: input.specialRequests,
      createdAt: input.createdAt,
      payments: input.payment
        ? {
            create: {
              // Placeholder ids: these payments never existed in Stripe.
              stripeCheckoutSessionId: `cs_seed_${reference}`,
              stripePaymentIntentId: paid ? `pi_seed_${reference}` : null,
              amount: totalPrice,
              status: input.payment,
              paidAt: paid ? new Date(input.createdAt.getTime() + 4 * 60_000) : null,
              createdAt: input.createdAt,
            },
          }
        : undefined,
      review: input.review
        ? {
            create: {
              userId: input.guest.id,
              hotelId: input.roomType.hotelId,
              rating: input.review.rating,
              cleanliness: subRating(input.review.rating),
              location: subRating(input.review.rating),
              value: subRating(input.review.rating),
              service: subRating(input.review.rating),
              comment: input.review.comment,
              createdAt: addDays(checkOut, randomInt(1, 6)),
            },
          }
        : undefined,
    },
  });
}

async function seedBookings(
  catalogue: Catalogue,
  guests: Guest[],
  prices: Map<string, number>,
  today: Date,
) {
  const [ayesha, daniel, sofia] = guests;
  const bookings: BookingInput[] = [];

  // Completed stays over the past year, each with a review.
  catalogue.forEach(({ seed, record }, hotelIndex) => {
    seed.reviews.forEach((review, reviewIndex) => {
      const room = record.roomTypes[reviewIndex % record.roomTypes.length];
      const nights = randomInt(2, 5);
      const checkOut = addDays(today, -(20 + reviewIndex * 55 + hotelIndex * 9 + randomInt(0, 10)));
      const checkIn = addDays(checkOut, -nights);
      bookings.push({
        guest: guests[(hotelIndex + reviewIndex) % guests.length],
        roomType: { ...room, hotelId: record.id },
        checkIn,
        nights,
        guests: Math.min(room.maxGuests, 2),
        status: "CHECKED_OUT",
        createdAt: addDays(checkIn, -randomInt(14, 60)),
        payment: "SUCCEEDED",
        review,
      });
    });
  });

  const room = (hotelSlug: string, roomSlug: string) => findRoomType(catalogue, hotelSlug, roomSlug);

  bookings.push(
    // Recent stays that have not been reviewed yet.
    {
      guest: sofia,
      roomType: room("hotel-kumo-shibuya", "compact-queen"),
      checkIn: addDays(today, -9),
      nights: 3,
      guests: 2,
      status: "CHECKED_OUT",
      createdAt: addDays(today, -40),
      payment: "SUCCEEDED",
    },
    {
      guest: ayesha,
      roomType: room("tirta-segara-resort", "garden-deluxe-room"),
      checkIn: addDays(today, -16),
      nights: 4,
      guests: 2,
      status: "CHECKED_OUT",
      createdAt: addDays(today, -55),
      payment: "SUCCEEDED",
    },
    // In house today.
    {
      guest: ayesha,
      roomType: room("the-clifton-grand", "executive-king"),
      checkIn: addDays(today, -1),
      nights: 3,
      guests: 2,
      status: "CHECKED_IN",
      createdAt: addDays(today, -12),
      payment: "SUCCEEDED",
      specialRequests: "High floor, away from the lifts, please.",
    },
    // Upcoming.
    {
      guest: ayesha,
      roomType: room("caldera-blue-suites", "caldera-view-suite"),
      checkIn: addDays(today, 21),
      nights: 4,
      guests: 2,
      status: "CONFIRMED",
      createdAt: addDays(today, -8),
      payment: "SUCCEEDED",
      specialRequests: "We are celebrating our anniversary.",
    },
    {
      guest: daniel,
      roomType: room("baltit-heights-lodge", "valley-view-deluxe"),
      checkIn: addDays(today, 9),
      nights: 5,
      guests: 3,
      status: "CONFIRMED",
      createdAt: addDays(today, -20),
      payment: "SUCCEEDED",
      specialRequests: "Arriving late from Gilgit, around 9 pm.",
    },
    {
      guest: daniel,
      roomType: room("larch-and-stone-alpine-lodge", "family-chalet-suite"),
      checkIn: addDays(today, 75),
      nights: 6,
      guests: 5,
      status: "CONFIRMED",
      createdAt: addDays(today, -3),
      payment: "SUCCEEDED",
    },
    {
      guest: sofia,
      roomType: room("dune-haven-desert-resort", "majlis-suite"),
      checkIn: addDays(today, 33),
      nights: 3,
      guests: 2,
      status: "CONFIRMED",
      createdAt: addDays(today, -5),
      payment: "SUCCEEDED",
    },
    {
      guest: sofia,
      roomType: room("tirta-segara-resort", "two-bedroom-pool-villa"),
      checkIn: addDays(today, 50),
      nights: 7,
      guests: 4,
      status: "CONFIRMED",
      createdAt: addDays(today, -2),
      payment: "SUCCEEDED",
      specialRequests: "Two vegetarian guests.",
    },
    // A hold that is waiting for payment.
    {
      guest: ayesha,
      roomType: room("hotel-kumo-shibuya", "city-view-king"),
      checkIn: addDays(today, 40),
      nights: 3,
      guests: 2,
      status: "PENDING",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60_000),
      payment: "PENDING",
    },
    // Cancelled and refunded.
    {
      guest: daniel,
      roomType: room("coral-lagoon-resort", "beach-bungalow"),
      checkIn: addDays(today, 60),
      nights: 5,
      guests: 2,
      status: "CANCELLED",
      createdAt: addDays(today, -15),
      payment: "REFUNDED",
    },
    // A hold that lapsed without payment.
    {
      guest: sofia,
      roomType: room("galata-pera-house", "deluxe-room"),
      checkIn: addDays(today, 15),
      nights: 2,
      guests: 2,
      status: "EXPIRED",
      createdAt: addDays(today, -1),
      expiresAt: new Date(addDays(today, -1).getTime() + 30 * 60_000),
    },
  );

  for (const booking of bookings) {
    await createBooking(booking, prices);
  }
}

async function seedWishlists(catalogue: Catalogue, guests: Guest[]) {
  const [ayesha, daniel, sofia] = guests;
  const picks: [Guest, string[]][] = [
    [ayesha, ["coral-lagoon-resort", "baltit-heights-lodge", "larch-and-stone-alpine-lodge"]],
    [daniel, ["caldera-blue-suites", "dune-haven-desert-resort"]],
    [sofia, ["tirta-segara-resort", "hotel-kumo-shibuya", "baltit-heights-lodge"]],
  ];

  const rows = picks.flatMap(([guest, slugs]) =>
    slugs.map((slug) => {
      const hotel = catalogue.find((entry) => entry.record.slug === slug);
      if (!hotel) throw new Error(`Unknown hotel in seed data: ${slug}`);
      return { userId: guest.id, hotelId: hotel.record.id };
    }),
  );

  await prisma.wishlist.createMany({ data: rows });
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The seed deletes existing data and must not run in production.");
  }

  const today = startOfUtcDay(new Date());

  const guests = await seedUsers();
  await clearDemoData();
  const catalogue = await seedCatalogue();
  const prices = await seedRateOverrides(catalogue, today);
  await seedAvailabilityBlocks(catalogue, today);
  await seedBookings(catalogue, guests, prices, today);
  await seedWishlists(catalogue, guests);

  const [users, hotelCount, roomTypes, overrides, bookings, reviews] = await Promise.all([
    prisma.user.count(),
    prisma.hotel.count(),
    prisma.roomType.count(),
    prisma.rateOverride.count(),
    prisma.booking.count(),
    prisma.review.count(),
  ]);
  console.log(
    `Seeded ${users} users, ${hotelCount} hotels, ${roomTypes} room types, ` +
      `${overrides} rate overrides, ${bookings} bookings and ${reviews} reviews.`,
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
