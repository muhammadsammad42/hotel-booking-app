// Loads the rows the engine needs and runs it. Server only.
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { BOOKING_CONFIG } from "./config";
import {
  buildCalendar,
  getAvailability,
  getNightlyPrices,
  quote,
  type Availability,
  type BlockInput,
  type BookingInput,
  type Quote,
  type RateOverrideInput,
  type RoomCalendar,
} from "./engine";
import { addDays, toUtcDate, todayIso } from "./stay";

export type RoomForEngine = { id: string; basePrice: number; totalInventory: number };

type Rows = { overrides: RateOverrideInput[]; blocks: BlockInput[]; bookings: BookingInput[] };

/**
 * Rate overrides, blocks and inventory-holding bookings for many room types
 * over [from, to), grouped by room type. Three queries however many rooms.
 */
export async function loadEngineRows(
  roomTypeIds: string[],
  from: string,
  to: string,
  // A transaction client, so a booking can re-check inside its transaction.
  db: Prisma.TransactionClient = prisma,
) {
  const start = toUtcDate(from);
  const end = toUtcDate(to);
  const [overrides, blocks, bookings] = await Promise.all([
    db.rateOverride.findMany({
      where: { roomTypeId: { in: roomTypeIds }, date: { gte: start, lt: end } },
      select: { roomTypeId: true, date: true, price: true },
    }),
    db.availabilityBlock.findMany({
      where: { roomTypeId: { in: roomTypeIds }, date: { gte: start, lt: end } },
      select: { roomTypeId: true, date: true, roomsBlocked: true },
    }),
    db.booking.findMany({
      where: {
        roomTypeId: { in: roomTypeIds },
        checkIn: { lt: end },
        checkOut: { gt: start },
        status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
      },
      select: { roomTypeId: true, checkIn: true, checkOut: true, rooms: true, status: true, expiresAt: true },
    }),
  ]);

  const rows = new Map<string, Rows>(roomTypeIds.map((id) => [id, { overrides: [], blocks: [], bookings: [] }]));
  for (const row of overrides) rows.get(row.roomTypeId)?.overrides.push(row);
  for (const row of blocks) rows.get(row.roomTypeId)?.blocks.push(row);
  for (const row of bookings) rows.get(row.roomTypeId)?.bookings.push(row);
  return rows;
}

export type RoomStay = { availability: Availability; quote: Quote };

/** Availability and a full quote for each room type, for one stay. */
export async function getRoomStays(
  rooms: RoomForEngine[],
  stay: { checkIn: string; checkOut: string; rooms?: number },
  now = new Date(),
) {
  const rows = await loadEngineRows(
    rooms.map((room) => room.id),
    stay.checkIn,
    stay.checkOut,
  );
  return new Map<string, RoomStay>(
    rooms.map((room) => {
      const data = rows.get(room.id)!;
      const availability = getAvailability({
        totalInventory: room.totalInventory,
        blocks: data.blocks,
        bookings: data.bookings,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
        rooms: stay.rooms,
        now,
      });
      const nights = getNightlyPrices({
        basePrice: room.basePrice,
        overrides: data.overrides,
        checkIn: stay.checkIn,
        checkOut: stay.checkOut,
      });
      return [room.id, { availability, quote: quote({ nights, rooms: stay.rooms }) }];
    }),
  );
}

/** Daily prices and free rooms for each room type, from today for `days` days. */
export async function getRoomCalendars(rooms: RoomForEngine[], days = BOOKING_CONFIG.maxAdvanceDays + BOOKING_CONFIG.maxNights, now = new Date()) {
  const start = todayIso(now);
  const end = addDays(start, days);
  const rows = await loadEngineRows(
    rooms.map((room) => room.id),
    start,
    end,
  );
  return Object.fromEntries(
    rooms.map((room) => {
      const data = rows.get(room.id)!;
      return [
        room.id,
        buildCalendar({ basePrice: room.basePrice, totalInventory: room.totalInventory, ...data, start, end, now }),
      ];
    }),
  ) as Record<string, RoomCalendar>;
}
