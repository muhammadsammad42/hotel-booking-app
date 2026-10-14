import { describe, expect, it } from "vitest";

import {
  DEFAULT_FILTERS,
  countActiveFilters,
  isIsoDate,
  parseSearchParams,
  searchHref,
  slugify,
  stayQuery,
  toSearchParams,
} from "./params";

describe("parseSearchParams", () => {
  it("returns defaults for an empty query", () => {
    expect(parseSearchParams({})).toEqual(DEFAULT_FILTERS);
  });

  it("reads every filter", () => {
    const filters = parseSearchParams(
      new URLSearchParams(
        "destination=Hunza&checkIn=2026-11-01&checkOut=2026-11-05&guests=3&minPrice=50&maxPrice=300&amenities=Infinity Pool,spa&stars=5,4&rating=4.5&sort=price-asc&page=2",
      ),
    );
    expect(filters).toEqual({
      destination: "Hunza",
      checkIn: "2026-11-01",
      checkOut: "2026-11-05",
      guests: 3,
      minPrice: 50,
      maxPrice: 300,
      amenities: ["infinity-pool", "spa"],
      stars: [4, 5],
      rating: 4.5,
      sort: "price-asc",
      page: 2,
    });
  });

  it("drops invalid values instead of failing", () => {
    const filters = parseSearchParams({
      checkIn: "2026-02-30",
      checkOut: "2026-03-02",
      guests: "99",
      stars: "0,6,x",
      rating: "3.2",
      sort: "cheapest",
      page: "-1",
    });
    expect(filters.checkIn).toBeNull();
    expect(filters.guests).toBe(DEFAULT_FILTERS.guests);
    expect(filters.stars).toEqual([]);
    expect(filters.rating).toBeNull();
    expect(filters.sort).toBe("recommended");
    expect(filters.page).toBe(1);
  });

  it("ignores dates where check-out is not after check-in", () => {
    const filters = parseSearchParams({ checkIn: "2026-11-05", checkOut: "2026-11-05" });
    expect(filters.checkIn).toBeNull();
    expect(filters.checkOut).toBeNull();
  });

  it("swaps a reversed price range", () => {
    const filters = parseSearchParams({ minPrice: "400", maxPrice: "100" });
    expect([filters.minPrice, filters.maxPrice]).toEqual([100, 400]);
  });
});

describe("toSearchParams", () => {
  it("round-trips and leaves out defaults", () => {
    const query = "destination=Bali&checkIn=2026-12-20&checkOut=2026-12-27&amenities=spa&stars=4,5&sort=rating";
    const params = toSearchParams(parseSearchParams(new URLSearchParams(query)));
    expect(params.toString()).toBe(new URLSearchParams(query).toString());
    expect(toSearchParams(DEFAULT_FILTERS).toString()).toBe("");
  });

  it("builds links", () => {
    expect(searchHref({})).toBe("/search");
    expect(searchHref({ destination: "Tokyo", page: 2 })).toBe("/search?destination=Tokyo&page=2");
    expect(stayQuery({ checkIn: "2026-11-01", checkOut: "2026-11-03", guests: 3 })).toBe(
      "?checkIn=2026-11-01&checkOut=2026-11-03&guests=3",
    );
    expect(stayQuery({ checkIn: null, checkOut: null, guests: 2 })).toBe("");
  });
});

describe("helpers", () => {
  it("validates calendar dates", () => {
    expect(isIsoDate("2028-02-29")).toBe(true);
    expect(isIsoDate("2027-02-29")).toBe(false);
    expect(isIsoDate("2026-1-1")).toBe(false);
  });

  it("slugifies names", () => {
    expect(slugify("Free Wi-Fi")).toBe("free-wi-fi");
    expect(slugify("24-hour front desk")).toBe("24-hour-front-desk");
    expect(slugify("Türkiye")).toBe("turkiye");
  });

  it("counts panel filters", () => {
    expect(countActiveFilters({ ...DEFAULT_FILTERS, amenities: ["spa", "bar"], stars: [5], minPrice: 100 })).toBe(4);
  });
});
