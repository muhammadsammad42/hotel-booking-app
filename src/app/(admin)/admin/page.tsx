import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, BedDoubleIcon, CalendarCheckIcon, LogInIcon, LogOutIcon, PercentIcon, WalletIcon } from "lucide-react";

import { BookingsChart, RevenueChart } from "@/components/admin/charts";
import { KpiCard } from "@/components/admin/kpi-card";
import { AdminPageHeader, Panel } from "@/components/admin/page-header";
import { StayActions } from "@/components/admin/stay-actions";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { Button } from "@/components/ui/button";
import { getOverview, type BookingRow } from "@/lib/admin/overview";
import { requireAdmin } from "@/lib/auth/guards";
import { todayIso } from "@/lib/booking/stay";
import { formatPrice, formatStayDate, pluralize } from "@/lib/format";

export const metadata: Metadata = { title: "Overview" };

const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });
const monthName = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" });
const created = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

const DESK_LIMIT = 6;

function DeskList({ rows, empty, kind, moreHref }: { rows: BookingRow[]; empty: string; kind: "arrival" | "departure"; moreHref: string }) {
  if (rows.length === 0) {
    return <p className="rounded-lg bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-3">
      <ul className="divide-y">
        {rows.slice(0, DESK_LIMIT).map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1 basis-56">
              <p className="truncate font-medium">{row.guestName}</p>
              <p className="truncate text-sm text-muted-foreground">
                {row.roomType.hotel.name} · {row.roomType.name}
                {row.rooms > 1 && ` × ${row.rooms}`} · {kind === "arrival" ? `until ${formatStayDate(row.checkOut)}` : pluralize(row.guests, "guest")}
              </p>
            </div>
            <StayActions bookingId={row.id} status={row.status} guestName={row.guestName} only={kind === "arrival" ? "CHECKED_IN" : "CHECKED_OUT"} />
          </li>
        ))}
      </ul>
      {rows.length > DESK_LIMIT && (
        <Button asChild variant="ghost" size="sm" className="justify-self-start">
          <Link href={moreHref}>
            {rows.length - DESK_LIMIT} more {kind === "arrival" ? "arrivals" : "departures"}
            <ArrowRightIcon aria-hidden />
          </Link>
        </Button>
      )}
    </div>
  );
}

export default async function AdminOverviewPage() {
  await requireAdmin();
  const now = new Date();
  const { kpis, revenueByMonth, bookingsByMonth, arrivals, departures, recent } = await getOverview(now);
  const month = monthName.format(now);

  return (
    <div className="grid grid-cols-1 gap-6">
      <AdminPageHeader
        title="Overview"
        description={`How Sarai is doing in ${month}, and what is happening at the front desk today.`}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/reservations">
              All reservations
              <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
        }
      />

      <section aria-label="Key numbers" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Revenue this month" value={formatPrice(kpis.revenue.current)} icon={WalletIcon} change={kpis.revenue.change} comparison="vs same days last month" />
        <KpiCard label="Bookings this month" value={String(kpis.bookings.current)} icon={CalendarCheckIcon} change={kpis.bookings.change} comparison="vs same days last month" />
        <KpiCard
          label="Occupancy"
          value={percent.format(kpis.occupancy.current)}
          icon={PercentIcon}
          change={kpis.occupancy.change}
          comparison="vs last month"
          hint={`Room-nights booked for all of ${month}`}
        />
        <KpiCard
          label="Average daily rate"
          value={formatPrice(Math.round(kpis.adr.current / 100) * 100)}
          icon={BedDoubleIcon}
          change={kpis.adr.change}
          comparison="vs last month"
          hint="Room revenue per room-night sold"
        />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Revenue" description="Payments received per month, last 12 months">
          <RevenueChart data={revenueByMonth} />
        </Panel>
        <Panel title="Bookings" description="Bookings made per month, last 12 months">
          <BookingsChart data={bookingsByMonth} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel
          title="Arriving today"
          description={pluralize(arrivals.length, "arrival")}
          actions={<LogInIcon className="size-5 text-muted-foreground" aria-hidden />}
        >
          <DeskList rows={arrivals} kind="arrival" moreHref={`/admin/reservations?from=${todayIso(now)}&to=${todayIso(now)}&sort=guest&dir=asc`} empty="No arrivals today. A quiet one at the front desk." />
        </Panel>
        <Panel
          title="Leaving today"
          description={pluralize(departures.length, "departure")}
          actions={<LogOutIcon className="size-5 text-muted-foreground" aria-hidden />}
        >
          <DeskList rows={departures} kind="departure" moreHref={`/admin/reservations?out=${todayIso(now)}&sort=guest&dir=asc`} empty="No departures today." />
        </Panel>
      </div>

      <Panel
        title="Recent bookings"
        description="The latest reservations across every hotel"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/reservations">
              View all
              <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
        }
      >
        <div className="relative -mx-5 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-y bg-muted/40 text-left text-xs text-muted-foreground">
                <th scope="col" className="px-5 py-2.5 font-medium">Reference</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Guest</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Stay</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                <th scope="col" className="px-5 py-2.5 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recent.map((row) => (
                <tr key={row.id} className="transition-colors duration-150 ease-soft hover:bg-accent/60">
                  <td className="px-5 py-3">
                    <Link href={`/admin/reservations?booking=${row.id}&q=${row.reference}`} className="rounded-sm font-mono font-medium hover:text-primary hover:underline">
                      {row.reference}
                    </Link>
                    <p className="text-xs text-muted-foreground">{created.format(row.createdAt)}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-medium">{row.guestName}</p>
                    <p className="text-xs text-muted-foreground">{row.roomType.hotel.name}</p>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {formatStayDate(row.checkIn)} → {formatStayDate(row.checkOut)}
                  </td>
                  <td className="px-3 py-3">
                    <BookingStatusBadge status={row.status} />
                  </td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums">{formatPrice(row.totalPrice, row.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
