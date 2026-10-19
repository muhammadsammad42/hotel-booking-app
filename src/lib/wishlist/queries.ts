import { getTrendingHotels } from "@/lib/catalog/hotels";
import { prisma } from "@/lib/prisma";

/** Ids of the hotels a user has saved; empty when signed out. */
export async function getWishlistIds(userId: string | undefined) {
  if (!userId) return new Set<string>();
  const rows = await prisma.wishlist.findMany({ where: { userId }, select: { hotelId: true } });
  return new Set(rows.map((row) => row.hotelId));
}

/** The user's saved hotels as cards, most recently saved first. Inactive hotels drop out. */
export async function getWishlistHotels(userId: string) {
  const [rows, hotels] = await Promise.all([
    prisma.wishlist.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { hotelId: true } }),
    getTrendingHotels(Number.MAX_SAFE_INTEGER),
  ]);
  const byId = new Map(hotels.map((hotel) => [hotel.id, hotel]));
  return rows.flatMap((row) => byId.get(row.hotelId) ?? []);
}
