// Booking holds and their payment lifecycle. Server only.
//
// A booking starts PENDING with a hold (expiresAt). The rooms count against
// availability until the hold lapses. Stripe confirms payment through the
// webhook (or the success page, whichever arrives first); both call the
// same idempotent functions here.
import type Stripe from "stripe";

import type { Booking } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

import { BOOKING_CONFIG } from "./config";
import { loadEngineRows } from "./data";
import { getAvailability, getNightlyPrices, quote } from "./engine";
import { generateReference } from "./reference";
import { toIso, toUtcDate } from "./stay";

export class BookingError extends Error {
  constructor(
    public code: "not-found" | "unavailable" | "capacity",
    message: string,
  ) {
    super(message);
  }
}

type HoldInput = {
  userId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  guest: { name: string; email: string; phone: string; specialRequests: string };
};

/**
 * Creates a PENDING booking that holds the rooms. The room type row is locked
 * for the length of the transaction, so two guests booking the last room are
 * served one after the other: the second sees the first one's hold and is
 * refused. Prices are always recomputed here, never taken from the browser.
 */
export async function createHold(input: HoldInput, now = new Date()): Promise<{ booking: Booking; reused: boolean }> {
  return prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM "RoomType" WHERE id = ${input.roomTypeId} FOR UPDATE`;

      const room = await tx.roomType.findFirst({
        where: { id: input.roomTypeId, isActive: true, hotel: { isActive: true } },
        select: { id: true, basePrice: true, totalInventory: true, maxGuests: true },
      });
      if (!room) throw new BookingError("not-found", "This room is no longer available to book.");
      if (input.rooms * room.maxGuests < input.guests || input.rooms > BOOKING_CONFIG.maxRooms) {
        throw new BookingError("capacity", "That many guests need more rooms of this type. Go back and choose a larger room.");
      }

      // A second click, or a return visit, reuses the guest's open hold.
      const existing = await tx.booking.findFirst({
        where: {
          userId: input.userId,
          roomTypeId: room.id,
          checkIn: toUtcDate(input.checkIn),
          checkOut: toUtcDate(input.checkOut),
          rooms: input.rooms,
          status: "PENDING",
          expiresAt: { gt: now },
        },
      });
      if (existing) {
        return {
          booking: await tx.booking.update({
            where: { id: existing.id },
            data: {
              guests: input.guests,
              guestName: input.guest.name,
              guestEmail: input.guest.email,
              guestPhone: input.guest.phone || null,
              specialRequests: input.guest.specialRequests || null,
            },
          }),
          reused: true,
        };
      }

      const rows = (await loadEngineRows([room.id], input.checkIn, input.checkOut, tx)).get(room.id)!;
      const availability = getAvailability({
        totalInventory: room.totalInventory,
        blocks: rows.blocks,
        bookings: rows.bookings,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        rooms: input.rooms,
        now,
      });
      if (!availability.bookable) {
        throw new BookingError("unavailable", "Someone has just booked the last room for these dates. Try other dates or another room.");
      }

      const price = quote({
        nights: getNightlyPrices({ basePrice: room.basePrice, overrides: rows.overrides, checkIn: input.checkIn, checkOut: input.checkOut }),
        rooms: input.rooms,
      });

      let reference = generateReference();
      while (await tx.booking.findUnique({ where: { reference }, select: { id: true } })) reference = generateReference();

      const booking = await tx.booking.create({
        data: {
          reference,
          userId: input.userId,
          roomTypeId: room.id,
          checkIn: toUtcDate(input.checkIn),
          checkOut: toUtcDate(input.checkOut),
          guests: input.guests,
          rooms: input.rooms,
          subtotal: price.subtotal,
          taxes: price.taxes,
          serviceFee: price.serviceFee,
          totalPrice: price.total,
          currency: price.currency,
          status: "PENDING",
          // A minute beyond the session's 30 so Stripe accepts its expiry.
          expiresAt: new Date(now.getTime() + (BOOKING_CONFIG.holdMinutes + 1) * 60_000),
          guestName: input.guest.name,
          guestEmail: input.guest.email,
          guestPhone: input.guest.phone || null,
          specialRequests: input.guest.specialRequests || null,
        },
      });
      return { booking, reused: false };
    },
    { maxWait: 10_000, timeout: 20_000 },
  );
}

/** The open Checkout Session for a booking, creating one if needed. */
export async function checkoutSessionFor(bookingId: string, origin: string): Promise<Stripe.Checkout.Session | null> {
  const stripe = getStripe();
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      roomType: { select: { name: true, hotel: { select: { name: true, city: true, coverImageUrl: true } } } },
      payments: { where: { status: "PENDING", stripeCheckoutSessionId: { not: null } }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!booking || booking.status !== "PENDING" || !booking.expiresAt || booking.expiresAt <= new Date()) return null;

  const existingId = booking.payments[0]?.stripeCheckoutSessionId;
  if (existingId) {
    // Demo data and deleted test sessions are not found; start a new one.
    const existing = await stripe.checkout.sessions.retrieve(existingId).catch(() => null);
    if (existing?.status === "open") return existing;
  }

  // Stripe needs at least 30 minutes; a hold with less left cannot get a new session.
  const expiresAt = Math.floor(booking.expiresAt.getTime() / 1000);
  if (expiresAt - Date.now() / 1000 < 30 * 60) return null;

  const nights = Math.round((booking.checkOut.getTime() - booking.checkIn.getTime()) / 86_400_000);
  const { name: roomName, hotel } = booking.roomType;
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      // Charge in the currency the guest saw on Sarai, without conversion.
      adaptive_pricing: { enabled: false },
      client_reference_id: booking.id,
      customer_email: booking.guestEmail,
      expires_at: expiresAt,
      metadata: { bookingId: booking.id, reference: booking.reference },
      payment_intent_data: { metadata: { bookingId: booking.id, reference: booking.reference } },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: booking.currency.toLowerCase(),
            unit_amount: booking.subtotal,
            product_data: {
              name: `${hotel.name}: ${roomName}`,
              description: `${nights} ${nights === 1 ? "night" : "nights"}, ${toIso(booking.checkIn)} to ${toIso(booking.checkOut)}${booking.rooms > 1 ? `, ${booking.rooms} rooms` : ""}`,
              images: [hotel.coverImageUrl],
            },
          },
        },
        { quantity: 1, price_data: { currency: booking.currency.toLowerCase(), unit_amount: booking.taxes, product_data: { name: "Taxes" } } },
        {
          quantity: 1,
          price_data: { currency: booking.currency.toLowerCase(), unit_amount: booking.serviceFee, product_data: { name: "Sarai service fee" } },
        },
      ].filter((item) => item.price_data.unit_amount > 0),
      custom_text: {
        submit: { message: `We are holding your room for ${BOOKING_CONFIG.holdMinutes} minutes while you pay. Booking ${booking.reference}.` },
      },
      success_url: `${origin}/book/${booking.id}/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/book/${booking.id}/cancelled`,
    },
    // Retries of the same request do not create a second session.
    { idempotencyKey: `checkout-${booking.id}-${expiresAt}` },
  );

  await prisma.payment.upsert({
    where: { stripeCheckoutSessionId: session.id },
    create: {
      bookingId: booking.id,
      stripeCheckoutSessionId: session.id,
      amount: booking.totalPrice,
      currency: booking.currency,
      status: "PENDING",
    },
    update: {},
  });
  return session;
}

export type ConfirmResult = "confirmed" | "already-confirmed" | "refunded" | "unpaid" | "mismatch" | "not-found";

/**
 * Marks a booking paid from a completed Checkout Session. Safe to call more
 * than once and from both the webhook and the success page. If the payment
 * arrives after the hold lapsed, the booking is confirmed only if the rooms
 * are still free; otherwise the payment is refunded in full.
 */
export async function confirmFromSession(session: Stripe.Checkout.Session, now = new Date()): Promise<ConfirmResult> {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return "not-found";
  if (session.payment_status !== "paid") return "unpaid";
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  const outcome = await prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Booking" WHERE id = ${bookingId} FOR UPDATE`;
      const booking = await tx.booking.findUnique({ where: { id: bookingId } });
      if (!booking) return "not-found" as const;
      if (session.amount_total !== booking.totalPrice) return "mismatch" as const;

      const recordPayment = (status: "SUCCEEDED" | "REFUNDED") =>
        tx.payment.upsert({
          where: { stripeCheckoutSessionId: session.id },
          create: {
            bookingId: booking.id,
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
            amount: session.amount_total ?? booking.totalPrice,
            currency: booking.currency,
            status,
            paidAt: now,
          },
          update: { stripePaymentIntentId: paymentIntentId, status, paidAt: now },
        });

      if (["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"].includes(booking.status)) {
        await recordPayment("SUCCEEDED");
        return "already-confirmed" as const;
      }
      if (booking.status === "CANCELLED") return "refund" as const;

      const lapsed = booking.status === "EXPIRED" || !booking.expiresAt || booking.expiresAt <= now;
      if (lapsed) {
        // Paid after the hold ran out: confirm only if the rooms are still free.
        await tx.$queryRaw`SELECT id FROM "RoomType" WHERE id = ${booking.roomTypeId} FOR UPDATE`;
        const room = await tx.roomType.findUniqueOrThrow({ where: { id: booking.roomTypeId }, select: { totalInventory: true } });
        const checkIn = toIso(booking.checkIn);
        const checkOut = toIso(booking.checkOut);
        const rows = (await loadEngineRows([booking.roomTypeId], checkIn, checkOut, tx)).get(booking.roomTypeId)!;
        // The lapsed hold no longer counts against availability, so this checks
        // whether anyone else has taken the rooms since.
        const free = getAvailability({
          totalInventory: room.totalInventory,
          blocks: rows.blocks,
          bookings: rows.bookings,
          checkIn,
          checkOut,
          rooms: booking.rooms,
          now,
        }).bookable;
        if (!free) return "refund" as const;
      }

      await tx.booking.update({ where: { id: booking.id }, data: { status: "CONFIRMED", expiresAt: null } });
      await recordPayment("SUCCEEDED");
      return "confirmed" as const;
    },
    { maxWait: 10_000, timeout: 20_000 },
  );

  if (outcome !== "refund") return outcome;

  // Refund outside the transaction; the idempotency key makes retries safe.
  if (paymentIntentId) {
    await getStripe().refunds.create({ payment_intent: paymentIntentId }, { idempotencyKey: `refund-${session.id}` });
  }
  await prisma.$transaction([
    prisma.booking.updateMany({ where: { id: bookingId, status: { in: ["PENDING", "EXPIRED"] } }, data: { status: "EXPIRED" } }),
    prisma.payment.upsert({
      where: { stripeCheckoutSessionId: session.id },
      create: {
        bookingId,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        amount: session.amount_total ?? 0,
        status: "REFUNDED",
        paidAt: now,
      },
      update: { stripePaymentIntentId: paymentIntentId, status: "REFUNDED" },
    }),
  ]);
  return "refunded";
}

/** Releases the hold of an unpaid session that Stripe has expired. Idempotent. */
export async function expireFromSession(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return 0;
  const [bookings] = await prisma.$transaction([
    prisma.booking.updateMany({ where: { id: bookingId, status: "PENDING" }, data: { status: "EXPIRED" } }),
    prisma.payment.updateMany({ where: { stripeCheckoutSessionId: session.id, status: "PENDING" }, data: { status: "FAILED" } }),
  ]);
  return bookings.count;
}

/**
 * Marks lapsed holds EXPIRED and closes their Stripe sessions. Availability
 * already ignores lapsed holds, so this only keeps the records tidy.
 */
export async function expireLapsedHolds(now = new Date()) {
  const lapsed = await prisma.booking.findMany({
    where: { status: "PENDING", expiresAt: { lt: now } },
    select: { id: true, payments: { where: { status: "PENDING" }, select: { stripeCheckoutSessionId: true } } },
  });
  if (lapsed.length === 0) return { expired: 0 };

  const ids = lapsed.map((booking) => booking.id);
  await prisma.$transaction([
    prisma.booking.updateMany({ where: { id: { in: ids }, status: "PENDING" }, data: { status: "EXPIRED" } }),
    prisma.payment.updateMany({ where: { bookingId: { in: ids }, status: "PENDING" }, data: { status: "FAILED" } }),
  ]);

  const sessions = lapsed.flatMap((booking) => booking.payments.map((payment) => payment.stripeCheckoutSessionId)).filter(Boolean) as string[];
  if (sessions.length && process.env.STRIPE_SECRET_KEY) {
    const stripe = getStripe();
    await Promise.allSettled(sessions.map((id) => stripe.checkout.sessions.expire(id)));
  }
  return { expired: ids.length };
}
