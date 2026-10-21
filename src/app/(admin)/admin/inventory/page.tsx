import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { HotelFilter } from "@/components/admin/hotel-filter";
import { OccupancyHeatmap, type HeatmapRow } from "@/components/admin/occupancy-heatmap";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { nightsFor, roomTypeOptions } from "@/lib/admin/inventory";
import { requireAdmin } from "@/lib/auth/guards";
import { addDays, daysBetween, eachNight, isIsoDate, todayIso } from "@/lib/booking/stay";

export const metadata: Metadata = { title: "Inventory" };

const DAYS = 28;
const range = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const fmt = (iso: string) => range.format(new Date(`${iso}T00:00:00Z`));

export default async function InventoryPage({ searchParams }: PageProps<"/admin/inventory">) {
  await requireAdmin();
  const params = await searchParams;
  const now = new Date();
  const today = todayIso(now);
  const requested = typeof params.from === "string" && isIsoDate(params.from) ? params.from : today;
  // Up to a year either way.
  const from = Math.abs(daysBetween(today, requested)) > 366 ? today : requested;
  const to = addDays(from, DAYS);
  const hotelId = typeof params.hotel === "string" ? params.hotel : undefined;

  const hotels = await roomTypeOptions();
  const shown = hotels.filter((hotel) => (hotelId ? hotel.id === hotelId : hotel.isActive));
  const rooms = shown.flatMap((hotel) => hotel.roomTypes.filter((room) => room.isActive).map((room) => ({ ...room, hotel: hotel.name })));
  const nights = rooms.length ? await nightsFor(rooms, from, to, now) : new Map();

  const rows: HeatmapRow[] = rooms.map((room) => ({
    id: room.id,
    name: room.name,
    hotel: room.hotel,
    inventory: room.totalInventory,
    nights: (nights.get(room.id) ?? []).map((night: { date: string; booked: number; blocked: number }) => ({ date: night.date, booked: night.booked, blocked: night.blocked })),
  }));

  const sold = rows.reduce((sum, row) => sum + row.nights.reduce((acc, night) => acc + night.booked, 0), 0);
  const capacity = rows.reduce((sum, row) => sum + row.inventory * DAYS, 0);
  const share = capacity ? Math.round((sold / capacity) * 100) : 0;
  const href = (start: string) => `/admin/inventory?from=${start}${hotelId ? `&hotel=${hotelId}` : ""}`;

  return (
    <div className="grid grid-cols-1 gap-6">
      <AdminPageHeader
        title="Inventory"
        description={`${fmt(from)} to ${fmt(addDays(to, -1))}: ${share}% of room-nights booked across ${rooms.length} room types.`}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <HotelFilter hotels={hotels.map((hotel) => ({ id: hotel.id, name: hotel.name }))} value={hotelId} />
        <nav aria-label="Dates" className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon-sm">
            <Link href={href(addDays(from, -DAYS))} scroll={false}>
              <ChevronLeftIcon aria-hidden />
              <span className="sr-only">Previous four weeks</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={href(today)} scroll={false}>
              Today
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon-sm">
            <Link href={href(addDays(from, DAYS))} scroll={false}>
              <ChevronRightIcon aria-hidden />
              <span className="sr-only">Next four weeks</span>
            </Link>
          </Button>
        </nav>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <EmptyState headingLevel="h2" title="Nothing to show" description="This hotel has no bookable room types. Add one, or turn an existing one back on." />
        </div>
      ) : (
        <OccupancyHeatmap rows={rows} dates={eachNight(from, to)} today={today} />
      )}
    </div>
  );
}
