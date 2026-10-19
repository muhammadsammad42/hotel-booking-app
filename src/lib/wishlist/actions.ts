"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

const inputSchema = z.object({ hotelId: z.string().min(1).max(64), saved: z.boolean() });

export type WishlistResult = { ok: true; saved: boolean } | { ok: false; reason: "signed-out" | "invalid" | "error" };

/** Saves or removes a hotel from the signed-in user's wishlist. Idempotent. */
export async function setWishlisted(input: { hotelId: string; saved: boolean }): Promise<WishlistResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "signed-out" };

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const { hotelId, saved } = parsed.data;

  try {
    if (saved) {
      const hotel = await prisma.hotel.findFirst({ where: { id: hotelId, isActive: true }, select: { id: true } });
      if (!hotel) return { ok: false, reason: "invalid" };
      await prisma.wishlist.upsert({
        where: { userId_hotelId: { userId: user.id, hotelId } },
        create: { userId: user.id, hotelId },
        update: {},
      });
    } else {
      await prisma.wishlist.deleteMany({ where: { userId: user.id, hotelId } });
    }
  } catch {
    return { ok: false, reason: "error" };
  }

  revalidatePath("/account/wishlist");
  return { ok: true, saved };
}
