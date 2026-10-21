import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarRangeIcon, ExternalLinkIcon, PencilIcon, PlusIcon } from "lucide-react";

import { ActiveSwitch } from "@/components/admin/active-switch";
import { BackLink } from "@/components/admin/back-link";
import { HotelForm } from "@/components/admin/hotel-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminHotel, getAmenityOptions, uploadsEnabled } from "@/lib/admin/catalog";
import { hotelToForm } from "@/lib/admin/form-values";
import { requireAdmin } from "@/lib/auth/guards";
import { formatPrice, pluralize } from "@/lib/format";

export const metadata: Metadata = { title: "Edit hotel" };

export default async function EditHotelPage({ params }: PageProps<"/admin/hotels/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const [hotel, amenities] = await Promise.all([getAdminHotel(id), getAmenityOptions()]);

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="grid grid-cols-1 gap-4">
        <BackLink href="/admin/hotels">Hotels</BackLink>
        <AdminPageHeader
          title={hotel.name}
          description={`${hotel.city}, ${hotel.country} · ${pluralize(hotel.roomTypes.length, "room type")}`}
          actions={
            <>
              <ActiveSwitch kind="hotel" id={hotel.id} name={hotel.name} active={hotel.isActive} />
              <Button asChild variant="outline">
                <Link href={`/hotels/${hotel.slug}`} target="_blank">
                  <ExternalLinkIcon aria-hidden />
                  View page
                </Link>
              </Button>
            </>
          }
        />
      </div>

      <section id="room-types" aria-labelledby="room-types-heading" className="grid scroll-mt-24 gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="room-types-heading" className="type-title-md">
              Room types
            </h2>
            <p className="text-sm text-muted-foreground">What guests can book at {hotel.name}.</p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/admin/hotels/${hotel.id}/rooms/new`}>
              <PlusIcon aria-hidden />
              Add room type
            </Link>
          </Button>
        </div>
        {hotel.roomTypes.length === 0 ? (
          <div className="rounded-xl border bg-card">
            <EmptyState
              headingLevel="h3"
              title="No room types yet"
              description="Guests cannot book this hotel until it has at least one room type."
              action={
                <Button asChild>
                  <Link href={`/admin/hotels/${hotel.id}/rooms/new`}>
                    <PlusIcon aria-hidden />
                    Add the first room type
                  </Link>
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="divide-y overflow-hidden rounded-xl border bg-card">
            {hotel.roomTypes.map((room) => (
              <li key={room.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="relative aspect-4/3 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                  {room.images[0] && <Image src={room.images[0].url} alt="" fill sizes="80px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{room.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {room.beds} · sleeps {room.maxGuests} · {pluralize(room.totalInventory, "room")} · {formatPrice(room.basePrice)} a night
                  </p>
                  {room._count.bookings > 0 && <p className="text-xs text-muted-foreground">{pluralize(room._count.bookings, "upcoming booking")}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ActiveSwitch kind="room" id={room.id} name={room.name} active={room.isActive} />
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/rates?room=${room.id}`}>
                      <CalendarRangeIcon aria-hidden />
                      Rates
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/hotels/${hotel.id}/rooms/${room.id}`}>
                      <PencilIcon aria-hidden />
                      Edit
                      <span className="sr-only">{room.name}</span>
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4">
        <h2 className="type-title-md">Hotel details</h2>
        <HotelForm hotelId={hotel.id} initial={hotelToForm(hotel)} amenities={amenities} uploadsEnabled={uploadsEnabled()} />
      </div>
    </div>
  );
}
