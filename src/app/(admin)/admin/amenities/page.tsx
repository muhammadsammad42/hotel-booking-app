import type { Metadata } from "next";

import { AmenityManager } from "@/components/admin/amenity-manager";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AMENITY_ICON_KEYS } from "@/components/hotel/amenity-icon";
import { requireAdmin } from "@/lib/auth/guards";
import { pluralize } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Amenities" };

export default async function AmenitiesPage() {
  await requireAdmin();
  const amenities = await prisma.amenity.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { id: true, name: true, iconKey: true, category: true, _count: { select: { hotels: true, roomTypes: true } } },
  });

  return (
    <div className="grid grid-cols-1 gap-6">
      <AdminPageHeader title="Amenities" description={`${pluralize(amenities.length, "amenity", "amenities")} that hotels and rooms can offer.`} />
      <AmenityManager
        iconKeys={AMENITY_ICON_KEYS}
        amenities={amenities.map(({ _count, ...amenity }) => ({ ...amenity, hotels: _count.hotels, rooms: _count.roomTypes }))}
      />
    </div>
  );
}
