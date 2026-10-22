"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import type { DayButton } from "react-day-picker";

import { useHotelBooking } from "@/components/hotel/booking-context";
import { DayInfoContext, shortPrice, type DayInfo } from "@/components/hotel/day-info";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";
import { BOOKING_CONFIG } from "@/lib/booking/config";
import type { RoomCalendar } from "@/lib/booking/engine";
import { toIsoDate } from "@/lib/dates";

// The day cells load with the calendar, when the picker first opens.
const LazyPricedDayButton = React.lazy(() => import("@/components/hotel/priced-day-button"));

function PricedDayButton(props: React.ComponentProps<typeof DayButton>) {
  return <LazyPricedDayButton {...props} />;
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
