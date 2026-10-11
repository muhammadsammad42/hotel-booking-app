"use client";

import * as React from "react";
import { differenceInCalendarDays, format, startOfToday } from "date-fns";
import { ArrowRightIcon, CalendarDaysIcon } from "lucide-react";
import type { DateRange, Matcher } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { controlClasses } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
  value?: DateRange;
  defaultValue?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  /** Shortest stay that can be selected, in nights. */
  minNights?: number;
  /** Longest stay that can be selected, in nights. */
  maxNights?: number;
  /** Dates that cannot be booked, in addition to dates in the past. */
  unavailable?: Matcher[];
  className?: string;
};

function formatDay(date: Date | undefined, placeholder: string) {
  return date ? format(date, "EEE, d MMM") : placeholder;
}

/**
 * Check-in and check-out picker. Opens in a popover with two months on
 * desktop and in a bottom sheet with one month on mobile.
 */
function DateRangePicker({
  value,
  defaultValue,
  onChange,
  minNights = 1,
  maxNights,
  unavailable = [],
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internal, setInternal] = React.useState(defaultValue);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const range = value ?? internal;
  const nights = range?.from && range.to ? differenceInCalendarDays(range.to, range.from) : 0;

  function select(next: DateRange | undefined) {
    setInternal(next);
    onChange?.(next);
  }

  const summary = !range?.from
    ? "Select your check-in date"
    : !range.to || nights === 0
      ? "Select your check-out date"
      : `${formatDay(range.from, "")} to ${formatDay(range.to, "")}, ${nights} ${nights === 1 ? "night" : "nights"}`;

  const trigger = (
    <button
      type="button"
      data-slot="date-range-picker"
      className={cn(
        controlClasses,
        "flex h-auto min-h-14 items-center gap-3 py-2 text-left data-[state=open]:border-ring data-[state=open]:ring-3 data-[state=open]:ring-ring/25",
        className,
      )}
    >
      <CalendarDaysIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="grid min-w-0 flex-1 grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span className="grid min-w-0">
          <span className="text-xs text-muted-foreground">Check-in</span>
          <span className={cn("truncate font-medium", !range?.from && "font-normal text-muted-foreground")}>
            {formatDay(range?.from, "Add date")}
          </span>
        </span>
        <ArrowRightIcon className="size-4 text-muted-foreground" aria-hidden />
        <span className="grid min-w-0">
          <span className="text-xs text-muted-foreground">Check-out</span>
          <span className={cn("truncate font-medium", !range?.to && "font-normal text-muted-foreground")}>
            {formatDay(range?.to, "Add date")}
          </span>
        </span>
      </span>
    </button>
  );

  const calendar = (
    <Calendar
      mode="range"
      // Keyboard users land on the day grid, not the month arrows.
      autoFocus
      selected={range}
      onSelect={select}
      numberOfMonths={isDesktop ? 2 : 1}
      defaultMonth={range?.from}
      startMonth={startOfToday()}
      disabled={[{ before: startOfToday() }, ...unavailable]}
      excludeDisabled
      min={minNights}
      max={maxNights}
    />
  );

  const actions = (
    <>
      <Button variant="ghost" size="sm" onClick={() => select(undefined)} disabled={!range?.from}>
        Clear dates
      </Button>
      <Button size="sm" onClick={() => setOpen(false)}>
        Done
      </Button>
    </>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="w-auto p-5" aria-label="Select dates">
          {calendar}
          <div className="mt-4 flex items-center justify-between gap-4 border-t pt-4">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {summary}
            </p>
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Select dates</SheetTitle>
          <SheetDescription aria-live="polite">{summary}</SheetDescription>
        </SheetHeader>
        <SheetBody className="flex justify-center">{calendar}</SheetBody>
        <SheetFooter className="flex-row items-center justify-between">{actions}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export { DateRangePicker };
export type { DateRange };
