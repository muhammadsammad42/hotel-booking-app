// Time-based booking rules: check-in moment, cancellation window and the
// grouping of trips. Pure functions, shared by pages, actions and tests.
//
// Hotels store their check-in time as local "HH:mm" without a time zone, so
// the moment is approximated as that time on the check-in date in UTC.
import type { BookingStatus } from "@/generated/prisma/client";

import { BOOKING_CONFIG } from "./config";

/** Check-in date plus the hotel's check-in time, e.g. 2026-10-20 15:00. */
export function checkInMoment(checkIn: Date, checkInTime = "00:00") {
  const [hours, minutes] = /^\d{2}:\d{2}$/.test(checkInTime) ? checkInTime.split(":").map(Number) : [0, 0];
  return new Date(checkIn.getTime() + (hours * 60 + minutes) * 60_000);
}

/** The last moment a guest can cancel for a full refund. */
export function cancellationDeadline(checkIn: Date, checkInTime?: string) {
  return new Date(checkInMoment(checkIn, checkInTime).getTime() - BOOKING_CONFIG.cancellationHours * 3_600_000);
}

export type CancellationCheck =
  | { allowed: true; deadline: Date }
  | { allowed: false; reason: "status" | "too-late"; deadline: Date };

/** Whether a guest may cancel this booking themselves, and until when. */
export function guestCancellation(
  booking: { status: BookingStatus; checkIn: Date },
  checkInTime?: string,
  now = new Date(),
): CancellationCheck {
  const deadline = cancellationDeadline(booking.checkIn, checkInTime);
  if (booking.status !== "CONFIRMED") return { allowed: false, reason: "status", deadline };
  if (now >= deadline) return { allowed: false, reason: "too-late", deadline };
  return { allowed: true, deadline };
}

export type TripGroup = "upcoming" | "past" | "cancelled" | "hidden";

/**
 * Which tab of My trips a booking belongs to. Lapsed holds and expired
 * bookings are hidden: nothing was booked.
 */
export function tripGroup(booking: { status: BookingStatus; expiresAt: Date | null }, now = new Date()): TripGroup {
  switch (booking.status) {
    case "PENDING":
      return booking.expiresAt && booking.expiresAt > now ? "upcoming" : "hidden";
    case "CONFIRMED":
    case "CHECKED_IN":
      return "upcoming";
    case "CHECKED_OUT":
      return "past";
    case "CANCELLED":
      return "cancelled";
    case "EXPIRED":
      return "hidden";
  }
}

/** Whole days from today (UTC) to a stay date; negative once it has passed. */
export function daysUntil(date: Date, now = new Date()) {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((date.getTime() - today) / 86_400_000);
}
