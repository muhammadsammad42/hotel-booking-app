"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Month grid built on react-day-picker. Day cells are 44px on touch screens.
 * For stay dates use DateRangePicker, which wraps this.
 */
function Calendar({
  className,
  classNames,
  components,
  showOutsideDays = false,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaults = getDefaultClassNames();
  const navButton = cn(
    buttonVariants({ variant: "ghost", size: "icon-sm" }),
    "aria-disabled:pointer-events-none aria-disabled:opacity-40",
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("[--cell-size:--spacing(10)] pointer-coarse:[--cell-size:--spacing(11)]", className)}
      classNames={{
        root: cn("w-fit", defaults.root),
        months: cn("relative flex flex-col gap-6 md:flex-row md:gap-8", defaults.months),
        // Clips the sliding weeks when the month changes.
        month: cn("relative flex w-full flex-col gap-3 overflow-hidden", defaults.month),
        // Above the months, which are positioned to clip their animation.
        nav: cn("absolute inset-x-0 top-0 z-10 flex items-center justify-between", defaults.nav),
        button_previous: cn(navButton, defaults.button_previous),
        button_next: cn(navButton, defaults.button_next),
        month_caption: cn(
          "flex h-9 items-center justify-center px-10 pointer-coarse:h-11",
          defaults.month_caption,
        ),
        caption_label: cn("type-title-sm select-none", defaults.caption_label),
        month_grid: cn("w-full border-collapse", defaults.month_grid),
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn(
          "w-(--cell-size) pb-1 text-xs font-medium text-muted-foreground select-none",
          defaults.weekday,
        ),
        week: cn("mt-1 flex w-full", defaults.week),
        day: cn("group/day relative size-(--cell-size) p-0 text-center select-none", defaults.day),
        // The cell paints the band between the two ends of a range.
        range_start: cn("rounded-l-lg bg-primary/12", defaults.range_start),
        range_middle: cn("bg-primary/12", defaults.range_middle),
        range_end: cn("rounded-r-lg bg-primary/12", defaults.range_end),
        today: cn("font-semibold", defaults.today),
        outside: cn("text-muted-foreground/60", defaults.outside),
        disabled: cn("text-muted-foreground/50 line-through", defaults.disabled),
        hidden: cn("invisible", defaults.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className: chevronClassName, orientation, ...chevronProps }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeftIcon
              : orientation === "right"
                ? ChevronRightIcon
                : ChevronDownIcon;
          return <Icon className={cn("size-4", chevronClassName)} {...chevronProps} />;
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ref: forwardedRef,
  ...props
}: React.ComponentProps<typeof DayButton> & { ref?: React.Ref<HTMLButtonElement> }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  // Keep our ref for focus management and pass the element on, e.g. to a tooltip.
  const setRef = React.useCallback(
    (element: HTMLButtonElement | null) => {
      ref.current = element;
      if (typeof forwardedRef === "function") forwardedRef(element);
      else if (forwardedRef) (forwardedRef as React.RefObject<HTMLButtonElement | null>).current = element;
    },
    [forwardedRef],
  );

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isRangeEnd = modifiers.range_start || modifiers.range_end;
  const isSingle = modifiers.selected && !isRangeEnd && !modifiers.range_middle;

  return (
    <button
      ref={setRef}
      type="button"
      data-day={day.isoDate}
      data-today={modifiers.today || undefined}
      data-selected={isRangeEnd || isSingle || undefined}
      className={cn(
        "relative flex size-(--cell-size) items-center justify-center rounded-lg text-sm tabular-nums outline-none",
        "transition-[background-color,color] duration-150 ease-soft",
        "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
        "data-selected:bg-primary data-selected:font-semibold data-selected:text-primary-foreground data-selected:hover:bg-primary-hover",
        // A small dot marks today.
        "data-today:after:absolute data-today:after:bottom-1.5 data-today:after:size-1 data-today:after:rounded-full data-today:after:bg-primary data-selected:data-today:after:bg-primary-foreground",
        "disabled:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
