// The availability and pricing engine. Pure functions: callers load the rows
// from the database (see ./data.ts) and pass them in, which keeps the rules
// testable and identical on the server and in the browser.
import { BOOKING_CONFIG } from "./config";
import { eachNight, toIso } from "./stay";

/** A price for one date, replacing the base price. */
export type RateOverrideInput = { date: string | Date; price: number };

/** Rooms taken out of sale on one date. */
export type BlockInput = { date: string | Date; roomsBlocked: number };

export type BookingStatusInput = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "CHECKED_IN" | "CHECKED_OUT";

export type BookingInput = {
  checkIn: string | Date;
  checkOut: string | Date;
  rooms: number;
  status: BookingStatusInput;
  expiresAt?: Date | null;
};

const asIso = (value: string | Date) => (typeof value === "string" ? value : toIso(value));

export type NightlyPrice = { date: string; price: number; override: boolean };

/**
 * The price of each night of a stay. A rate override for a date replaces the
 * base price; check-out night is not charged.
 */
export function getNightlyPrices(input: {
  basePrice: number;
  overrides: RateOverrideInput[];
  checkIn: string;
  checkOut: string;
}): NightlyPrice[] {
  const overrides = new Map(input.overrides.map((override) => [asIso(override.date), override.price]));
  return eachNight(input.checkIn, input.checkOut).map((date) => {
    const override = overrides.get(date);
    return { date, price: override ?? input.basePrice, override: override !== undefined };
  });
}

/**
 * Whether a booking holds rooms. Confirmed and in-house stays always do; a
 * pending booking does only until its hold expires. Cancelled, expired and
 * completed bookings do not.
 */
export function holdsInventory(booking: Pick<BookingInput, "status" | "expiresAt">, now: Date) {
  if (booking.status === "CONFIRMED" || booking.status === "CHECKED_IN") return true;
  if (booking.status === "PENDING") return booking.expiresAt ? booking.expiresAt.getTime() > now.getTime() : false;
  return false;
}

export type NightAvailability = {
  date: string;
  /** Rooms still free that night, never below zero. */
  available: number;
  blocked: number;
  booked: number;
};

export type Availability = {
  nights: NightAvailability[];
  /** The fewest free rooms on any night of the stay. */
  minAvailable: number;
  /** True only if every night has at least the requested rooms. */
  bookable: boolean;
};

/**
 * Free rooms for each night: inventory, minus rooms blocked that date, minus
 * rooms held by bookings that cover the night. A stay is bookable only if
 * every night has room.
 */
export function getAvailability(input: {
  totalInventory: number;
  blocks: BlockInput[];
  bookings: BookingInput[];
  checkIn: string;
  checkOut: string;
  rooms?: number;
  now: Date;
}): Availability {
  const rooms = input.rooms ?? 1;
  const blocked = new Map<string, number>();
  for (const block of input.blocks) {
    const date = asIso(block.date);
    blocked.set(date, (blocked.get(date) ?? 0) + block.roomsBlocked);
  }

  const active = input.bookings
    .filter((booking) => holdsInventory(booking, input.now))
    .map((booking) => ({ checkIn: asIso(booking.checkIn), checkOut: asIso(booking.checkOut), rooms: booking.rooms }));

  const nights = eachNight(input.checkIn, input.checkOut).map((date) => {
    // A booking covers a night when it starts on or before it and ends after it.
    const booked = active
      .filter((booking) => booking.checkIn <= date && date < booking.checkOut)
      .reduce((sum, booking) => sum + booking.rooms, 0);
    const blockedRooms = blocked.get(date) ?? 0;
    return { date, booked, blocked: blockedRooms, available: Math.max(0, input.totalInventory - blockedRooms - booked) };
  });

  const minAvailable = nights.length ? Math.min(...nights.map((night) => night.available)) : 0;
  return { nights, minAvailable, bookable: nights.length > 0 && minAvailable >= rooms };
}

export type Quote = {
  nights: NightlyPrice[];
  nightCount: number;
  rooms: number;
  /** Nightly prices times rooms. */
  subtotal: number;
  taxes: number;
  serviceFee: number;
  total: number;
  /** Subtotal per night per room, rounded to a whole currency unit for display. */
  averageNightly: number;
  currency: string;
};

/** The full price of a stay in integer cents, with taxes and the service fee. */
export function quote(input: {
  nights: NightlyPrice[];
  rooms?: number;
  taxRate?: number;
  serviceFeeRate?: number;
  currency?: string;
}): Quote {
  const rooms = input.rooms ?? 1;
  const taxRate = input.taxRate ?? BOOKING_CONFIG.taxRate;
  const serviceFeeRate = input.serviceFeeRate ?? BOOKING_CONFIG.serviceFeeRate;
  const roomNights = input.nights.reduce((sum, night) => sum + night.price, 0);
  const subtotal = roomNights * rooms;
  const taxes = Math.round(subtotal * taxRate);
  const serviceFee = Math.round(subtotal * serviceFeeRate);

  return {
    nights: input.nights,
    nightCount: input.nights.length,
    rooms,
    subtotal,
    taxes,
    serviceFee,
    total: subtotal + taxes + serviceFee,
    averageNightly: input.nights.length ? Math.round(roomNights / input.nights.length / 100) * 100 : 0,
    currency: input.currency ?? BOOKING_CONFIG.currency,
  };
}

/** Prices and free rooms for each day of a window, for a priced calendar. */
export type RoomCalendar = {
  start: string;
  /** Nightly price for start + index. */
  prices: number[];
  /** Free rooms for start + index. */
  available: number[];
};

export function buildCalendar(input: {
  basePrice: number;
  totalInventory: number;
  overrides: RateOverrideInput[];
  blocks: BlockInput[];
  bookings: BookingInput[];
  start: string;
  end: string;
  now: Date;
}): RoomCalendar {
  const prices = getNightlyPrices({ basePrice: input.basePrice, overrides: input.overrides, checkIn: input.start, checkOut: input.end });
  const availability = getAvailability({
    totalInventory: input.totalInventory,
    blocks: input.blocks,
    bookings: input.bookings,
    checkIn: input.start,
    checkOut: input.end,
    now: input.now,
  });
  return {
    start: input.start,
    prices: prices.map((night) => night.price),
    available: availability.nights.map((night) => night.available),
  };
}

/** Reads a stay out of a calendar, for instant quotes in the browser. */
export function stayFromCalendar(calendar: RoomCalendar, checkIn: string, checkOut: string) {
  const nights = eachNight(checkIn, checkOut);
  const offset = (date: string) => Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${calendar.start}T00:00:00Z`)) / 86_400_000);
  const rows = nights.map((date) => {
    const index = offset(date);
    return { date, price: calendar.prices[index], available: calendar.available[index] };
  });
  if (rows.some((row) => row.price === undefined)) return null;
  return {
    nights: rows.map((row) => ({ date: row.date, price: row.price, override: false })),
    minAvailable: rows.length ? Math.min(...rows.map((row) => row.available)) : 0,
  };
}
