"use client";

import * as React from "react";
import { MinusIcon, PlusIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { controlClasses } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { pluralize } from "@/lib/format";
import { MAX_GUESTS } from "@/lib/search/params";
import { cn } from "@/lib/utils";

type GuestCounterProps = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  id?: string;
  className?: string;
};

/** Minus and plus buttons around a count. */
export function GuestStepper({ value, onChange, max = MAX_GUESTS, label = "Guests" }: GuestCounterProps & { label?: string }) {
  return (
    <div className="flex items-center gap-3" role="group" aria-label={label}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="rounded-full"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
      >
        <MinusIcon aria-hidden />
        <span className="sr-only">Fewer guests</span>
      </Button>
      <span className="w-6 text-center font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        className="rounded-full"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <PlusIcon aria-hidden />
        <span className="sr-only">More guests</span>
      </Button>
    </div>
  );
}

/** A field that opens a guest stepper. */
export function GuestCounter({ value, onChange, max = MAX_GUESTS, id, className }: GuestCounterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(controlClasses, "flex h-11 items-center gap-2.5 text-left", className)}
        >
          <UsersIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{pluralize(value, "guest")}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="type-title-sm">Guests</p>
            <p className="text-sm text-muted-foreground">Adults and children</p>
          </div>
          <GuestStepper value={value} onChange={onChange} max={max} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
