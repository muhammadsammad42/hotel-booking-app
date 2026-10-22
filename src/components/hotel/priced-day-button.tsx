"use client";

import * as React from "react";
import type { DayButton } from "react-day-picker";

import { DayInfoContext, shortPrice } from "@/components/hotel/day-info";
import { CalendarDayButton } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Loaded with the calendar, when the date picker first opens.
/** A day with its nightly price underneath; sold-out days explain themselves. */
export default function PricedDayButton(props: React.ComponentProps<typeof DayButton>) {
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

