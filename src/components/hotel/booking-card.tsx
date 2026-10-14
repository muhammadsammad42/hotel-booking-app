"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDaysIcon, ShieldCheckIcon } from "lucide-react";

import { useHotelBooking } from "@/components/hotel/booking-context";
import { GuestCounter } from "@/components/search/guest-counter";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { PriceTag } from "@/components/ui/price-tag";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice, pluralize } from "@/lib/format";
import { MAX_GUESTS } from "@/lib/search/params";
import { cn } from "@/lib/utils";

/** Room, dates, guests and the Reserve button. Sticky beside the content on desktop. */
export function BookingCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  const booking = useHotelBooking();
  const nights =
    booking.checkIn && booking.checkOut
      ? Math.round((new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / 86_400_000)
      : 0;

  return (
    <section
      id="booking-card"
      aria-labelledby="booking-card-heading"
      className={cn("scroll-mt-28 rounded-2xl border bg-card p-5 shadow-lift sm:p-6", className)}
    >
      <h2 id="booking-card-heading" className="sr-only">
        Book your stay
      </h2>
      <PriceTag amount={booking.room.basePrice} prefix="From" size="lg" />
      <p className="mt-1 text-sm text-muted-foreground">{booking.room.name}</p>

      <div className="mt-5 grid gap-3">
        <DateRangePicker
          value={booking.range}
          onChange={booking.setRange}
          open={booking.datesOpen}
          onOpenChange={booking.setDatesOpen}
        />
        <div className="grid gap-3">
          <Select value={booking.room.id} onValueChange={booking.setRoomId}>
            <SelectTrigger aria-label="Room type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {booking.rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name} · {formatPrice(room.basePrice)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <GuestCounter value={booking.guests} onChange={booking.setGuests} max={MAX_GUESTS} />
        </div>
      </div>

      {children}

      <div className="mt-5">
        {booking.reserveHref ? (
          <Button asChild size="lg" fullWidth>
            <Link href={booking.reserveHref}>Reserve</Link>
          </Button>
        ) : (
          <Button size="lg" fullWidth onClick={() => booking.setDatesOpen(true)}>
            <CalendarDaysIcon aria-hidden />
            Check availability
          </Button>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        <ShieldCheckIcon className="mr-1 inline size-3.5 align-[-2px]" aria-hidden />
        {nights > 0
          ? `${pluralize(nights, "night")}, ${pluralize(booking.roomCount, "room")}. You will not be charged yet.`
          : "Choose dates to see the total. You will not be charged yet."}
      </p>
    </section>
  );
}

/** Price and the main action, pinned to the bottom of the screen on phones. */
export function MobileBookingBar() {
  const booking = useHotelBooking();
  const dates =
    booking.range?.from && booking.range.to
      ? `${booking.range.from.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} to ${booking.range.to.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
      : "Add your dates";

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-overlay backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-gutter py-3">
        <div className="min-w-0">
          <PriceTag amount={booking.room.basePrice} prefix="From" size="sm" />
          <button
            type="button"
            onClick={() => booking.setDatesOpen(true)}
            className="block min-h-6 truncate text-sm font-medium underline underline-offset-4"
          >
            {dates}
          </button>
        </div>
        {booking.reserveHref ? (
          <Button asChild size="lg">
            <Link href={booking.reserveHref}>Reserve</Link>
          </Button>
        ) : (
          <Button size="lg" onClick={() => booking.setDatesOpen(true)}>
            Check availability
          </Button>
        )}
      </div>
    </div>
  );
}
