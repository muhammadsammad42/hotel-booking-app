// Nightly prices and room counts for the admin rates and inventory pages.
// Built on the booking engine, so the admin sees exactly what guests are sold.
import { loadEngineRows } from "@/lib/booking/data";
import { getAvailability, getNightlyPrices } from "@/lib/booking/engine";
import { prisma } from "@/lib/prisma";

export type AdminNight = {
  date: string;
  price: number;
  /** The price comes from a rate override, not the base price. */
  override: boolean;
  blocked: number;
  booked: number;
  available: number;
};

type Room = { id: string; basePrice: number; totalInventory: number };

/** Every night in [from, to) for each room type, from three queries. */
export async function nightsFor(rooms: Room[], from: string, to: string, now = new Date()) {
  const rows = await loadEngineRows(
    rooms.map((room) => room.id),
    from,
    to,
  );
  return new Map(
    rooms.map((room) => {
      const data = rows.get(room.id)!;
      const prices = getNightlyPrices({ basePrice: room.basePrice, overrides: data.overrides, checkIn: from, checkOut: to });
      const availability = getAvailability({ totalInventory: room.totalInventory, blocks: data.blocks, bookings: data.bookings, checkIn: from, checkOut: to, now });
      const nights: AdminNight[] = prices.map((night, index) => ({
        date: night.date,
        price: night.price,
        override: night.override,
        blocked: availability.nights[index].blocked,
        booked: availability.nights[index].booked,
        available: availability.nights[index].available,
      }));
      return [room.id, nights] as const;
    }),
  );
}

/** Room types for pickers, grouped under their hotel. */
export async function roomTypeOptions() {
  const hotels = await prisma.hotel.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      isActive: true,
      roomTypes: { orderBy: { basePrice: "asc" }, select: { id: true, name: true, isActive: true, basePrice: true, totalInventory: true } },
    },
  });
  return hotels.filter((hotel) => hotel.roomTypes.length > 0);
}
