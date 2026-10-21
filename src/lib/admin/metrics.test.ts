import { describe, expect, it } from "vitest";

import { change, monthStart, monthlySeries, nightsInRange, stayMetrics } from "./metrics";
import { reservationFiltersSchema, toCsv } from "./reservation-filters";

const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const october = { from: d("2026-10-01"), to: d("2026-11-01") };

describe("nightsInRange", () => {
  it("counts only the nights inside the range", () => {
    expect(nightsInRange({ checkIn: d("2026-09-29"), checkOut: d("2026-10-03") }, october)).toBe(2);
    expect(nightsInRange({ checkIn: d("2026-10-30"), checkOut: d("2026-11-04") }, october)).toBe(2);
    expect(nightsInRange({ checkIn: d("2026-11-01"), checkOut: d("2026-11-04") }, october)).toBe(0);
  });
});

describe("stayMetrics", () => {
  it("computes occupancy and ADR from room-nights", () => {
    const metrics = stayMetrics(
      [
        { checkIn: d("2026-10-10"), checkOut: d("2026-10-12"), rooms: 1, subtotal: 40000 },
        { checkIn: d("2026-10-20"), checkOut: d("2026-10-21"), rooms: 2, subtotal: 30000 },
      ],
      10,
      0,
      october,
    );
    expect(metrics.roomNights).toBe(4);
    expect(metrics.capacity).toBe(310);
    expect(metrics.occupancy).toBeCloseTo(4 / 310);
    expect(metrics.adr).toBe(17500);
  });

  it("spreads revenue over nights for stays crossing the range edge", () => {
    const metrics = stayMetrics([{ checkIn: d("2026-09-30"), checkOut: d("2026-10-02"), rooms: 1, subtotal: 20000 }], 1, 0, october);
    expect(metrics.roomRevenue).toBe(10000);
    expect(metrics.adr).toBe(10000);
  });

  it("removes blocked rooms from capacity", () => {
    expect(stayMetrics([], 2, 12, october).capacity).toBe(50);
  });
});

describe("change", () => {
  it("is a fraction of the previous value, or null without a base", () => {
    expect(change(150, 100)).toBe(0.5);
    expect(change(50, 100)).toBe(-0.5);
    expect(change(10, 0)).toBeNull();
    expect(change(0, 0)).toBe(0);
  });
});

describe("monthlySeries", () => {
  it("buckets values into calendar months, oldest first", () => {
    const now = new Date("2026-10-19T12:00:00Z");
    const series = monthlySeries(
      [{ at: d("2026-10-02"), v: 5 }, { at: d("2026-10-30"), v: 1 }, { at: d("2026-08-15"), v: 2 }, { at: d("2025-01-01"), v: 9 }],
      (row) => row.at,
      (row) => row.v,
      now,
    );
    expect(series).toHaveLength(12);
    expect(series[0].key).toBe("2025-11");
    expect(series.at(-1)).toMatchObject({ key: "2026-10", label: "Oct", value: 6 });
    expect(series.at(-3)?.value).toBe(2);
    expect(monthStart(now, -1).toISOString()).toBe("2026-09-01T00:00:00.000Z");
  });
});

describe("reservation filters", () => {
  it("drops invalid values instead of failing", () => {
    const filters = reservationFiltersSchema.parse({ status: "NOPE", sort: "x", dir: "up", page: "-3", from: "2026-13-40" });
    expect(filters).toMatchObject({ status: undefined, sort: "created", dir: "desc", page: 1, from: undefined });
  });
});

describe("toCsv", () => {
  it("quotes commas, quotes and newlines", () => {
    expect(toCsv([["a,b", 'say "hi"', "line\nbreak", 3]])).toBe('"a,b","say ""hi""","line\nbreak",3');
  });

  it("defuses spreadsheet formulas in text", () => {
    expect(toCsv([["=HYPERLINK(1)", "+1", "@x", "-2", -5]])).toBe("'=HYPERLINK(1),'+1,'@x,'-2,-5");
  });
});
