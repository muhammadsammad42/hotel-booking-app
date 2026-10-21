import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPinIcon, PencilIcon, PlusIcon, SparklesIcon, StarIcon } from "lucide-react";

import { ActiveSwitch } from "@/components/admin/active-switch";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listAdminHotels } from "@/lib/admin/catalog";
import { requireAdmin } from "@/lib/auth/guards";
import { formatPrice, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Hotels" };

export default async function AdminHotelsPage() {
  await requireAdmin();
  const hotels = await listAdminHotels();
  const live = hotels.filter((hotel) => hotel.isActive).length;

  return (
    <div className="grid grid-cols-1 gap-6">
      <AdminPageHeader
        title="Hotels"
        description={`${pluralize(hotels.length, "hotel")}, ${live} live.`}
        actions={
          <Button asChild>
            <Link href="/admin/hotels/new">
              <PlusIcon aria-hidden />
              New hotel
            </Link>
          </Button>
        }
      />
      {hotels.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <EmptyState
            headingLevel="h2"
            title="No hotels yet"
            description="Add your first hotel, then its room types and rates."
            action={
              <Button asChild size="lg">
                <Link href="/admin/hotels/new">
                  <PlusIcon aria-hidden />
                  Add a hotel
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {hotels.map((hotel, index) => (
            <li key={hotel.id} className="group/card flex flex-col overflow-hidden rounded-xl border bg-card transition-[box-shadow,border-color] duration-200 ease-soft hover:border-input hover:shadow-lift">
              <div className="relative aspect-16/9 overflow-hidden bg-muted">
                <Image
                  src={hotel.coverImageUrl}
                  alt=""
                  fill
                  priority={index < 3}
                  sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
                  className={cn("object-cover transition-[transform,opacity] duration-500 ease-soft group-hover/card:scale-[1.03]", !hotel.isActive && "opacity-60")}
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {!hotel.isActive && <Badge variant="neutral" className="bg-card">Hidden</Badge>}
                  {hotel.isFeatured && (
                    <Badge variant="brass">
                      <SparklesIcon aria-hidden />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <h2 className="type-title-md">
                    <Link href={`/admin/hotels/${hotel.id}`} className="rounded-sm hover:text-primary">
                      {hotel.name}
                    </Link>
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPinIcon className="size-3.5" aria-hidden />
                    {hotel.city}, {hotel.country} · {hotel.starRating}-star
                  </p>
                </div>
                <dl className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3 text-center text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Room types</dt>
                    <dd className="font-semibold tabular-nums">{hotel.roomTypeCount}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Rooms</dt>
                    <dd className="font-semibold tabular-nums">{hotel.rooms}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Rating</dt>
                    <dd className="inline-flex items-center gap-1 font-semibold tabular-nums">
                      {hotel.rating ? (
                        <>
                          <StarIcon className="size-3.5 fill-star text-star" aria-hidden />
                          {hotel.rating.average.toFixed(1)}
                        </>
                      ) : (
                        "New"
                      )}
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                  <ActiveSwitch kind="hotel" id={hotel.id} name={hotel.name} active={hotel.isActive} />
                  <div className="flex items-center gap-3">
                    {hotel.fromPrice !== null && <span className="text-sm text-muted-foreground tabular-nums">from {formatPrice(hotel.fromPrice)}</span>}
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/hotels/${hotel.id}`}>
                        <PencilIcon aria-hidden />
                        Edit
                        <span className="sr-only">{hotel.name}</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
