import { describe, expect, it } from "vitest";

import {
  buildCalendar,
  getAvailability,
  getNightlyPrices,
  holdsInventory,
  quote,
  stayFromCalendar,
  type BookingInput,
} from "./engine";

const NOW = new Date("2026-11-01T12:00:00Z");
const inFuture = new Date("2026-11-01T12:30:00Z");
const inPast = new Date("2026-11-01T11:30:00Z");

describe("getNightlyPrices", () => {
  it("charges the base price for each night and not for check-out", () => {
    const nights = getNightlyPrices({ basePrice: 10000, overrides: [], checkIn: "2026-11-10", checkOut: "2026-11-13" });
    expect(nights.map((night) => night.date)).toEqual(["2026-11-10", "2026-11-11", "2026-11-12"]);
    expect(nights.every((night) => night.price === 10000 && !night.override)).toBe(true);
  });

  it("replaces the base price where an override exists", () => {
    const nights = getNightlyPrices({
      basePrice: 10000,
      overrides: [
        { date: "2026-11-13", price: 12000 }, // Friday
        { date: new Date("2026-11-14T00:00:00Z"), price: 12500 }, // Date objects from the database
        { date: "2026-11-15", price: 99999 }, // check-out day: ignored
      ],
      checkIn: "2026-11-12",
      checkOut: "2026-11-15",
    });
    expect(nights.map((night) => night.price)).toEqual([10000, 12000, 12500]);
    expect(nights.map((night) => night.override)).toEqual([false, true, true]);
  });

  it("crosses month and year boundaries", () => {
    const nights = getNightlyPrices({ basePrice: 100, overrides: [], checkIn: "2026-12-30", checkOut: "2027-01-02" });
    expect(nights.map((night) => night.date)).toEqual(["2026-12-30", "2026-12-31", "2027-01-01"]);
  });

  it("returns nothing for a zero-night stay", () => {
    expect(getNightlyPrices({ basePrice: 100, overrides: [], checkIn: "2026-11-10", checkOut: "2026-11-10" })).toEqual([]);
  });
});

describe("holdsInventory", () => {
  it("counts confirmed and in-house stays", () => {
    expect(holdsInventory({ status: "CONFIRMED" }, NOW)).toBe(true);
    expect(holdsInventory({ status: "CHECKED_IN" }, NOW)).toBe(true);
  });

  it("counts a pending hold only until it expires", () => {
    expect(holdsInventory({ status: "PENDING", expiresAt: inFuture }, NOW)).toBe(true);
    expect(holdsInventory({ status: "PENDING", expiresAt: inPast }, NOW)).toBe(false);
    expect(holdsInventory({ status: "PENDING", expiresAt: null }, NOW)).toBe(false);
  });

  it("ignores cancelled, expired and completed bookings", () => {
    for (const status of ["CANCELLED", "EXPIRED", "CHECKED_OUT"] as const) {
      expect(holdsInventory({ status }, NOW)).toBe(false);
    }
  });
});

describe("getAvailability", () => {
  const base = { totalInventory: 3, blocks: [], now: NOW, checkIn: "2026-11-10", checkOut: "2026-11-13" };
  const booking = (checkIn: string, checkOut: string, extra: Partial<BookingInput> = {}): BookingInput => ({
    checkIn,
    checkOut,
    rooms: 1,
    status: "CONFIRMED",
    ...extra,
  });

  it("is fully available with no bookings", () => {
    const result = getAvailability({ ...base, bookings: [] });
    expect(result.nights.map((night) => night.available)).toEqual([3, 3, 3]);
    expect(result).toMatchObject({ minAvailable: 3, bookable: true });
  });

  it("subtracts bookings only on the nights they overlap", () => {
    const result = getAvailability({
      ...base,
      bookings: [
        booking("2026-11-08", "2026-11-11"), // covers the 10th
        booking("2026-11-12", "2026-11-14", { rooms: 2 }), // covers the 12th
      ],
    });
    expect(result.nights.map((night) => night.available)).toEqual([2, 3, 1]);
    expect(result.minAvailable).toBe(1);
  });

  it("frees the room on the check-out day of the previous guest", () => {
    // Out on the 10th, in on the 10th: the same room works.
    const result = getAvailability({ ...base, totalInventory: 1, bookings: [booking("2026-11-07", "2026-11-10")] });
    expect(result.bookable).toBe(true);
  });

  it("does not count a booking that starts on our check-out day", () => {
    const result = getAvailability({ ...base, totalInventory: 1, bookings: [booking("2026-11-13", "2026-11-15")] });
    expect(result.bookable).toBe(true);
  });

  it("refuses a stay if any single night is full", () => {
    const result = getAvailability({ ...base, totalInventory: 1, bookings: [booking("2026-11-11", "2026-11-12")] });
    expect(result.nights.map((night) => night.available)).toEqual([1, 0, 1]);
    expect(result.bookable).toBe(false);
  });

  it("counts unexpired holds and ignores expired ones", () => {
    const held = getAvailability({
      ...base,
      totalInventory: 1,
      bookings: [booking("2026-11-10", "2026-11-11", { status: "PENDING", expiresAt: inFuture })],
    });
    const lapsed = getAvailability({
      ...base,
      totalInventory: 1,
      bookings: [booking("2026-11-10", "2026-11-11", { status: "PENDING", expiresAt: inPast })],
    });
    expect(held.bookable).toBe(false);
    expect(lapsed.bookable).toBe(true);
  });

  it("ignores cancelled bookings", () => {
    const result = getAvailability({
      ...base,
      totalInventory: 1,
      bookings: [booking("2026-11-10", "2026-11-13", { status: "CANCELLED" })],
    });
    expect(result.bookable).toBe(true);
  });

  it("subtracts blocked rooms and adds up several blocks on one date", () => {
    const result = getAvailability({
      ...base,
      blocks: [
        { date: "2026-11-11", roomsBlocked: 1 },
        { date: new Date("2026-11-11T00:00:00Z"), roomsBlocked: 1 },
        { date: "2026-11-13", roomsBlocked: 3 }, // check-out day: not part of the stay
      ],
      bookings: [],
    });
    expect(result.nights.map((night) => night.available)).toEqual([3, 1, 3]);
    expect(result.nights[1].blocked).toBe(2);
  });

  it("never reports negative availability when overbooked", () => {
    const result = getAvailability({
      ...base,
      totalInventory: 1,
      blocks: [{ date: "2026-11-10", roomsBlocked: 1 }],
      bookings: [booking("2026-11-10", "2026-11-11", { rooms: 2 })],
    });
    expect(result.nights[0].available).toBe(0);
  });

  it("checks the number of rooms requested", () => {
    const bookings = [booking("2026-11-10", "2026-11-13")];
    expect(getAvailability({ ...base, bookings, rooms: 2 }).bookable).toBe(true);
    expect(getAvailability({ ...base, bookings, rooms: 3 }).bookable).toBe(false);
  });

  it("is never bookable for zero nights", () => {
    expect(getAvailability({ ...base, checkOut: base.checkIn, bookings: [] }).bookable).toBe(false);
  });
});

describe("quote", () => {
  const nights = getNightlyPrices({
    basePrice: 10000,
    overrides: [{ date: "2026-11-13", price: 12000 }],
    checkIn: "2026-11-12",
    checkOut: "2026-11-14",
  });

  it("adds taxes and the service fee in whole cents", () => {
    expect(quote({ nights, taxRate: 0.1, serviceFeeRate: 0.05 })).toMatchObject({
      nightCount: 2,
      rooms: 1,
      subtotal: 22000,
      taxes: 2200,
      serviceFee: 1100,
      total: 25300,
      averageNightly: 11000,
    });
  });

  it("multiplies by rooms", () => {
    const result = quote({ nights, rooms: 2, taxRate: 0.1, serviceFeeRate: 0.05 });
    expect(result.subtotal).toBe(44000);
    expect(result.total).toBe(50600);
    expect(result.averageNightly).toBe(11000);
  });

  it("rounds the average to whole dollars but keeps the subtotal exact", () => {
    const uneven = getNightlyPrices({
      basePrice: 89000,
      overrides: [{ date: "2026-11-13", price: 106800 }],
      checkIn: "2026-11-11",
      checkOut: "2026-11-14",
    });
    const result = quote({ nights: uneven });
    expect(result.subtotal).toBe(284800);
    expect(result.averageNightly).toBe(94900);
  });

  it("rounds fractional cents and keeps the total exact", () => {
    const odd = quote({ nights: [{ date: "2026-11-12", price: 9999, override: false }], taxRate: 0.0825, serviceFeeRate: 0.03 });
    expect(Number.isInteger(odd.taxes) && Number.isInteger(odd.serviceFee)).toBe(true);
    expect(odd.taxes).toBe(825);
    expect(odd.serviceFee).toBe(300);
    expect(odd.total).toBe(9999 + 825 + 300);
  });
});

describe("calendar", () => {
  it("builds daily prices and free rooms, and reads a stay back out of it", () => {
    const calendar = buildCalendar({
      basePrice: 10000,
      totalInventory: 2,
      overrides: [{ date: "2026-11-02", price: 15000 }],
      blocks: [{ date: "2026-11-03", roomsBlocked: 2 }],
      bookings: [{ checkIn: "2026-11-01", checkOut: "2026-11-02", rooms: 1, status: "CONFIRMED" }],
      start: "2026-11-01",
      end: "2026-11-05",
      now: NOW,
    });
    expect(calendar.prices).toEqual([10000, 15000, 10000, 10000]);
    expect(calendar.available).toEqual([1, 2, 0, 2]);

    const stay = stayFromCalendar(calendar, "2026-11-01", "2026-11-03");
    expect(stay?.nights.map((night) => night.price)).toEqual([10000, 15000]);
    expect(stay?.minAvailable).toBe(1);
    expect(stayFromCalendar(calendar, "2026-11-04", "2026-11-07")).toBeNull();
  });
});
