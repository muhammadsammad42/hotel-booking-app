import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, MapPinIcon } from "lucide-react";

import { TripCountdown } from "@/components/account/trip-countdown";
import { Button } from "@/components/ui/button";
import type { Trip } from "@/lib/account/trips";
import { checkInMoment } from "@/lib/booking/policy";
import { formatStayDate, formatStayRange } from "@/lib/format";

/** The trip coming up next, over its photo, with a live countdown to check-in. */
export function NextTrip({ trip, now }: { trip: Trip; now: Date }) {
  const { hotel } = trip.roomType;
  const staying = trip.status === "CHECKED_IN";

  return (
    <section aria-labelledby="next-trip-heading" className="relative isolate overflow-hidden rounded-2xl bg-lightbox text-lightbox-foreground">
      <Image src={hotel.coverImageUrl} alt="" fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="-z-10 object-cover" />
      {/* Scrim so the text stays readable on any photo. */}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-lightbox/90 via-lightbox/55 to-lightbox/15 sm:bg-linear-to-r sm:from-lightbox/85 sm:via-lightbox/50 sm:to-transparent" aria-hidden />
      <div className="grid gap-6 p-6 pt-24 sm:p-8 sm:pt-8 md:min-h-72 md:content-end">
        <div className="grid max-w-lg gap-2">
          <p className="type-eyebrow text-lightbox-foreground/80">{staying ? "You are staying at" : "Your next trip"}</p>
          <h2 id="next-trip-heading" className="type-title-lg text-balance">
            {hotel.name}
          </h2>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-lightbox-foreground/85">
            <MapPinIcon className="size-3.5" aria-hidden />
            {hotel.city}, {hotel.country}
            <span aria-hidden>·</span>
            {staying ? `Check-out ${formatStayDate(trip.checkOut, true)} by ${hotel.checkOutTime}` : formatStayRange(trip.checkIn, trip.checkOut)}
          </p>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          {staying ? (
            <p className="max-w-sm text-sm text-lightbox-foreground/85">Enjoy every moment. Your booking details are one tap away if you need them.</p>
          ) : (
            <TripCountdown target={checkInMoment(trip.checkIn, hotel.checkInTime).toISOString()} serverNow={now.toISOString()} />
          )}
          <Button asChild variant="outline" className="border-transparent">
            <Link href={`/account/trips/${trip.id}`}>
              View trip
              <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
