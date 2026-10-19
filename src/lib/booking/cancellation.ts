// Cancelling a booking and refunding its payment. Server only.
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

import { guestCancellation } from "./policy";

export class CancellationError extends Error {
  constructor(
    public code: "not-found" | "not-cancellable" | "too-late" | "refund-failed",
    message: string,
  ) {
    super(message);
  }
}

type CancelInput =
  | { bookingId: string; actor: "guest"; userId: string }
  | { bookingId: string; actor: "admin" };

/** Demo payments made by the seed never existed in Stripe. */
const isSeedPayment = (paymentIntentId: string) => paymentIntentId.startsWith("pi_seed_");

/**
 * Cancels a booking and refunds what was paid, in full.
 *
 * Guests can cancel their own confirmed bookings until the cancellation
 * deadline; admins can cancel any pending or confirmed booking. The booking
 * row is locked while Stripe refunds, so the booking is only marked cancelled
 * once the refund exists. If Stripe fails, nothing changes and the guest can
 * try again; the idempotency key stops a retry from refunding twice.
 */
export async function cancelBooking(input: CancelInput, now = new Date()) {
  const result = await prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Booking" WHERE id = ${input.bookingId} FOR UPDATE`;
      const booking = await tx.booking.findFirst({
        where: { id: input.bookingId, ...(input.actor === "guest" ? { userId: input.userId } : {}) },
        include: {
          roomType: { select: { hotel: { select: { checkInTime: true } } } },
          payments: { where: { status: "SUCCEEDED" } },
        },
      });
      if (!booking) throw new CancellationError("not-found", "We could not find this booking.");

      if (input.actor === "guest") {
        const check = guestCancellation(booking, booking.roomType.hotel.checkInTime, now);
        if (!check.allowed) {
          throw check.reason === "too-late"
            ? new CancellationError("too-late", "The free cancellation window for this booking has closed. Contact the hotel to change your stay.")
            : new CancellationError("not-cancellable", "This booking can no longer be cancelled.");
        }
      } else if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
        throw new CancellationError("not-cancellable", "Only pending or confirmed bookings can be cancelled.");
      }

      let refunded = 0;
      for (const payment of booking.payments) {
        if (payment.stripePaymentIntentId && !isSeedPayment(payment.stripePaymentIntentId)) {
          try {
            await getStripe().refunds.create(
              { payment_intent: payment.stripePaymentIntentId, metadata: { bookingId: booking.id, reason: `cancelled by ${input.actor}` } },
              { idempotencyKey: `cancel-${payment.id}` },
            );
          } catch (error) {
            console.error(`[cancellation] Refund failed for booking ${booking.id}:`, error);
            throw new CancellationError("refund-failed", "We could not refund your payment just now, so the booking is unchanged. Please try again in a moment.");
          }
        }
        await tx.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } });
        refunded += payment.amount;
      }

      // Open checkout sessions must not be paid any more (closed below).
      const openSessions = await tx.payment.findMany({
        where: { bookingId: booking.id, status: "PENDING", stripeCheckoutSessionId: { not: null } },
        select: { stripeCheckoutSessionId: true },
      });
      await tx.payment.updateMany({ where: { bookingId: booking.id, status: "PENDING" }, data: { status: "FAILED" } });
      const updated = await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED", expiresAt: null },
      });
      return {
        booking: updated,
        refunded,
        currency: booking.currency,
        openSessions: openSessions.map((payment) => payment.stripeCheckoutSessionId!).filter((id) => id.startsWith("cs_") && !id.startsWith("cs_seed_")),
      };
    },
    { maxWait: 10_000, timeout: 30_000 },
  );

  // A payment that still slips through is refunded by confirmFromSession,
  // which refunds any payment for a cancelled booking.
  if (result.openSessions.length && process.env.STRIPE_SECRET_KEY) {
    await Promise.allSettled(result.openSessions.map((id) => getStripe().checkout.sessions.expire(id)));
  }
  return { booking: result.booking, refunded: result.refunded, currency: result.currency };
}
