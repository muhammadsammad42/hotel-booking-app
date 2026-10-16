"use server";

import { getCurrentUser } from "@/lib/auth/guards";
import { BookingError, checkoutSessionFor, createHold } from "@/lib/booking/holds";
import { STAY_ERROR_MESSAGES, todayIso, validateStay } from "@/lib/booking/stay";
import { prisma } from "@/lib/prisma";
import { siteOrigin } from "@/lib/site-url";
import { bookingSubmissionSchema, type BookingSubmission, type GuestDetails } from "@/lib/validation/booking";

export type CreateBookingResult =
  | { ok: true; bookingId: string }
  | {
      ok: false;
      fieldErrors?: Partial<Record<keyof GuestDetails, string>>;
      formError?: string;
      /** The stay itself cannot be booked: send the guest back to choose again. */
      unavailable?: boolean;
    };

/**
 * Validates the stay and guest details, holds the rooms and opens a Stripe
 * Checkout Session. Everything is checked again here: the price, the
 * availability and the signed-in user.
 */
export async function createBookingAction(input: BookingSubmission): Promise<CreateBookingResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, formError: "Your session has ended. Sign in again to continue." };

  const parsed = bookingSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof GuestDetails, string>> = {};
    for (const issue of parsed.error.issues) {
      const [group, field] = issue.path;
      if (group === "guest" && typeof field === "string" && !fieldErrors[field as keyof GuestDetails]) {
        fieldErrors[field as keyof GuestDetails] = issue.message;
      }
    }
    return Object.keys(fieldErrors).length
      ? { ok: false, fieldErrors }
      : { ok: false, formError: "Something about this stay is not valid. Go back and choose it again.", unavailable: true };
  }

  const data = parsed.data;
  const stay = validateStay(data.checkIn, data.checkOut, todayIso());
  if (!stay.ok) return { ok: false, formError: STAY_ERROR_MESSAGES[stay.error], unavailable: true };

  const room = await prisma.roomType.findFirst({
    where: { id: data.room, isActive: true, hotel: { slug: data.hotel, isActive: true } },
    select: { id: true },
  });
  if (!room) return { ok: false, formError: "This room is no longer available to book.", unavailable: true };

  let bookingId: string;
  try {
    const { booking } = await createHold({
      userId: user.id,
      roomTypeId: room.id,
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      guests: data.guests,
      rooms: data.rooms,
      guest: data.guest,
    });
    bookingId = booking.id;
  } catch (error) {
    if (error instanceof BookingError) return { ok: false, formError: error.message, unavailable: error.code !== "capacity" };
    console.error("[booking] Could not create hold:", error);
    return { ok: false, formError: "We could not reserve your room just now. Please try again in a moment." };
  }

  try {
    const session = await checkoutSessionFor(bookingId, await siteOrigin());
    if (!session) throw new Error("No checkout session");
  } catch (error) {
    console.error("[booking] Could not create checkout session:", error);
    // Release the rooms rather than leave a hold nobody can pay for.
    await prisma.booking.updateMany({ where: { id: bookingId, status: "PENDING" }, data: { status: "EXPIRED" } });
    return { ok: false, formError: "We could not start the payment. You have not been charged. Please try again." };
  }

  return { ok: true, bookingId };
}
