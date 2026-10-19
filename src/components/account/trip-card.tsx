import Image from "next/image";
import Link from "next/link";
import { CalendarDaysIcon, ChevronRightIcon, StarIcon, UsersIcon } from "lucide-react";

import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { Card } from "@/components/ui/card";
import { PriceTag } from "@/components/ui/price-tag";
import { nightsOf, type Trip } from "@/lib/account/trips";
import { daysUntil } from "@/lib/booking/policy";
import { formatPrice, formatStayRange, pluralize } from "@/lib/format";

/** "Today", "Tomorrow", "In 21 days". */
export function relativeDay(days: number) {
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

function TripNote({ trip, now }: { trip: Trip; now: Date }) {
  switch (trip.status) {
    case "PENDING":
      return <span className="font-semibold text-primary">Complete payment to confirm</span>;
    case "CONFIRMED":
      return <span className="font-medium">{relativeDay(daysUntil(trip.checkIn, now))}</span>;
    case "CHECKED_IN":
      return <span className="font-medium text-success">Enjoy your stay</span>;
    case "CHECKED_OUT":
      return trip.review ? (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <StarIcon className="size-3.5 fill-star text-star" aria-hidden />
          You rated it {trip.review.rating} out of 5
        </span>
      ) : (
        <span className="font-semibold text-primary">Rate your stay</span>
      );
    case "CANCELLED": {
      const refunded = trip.payments.reduce((sum, payment) => sum + payment.amount, 0);
      return <span className="text-muted-foreground">{refunded > 0 ? `Refunded ${formatPrice(refunded, trip.currency)}` : "Nothing was charged"}</span>;
    }
    default:
      return null;
  }
}

/** A booking in My trips: photo, status, dates and price. The whole card opens the trip. */
export function TripCard({ trip, now }: { trip: Trip; now: Date }) {
  const { hotel } = trip.roomType;
  const href = trip.status === "PENDING" ? `/book/${trip.id}` : `/account/trips/${trip.id}`;

  return (
    <Card interactive className="sm:flex-row">
      <div className="relative aspect-16/9 shrink-0 overflow-hidden bg-muted sm:aspect-auto sm:w-60">
        <Image
          src={hotel.coverImageUrl}
          alt=""
          fill
          sizes="(min-width: 640px) 240px, 100vw"
          className="object-cover transition-transform duration-500 ease-soft group-hover/card:scale-[1.03]"
        />
        {/* A solid chip behind the badge keeps it readable on any photo. */}
        <div className="absolute top-3 left-3 rounded-full bg-card shadow-xs sm:hidden">
          <BookingStatusBadge status={trip.status} />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="type-eyebrow truncate text-muted-foreground">
              {hotel.city}, {hotel.country}
            </p>
            <h3 className="type-title-md mt-1">
              <Link href={href} className="outline-none after:absolute after:inset-0">
                {hotel.name}
              </Link>
            </h3>
            <p className="truncate text-sm text-muted-foreground">
              {trip.roomType.name}
              {trip.rooms > 1 && ` × ${trip.rooms}`}
            </p>
          </div>
          <BookingStatusBadge status={trip.status} className="hidden sm:inline-flex" />
        </div>
        <dl className="grid gap-1.5 text-sm">
          <div className="flex items-center gap-2">
            <dt>
              <CalendarDaysIcon className="size-4 text-muted-foreground" aria-hidden />
              <span className="sr-only">Dates</span>
            </dt>
            <dd>
              {formatStayRange(trip.checkIn, trip.checkOut)} · {pluralize(nightsOf(trip), "night")}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>
              <UsersIcon className="size-4 text-muted-foreground" aria-hidden />
              <span className="sr-only">Guests</span>
            </dt>
            <dd>{pluralize(trip.guests, "guest")}</dd>
          </div>
        </dl>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t pt-3 text-sm">
          <p className="flex items-center gap-1">
            <TripNote trip={trip} now={now} />
            <ChevronRightIcon className="size-4 text-muted-foreground transition-transform duration-150 ease-soft group-hover/card:translate-x-0.5" aria-hidden />
          </p>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-muted-foreground">{trip.reference}</span>
            <PriceTag amount={trip.totalPrice} currency={trip.currency} unit={null} size="sm" />
          </div>
        </div>
      </div>
    </Card>
  );
}
