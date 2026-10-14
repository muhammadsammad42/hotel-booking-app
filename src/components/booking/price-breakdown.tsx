"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

import { BOOKING_CONFIG } from "@/lib/booking/config";
import type { Quote } from "@/lib/booking/engine";
import { formatPrice, pluralize } from "@/lib/format";
import { duration, ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** An amount that rolls to its new value when it changes. */
export function AnimatedPrice({ amount, currency = "USD", className }: { amount: number; currency?: string; className?: string }) {
  return (
    <span className={cn("relative inline-flex overflow-hidden tabular-nums", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={amount}
          initial={{ y: "70%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-70%", opacity: 0 }}
          transition={{ duration: duration.base, ease: ease.soft }}
        >
          {formatPrice(amount, currency)}
        </m.span>
      </AnimatePresence>
    </span>
  );
}

const nightLabel = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });

/** Nightly rate, taxes, service fee and total, with an optional night-by-night list. */
export function PriceBreakdown({ quote, className }: { quote: Quote; className?: string }) {
  const [showNights, setShowNights] = React.useState(false);
  const id = React.useId();
  const varies = new Set(quote.nights.map((night) => night.price)).size > 1;
  const percent = (rate: number) => `${Math.round(rate * 1000) / 10}%`;

  return (
    <div className={cn("grid gap-2.5 text-sm", className)}>
      <div className="flex items-start justify-between gap-4">
        <span className="text-muted-foreground">
          {varies ? "Average " : ""}
          {formatPrice(quote.averageNightly, quote.currency)} × {pluralize(quote.nightCount, "night")}
          {quote.rooms > 1 && ` × ${pluralize(quote.rooms, "room")}`}
          {varies && (
            <button
              type="button"
              onClick={() => setShowNights((value) => !value)}
              aria-expanded={showNights}
              aria-controls={id}
              className="ml-1.5 inline-flex items-center gap-0.5 rounded-sm font-medium text-foreground underline underline-offset-4"
            >
              details
              <ChevronDownIcon className={cn("size-3.5 transition-transform duration-200 ease-soft", showNights && "rotate-180")} aria-hidden />
            </button>
          )}
        </span>
        <AnimatedPrice amount={quote.subtotal} currency={quote.currency} />
      </div>

      <AnimatePresence initial={false}>
        {showNights && (
          <m.ul
            id={id}
            className="grid gap-1 overflow-hidden rounded-lg bg-muted/60 px-3 text-xs"
            initial={{ height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 }}
            animate={{ height: "auto", opacity: 1, paddingTop: 8, paddingBottom: 8 }}
            exit={{ height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 }}
            transition={{ duration: duration.base, ease: ease.soft }}
          >
            {quote.nights.map((night) => (
              <li key={night.date} className="flex justify-between gap-3 tabular-nums">
                <span className="text-muted-foreground">{nightLabel.format(new Date(`${night.date}T00:00:00Z`))}</span>
                <span>{formatPrice(night.price, quote.currency)}</span>
              </li>
            ))}
          </m.ul>
        )}
      </AnimatePresence>

      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Taxes ({percent(BOOKING_CONFIG.taxRate)})</span>
        <AnimatedPrice amount={quote.taxes} currency={quote.currency} />
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Sarai service fee ({percent(BOOKING_CONFIG.serviceFeeRate)})</span>
        <AnimatedPrice amount={quote.serviceFee} currency={quote.currency} />
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-4 border-t pt-3 text-base font-semibold">
        <span>Total</span>
        <AnimatedPrice amount={quote.total} currency={quote.currency} />
      </div>
    </div>
  );
}
