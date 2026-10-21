"use server";

import { revalidatePath } from "next/cache";

import { getAdmin, NOT_ADMIN } from "@/lib/admin/guard";
import { addDays, eachNight, toUtcDate } from "@/lib/booking/stay";
import { formatPrice, pluralize } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { rateUpdateSchema, type RateUpdateInput } from "@/lib/validation/admin";
import { fieldErrors } from "@/lib/validation/auth";

type Result = { ok: true; message: string } | { ok: false; formError: string };

/**
 * Sets a nightly price, resets to the base price, or blocks or unblocks
 * rooms for every date from `from` to `to` (both included).
 */
export async function applyRatesAction(input: RateUpdateInput): Promise<Result> {
  if (!(await getAdmin())) return NOT_ADMIN;
  const parsed = rateUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, formError: Object.values(fieldErrors(parsed.error))[0] ?? "Check the dates and values." };
  const update = parsed.data;

  const room = await prisma.roomType.findUnique({
    where: { id: update.roomTypeId },
    select: { id: true, totalInventory: true, hotel: { select: { slug: true } } },
  });
  if (!room) return { ok: false, formError: "We could not find this room type." };

  // eachNight excludes its end date, so go one day past `to`.
  const end = addDays(update.to, 1);
  const dates = eachNight(update.from, end).map(toUtcDate);
  const inRange = { roomTypeId: room.id, date: { gte: dates[0], lte: dates.at(-1)! } };
  const days = pluralize(dates.length, "night");

  let message: string;
  switch (update.action) {
    case "price":
      await prisma.$transaction([
        prisma.rateOverride.deleteMany({ where: inRange }),
        prisma.rateOverride.createMany({ data: dates.map((date) => ({ roomTypeId: room.id, date, price: update.price })) }),
      ]);
      message = `${days} set to ${formatPrice(update.price)}.`;
      break;
    case "reset":
      await prisma.rateOverride.deleteMany({ where: inRange });
      message = `${days} back to the base price.`;
      break;
    case "block":
      if (update.rooms > room.totalInventory) return { ok: false, formError: `This room type only has ${pluralize(room.totalInventory, "room")}.` };
      await prisma.$transaction([
        prisma.availabilityBlock.deleteMany({ where: inRange }),
        prisma.availabilityBlock.createMany({
          data: dates.map((date) => ({ roomTypeId: room.id, date, roomsBlocked: update.rooms, reason: update.reason || null })),
        }),
      ]);
      message = `${pluralize(update.rooms, "room")} blocked for ${days}.`;
      break;
    case "unblock":
      await prisma.availabilityBlock.deleteMany({ where: inRange });
      message = `Blocks removed for ${days}.`;
      break;
  }

  revalidatePath("/admin", "layout");
  revalidatePath(`/hotels/${room.hotel.slug}`);
  revalidatePath("/search");
  return { ok: true, message };
}
