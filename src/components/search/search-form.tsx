"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

import { DestinationCombobox, type DestinationSuggestion } from "@/components/search/destination-combobox";
import { GuestCounter } from "@/components/search/guest-counter";
import { Button } from "@/components/ui/button";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";
import { fromIsoDate, toIsoDate } from "@/lib/dates";
import { DEFAULT_FILTERS, searchHref, type SearchFilters } from "@/lib/search/params";
import { cn } from "@/lib/utils";

type SearchFormProps = {
  suggestions: DestinationSuggestion[];
  initial?: Partial<Pick<SearchFilters, "destination" | "checkIn" | "checkOut" | "guests">>;
  /** Filters kept when searching again from the results page. */
  keep?: Partial<SearchFilters>;
  variant?: "hero" | "bar";
  className?: string;
};

/** Where, when and who: the main search, on the home page and above results. */
export function SearchForm({ suggestions, initial = {}, keep = {}, variant = "hero", className }: SearchFormProps) {
  const router = useRouter();
  const ids = React.useId();
  const [destination, setDestination] = React.useState(initial.destination ?? "");
  const [range, setRange] = React.useState<DateRange | undefined>(
    initial.checkIn && initial.checkOut
      ? { from: fromIsoDate(initial.checkIn), to: fromIsoDate(initial.checkOut) }
      : undefined,
  );
  const [guests, setGuests] = React.useState(initial.guests ?? DEFAULT_FILTERS.guests);
  const [pending, startTransition] = React.useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const hasDates = range?.from && range.to && range.to > range.from;
    startTransition(() =>
      router.push(
        searchHref({
          ...keep,
          destination: destination.trim(),
          checkIn: hasDates ? toIsoDate(range.from!) : null,
          checkOut: hasDates ? toIsoDate(range.to!) : null,
          guests,
          page: 1,
        }),
      ),
    );
  }

  const label = cn("text-xs font-semibold text-foreground", variant === "bar" && "sr-only");

  return (
    <form
      role="search"
      aria-label="Find a stay"
      onSubmit={onSubmit}
      className={cn(
        "grid gap-3",
        variant === "hero"
          ? "rounded-2xl border bg-card p-4 shadow-overlay sm:p-5 lg:grid-cols-[1.3fr_1.6fr_0.9fr_auto] lg:items-end"
          : "md:grid-cols-[1.2fr_1.6fr_0.8fr_auto] md:items-center",
        className,
      )}
    >
      <div className="grid gap-1.5">
        <label htmlFor={`${ids}-where`} className={label}>
          Where
        </label>
        <DestinationCombobox
          id={`${ids}-where`}
          value={destination}
          onChange={setDestination}
          suggestions={suggestions}
          inputClassName={variant === "hero" ? "h-14" : undefined}
        />
      </div>
      <div className="grid gap-1.5">
        <span className={label}>When</span>
        <DateRangePicker value={range} onChange={setRange} className={variant === "bar" ? "min-h-11 py-1" : undefined} />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor={`${ids}-guests`} className={label}>
          Who
        </label>
        <GuestCounter id={`${ids}-guests`} value={guests} onChange={setGuests} className={variant === "hero" ? "h-14" : undefined} />
      </div>
      <Button type="submit" size="lg" loading={pending} className={variant === "hero" ? "h-14 lg:px-8" : "h-11"}>
        <SearchIcon aria-hidden />
        Search
      </Button>
    </form>
  );
}
