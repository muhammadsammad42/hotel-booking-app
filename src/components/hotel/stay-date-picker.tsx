"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import type { DayButton } from "react-day-picker";

import { useHotelBooking } from "@/components/hotel/booking-context";
import { CalendarDayButton } from "@/components/ui/calendar";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BOOKING_CONFIG } from "@/lib/booking/config";
import type { RoomCalendar } from "@/lib/booking/engine";
import { toIsoDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

type DayInfo = { price: number; available: number; cheap: boolean };

const DayInfoContext = React.createContext<(date: Date) => DayInfo | undefined>(() => undefined);

/** "$420", or "$1.1k" so long prices fit in a day cell. */
function shortPrice(cents: number) {
  const dollars = Math.round(cents / 100);
  return dollars >= 1000 ? `$${(dollars / 1000).toFixed(1).replace(/\.0$/, "")}k` : `$${dollars}`;
}

/** A day with its nightly price underneath; sold-out days explain themselves. */
function PricedDayButton(props: React.ComponentProps<typeof DayButton>) {
  const info = React.useContext(DayInfoContext)(props.day.date);
  const soldOut = info !== undefined && info.available === 0;
  const past = props.modifiers.disabled;

  const button = (
    <CalendarDayButton
      {...props}
      data-sold-out={soldOut || undefined}
      className={cn(
        "flex-col gap-0.5 leading-none data-today:after:hidden",
        soldOut && "text-muted-foreground/60 [&>span:first-child]:line-through",
        info?.cheap && !soldOut && !props.modifiers.selected && "[&>span:last-child]:text-success",
      )}
    >
      <span>{props.day.date.getDate()}</span>
      {info && !past && (
        <span className="text-xs font-medium tabular-nums opacity-80" aria-hidden>
          {soldOut ? "—" : shortPrice(info.price)}
        </span>
      )}
    </CalendarDayButton>
  );

  if (!soldOut || past) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>Sold out that night</TooltipContent>
    </Tooltip>
  );
}

function lookup(calendar: RoomCalendar | undefined) {
  if (!calendar) return () => undefined;
  const start = Date.parse(`${calendar.start}T00:00:00Z`);
  // "Cheaper" dates: at or below the 30th percentile of the next four months.
  const sorted = [...calendar.prices.slice(0, 120)].sort((a, b) => a - b);
  const threshold = sorted[Math.floor(sorted.length * 0.3)] ?? 0;
  const hasRange = sorted.length > 0 && sorted[0] !== sorted[sorted.length - 1];

  return (date: Date): DayInfo | undefined => {
    const index = Math.round((Date.parse(`${toIsoDate(date)}T00:00:00Z`) - start) / 86_400_000);
    const price = calendar.prices[index];
    if (price === undefined) return undefined;
    return { price, available: calendar.available[index] ?? 0, cheap: hasRange && price <= threshold };
  };
}

/**
 * The hotel page calendar: prices under each date for the chosen room,
 * cheaper dates in green, sold-out nights struck through with a tooltip, and
 * stays across a sold-out night refused with an explanation.
 */
export function StayDatePicker() {
  const booking = useHotelBooking();
  const calendar = booking.calendars[booking.room.id];
  const info = React.useMemo(() => lookup(calendar), [calendar]);

  function validateRange(next: DateRange | undefined, clicked: Date) {
    if (!next?.from) return { range: next };
    // The check-in night itself must have a room.
    const firstNight = info(next.from);
    if (firstNight && firstNight.available < booking.roomCount) {
      return { range: undefined, message: `${format(next.from, "EEE d MMM")} is sold out. Choose another check-in date.` };
    }
    if (!next.to || next.to <= next.from) return { range: next };
    for (let day = next.from; day < next.to; day = addDays(day, 1)) {
      const night = info(day);
      if (night && night.available < booking.roomCount) {
        return {
          range: { from: clicked, to: undefined },
          message: `The night of ${format(day, "EEE d MMM")} is sold out. Pick dates either side of it.`,
        };
      }
    }
    return { range: next };
  }

  return (
    <DayInfoContext.Provider value={info}>
      <DateRangePicker
        value={booking.range}
        onChange={booking.setRange}
        open={booking.datesOpen}
        onOpenChange={booking.setDatesOpen}
        maxNights={BOOKING_CONFIG.maxNights}
        validateRange={validateRange}
        calendarProps={{
          animate: true,
          endMonth: addDays(new Date(), BOOKING_CONFIG.maxAdvanceDays),
          className: "[--cell-size:--spacing(11.5)] md:[--cell-size:--spacing(12)]",
          components: { DayButton: PricedDayButton },
          labels: {
            labelDayButton: (date, modifiers) => {
              const day = info(date);
              const parts = [format(date, "EEEE, d MMMM yyyy")];
              if (day && !modifiers.disabled) {
                parts.push(day.available === 0 ? "sold out" : `${shortPrice(day.price)} a night`);
              }
              if (modifiers.selected) parts.push("selected");
              return parts.join(", ");
            },
          },
        }}
        footerNote={
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-success" aria-hidden />
            Green prices are the best rates for {booking.room.name}.
          </p>
        }
      />
    </DayInfoContext.Provider>
  );
}
