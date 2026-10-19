import { describe, expect, it } from "vitest";

import { BOOKING_CONFIG } from "./config";
import { cancellationDeadline, checkInMoment, daysUntil, guestCancellation, tripGroup } from "./policy";

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe("checkInMoment", () => {
  it("adds the hotel's check-in time to the date", () => {
    expect(checkInMoment(day("2026-11-10"), "15:00").toISOString()).toBe("2026-11-10T15:00:00.000Z");
  });

  it("falls back to midnight for a malformed time", () => {
    expect(checkInMoment(day("2026-11-10"), "3pm").toISOString()).toBe("2026-11-10T00:00:00.000Z");
  });
});

describe("guest cancellation", () => {
  const booking = { status: "CONFIRMED" as const, checkIn: day("2026-11-10") };

  it("closes the configured number of hours before check-in", () => {
    const deadline = cancellationDeadline(booking.checkIn, "15:00");
    expect(BOOKING_CONFIG.cancellationHours).toBe(48);
    expect(deadline.toISOString()).toBe("2026-11-08T15:00:00.000Z");
  });

  it("is allowed before the deadline", () => {
    expect(guestCancellation(booking, "15:00", new Date("2026-11-08T14:59:00Z")).allowed).toBe(true);
  });

  it("is refused at and after the deadline", () => {
    const at = guestCancellation(booking, "15:00", new Date("2026-11-08T15:00:00Z"));
    expect(at).toMatchObject({ allowed: false, reason: "too-late" });
  });

  it("only applies to confirmed bookings", () => {
    for (const status of ["PENDING", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "EXPIRED"] as const) {
      expect(guestCancellation({ ...booking, status }, "15:00", new Date("2026-10-01T00:00:00Z"))).toMatchObject({
        allowed: false,
        reason: "status",
      });
    }
  });
});

describe("tripGroup", () => {
  const now = new Date("2026-10-19T12:00:00Z");

  it("puts active holds and confirmed or in-house stays under upcoming", () => {
    expect(tripGroup({ status: "PENDING", expiresAt: new Date("2026-10-19T12:10:00Z") }, now)).toBe("upcoming");
    expect(tripGroup({ status: "CONFIRMED", expiresAt: null }, now)).toBe("upcoming");
    expect(tripGroup({ status: "CHECKED_IN", expiresAt: null }, now)).toBe("upcoming");
  });

  it("hides lapsed holds and expired bookings", () => {
    expect(tripGroup({ status: "PENDING", expiresAt: new Date("2026-10-19T11:59:00Z") }, now)).toBe("hidden");
    expect(tripGroup({ status: "EXPIRED", expiresAt: null }, now)).toBe("hidden");
  });

  it("files completed and cancelled stays", () => {
    expect(tripGroup({ status: "CHECKED_OUT", expiresAt: null }, now)).toBe("past");
    expect(tripGroup({ status: "CANCELLED", expiresAt: null }, now)).toBe("cancelled");
  });
});

describe("daysUntil", () => {
  it("counts whole calendar days in UTC", () => {
    const now = new Date("2026-10-19T23:30:00Z");
    expect(daysUntil(day("2026-10-19"), now)).toBe(0);
    expect(daysUntil(day("2026-10-20"), now)).toBe(1);
    expect(daysUntil(day("2026-11-09"), now)).toBe(21);
    expect(daysUntil(day("2026-10-18"), now)).toBe(-1);
  });
});
