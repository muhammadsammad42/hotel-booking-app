// Catalogue queries for the admin. Server only.
import { notFound } from "next/navigation";

import { getRatings } from "@/lib/catalog/ratings";
import { prisma } from "@/lib/prisma";

/** Cloudinary is configured, so the admin can upload photos as well as link them. */
export function uploadsEnabled() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export async function listAdminHotels() {
  const hotels = await prisma.hotel.findMany({
    // Stable order, so a hotel does not jump when it is hidden or shown.
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      country: true,
      starRating: true,
      isActive: true,
      isFeatured: true,
      coverImageUrl: true,
      roomTypes: { select: { isActive: true, totalInventory: true, basePrice: true } },
      _count: { select: { reviews: true } },
    },
  });
  const ratings = await getRatings(hotels.map((hotel) => hotel.id));
  return hotels.map((hotel) => {
    const live = hotel.roomTypes.filter((room) => room.isActive);
    return {
      ...hotel,
      rating: ratings.get(hotel.id) ?? null,
      roomTypeCount: hotel.roomTypes.length,
      rooms: live.reduce((sum, room) => sum + room.totalInventory, 0),
      fromPrice: live.length ? Math.min(...live.map((room) => room.basePrice)) : null,
    };
  });
}

export async function getAmenityOptions() {
  return prisma.amenity.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }], select: { id: true, name: true, iconKey: true, category: true } });
}

export async function getAdminHotel(id: string) {
  const hotel = await prisma.hotel.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" }, select: { url: true, alt: true } },
      amenities: { select: { id: true } },
      roomTypes: {
        orderBy: [{ isActive: "desc" }, { basePrice: "asc" }],
        select: {
          id: true,
          name: true,
          maxGuests: true,
          beds: true,
          basePrice: true,
          totalInventory: true,
          isActive: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
          _count: { select: { bookings: { where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } } } } },
        },
      },
    },
  });
  if (!hotel) notFound();
  return hotel;
}

export async function getAdminRoomType(hotelId: string, roomTypeId: string) {
  const room = await prisma.roomType.findFirst({
    where: { id: roomTypeId, hotelId },
    include: {
      images: { orderBy: { sortOrder: "asc" }, select: { url: true, alt: true } },
      amenities: { select: { id: true } },
      hotel: { select: { name: true } },
    },
  });
  if (!room) notFound();
  return room;
}
