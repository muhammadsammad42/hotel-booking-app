import { prisma } from "@/lib/prisma";

export type RatingSummary = { average: number; count: number };

/** A hotel is a guest favourite with a high average from enough stays. */
export function isGuestFavourite(rating: RatingSummary | undefined) {
  return Boolean(rating && rating.count >= 5 && rating.average >= 4.7);
}

/** Average rating and review count per hotel, for the given hotels. */
export async function getRatings(hotelIds: string[]) {
  const rows = await prisma.review.groupBy({
    by: ["hotelId"],
    where: { hotelId: { in: hotelIds } },
    _avg: { rating: true },
    _count: true,
  });

  return new Map<string, RatingSummary>(
    rows.map((row) => [row.hotelId, { average: row._avg.rating ?? 0, count: row._count }]),
  );
}
