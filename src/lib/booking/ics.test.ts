import { describe, expect, it } from "vitest";

import { buildStayIcs } from "./ics";

describe("buildStayIcs", () => {
  const ics = buildStayIcs({
    reference: "HB-7K3M9Q",
    hotelName: "Caldera Blue Suites",
    roomName: "Caldera View Suite",
    address: "Nikolaou Nomikou 14, Oia 847 02; Santorini",
    checkIn: "2026-11-01",
    checkOut: "2026-11-05",
    checkInTime: "15:00",
    guests: 2,
    url: "https://sarai.example/account/trips",
    now: new Date("2026-10-16T09:30:00.123Z"),
  });

  it("is an all-day event from check-in to check-out", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20261101");
    expect(ics).toContain("DTEND;VALUE=DATE:20261105");
    expect(ics).toContain("DTSTAMP:20261016T093000Z");
    expect(ics).toContain("UID:HB-7K3M9Q@sarai");
  });

  it("escapes commas, semicolons and line breaks", () => {
    expect(ics).toContain("LOCATION:Nikolaou Nomikou 14\\, Oia 847 02\\; Santorini");
    expect(ics).toContain("Booking HB-7K3M9Q\\nCaldera View Suite\\, 2 guests.");
  });

  it("uses CRLF line endings and folds long lines", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    for (const line of ics.split("\r\n")) expect(line.length).toBeLessThanOrEqual(75);
  });
});
