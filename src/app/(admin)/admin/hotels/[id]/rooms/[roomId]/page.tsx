import type { Metadata } from "next";
import Link from "next/link";
import { CalendarRangeIcon } from "lucide-react";

import { ActiveSwitch } from "@/components/admin/active-switch";
import { BackLink } from "@/components/admin/back-link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RoomTypeForm } from "@/components/admin/room-type-form";
import { Button } from "@/components/ui/button";
import { getAdminRoomType, getAmenityOptions, uploadsEnabled } from "@/lib/admin/catalog";
import { roomTypeToForm } from "@/lib/admin/form-values";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Edit room type" };

export default async function EditRoomTypePage({ params }: PageProps<"/admin/hotels/[id]/rooms/[roomId]">) {
  await requireAdmin();
  const { id, roomId } = await params;
  const [room, amenities] = await Promise.all([getAdminRoomType(id, roomId), getAmenityOptions()]);

  return (
    <div className="grid grid-cols-1 gap-4">
      <BackLink href={`/admin/hotels/${id}#room-types`}>{room.hotel.name}</BackLink>
      <AdminPageHeader
        title={room.name}
        description={room.hotel.name}
        actions={
          <>
            <ActiveSwitch kind="room" id={room.id} name={room.name} active={room.isActive} />
            <Button asChild variant="outline">
              <Link href={`/admin/rates?room=${room.id}`}>
                <CalendarRangeIcon aria-hidden />
                Rates calendar
              </Link>
            </Button>
          </>
        }
      />
      <RoomTypeForm hotelId={id} roomTypeId={room.id} initial={roomTypeToForm(room)} amenities={amenities} uploadsEnabled={uploadsEnabled()} />
    </div>
  );
}
