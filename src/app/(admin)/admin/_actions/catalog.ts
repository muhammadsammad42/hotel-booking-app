"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";

import { getAdmin, NOT_ADMIN } from "@/lib/admin/guard";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/lib/validation/account";
import {
  amenitySchema,
  hotelSchema,
  roomTypeSchema,
  slugify,
  type AmenityInput,
  type HotelInput,
  type RoomTypeInput,
} from "@/lib/validation/admin";
import { fieldErrors, type FieldErrors } from "@/lib/validation/auth";

type SaveResult<Input> =
  | { ok: true; id: string; message: string }
  | { ok: false; formError?: string; fieldErrors?: FieldErrors<Input> };

type Result = { ok: true; message: string } | { ok: false; formError: string };

/** Revalidates the public pages that show catalogue data. */
function refreshCatalogue(slug?: string) {
  revalidatePath("/admin", "layout");
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/destinations");
  if (slug) revalidatePath(`/hotels/${slug}`);
}

async function uniqueSlug(base: string, taken: (slug: string) => Promise<boolean>) {
  let slug = base || "untitled";
  for (let n = 2; await taken(slug); n++) slug = `${base}-${n}`;
  return slug;
}

export async function saveHotelAction(input: HotelInput, hotelId?: string): Promise<SaveResult<HotelInput>> {
  if (!(await getAdmin())) return NOT_ADMIN;
  const parsed = hotelSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const { images, amenityIds, slug: requested, ...data } = parsed.data;
  if (hotelId && !idSchema.safeParse(hotelId).success) return { ok: false, formError: "We could not find this hotel." };

  const slug = await uniqueSlug(requested || slugify(data.name), async (candidate) =>
    Boolean(await prisma.hotel.findFirst({ where: { slug: candidate, NOT: hotelId ? { id: hotelId } : undefined }, select: { id: true } })),
  );
  const record = {
    ...data,
    slug,
    coverImageUrl: images[0].url,
    coverImageAlt: images[0].alt,
    amenities: { set: amenityIds.map((id) => ({ id })) },
  };

  try {
    const hotel = await prisma.$transaction(async (tx) => {
      const saved = hotelId
        ? await tx.hotel.update({ where: { id: hotelId }, data: record, select: { id: true, slug: true } })
        : await tx.hotel.create({
            data: { ...record, amenities: { connect: amenityIds.map((id) => ({ id })) } },
            select: { id: true, slug: true },
          });
      await tx.hotelImage.deleteMany({ where: { hotelId: saved.id } });
      await tx.hotelImage.createMany({ data: images.map((image, sortOrder) => ({ ...image, sortOrder, hotelId: saved.id })) });
      return saved;
    });
    refreshCatalogue(hotel.slug);
    return { ok: true, id: hotel.id, message: hotelId ? "Hotel saved." : "Hotel created. Add its room types next." };
  } catch (error) {
    console.error("[admin] Save hotel failed:", error);
    return { ok: false, formError: "We could not save this hotel. Check the fields and try again." };
  }
}

export async function setHotelActiveAction(hotelId: string, isActive: boolean): Promise<Result> {
  if (!(await getAdmin())) return NOT_ADMIN;
  if (!idSchema.safeParse(hotelId).success || typeof isActive !== "boolean") return { ok: false, formError: "We could not find this hotel." };
  const hotel = await prisma.hotel.update({ where: { id: hotelId }, data: { isActive }, select: { slug: true, name: true } }).catch(() => null);
  if (!hotel) return { ok: false, formError: "We could not find this hotel." };
  refreshCatalogue(hotel.slug);
  return { ok: true, message: isActive ? `${hotel.name} is live again.` : `${hotel.name} is hidden from guests. Existing bookings are kept.` };
}

export async function saveRoomTypeAction(hotelId: string, input: RoomTypeInput, roomTypeId?: string): Promise<SaveResult<RoomTypeInput>> {
  if (!(await getAdmin())) return NOT_ADMIN;
  if (!idSchema.safeParse(hotelId).success || (roomTypeId && !idSchema.safeParse(roomTypeId).success)) {
    return { ok: false, formError: "We could not find this room type." };
  }
  const parsed = roomTypeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const { images, amenityIds, slug: requested, ...data } = parsed.data;

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId }, select: { slug: true } });
  if (!hotel) return { ok: false, formError: "We could not find this hotel." };
  if (roomTypeId) {
    const booked = await prisma.booking.aggregate({
      where: { roomTypeId, status: { in: ["CONFIRMED", "CHECKED_IN"] } },
      _max: { rooms: true },
    });
    if ((booked._max.rooms ?? 0) > data.totalInventory) {
      return { ok: false, fieldErrors: { totalInventory: "Some upcoming bookings need more rooms than this" } };
    }
  }

  const slug = await uniqueSlug(requested || slugify(data.name), async (candidate) =>
    Boolean(await prisma.roomType.findFirst({ where: { hotelId, slug: candidate, NOT: roomTypeId ? { id: roomTypeId } : undefined }, select: { id: true } })),
  );

  try {
    const room = await prisma.$transaction(async (tx) => {
      const saved = roomTypeId
        ? await tx.roomType.update({ where: { id: roomTypeId, hotelId }, data: { ...data, slug, amenities: { set: amenityIds.map((id) => ({ id })) } }, select: { id: true } })
        : await tx.roomType.create({ data: { ...data, slug, hotelId, amenities: { connect: amenityIds.map((id) => ({ id })) } }, select: { id: true } });
      await tx.roomImage.deleteMany({ where: { roomTypeId: saved.id } });
      await tx.roomImage.createMany({ data: images.map((image, sortOrder) => ({ ...image, sortOrder, roomTypeId: saved.id })) });
      return saved;
    });
    refreshCatalogue(hotel.slug);
    return { ok: true, id: room.id, message: roomTypeId ? "Room type saved." : "Room type created." };
  } catch (error) {
    console.error("[admin] Save room type failed:", error);
    return { ok: false, formError: "We could not save this room type. Check the fields and try again." };
  }
}

export async function setRoomTypeActiveAction(roomTypeId: string, isActive: boolean): Promise<Result> {
  if (!(await getAdmin())) return NOT_ADMIN;
  if (!idSchema.safeParse(roomTypeId).success || typeof isActive !== "boolean") return { ok: false, formError: "We could not find this room type." };
  const room = await prisma.roomType
    .update({ where: { id: roomTypeId }, data: { isActive }, select: { name: true, hotel: { select: { slug: true } } } })
    .catch(() => null);
  if (!room) return { ok: false, formError: "We could not find this room type." };
  refreshCatalogue(room.hotel.slug);
  return { ok: true, message: isActive ? `${room.name} is bookable again.` : `${room.name} is no longer bookable. Existing bookings are kept.` };
}

export async function saveAmenityAction(input: AmenityInput, amenityId?: string): Promise<SaveResult<AmenityInput>> {
  if (!(await getAdmin())) return NOT_ADMIN;
  const parsed = amenitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  if (amenityId && !idSchema.safeParse(amenityId).success) return { ok: false, formError: "We could not find this amenity." };

  const clash = await prisma.amenity.findFirst({
    where: { name: { equals: parsed.data.name, mode: "insensitive" }, NOT: amenityId ? { id: amenityId } : undefined },
    select: { id: true },
  });
  if (clash) return { ok: false, fieldErrors: { name: "There is already an amenity with this name" } };

  const amenity = amenityId
    ? await prisma.amenity.update({ where: { id: amenityId }, data: parsed.data, select: { id: true } })
    : await prisma.amenity.create({ data: parsed.data, select: { id: true } });
  refreshCatalogue();
  return { ok: true, id: amenity.id, message: amenityId ? "Amenity saved." : "Amenity added." };
}

export async function deleteAmenityAction(amenityId: string): Promise<Result> {
  if (!(await getAdmin())) return NOT_ADMIN;
  if (!idSchema.safeParse(amenityId).success) return { ok: false, formError: "We could not find this amenity." };
  const deleted = await prisma.amenity.delete({ where: { id: amenityId }, select: { name: true } }).catch(() => null);
  if (!deleted) return { ok: false, formError: "We could not find this amenity." };
  refreshCatalogue();
  return { ok: true, message: `${deleted.name} removed from every hotel and room.` };
}

export type UploadSignature =
  | { enabled: true; cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string }
  | { enabled: false };

/**
 * Signs a direct browser upload to Cloudinary, when CLOUDINARY_CLOUD_NAME,
 * CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are set. The secret never
 * leaves the server.
 */
export async function uploadSignatureAction(): Promise<UploadSignature> {
  if (!(await getAdmin())) return { enabled: false };
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: secret } = process.env;
  if (!cloudName || !apiKey || !secret) return { enabled: false };
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "sarai";
  const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
  return { enabled: true, cloudName, apiKey, timestamp, folder, signature };
}
