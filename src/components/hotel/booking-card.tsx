"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarDaysIcon, CalendarX2Icon, FlameIcon, ShieldCheckIcon } from "lucide-react";

import { AnimatedPrice, PriceBreakdown } from "@/components/booking/price-breakdown";
import { useHotelBooking } from "@/components/hotel/booking-context";
import { StayDatePicker } from "@/components/hotel/stay-date-picker";
import { GuestCounter } from "@/components/search/guest-counter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/ui/price-tag";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BOOKING_CONFIG } from "@/lib/booking/config";
import { formatPrice, pluralize } from "@/lib/format";
import { MAX_GUESTS } from "@/lib/search/params";
import { cn } from "@/lib/utils";

/** "Only 2 rooms left" when few rooms remain for the dates. */
export function LowAvailabilityBadge({ available, className }: { available: number; className?: string }) {
  if (available <= 0 || available > BOOKING_CONFIG.lowAvailability) return null;
  return (
    <Badge variant="warning" className={className}>
      <FlameIcon aria-hidden />
      Only {pluralize(available, "room")} left
    </Badge>
  );
}

/** Room, dates, guests, the live price breakdown and Reserve. */
export function BookingCard({ className }: { className?: string }) {
  const booking = useHotelBooking();
  const { stay } = booking;
  const unavailable = stay !== null && !stay.bookable;

  return (
    <section
      id="booking-card"
      aria-labelledby="booking-card-heading"
      className={cn("scroll-mt-28 rounded-2xl border bg-card p-5 shadow-lift sm:p-6", className)}
    >
      <h2 id="booking-card-heading" className="sr-only">
        Book your stay
      </h2>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          {stay ? (
            <p className="flex items-baseline gap-1.5">
              <AnimatedPrice amount={stay.quote.averageNightly} className="text-3xl font-semibold tracking-tight" />
              <span className="text-sm text-muted-foreground">/ night</span>
            </p>
          ) : (
            <PriceTag amount={booking.room.basePrice} prefix="From" size="lg" />
          )}
          <p className="mt-1 text-sm text-muted-foreground">{booking.room.name}</p>
        </div>
        {stay?.bookable && <LowAvailabilityBadge available={stay.minAvailable} />}
      </div>

      <div className="mt-5 grid gap-3">
        <StayDatePicker />
        <Select value={booking.room.id} onValueChange={booking.setRoomId}>
          <SelectTrigger aria-label="Room type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {booking.rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name} · from {formatPrice(room.basePrice)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <GuestCounter value={booking.guests} onChange={booking.setGuests} max={MAX_GUESTS} />
        {booking.roomCount > 1 && !booking.tooManyGuests && (
          <p className="text-sm text-muted-foreground">
            {pluralize(booking.guests, "guest")} need {pluralize(booking.roomCount, "room")} of this type.
          </p>
        )}
      </div>

      {stay && stay.bookable && <PriceBreakdown quote={stay.quote} className="mt-5" />}

      {(unavailable || booking.tooManyGuests) && (
        <p role="status" className="mt-5 flex items-start gap-2.5 rounded-lg bg-warning/10 px-3.5 py-3 text-sm text-warning">
          <CalendarX2Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
          {booking.tooManyGuests
            ? `That is more guests than ${BOOKING_CONFIG.maxRooms} rooms of this type can take. Try a larger room.`
            : `${booking.room.name} is not available for every night of these dates. Try other dates or another room.`}
        </p>
      )}

      <div className="mt-5">
        {booking.reserveHref ? (
          <Button asChild size="lg" fullWidth>
            <Link href={booking.reserveHref}>Reserve</Link>
          </Button>
        ) : (
          <Button size="lg" fullWidth onClick={() => booking.setDatesOpen(true)}>
            <CalendarDaysIcon aria-hidden />
            {unavailable ? "Change dates" : "Check availability"}
          </Button>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        <ShieldCheckIcon className="mr-1 inline size-3.5 align-[-2px]" aria-hidden />
        {stay?.bookable
          ? "You will not be charged yet. Taxes and fees are included in the total."
          : "Choose dates to see the full price. You will not be charged yet."}
      </p>
    </section>
  );
}

/** Price and the main action, pinned to the bottom of the screen on phones. */
export function MobileBookingBar() {
  const booking = useHotelBooking();
  const { stay } = booking;
  const dates =
    booking.range?.from && booking.range.to
      ? `${booking.range.from.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} to ${booking.range.to.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
      : "Add your dates";

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-overlay backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-page items-center justify-between gap-4 px-gutter py-3">
        <div className="min-w-0">
          {stay?.bookable ? (
            <p className="flex items-baseline gap-1.5">
              <AnimatedPrice amount={stay.quote.total} className="text-base font-semibold" />
              <span className="text-xs text-muted-foreground">total</span>
            </p>
          ) : (
            <PriceTag amount={booking.room.basePrice} prefix="From" size="sm" />
          )}
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
            {stay && !stay.bookable ? "Change dates" : "Check availability"}
          </Button>
        )}
      </div>
    </div>
  );
}
