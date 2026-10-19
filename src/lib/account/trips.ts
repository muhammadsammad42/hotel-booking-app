// Queries for a guest's own bookings. Every query is scoped by user id.
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

const hotelSummary = {
  name: true,
  slug: true,
  city: true,
  country: true,
  checkInTime: true,
  checkOutTime: true,
  coverImageUrl: true,
  coverImageAlt: true,
} as const;

export async function getTrips(userId: string) {
  return prisma.booking.findMany({
    where: { userId, status: { not: "EXPIRED" } },
    orderBy: { checkIn: "asc" },
    include: {
      roomType: { select: { name: true, hotel: { select: hotelSummary } } },
      review: { select: { rating: true } },
      payments: { where: { status: "REFUNDED" }, select: { amount: true } },
    },
  });
}

export type Trip = Awaited<ReturnType<typeof getTrips>>[number];

/** One booking of the user, with everything the trip page shows. 404 for anyone else's. */
export async function getTrip(id: string, userId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id, userId },
    include: {
      roomType: {
        select: {
          id: true,
          name: true,
          beds: true,
          sizeSqm: true,
          hotel: { select: { ...hotelSummary, address: true, latitude: true, longitude: true, starRating: true } },
        },
      },
      review: true,
      payments: { where: { status: { in: ["SUCCEEDED", "REFUNDED"] } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!booking) notFound();
  return booking;
}

export type TripDetail = Awaited<ReturnType<typeof getTrip>>;

export const nightsOf = (booking: { checkIn: Date; checkOut: Date }) =>
  Math.round((booking.checkOut.getTime() - booking.checkIn.getTime()) / 86_400_000);
