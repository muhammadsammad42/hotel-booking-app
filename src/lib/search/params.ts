// Search filters live in the URL so results can be shared, bookmarked and
// restored with the back button. This module is the single source of truth
// for reading and writing them. Pure: safe on the server and in the browser.

export const SORTS = ["recommended", "price-asc", "price-desc", "rating"] as const;
export type Sort = (typeof SORTS)[number];

export const GUEST_RATINGS = [4.7, 4.5, 4] as const;
export const MAX_GUESTS = 10;
export const PAGE_SIZE = 6;

export type SearchFilters = {
  destination: string;
  /** Calendar dates as YYYY-MM-DD, or null. */
  checkIn: string | null;
  checkOut: string | null;
  guests: number;
  /** Whole dollars per night. */
  minPrice: number | null;
  maxPrice: number | null;
  /** Amenity slugs, e.g. "infinity-pool". */
  amenities: string[];
  stars: number[];
  /** Minimum average guest rating. */
  rating: number | null;
  sort: Sort;
  page: number;
};

export const DEFAULT_FILTERS: SearchFilters = {
  destination: "",
  checkIn: null,
  checkOut: null,
  guests: 2,
  minPrice: null,
  maxPrice: null,
  amenities: [],
  stars: [],
  rating: null,
  sort: "recommended",
  page: 1,
};

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

function read(params: RawParams, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function readInt(value: string | undefined, min: number, max: number): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return number >= min && number <= max ? number : null;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Accepts only real calendar dates in YYYY-MM-DD form. */
export function isIsoDate(value: string | undefined | null): value is string {
  if (!value || !ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Turns a display name into a URL slug: "Free Wi-Fi" -> "free-wi-fi". */
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Reads filters from search params. Invalid values fall back to defaults. */
export function parseSearchParams(params: RawParams): SearchFilters {
  const checkIn = read(params, "checkIn");
  const checkOut = read(params, "checkOut");
  const datesValid = isIsoDate(checkIn) && isIsoDate(checkOut) && checkOut > checkIn;

  let minPrice = readInt(read(params, "minPrice"), 0, 100_000);
  let maxPrice = readInt(read(params, "maxPrice"), 0, 100_000);
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];

  const rating = Number(read(params, "rating"));
  const sort = read(params, "sort");

  return {
    destination: (read(params, "destination") ?? "").trim().slice(0, 80),
    checkIn: datesValid ? checkIn : null,
    checkOut: datesValid ? checkOut : null,
    guests: readInt(read(params, "guests"), 1, MAX_GUESTS) ?? DEFAULT_FILTERS.guests,
    minPrice,
    maxPrice,
    amenities: [...new Set((read(params, "amenities") ?? "").split(",").map(slugify).filter(Boolean))].slice(0, 20),
    stars: [...new Set((read(params, "stars") ?? "").split(",").map(Number))]
      .filter((value) => Number.isInteger(value) && value >= 1 && value <= 5)
      .sort(),
    rating: (GUEST_RATINGS as readonly number[]).includes(rating) ? rating : null,
    sort: (SORTS as readonly string[]).includes(sort ?? "") ? (sort as Sort) : DEFAULT_FILTERS.sort,
    page: readInt(read(params, "page"), 1, 1000) ?? 1,
  };
}

/** Writes filters back to search params, leaving out defaults. */
export function toSearchParams(filters: Partial<SearchFilters>): URLSearchParams {
  const merged = { ...DEFAULT_FILTERS, ...filters };
  const params = new URLSearchParams();
  if (merged.destination) params.set("destination", merged.destination);
  if (merged.checkIn && merged.checkOut) {
    params.set("checkIn", merged.checkIn);
    params.set("checkOut", merged.checkOut);
  }
  if (merged.guests !== DEFAULT_FILTERS.guests) params.set("guests", String(merged.guests));
  if (merged.minPrice !== null) params.set("minPrice", String(merged.minPrice));
  if (merged.maxPrice !== null) params.set("maxPrice", String(merged.maxPrice));
  if (merged.amenities.length) params.set("amenities", merged.amenities.join(","));
  if (merged.stars.length) params.set("stars", [...merged.stars].sort().join(","));
  if (merged.rating !== null) params.set("rating", String(merged.rating));
  if (merged.sort !== DEFAULT_FILTERS.sort) params.set("sort", merged.sort);
  if (merged.page > 1) params.set("page", String(merged.page));
  return params;
}

/** "/search?..." for a set of filters. */
export function searchHref(filters: Partial<SearchFilters>) {
  const query = toSearchParams(filters).toString();
  return query ? `/search?${query}` : "/search";
}

/** The number of filters applied in the filter panel (not destination or dates). */
export function countActiveFilters(filters: SearchFilters) {
  return (
    (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
    filters.amenities.length +
    filters.stars.length +
    (filters.rating !== null ? 1 : 0)
  );
}

/** Stay query string carried from search to hotel pages: dates and guests. */
export function stayQuery(filters: Pick<SearchFilters, "checkIn" | "checkOut" | "guests">) {
  const params = new URLSearchParams();
  if (filters.checkIn && filters.checkOut) {
    params.set("checkIn", filters.checkIn);
    params.set("checkOut", filters.checkOut);
  }
  if (filters.guests !== DEFAULT_FILTERS.guests) params.set("guests", String(filters.guests));
  const query = params.toString();
  return query ? `?${query}` : "";
}
