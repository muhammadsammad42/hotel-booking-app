"use client";

// Interactive examples for the /design page.
import * as React from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { InfoIcon, SlidersHorizontalIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const filterOptions = ["Free cancellation", "Breakfast included", "Pool", "Sea view"];

function FilterList() {
  return (
    <ul className="grid gap-1">
      {filterOptions.map((option, index) => (
        <li key={option}>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <Checkbox defaultChecked={index === 0} />
            {option}
          </label>
        </li>
      ))}
    </ul>
  );
}

export function OverlayDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open modal</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              Your stay at Caldera Blue Suites from 1 to 5 November will be cancelled and $1,680 refunded to
              your card within 5 working days.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep booking</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="destructive" onClick={() => toast.success("Booking cancelled")}>
                Cancel booking
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">
            <SlidersHorizontalIcon aria-hidden />
            Open bottom sheet
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow the list to stays that suit you.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <FilterList />
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button size="lg" fullWidth>
                Show 6 stays
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open side sheet</Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Price details</SheetTitle>
            <SheetDescription>4 nights in a Caldera View Suite.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">3 nights at $420</dt>
                <dd className="tabular-nums">$1,260</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">1 weekend night at $504</dt>
                <dd className="tabular-nums">$504</dd>
              </div>
              <div className="flex justify-between border-t pt-3 font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">$1,764</dd>
              </div>
            </dl>
          </SheetBody>
          <SheetFooter>
            <SheetClose asChild>
              <Button fullWidth>Got it</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p className="type-title-sm">Free cancellation</p>
          <p className="mt-1.5 leading-relaxed text-muted-foreground">
            Cancel up to 48 hours before check-in for a full refund.
          </p>
        </PopoverContent>
      </Popover>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <InfoIcon className="size-5" aria-hidden />
            <span className="sr-only">What is included</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Taxes and fees are included</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        onClick={() =>
          toast.success("Booking confirmed", { description: "We have emailed your confirmation, HB-7K3M9Q." })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error("Payment failed", { description: "Your card was declined. Try another card." })
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast("Removed from your wishlist", {
            action: { label: "Undo", onClick: () => toast.success("Back on your wishlist") },
          })
        }
      >
        With undo
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1600)), {
            loading: "Checking availability",
            success: "Your dates are available",
            error: "Something went wrong",
          })
        }
      >
        Loading
      </Button>
    </div>
  );
}

export function DateRangeDemo() {
  const [range, setRange] = React.useState<DateRange>();
  const nights = range?.from && range.to ? differenceInCalendarDays(range.to, range.from) : 0;

  return (
    <div className="grid max-w-md gap-3">
      <DateRangePicker value={range} onChange={setRange} minNights={2} />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {range?.from && range.to && nights > 0
          ? `Selected ${format(range.from, "d MMM yyyy")} to ${format(range.to, "d MMM yyyy")}: ${nights} nights.`
          : "This example needs a stay of at least 2 nights. Past dates are disabled."}
      </p>
    </div>
  );
}

export function LoadingButtonDemo() {
  const [loading, setLoading] = React.useState(false);

  return (
    <Button
      loading={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1800);
      }}
    >
      Reserve now
    </Button>
  );
}
