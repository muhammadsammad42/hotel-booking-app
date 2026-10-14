import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, slugify, type SearchFilters } from "@/lib/search/params";

import { getRatings, isGuestFavourite, type RatingSummary } from "./ratings";

/** The data a hotel card needs. Prices are cents. */
export type HotelCardData = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  starRating: number;
  latitude: number;
  longitude: number;
  images: { url: string; alt: string }[];
  rating: RatingSummary | null;
  guestFavourite: boolean;
  /** Lowest nightly price for the stay, or the lowest base price without dates. */
  fromPrice: number;
};

const cardInclude = {
  images: { orderBy: { sortOrder: "asc" }, take: 5, select: { url: true, alt: true } },
} satisfies Prisma.HotelInclude;

type HotelWithImages = Prisma.HotelGetPayload<{ include: typeof cardInclude }>;

function toCard(hotel: HotelWithImages, fromPrice: number, rating: RatingSummary | undefined): HotelCardData {
  return {
    id: hotel.id,
    slug: hotel.slug,
    name: hotel.name,
    city: hotel.city,
    country: hotel.country,
    starRating: hotel.starRating,
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    images: hotel.images,
    rating: rating ?? null,
    guestFavourite: isGuestFavourite(rating),
    fromPrice,
  };
}

/** Amenities guests can filter by: hotel-wide ones, not in-room details. */
export async function getFilterAmenities() {
  const amenities = await prisma.amenity.findMany({
    where: { category: { notIn: ["ROOM", "BATHROOM"] }, hotels: { some: { isActive: true } } },
    orderBy: { name: "asc" },
    select: { name: true, iconKey: true, _count: { select: { hotels: true } } },
  });
  return amenities
    .sort((a, b) => b._count.hotels - a._count.hotels)
    .map((amenity) => ({ slug: slugify(amenity.name), name: amenity.name, iconKey: amenity.iconKey }));
}

export type SearchResult = {
  hotels: HotelCardData[];
  total: number;
  page: number;
  pageCount: number;
  /** Cheapest and dearest nightly prices among matching stays, in dollars. */
  priceBounds: { min: number; max: number };
};

/**
 * Finds hotels for the search page. Destination, stars, amenities and guests
 * filter in the database; price and rating need computed values, so they are
 * applied to the candidates afterwards. Fine at this catalogue size; a larger
 * one would store the rating summary on the hotel.
 */
export async function searchHotels(
  filters: SearchFilters,
  priceFor: (roomTypes: { id: string; basePrice: number }[]) => Promise<number | null> | number | null = (rooms) =>
    rooms.length ? Math.min(...rooms.map((room) => room.basePrice)) : null,
): Promise<SearchResult> {
  const amenityNames = filters.amenities.length
    ? (await getFilterAmenities()).filter((a) => filters.amenities.includes(a.slug)).map((a) => a.name)
    : [];

  const roomFilter = { isActive: true, maxGuests: { gte: filters.guests } } satisfies Prisma.RoomTypeWhereInput;
  const where: Prisma.HotelWhereInput = {
    isActive: true,
    roomTypes: { some: roomFilter },
    ...(filters.stars.length ? { starRating: { in: filters.stars } } : {}),
    ...(amenityNames.length ? { AND: amenityNames.map((name) => ({ amenities: { some: { name } } })) } : {}),
    ...(filters.destination
      ? {
          OR: [
            { city: { contains: filters.destination, mode: "insensitive" } },
            { country: { contains: filters.destination, mode: "insensitive" } },
            { name: { contains: filters.destination, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const candidates = await prisma.hotel.findMany({
    where,
    include: { ...cardInclude, roomTypes: { where: roomFilter, select: { id: true, basePrice: true } } },
  });
  const ratings = await getRatings(candidates.map((hotel) => hotel.id));

  const priced = (
    await Promise.all(
      candidates.map(async (hotel) => {
        const price = await priceFor(hotel.roomTypes);
        return price === null ? null : { hotel, price };
      }),
    )
  ).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const dollars = priced.map((entry) => Math.round(entry.price / 100));
  const priceBounds = dollars.length
    ? { min: Math.min(...dollars), max: Math.max(...dollars) }
    : { min: 0, max: 0 };

  const matches = priced.filter(({ hotel, price }) => {
    const nightly = price / 100;
    if (filters.minPrice !== null && nightly < filters.minPrice) return false;
    if (filters.maxPrice !== null && nightly > filters.maxPrice) return false;
    if (filters.rating !== null && (ratings.get(hotel.id)?.average ?? 0) < filters.rating) return false;
    return true;
  });

  const score = (hotel: (typeof matches)[number]["hotel"]) => {
    const rating = ratings.get(hotel.id);
    return (hotel.isFeatured ? 1 : 0) + (rating?.average ?? 0) + Math.log10((rating?.count ?? 0) + 1) / 2;
  };
  matches.sort((a, b) => {
    switch (filters.sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "rating":
        return (ratings.get(b.hotel.id)?.average ?? 0) - (ratings.get(a.hotel.id)?.average ?? 0);
      default:
        return score(b.hotel) - score(a.hotel);
    }
  });

  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const slice = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return {
    hotels: slice.map(({ hotel, price }) => toCard(hotel, price, ratings.get(hotel.id))),
    total: matches.length,
    page,
    pageCount,
    priceBounds,
  };
}

/** Featured and best-rated stays for the home page. */
export async function getTrendingHotels(limit = 8) {
  const hotels = await prisma.hotel.findMany({
    where: { isActive: true },
    include: { ...cardInclude, roomTypes: { where: { isActive: true }, select: { basePrice: true } } },
  });
  const ratings = await getRatings(hotels.map((hotel) => hotel.id));
  return hotels
    .map((hotel) =>
      toCard(hotel, Math.min(...hotel.roomTypes.map((room) => room.basePrice)), ratings.get(hotel.id)),
    )
    .sort((a, b) => Number(b.guestFavourite) - Number(a.guestFavourite) || (b.rating?.average ?? 0) - (a.rating?.average ?? 0))
    .slice(0, limit);
}

export type Destination = {
  name: string;
  country: string;
  stays: number;
  image: { url: string; alt: string };
  fromPrice: number;
};

/** One card per city, with its best hotel photo and lowest price. */
export async function getDestinations(): Promise<Destination[]> {
  const hotels = await prisma.hotel.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    select: {
      city: true,
      country: true,
      coverImageUrl: true,
      coverImageAlt: true,
      roomTypes: { where: { isActive: true }, select: { basePrice: true } },
    },
  });

  const byCity = new Map<string, Destination>();
  for (const hotel of hotels) {
    const price = Math.min(...hotel.roomTypes.map((room) => room.basePrice));
    const existing = byCity.get(hotel.city);
    if (existing) {
      existing.stays += 1;
      existing.fromPrice = Math.min(existing.fromPrice, price);
    } else {
      byCity.set(hotel.city, {
        name: hotel.city,
        country: hotel.country,
        stays: 1,
        image: { url: hotel.coverImageUrl, alt: hotel.coverImageAlt },
        fromPrice: price,
      });
    }
  }
  return [...byCity.values()];
}

/** Places for the destination search box, with how many stays each has. */
export async function getDestinationSuggestions() {
  const hotels = await prisma.hotel.findMany({ where: { isActive: true }, select: { city: true, country: true } });
  const suggestions = new Map<string, { value: string; label: string; detail: string; count: number }>();
  for (const { city, country } of hotels) {
    const cityKey = `city:${city}`;
    const countryKey = `country:${country}`;
    suggestions.set(cityKey, { value: city, label: city, detail: country, count: (suggestions.get(cityKey)?.count ?? 0) + 1 });
    suggestions.set(countryKey, {
      value: country,
      label: country,
      detail: "Country",
      count: (suggestions.get(countryKey)?.count ?? 0) + 1,
    });
  }
  return [...suggestions.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/** Recent five-star reviews with a comment, for the home page. */
export async function getTestimonials(limit = 6) {
  const reviews = await prisma.review.findMany({
    where: { rating: 5, comment: { not: null } },
    orderBy: { createdAt: "desc" },
    take: limit * 3,
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      user: { select: { name: true } },
      hotel: { select: { name: true, slug: true, city: true } },
    },
  });
  // At most one review per hotel, so the section shows variety.
  const seen = new Set<string>();
  return reviews.filter((review) => !seen.has(review.hotel.slug) && seen.add(review.hotel.slug)).slice(0, limit);
}

/** Everything the hotel page shows, or null if there is no such active hotel. */
export async function getHotelBySlug(slug: string) {
  const hotel = await prisma.hotel.findFirst({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" }, select: { url: true, alt: true } },
      amenities: { orderBy: { name: "asc" }, select: { name: true, iconKey: true, category: true } },
      roomTypes: {
        where: { isActive: true },
        orderBy: { basePrice: "asc" },
        include: {
          images: { orderBy: { sortOrder: "asc" }, select: { url: true, alt: true } },
          amenities: { orderBy: { name: "asc" }, select: { name: true, iconKey: true } },
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          cleanliness: true,
          location: true,
          value: true,
          service: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true, image: true } },
        },
      },
    },
  });
  if (!hotel) return null;

  const { reviews } = hotel;
  const count = reviews.length;
  const average = (pick: (review: (typeof reviews)[number]) => number) =>
    count ? reviews.reduce((sum, review) => sum + pick(review), 0) / count : 0;
  const rating: RatingSummary | null = count ? { average: average((r) => r.rating), count } : null;

  return {
    ...hotel,
    rating,
    guestFavourite: isGuestFavourite(rating ?? undefined),
    subRatings: {
      cleanliness: average((r) => r.cleanliness),
      location: average((r) => r.location),
      value: average((r) => r.value),
      service: average((r) => r.service),
    },
    distribution: [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((review) => review.rating === stars).length,
    })),
  };
}

export type HotelDetail = NonNullable<Awaited<ReturnType<typeof getHotelBySlug>>>;

/** Slugs for static generation and the sitemap. */
export async function getHotelSlugs() {
  return prisma.hotel.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
}
