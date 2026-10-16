import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

/** A booking of the signed-in user, with what the booking pages show. 404 for anyone else. */
export async function getOwnBooking(id: string, returnTo: string) {
  const user = await requireUser(returnTo);
  const booking = await prisma.booking.findFirst({
    where: { id, userId: user.id },
    include: {
      roomType: {
        select: {
          id: true,
          name: true,
          hotel: {
            select: {
              name: true,
              slug: true,
              city: true,
              country: true,
              address: true,
              checkInTime: true,
              checkOutTime: true,
              coverImageUrl: true,
              coverImageAlt: true,
            },
          },
        },
      },
    },
  });
  if (!booking) notFound();
  return booking;
}

export type OwnBooking = Awaited<ReturnType<typeof getOwnBooking>>;

/** True while a pending booking still holds its rooms. */
export function holdIsActive(booking: Pick<OwnBooking, "status" | "expiresAt">, now = new Date()) {
  return booking.status === "PENDING" && booking.expiresAt !== null && booking.expiresAt > now;
}

/** The /book link that starts this stay again, e.g. after a hold expired. */
export function rebookHref(booking: OwnBooking) {
  return `/book?${new URLSearchParams({
    hotel: booking.roomType.hotel.slug,
    room: booking.roomType.id,
    checkIn: booking.checkIn.toISOString().slice(0, 10),
    checkOut: booking.checkOut.toISOString().slice(0, 10),
    guests: String(booking.guests),
    rooms: String(booking.rooms),
  })}`;
}
