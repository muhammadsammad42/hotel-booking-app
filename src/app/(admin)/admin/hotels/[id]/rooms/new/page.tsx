import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/admin/back-link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RoomTypeForm } from "@/components/admin/room-type-form";
import { getAmenityOptions, uploadsEnabled } from "@/lib/admin/catalog";
import { EMPTY_ROOM_TYPE } from "@/lib/admin/form-values";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "New room type" };

export default async function NewRoomTypePage({ params }: PageProps<"/admin/hotels/[id]/rooms/new">) {
  await requireAdmin();
  const { id } = await params;
  const [hotel, amenities] = await Promise.all([
    prisma.hotel.findUnique({ where: { id }, select: { id: true, name: true } }),
    getAmenityOptions(),
  ]);
  if (!hotel) notFound();

  return (
    <div className="grid grid-cols-1 gap-4">
      <BackLink href={`/admin/hotels/${hotel.id}#room-types`}>{hotel.name}</BackLink>
      <AdminPageHeader title="New room type" description={`A new kind of room at ${hotel.name}.`} />
      <RoomTypeForm hotelId={hotel.id} initial={EMPTY_ROOM_TYPE} amenities={amenities} uploadsEnabled={uploadsEnabled()} />
    </div>
  );
}
