import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { RatesCalendar, type RatesMonth } from "@/components/admin/rates-calendar";
import { RoomTypePicker } from "@/components/admin/room-type-picker";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { nightsFor, roomTypeOptions } from "@/lib/admin/inventory";
import { monthStart } from "@/lib/admin/metrics";
import { requireAdmin } from "@/lib/auth/guards";
import { todayIso } from "@/lib/booking/stay";
import { formatPrice, pluralize } from "@/lib/format";

export const metadata: Metadata = { title: "Rates" };

const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const MONTHS_SHOWN = 2;

/** "2026-11" from ?month=, within a year either side of today. */
function parseMonth(value: unknown, now: Date) {
  const current = monthStart(now);
  if (typeof value !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return current;
  const date = new Date(`${value}-01T00:00:00Z`);
  const offset = (date.getUTCFullYear() - current.getUTCFullYear()) * 12 + date.getUTCMonth() - current.getUTCMonth();
  return offset < -12 || offset > 12 ? current : date;
}

export default async function RatesPage({ searchParams }: PageProps<"/admin/rates">) {
  await requireAdmin();
  const params = await searchParams;
  const now = new Date();
  const hotels = await roomTypeOptions();
  const rooms = hotels.flatMap((hotel) => hotel.roomTypes.map((room) => ({ ...room, hotelName: hotel.name })));

  if (rooms.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <AdminPageHeader title="Rates" description="Nightly prices and blocked rooms for each room type." />
        <div className="rounded-xl border bg-card">
          <EmptyState
            headingLevel="h2"
            title="No room types yet"
            description="Add a hotel and its room types first; their rates appear here."
            action={
              <Button asChild>
                <Link href="/admin/hotels/new">
                  <PlusIcon aria-hidden />
                  Add a hotel
                </Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const room = rooms.find((item) => item.id === params.room) ?? rooms.find((item) => item.isActive) ?? rooms[0];
  const start = parseMonth(params.month, now);
  const end = monthStart(start, MONTHS_SHOWN);
  const nights = (await nightsFor([room], start.toISOString().slice(0, 10), end.toISOString().slice(0, 10), now)).get(room.id)!;

  const months: RatesMonth[] = Array.from({ length: MONTHS_SHOWN }, (_, index) => {
    const month = monthStart(start, index);
    const key = month.toISOString().slice(0, 7);
    return { key, label: monthLabel.format(month), nights: nights.filter((night) => night.date.startsWith(key)) };
  });
  const overrides = nights.filter((night) => night.override).length;
  const monthHref = (offset: number) => `/admin/rates?room=${room.id}&month=${monthStart(start, offset).toISOString().slice(0, 7)}`;
  const canGoBack = start > monthStart(now, -12);
  const canGoForward = start < monthStart(now, 12);

  return (
    <div className="grid grid-cols-1 gap-6">
      <AdminPageHeader
        title="Rates"
        description={`${room.hotelName} · ${room.name}: base price ${formatPrice(room.basePrice)}, ${pluralize(room.totalInventory, "room")}. ${pluralize(overrides, "custom price")} in view.`}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <RoomTypePicker hotels={hotels} value={room.id} />
        <nav aria-label="Months" className="flex items-center gap-2">
          {canGoBack ? (
            <Button asChild variant="outline" size="icon-sm">
              <Link href={monthHref(-1)} scroll={false}>
                <ChevronLeftIcon aria-hidden />
                <span className="sr-only">Earlier month</span>
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="icon-sm" disabled>
              <ChevronLeftIcon aria-hidden />
              <span className="sr-only">Earlier month</span>
            </Button>
          )}
          <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/rates?room=${room.id}`} scroll={false}>
              Today
            </Link>
          </Button>
          {canGoForward ? (
            <Button asChild variant="outline" size="icon-sm">
              <Link href={monthHref(1)} scroll={false}>
                <ChevronRightIcon aria-hidden />
                <span className="sr-only">Later month</span>
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="icon-sm" disabled>
              <ChevronRightIcon aria-hidden />
              <span className="sr-only">Later month</span>
            </Button>
          )}
        </nav>
      </div>
      <RatesCalendar
        key={`${room.id}-${months[0].key}`}
        roomTypeId={room.id}
        basePrice={room.basePrice}
        inventory={room.totalInventory}
        months={months}
        today={todayIso(now)}
      />
    </div>
  );
}
