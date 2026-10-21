// Reservation search for the admin table and its CSV export. Server only.
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { PAGE_SIZE, reservationWhere, type ReservationFilters } from "./reservation-filters";

export * from "./reservation-filters";

function orderBy(filters: ReservationFilters): Prisma.BookingOrderByWithRelationInput[] {
  const dir = filters.dir;
  switch (filters.sort) {
    case "checkIn":
      return [{ checkIn: dir }, { createdAt: "desc" }];
    case "guest":
      return [{ guestName: dir }, { createdAt: "desc" }];
    case "total":
      return [{ totalPrice: dir }, { createdAt: "desc" }];
    default:
      return [{ createdAt: dir }];
  }
}

export const reservationSelect = {
  id: true,
  reference: true,
  status: true,
  checkIn: true,
  checkOut: true,
  guests: true,
  rooms: true,
  guestName: true,
  guestEmail: true,
  guestPhone: true,
  specialRequests: true,
  subtotal: true,
  taxes: true,
  serviceFee: true,
  totalPrice: true,
  currency: true,
  expiresAt: true,
  createdAt: true,
  roomType: { select: { id: true, name: true, hotel: { select: { id: true, name: true, slug: true, city: true } } } },
  payments: { orderBy: { createdAt: "asc" }, select: { id: true, amount: true, status: true, paidAt: true, updatedAt: true, stripePaymentIntentId: true } },
} satisfies Prisma.BookingSelect;

export async function listReservations(filters: ReservationFilters) {
  const where = reservationWhere(filters);
  const total = await prisma.booking.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const rows = await prisma.booking.findMany({
    where,
    orderBy: orderBy(filters),
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: reservationSelect,
  });
  return { rows, total, page, pageCount };
}

export type Reservation = Awaited<ReturnType<typeof listReservations>>["rows"][number];

/** Every matching reservation, for export. Capped so a request stays small. */
export function exportReservations(filters: ReservationFilters, limit = 5000) {
  return prisma.booking.findMany({ where: reservationWhere(filters), orderBy: orderBy(filters), take: limit, select: reservationSelect });
}
