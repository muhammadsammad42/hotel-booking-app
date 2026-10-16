import Image from "next/image";
import { CalendarDaysIcon, MapPinIcon, UsersIcon } from "lucide-react";

import { PriceBreakdown } from "@/components/booking/price-breakdown";
import { Stepper } from "@/components/ui/stepper";
import type { Quote } from "@/lib/booking/engine";
import { formatStayDate, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const BOOKING_STEPS = ["Details", "Payment", "Confirmed"];

/** The 3-step progress indicator used across the booking flow. */
export function BookingSteps({ current }: { current: 0 | 1 | 2 }) {
  return <Stepper steps={BOOKING_STEPS} current={current} className="max-w-xl" />;
}

type StaySummaryProps = {
  hotel: { name: string; city: string; country: string; coverImageUrl: string; coverImageAlt: string };
  roomName: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  quote: Quote;
  className?: string;
  children?: React.ReactNode;
};

/** Hotel photo, the stay and its price. Sticky beside the form on desktop. */
export function StaySummary({ hotel, roomName, checkIn, checkOut, guests, quote, className, children }: StaySummaryProps) {
  return (
    <aside aria-label="Your stay" className={cn("lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)]", className)}>
      <div className="overflow-hidden rounded-2xl border bg-card shadow-lift">
        <div className="relative aspect-16/9 bg-muted">
          <Image src={hotel.coverImageUrl} alt={hotel.coverImageAlt} fill sizes="(min-width: 1024px) 352px, 100vw" className="object-cover" />
        </div>
        <div className="grid gap-4 p-5">
          <div>
            <h2 className="type-title-md">{hotel.name}</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPinIcon className="size-3.5" aria-hidden />
              {hotel.city}, {hotel.country}
            </p>
          </div>
          <dl className="grid gap-2 border-y py-4 text-sm">
            <div className="flex items-start gap-2.5">
              <dt className="sr-only">Room</dt>
              <dd className="font-medium">{roomName}</dd>
            </div>
            <div className="flex items-center gap-2.5">
              <dt>
                <CalendarDaysIcon className="size-4 text-muted-foreground" aria-hidden />
                <span className="sr-only">Dates</span>
              </dt>
              <dd>
                {formatStayDate(checkIn)} to {formatStayDate(checkOut, true)} · {pluralize(quote.nightCount, "night")}
              </dd>
            </div>
            <div className="flex items-center gap-2.5">
              <dt>
                <UsersIcon className="size-4 text-muted-foreground" aria-hidden />
                <span className="sr-only">Guests</span>
              </dt>
              <dd>
                {pluralize(guests, "guest")}
                {quote.rooms > 1 && `, ${pluralize(quote.rooms, "room")}`}
              </dd>
            </div>
          </dl>
          <PriceBreakdown quote={quote} />
          {children}
        </div>
      </div>
    </aside>
  );
}
