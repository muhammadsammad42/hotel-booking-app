// Stay dates. Everything here works on "YYYY-MM-DD" strings and midnight UTC,
// so a stay means the same nights for every guest in every timezone.
// Check-out is exclusive: 10th to 12th is the nights of the 10th and 11th.
import { BOOKING_CONFIG } from "./config";

const DAY_MS = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** "YYYY-MM-DD" as a Date at midnight UTC. */
export function toUtcDate(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`);
}

/** A Date as its UTC calendar date. */
export function toIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number) {
  return toIso(new Date(toUtcDate(iso).getTime() + days * DAY_MS));
}

export function daysBetween(from: string, to: string) {
  return Math.round((toUtcDate(to).getTime() - toUtcDate(from).getTime()) / DAY_MS);
}

/** Every night of a stay: check-in up to, not including, check-out. */
export function eachNight(checkIn: string, checkOut: string) {
  const nights = daysBetween(checkIn, checkOut);
  return Array.from({ length: Math.max(0, nights) }, (_, index) => addDays(checkIn, index));
}

export type StayError = "invalid-date" | "check-out-before-check-in" | "in-the-past" | "too-far-ahead" | "too-long";

export const STAY_ERROR_MESSAGES: Record<StayError, string> = {
  "invalid-date": "Choose your check-in and check-out dates.",
  "check-out-before-check-in": "Check-out must be after check-in.",
  "in-the-past": "Check-in cannot be in the past.",
  "too-far-ahead": `Bookings open up to ${BOOKING_CONFIG.maxAdvanceDays} days ahead.`,
  "too-long": `Stays can be up to ${BOOKING_CONFIG.maxNights} nights.`,
};

export type ValidStay = { ok: true; checkIn: string; checkOut: string; nights: number };

/**
 * Checks a stay against the booking rules. `today` is the current UTC date,
 * passed in so the rules can be tested.
 */
export function validateStay(
  checkIn: unknown,
  checkOut: unknown,
  today: string,
  limits: { maxNights?: number; maxAdvanceDays?: number } = {},
): ValidStay | { ok: false; error: StayError } {
  const maxNights = limits.maxNights ?? BOOKING_CONFIG.maxNights;
  const maxAdvanceDays = limits.maxAdvanceDays ?? BOOKING_CONFIG.maxAdvanceDays;

  if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) return { ok: false, error: "invalid-date" };
  const nights = daysBetween(checkIn, checkOut);
  if (nights < 1) return { ok: false, error: "check-out-before-check-in" };
  if (checkIn < today) return { ok: false, error: "in-the-past" };
  if (daysBetween(today, checkIn) > maxAdvanceDays) return { ok: false, error: "too-far-ahead" };
  if (nights > maxNights) return { ok: false, error: "too-long" };
  return { ok: true, checkIn, checkOut, nights };
}

/** Today's UTC date. */
export function todayIso(now: Date = new Date()) {
  return toIso(now);
}
