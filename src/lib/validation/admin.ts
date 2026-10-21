import { z } from "zod";

import { isIsoDate } from "@/lib/booking/stay";

export const MAX_RATE_RANGE_DAYS = 366;

const text = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Enter the ${label}`)
    .min(min, `Use at least ${min} characters for the ${label}`)
    .max(max, `Use ${max} characters or fewer`);

/** A number typed into a text field; empty is an error, not zero. */
const coordinate = (label: string, limit: number) =>
  z
    .union([z.string(), z.number()])
    .transform((value) => String(value).trim())
    .refine((value) => value !== "", `Enter the ${label}`)
    .transform(Number)
    .refine((value) => Number.isFinite(value), `Enter the ${label} as a number`)
    .refine((value) => Math.abs(value) <= limit, `The ${label} is between -${limit} and ${limit}`);

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(80, "Use 80 characters or fewer")
  .refine((value) => value === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), "Use lowercase letters, numbers and single hyphens");

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time, like 15:00");

export const imageSchema = z.object({
  url: z
    .string()
    .trim()
    .url("Enter the full image address, starting with https://")
    .refine((value) => value.startsWith("https://"), "Images must use https://")
    .max(600),
  alt: text("description of the photo", 3, 160),
});

const images = (max: number) => z.array(imageSchema).min(1, "Add at least one photo").max(max, `Use up to ${max} photos`);
const ids = z.array(z.string().min(1).max(64)).max(80);

/** Money typed in dollars ("189" or "189.50"), stored in cents. */
export const dollars = (label: string) =>
  z.coerce
    .number({ error: `Enter the ${label}` })
    .min(1, `The ${label} must be at least $1`)
    .max(100_000, `The ${label} must be under $100,000`)
    .transform((value) => Math.round(value * 100));

export const hotelSchema = z.object({
  name: text("hotel name", 2, 120),
  slug,
  description: text("description", 40, 4000),
  city: text("city", 2, 80),
  country: text("country", 2, 80),
  address: text("address", 5, 200),
  latitude: coordinate("latitude", 90),
  longitude: coordinate("longitude", 180),
  starRating: z.coerce.number().int().min(1, "Choose a star rating").max(5),
  checkInTime: time,
  checkOutTime: time,
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  images: images(12),
  amenityIds: ids,
});

export const roomTypeSchema = z.object({
  name: text("room name", 2, 120),
  slug,
  description: text("description", 20, 2000),
  beds: text("bed configuration", 3, 80),
  maxGuests: z.coerce.number().int().min(1, "At least 1 guest").max(10, "Up to 10 guests"),
  sizeSqm: z.coerce.number().int().min(5, "At least 5 m²").max(1000, "Up to 1,000 m²"),
  basePrice: dollars("nightly price"),
  totalInventory: z.coerce.number().int().min(1, "At least 1 room").max(500, "Up to 500 rooms"),
  isActive: z.boolean(),
  images: images(10),
  amenityIds: ids,
});

const isoDate = z.string().refine(isIsoDate, "Choose a valid date");

export const rateUpdateSchema = z
  .discriminatedUnion("action", [
    z.object({ action: z.literal("price"), price: dollars("price") }),
    z.object({ action: z.literal("reset") }),
    z.object({ action: z.literal("block"), rooms: z.coerce.number().int().min(1, "Block at least 1 room").max(500), reason: z.string().trim().max(120) }),
    z.object({ action: z.literal("unblock") }),
  ])
  .and(z.object({ roomTypeId: z.string().min(1).max(64), from: isoDate, to: isoDate }))
  .refine((value) => value.to >= value.from, { path: ["to"], message: "The end date must be on or after the start date" })
  .refine(
    (value) => (Date.parse(value.to) - Date.parse(value.from)) / 86_400_000 < MAX_RATE_RANGE_DAYS,
    { path: ["to"], message: `Change up to ${MAX_RATE_RANGE_DAYS} days at a time` },
  );

export const AMENITY_CATEGORIES = ["GENERAL", "WELLNESS", "DINING", "ROOM", "BATHROOM", "ENTERTAINMENT", "SERVICES", "OUTDOORS"] as const;

export const amenitySchema = z.object({
  name: text("amenity name", 2, 60),
  iconKey: z.string().min(1, "Choose an icon").max(40),
  category: z.enum(AMENITY_CATEGORIES, { error: "Choose a category" }),
});

export type HotelInput = z.input<typeof hotelSchema>;
export type RoomTypeInput = z.input<typeof roomTypeSchema>;
export type RateUpdateInput = z.input<typeof rateUpdateSchema>;
export type AmenityInput = z.input<typeof amenitySchema>;

/** "Caldera Blue Suites" -> "caldera-blue-suites". */
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
