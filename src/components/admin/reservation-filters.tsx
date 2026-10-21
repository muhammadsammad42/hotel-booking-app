"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DownloadIcon, Loader2Icon, SearchIcon, XIcon } from "lucide-react";

import { BOOKING_STATUSES } from "@/components/booking/booking-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BookingStatus } from "@/generated/prisma/client";
import { RESERVATION_STATUSES } from "@/lib/admin/reservation-filters";

const ALL = "all";

/** Search, status, hotel and check-in range. Everything lives in the URL, so views can be shared. */
export function ReservationFilters({ hotels }: { hotels: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = React.useTransition();
  const [query, setQuery] = React.useState(params.get("q") ?? "");

  const update = React.useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      next.delete("page");
      next.delete("booking");
      startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
    },
    [params, pathname, router],
  );

  // Search as you type, after a short pause.
  React.useEffect(() => {
    if (query === (params.get("q") ?? "")) return;
    const timer = window.setTimeout(() => update({ q: query.trim() || null }), 300);
    return () => window.clearTimeout(timer);
  }, [query, params, update]);

  const active = ["q", "status", "hotel", "from", "to", "out"].some((key) => params.get(key));
  const exportHref = `/admin/reservations/export?${(() => {
    const next = new URLSearchParams(params.toString());
    next.delete("page");
    next.delete("booking");
    return next.toString();
  })()}`;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
      <label className="relative w-full lg:w-auto lg:min-w-72 lg:flex-1">
        <span className="sr-only">Search reservations</span>
        {pending ? (
          <Loader2Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
        ) : (
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        )}
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Reference, guest name or email" className="pl-10" type="search" />
      </label>
      <Select value={params.get("status") ?? ALL} onValueChange={(value) => update({ status: value === ALL ? null : value })}>
        <SelectTrigger aria-label="Status" className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {RESERVATION_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {BOOKING_STATUSES[status as BookingStatus].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={params.get("hotel") ?? ALL} onValueChange={(value) => update({ hotel: value === ALL ? null : value })}>
        <SelectTrigger aria-label="Hotel" className="w-full sm:w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All hotels</SelectItem>
          {hotels.map((hotel) => (
            <SelectItem key={hotel.id} value={hotel.id}>
              {hotel.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <label className="grid flex-1 gap-0.5">
          <span className="sr-only">Check-in from</span>
          <Input type="date" value={params.get("from") ?? ""} onChange={(event) => update({ from: event.target.value || null })} aria-label="Check-in from" />
        </label>
        <span className="text-sm text-muted-foreground" aria-hidden>
          to
        </span>
        <label className="grid flex-1 gap-0.5">
          <span className="sr-only">Check-in until</span>
          <Input type="date" value={params.get("to") ?? ""} min={params.get("from") ?? undefined} onChange={(event) => update({ to: event.target.value || null })} aria-label="Check-in until" />
        </label>
      </div>
      <Button
        variant="ghost"
        disabled={!active}
        onClick={() => {
          setQuery("");
          update({ q: null, status: null, hotel: null, from: null, to: null, out: null });
        }}
      >
        <XIcon aria-hidden />
        Clear
      </Button>
      <Button asChild variant="outline" className="sm:ml-auto">
        <a href={exportHref} download>
          <DownloadIcon aria-hidden />
          Export CSV
        </a>
      </Button>
    </div>
  );
}
