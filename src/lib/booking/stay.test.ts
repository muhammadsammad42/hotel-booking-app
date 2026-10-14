import { describe, expect, it } from "vitest";

import { addDays, daysBetween, eachNight, isIsoDate, validateStay } from "./stay";

const TODAY = "2026-11-01";

describe("validateStay", () => {
  it("accepts a normal stay and counts nights", () => {
    expect(validateStay("2026-11-10", "2026-11-13", TODAY)).toEqual({
      ok: true,
      checkIn: "2026-11-10",
      checkOut: "2026-11-13",
      nights: 3,
    });
  });

  it("allows checking in today", () => {
    expect(validateStay(TODAY, "2026-11-02", TODAY).ok).toBe(true);
  });

  it("rejects check-out on or before check-in", () => {
    expect(validateStay("2026-11-10", "2026-11-10", TODAY)).toEqual({ ok: false, error: "check-out-before-check-in" });
    expect(validateStay("2026-11-10", "2026-11-09", TODAY)).toEqual({ ok: false, error: "check-out-before-check-in" });
  });

  it("rejects past dates", () => {
    expect(validateStay("2026-10-31", "2026-11-02", TODAY)).toEqual({ ok: false, error: "in-the-past" });
  });

  it("enforces the maximum stay and how far ahead you can book", () => {
    expect(validateStay("2026-11-10", "2026-12-10", TODAY, { maxNights: 30 }).ok).toBe(true);
    expect(validateStay("2026-11-10", "2026-12-11", TODAY, { maxNights: 30 })).toEqual({ ok: false, error: "too-long" });
    expect(validateStay("2027-11-02", "2027-11-03", TODAY, { maxAdvanceDays: 365 })).toEqual({
      ok: false,
      error: "too-far-ahead",
    });
  });

  it("rejects malformed and impossible dates", () => {
    expect(validateStay("2026-02-30", "2026-03-02", "2026-01-01")).toEqual({ ok: false, error: "invalid-date" });
    expect(validateStay("11/10/2026", "2026-11-12", TODAY)).toEqual({ ok: false, error: "invalid-date" });
    expect(validateStay(undefined, null, TODAY)).toEqual({ ok: false, error: "invalid-date" });
  });
});

describe("date helpers", () => {
  it("works in UTC across leap years and year ends", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(daysBetween("2026-03-28", "2026-03-30")).toBe(2); // across the EU clock change
    expect(eachNight("2026-10-24", "2026-10-26")).toEqual(["2026-10-24", "2026-10-25"]);
    expect(isIsoDate("2027-02-29")).toBe(false);
  });
});
