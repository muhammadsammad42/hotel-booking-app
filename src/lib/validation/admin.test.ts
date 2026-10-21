import { describe, expect, it } from "vitest";

import { hotelSchema, rateUpdateSchema, roomTypeSchema, slugify } from "./admin";

const hotel = {
  name: "Caldera Blue Suites",
  slug: "",
  description: "Cave suites carved into the cliff, with plunge pools over the caldera.",
  city: "Oia",
  country: "Greece",
  address: "Oia 847 02, Santorini",
  latitude: "36.4618",
  longitude: "25.3753",
  starRating: "5",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  isFeatured: false,
  isActive: true,
  images: [{ url: "https://images.unsplash.com/photo-1", alt: "Pool over the caldera" }],
  amenityIds: [],
};

describe("slugify", () => {
  it("makes readable, URL-safe slugs", () => {
    expect(slugify("Caldera Blue Suites")).toBe("caldera-blue-suites");
    expect(slugify("Larch & Stone Alpine Lodge")).toBe("larch-and-stone-alpine-lodge");
    expect(slugify("  Hôtel Côte d'Azur!  ")).toBe("hotel-cote-d-azur");
  });
});

describe("hotelSchema", () => {
  it("accepts a complete hotel and converts numbers", () => {
    const parsed = hotelSchema.parse(hotel);
    expect(parsed).toMatchObject({ latitude: 36.4618, longitude: 25.3753, starRating: 5 });
  });

  it("treats empty coordinates as missing, not zero", () => {
    const result = hotelSchema.safeParse({ ...hotel, latitude: "", longitude: "  " });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(expect.arrayContaining(["Enter the latitude", "Enter the longitude"]));
  });

  it("requires https photos with descriptions", () => {
    expect(hotelSchema.safeParse({ ...hotel, images: [] }).success).toBe(false);
    expect(hotelSchema.safeParse({ ...hotel, images: [{ url: "http://x.test/a.jpg", alt: "Pool" }] }).success).toBe(false);
    expect(hotelSchema.safeParse({ ...hotel, images: [{ url: "https://x.test/a.jpg", alt: "" }] }).success).toBe(false);
  });

  it("rejects bad times and slugs", () => {
    expect(hotelSchema.safeParse({ ...hotel, checkInTime: "3pm" }).success).toBe(false);
    expect(hotelSchema.safeParse({ ...hotel, slug: "Not a slug" }).success).toBe(false);
  });
});

describe("roomTypeSchema", () => {
  it("stores the price typed in dollars as cents", () => {
    const parsed = roomTypeSchema.parse({
      name: "Caldera View Suite",
      slug: "",
      description: "A cave suite with a private terrace over the sea.",
      beds: "1 king bed",
      maxGuests: "2",
      sizeSqm: "45",
      basePrice: "189.50",
      totalInventory: "6",
      isActive: true,
      images: hotel.images,
      amenityIds: [],
    });
    expect(parsed.basePrice).toBe(18950);
  });
});

describe("rateUpdateSchema", () => {
  const base = { roomTypeId: "room_1", from: "2026-11-10", to: "2026-11-12" };

  it("accepts each action", () => {
    expect(rateUpdateSchema.parse({ ...base, action: "price", price: "250" })).toMatchObject({ price: 25000 });
    expect(rateUpdateSchema.safeParse({ ...base, action: "reset" }).success).toBe(true);
    expect(rateUpdateSchema.safeParse({ ...base, action: "block", rooms: "2", reason: "Maintenance" }).success).toBe(true);
    expect(rateUpdateSchema.safeParse({ ...base, action: "unblock" }).success).toBe(true);
  });

  it("refuses reversed or very long ranges", () => {
    expect(rateUpdateSchema.safeParse({ ...base, from: "2026-11-12", to: "2026-11-10", action: "reset" }).success).toBe(false);
    expect(rateUpdateSchema.safeParse({ ...base, to: "2028-01-01", action: "reset" }).success).toBe(false);
  });

  it("refuses prices under $1 and unknown actions", () => {
    expect(rateUpdateSchema.safeParse({ ...base, action: "price", price: "0.5" }).success).toBe(false);
    expect(rateUpdateSchema.safeParse({ ...base, action: "delete" }).success).toBe(false);
  });
});
