import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { ReservationDrawer } from "@/components/admin/reservation-drawer";
import { ReservationFilters } from "@/components/admin/reservation-filters";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  listReservations,
  PAGE_SIZE,
  parseReservationFilters,
  reservationSelect,
  type ReservationFilters as Filters,
} from "@/lib/admin/reservations";
import { requireAdmin } from "@/lib/auth/guards";
import { formatPrice, formatStayDate, pluralize } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { idSchema } from "@/lib/validation/account";

export const metadata: Metadata = { title: "Reservations" };

const count = new Intl.NumberFormat("en-US");

type Params = Record<string, string | string[] | undefined>;

/** The current URL with some parameters changed. */
function hrefWith(params: Params, changes: Record<string, string | null>) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const single = Array.isArray(value) ? value[0] : value;
    if (single) next.set(key, single);
  }
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) next.delete(key);
    else next.set(key, value);
  }
  const query = next.toString();
  return `/admin/reservations${query ? `?${query}` : ""}`;
}

function SortHeader({
  label,
  sort,
  filters,
  params,
  align = "left",
}: {
  label: string;
  sort: Filters["sort"];
  filters: Filters;
  params: Params;
  align?: "left" | "right";
}) {
  const active = filters.sort === sort;
  const nextDir = active && filters.dir === "desc" ? "asc" : "desc";
  const Icon = !active ? ArrowUpDownIcon : filters.dir === "asc" ? ArrowUpIcon : ArrowDownIcon;
  return (
    <th
      scope="col"
      aria-sort={active ? (filters.dir === "asc" ? "ascending" : "descending") : "none"}
      className={cn("px-3 py-2.5 font-medium", align === "right" && "text-right")}
    >
      <Link
        href={hrefWith(params, { sort, dir: nextDir, page: null, booking: null })}
        scroll={false}
        className={cn("inline-flex min-h-8 items-center gap-1 rounded-sm hover:text-foreground", active && "text-foreground")}
      >
        {label}
        <Icon className="size-3.5" aria-hidden />
        <span className="sr-only">, sort {nextDir === "asc" ? "ascending" : "descending"}</span>
      </Link>
    </th>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled: boolean; children: React.ReactNode }) {
  if (disabled) {
    return (
      <Button variant="outline" size="sm" disabled>
        {children}
      </Button>
    );
  }
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={href} scroll={false}>
        {children}
      </Link>
    </Button>
  );
}

export default async function ReservationsPage({ searchParams }: PageProps<"/admin/reservations">) {
  await requireAdmin();
  const params = (await searchParams) as Params;
  const filters = parseReservationFilters(params);
  const bookingParam = typeof params.booking === "string" ? params.booking : undefined;

  const [{ rows, total, page, pageCount }, hotels, selected] = await Promise.all([
    listReservations(filters),
    prisma.hotel.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    bookingParam && idSchema.safeParse(bookingParam).success
      ? prisma.booking.findUnique({ where: { id: bookingParam }, select: reservationSelect })
      : Promise.resolve(null),
  ]);
  const filtered = Boolean(filters.q || filters.status || filters.hotel || filters.from || filters.to || filters.out);
  const first = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  return (
    <div className="grid grid-cols-1 gap-5">
      <AdminPageHeader
        title="Reservations"
        description={`${count.format(total)} ${total === 1 ? "reservation" : "reservations"}${filtered ? (total === 1 ? " matches these filters" : " match these filters") : " in total"}. Select one to see the details.`}
      />
      <ReservationFilters hotels={hotels} />

      {rows.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <EmptyState
            headingLevel="h2"
            title={filtered ? "No reservations match" : "No reservations yet"}
            description={filtered ? "Try a different search, or clear the filters to see everything." : "Bookings appear here as soon as guests make them."}
            action={
              filtered ? (
                <Button asChild variant="outline">
                  <Link href="/admin/reservations">Clear filters</Link>
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          {/* Phones get a list of cards; the table starts at tablet width. */}
          <ul className="divide-y md:hidden">
            {rows.map((row) => (
              <li key={row.id} className={cn("relative grid gap-1.5 px-4 py-3.5 transition-colors duration-150 ease-soft active:bg-accent/60", selected?.id === row.id && "bg-accent/60")}>
                <div className="flex items-center justify-between gap-3">
                  <Link href={hrefWith(params, { booking: row.id })} scroll={false} className="rounded-sm font-mono text-sm font-semibold outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset">
                    {row.reference}
                    <span className="sr-only">, open details</span>
                  </Link>
                  <BookingStatusBadge status={row.status} />
                </div>
                <p className="truncate text-sm font-medium">{row.guestName}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {row.roomType.hotel.name} · {row.roomType.name}
                </p>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {formatStayDate(row.checkIn)} → {formatStayDate(row.checkOut)}
                  </span>
                  <span className="font-semibold tabular-nums">{formatPrice(row.totalPrice, row.currency)}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="relative hidden overflow-x-auto md:block">
            <table className="w-full min-w-[56rem] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <th scope="col" className="py-2.5 pr-3 pl-5 font-medium">
                    Reference
                  </th>
                  <SortHeader label="Guest" sort="guest" filters={filters} params={params} />
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    Hotel and room
                  </th>
                  <SortHeader label="Check-in" sort="checkIn" filters={filters} params={params} />
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    Status
                  </th>
                  <SortHeader label="Total" sort="total" filters={filters} params={params} align="right" />
                  <SortHeader label="Booked" sort="created" filters={filters} params={params} align="right" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => {
                  const nights = Math.round((row.checkOut.getTime() - row.checkIn.getTime()) / 86_400_000);
                  return (
                    <tr
                      key={row.id}
                      className={cn("relative transition-colors duration-150 ease-soft hover:bg-accent/60", selected?.id === row.id && "bg-accent/60")}
                    >
                      <td className="py-3 pr-3 pl-5 whitespace-nowrap">
                        <Link
                          href={hrefWith(params, { booking: row.id })}
                          scroll={false}
                          className="rounded-sm font-mono font-medium outline-none after:absolute after:inset-0 hover:text-primary focus-visible:after:rounded-md focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
                        >
                          {row.reference}
                          <span className="sr-only">, open details</span>
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium">{row.guestName}</p>
                        <p className="max-w-56 truncate text-xs text-muted-foreground">{row.guestEmail}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="max-w-60 truncate">{row.roomType.hotel.name}</p>
                        <p className="max-w-60 truncate text-xs text-muted-foreground">
                          {row.roomType.name}
                          {row.rooms > 1 && ` × ${row.rooms}`}
                        </p>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <p>{formatStayDate(row.checkIn, true)}</p>
                        <p className="text-xs text-muted-foreground">
                          {pluralize(nights, "night")} · {pluralize(row.guests, "guest")}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <BookingStatusBadge status={row.status} />
                      </td>
                      <td className="px-3 py-3 text-right font-medium tabular-nums">{formatPrice(row.totalPrice, row.currency)}</td>
                      <td className="py-3 pr-5 pl-3 text-right whitespace-nowrap text-muted-foreground tabular-nums">{formatStayDate(row.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <nav aria-label="Pages" className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-sm">
            <p className="text-muted-foreground tabular-nums">
              {count.format(first)}–{count.format(first + rows.length - 1)} of {count.format(total)}
            </p>
            <div className="flex items-center gap-2">
              <PageLink href={hrefWith(params, { page: String(page - 1), booking: null })} disabled={page <= 1}>
                <ChevronLeftIcon aria-hidden />
                Previous
              </PageLink>
              <span className="px-1 text-muted-foreground tabular-nums">
                Page {count.format(page)} of {count.format(pageCount)}
              </span>
              <PageLink href={hrefWith(params, { page: String(page + 1), booking: null })} disabled={page >= pageCount}>
                Next
                <ChevronRightIcon aria-hidden />
              </PageLink>
            </div>
          </nav>
        </div>
      )}
      <ReservationDrawer booking={selected} />
    </div>
  );
}
