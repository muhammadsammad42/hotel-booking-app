// Reservation filters (from the URL) and CSV encoding. Pure: no database access.
import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import { isIsoDate, toUtcDate } from "@/lib/booking/stay";

export const PAGE_SIZE = 15;

export const RESERVATION_STATUSES = ["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "EXPIRED"] as const;
export const RESERVATION_SORTS = ["created", "checkIn", "guest", "total"] as const;

const optionalDate = z
  .string()
  .optional()
  .transform((value) => (value && isIsoDate(value) ? value : undefined));

/** Filters from the URL. Anything invalid is dropped rather than failing the page. */
export const reservationFiltersSchema = z.object({
  q: z
    .string()
    .optional()
    .transform((value) => value?.trim().slice(0, 80) || undefined),
  status: z.enum(RESERVATION_STATUSES).optional().catch(undefined),
  hotel: z.string().max(64).optional().catch(undefined),
  from: optionalDate,
  to: optionalDate,
  /** Check-out on this date, for the "leaving today" list. */
  out: optionalDate,
  sort: z.enum(RESERVATION_SORTS).catch("created").default("created"),
  dir: z.enum(["asc", "desc"]).catch("desc").default("desc"),
  page: z.coerce.number().int().min(1).max(10_000).catch(1).default(1),
});

export type ReservationFilters = z.infer<typeof reservationFiltersSchema>;

export function parseReservationFilters(params: Record<string, string | string[] | undefined>): ReservationFilters {
  const flat = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
  return reservationFiltersSchema.parse(flat);
}

/** Search matches the reference, guest name or email. from and to filter on check-in; out on check-out. */
export function reservationWhere(filters: ReservationFilters): Prisma.BookingWhereInput {
  const where: Prisma.BookingWhereInput = {};
  if (filters.q) {
    where.OR = [
      { reference: { contains: filters.q, mode: "insensitive" } },
      { guestName: { contains: filters.q, mode: "insensitive" } },
      { guestEmail: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  if (filters.status) where.status = filters.status;
  if (filters.hotel) where.roomType = { hotelId: filters.hotel };
  if (filters.from || filters.to) {
    where.checkIn = {
      ...(filters.from ? { gte: toUtcDate(filters.from) } : {}),
      ...(filters.to ? { lte: toUtcDate(filters.to) } : {}),
    };
  }
  if (filters.out) where.checkOut = toUtcDate(filters.out);
  return where;
}

/**
 * RFC 4180 CSV. Cells that a spreadsheet would run as a formula (starting
 * with =, +, - or @) get a leading apostrophe, so guest-entered text cannot
 * inject formulas.
 */
export function toCsv(rows: (string | number | null | undefined)[][]) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          let value = cell === null || cell === undefined ? "" : String(cell);
          if (typeof cell === "string" && /^[=+\-@\t\r]/.test(value)) value = `'${value}`;
          return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(","),
    )
    .join("\r\n");
}
