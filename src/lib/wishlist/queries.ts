import { prisma } from "@/lib/prisma";

/** Ids of the hotels a user has saved; empty when signed out. */
export async function getWishlistIds(userId: string | undefined) {
  if (!userId) return new Set<string>();
  const rows = await prisma.wishlist.findMany({ where: { userId }, select: { hotelId: true } });
  return new Set(rows.map((row) => row.hotelId));
}
