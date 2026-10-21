"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BanIcon, CircleDollarSignIcon, LockOpenIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { applyRatesAction } from "@/app/(admin)/admin/_actions/rates";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdminNight } from "@/lib/admin/inventory";
import { formatPrice, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RateUpdateInput } from "@/lib/validation/admin";

export type RatesMonth = { key: string; label: string; nights: AdminNight[] };

type Selection = { anchor: string; end: string } | null;

/** One bulk change from the side panel; the dates come from the selection. */
type RateChange = { action: "price"; price: string } | { action: "reset" } | { action: "block"; rooms: string; reason: string } | { action: "unblock" };

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const shortDate = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const fmt = (iso: string) => shortDate.format(new Date(`${iso}T00:00:00Z`)).replace(",", "");
const addDays = (iso: string, days: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
const span = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1;

function ordered(selection: Selection) {
  if (!selection) return null;
  return selection.anchor <= selection.end ? { from: selection.anchor, to: selection.end } : { from: selection.end, to: selection.anchor };
}

/** Applies an update to the nights on screen, for the optimistic view. */
function applyLocally(months: RatesMonth[], update: RateUpdateInput & { basePrice: number; inventory: number }) {
  return months.map((month) => ({
    ...month,
    nights: month.nights.map((night) => {
      if (night.date < update.from || night.date > update.to) return night;
      switch (update.action) {
        case "price":
          return { ...night, price: Math.round(Number(update.price) * 100), override: true };
        case "reset":
          return { ...night, price: update.basePrice, override: false };
        case "block": {
          const blocked = Math.min(Number(update.rooms), update.inventory);
          return { ...night, blocked, available: Math.max(0, update.inventory - blocked - night.booked) };
        }
        case "unblock":
          return { ...night, blocked: 0, available: Math.max(0, update.inventory - night.booked) };
      }
    }),
  }));
}

export function RatesCalendar({
  roomTypeId,
  basePrice,
  inventory,
  months,
  today,
}: {
  roomTypeId: string;
  basePrice: number;
  inventory: number;
  months: RatesMonth[];
  today: string;
}) {
  const router = useRouter();
  const [view, setOptimistic] = React.useOptimistic(months, (current: RatesMonth[], update: RateUpdateInput) =>
    applyLocally(current, { ...update, basePrice, inventory }),
  );
  const [pending, startTransition] = React.useTransition();
  const [selection, setSelection] = React.useState<Selection>(null);
  const [dragging, setDragging] = React.useState(false);
  const [price, setPrice] = React.useState("");
  const [rooms, setRooms] = React.useState("1");
  const [reason, setReason] = React.useState("");
  const range = ordered(selection);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLElement>(null);
  const [panelVisible, setPanelVisible] = React.useState(false);

  // The floating bar is only needed while the panel is off screen.
  React.useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const observer = new IntersectionObserver(([entry]) => setPanelVisible(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  // Stop dragging wherever the pointer is released.
  React.useEffect(() => {
    const stop = () => setDragging(false);
    window.addEventListener("pointerup", stop);
    return () => window.removeEventListener("pointerup", stop);
  }, []);

  function pick(date: string, extend: boolean) {
    setSelection((current) => {
      // A second tap after a single day extends to a range, which also works on touch.
      if (extend || (current && current.anchor === current.end && current.anchor !== date)) return { anchor: current?.anchor ?? date, end: date };
      return { anchor: date, end: date };
    });
  }

  function onKeyDown(event: React.KeyboardEvent, date: string) {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const target = gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${addDays(date, step)}"]:not(:disabled)`);
    if (!target) return;
    target.focus();
    if (event.shiftKey) setSelection((current) => ({ anchor: current?.anchor ?? date, end: target.dataset.date! }));
  }

  function apply(update: RateChange) {
    if (!range) return;
    const full: RateUpdateInput = { ...update, roomTypeId, from: range.from, to: range.to };
    startTransition(async () => {
      setOptimistic(full);
      const result = await applyRatesAction(full);
      if (!result.ok) {
        toast.error("Nothing changed", { description: result.formError });
        return;
      }
      toast.success(result.message, { description: `${fmt(range.from)} to ${fmt(range.to)}` });
      router.refresh();
    });
  }

  const priceValid = Number(price) >= 1;
  const roomsValid = Number(rooms) >= 1 && Number(rooms) <= inventory;

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div ref={gridRef} className={cn("grid gap-6 select-none 2xl:grid-cols-2", pending && "cursor-progress")}>
        {view.map((month) => {
          const first = month.nights[0]?.date;
          const lead = first ? (new Date(`${first}T00:00:00Z`).getUTCDay() + 6) % 7 : 0;
          return (
            <section key={month.key} aria-label={month.label} className="rounded-xl border bg-card p-3 sm:p-4">
              <h2 className="type-title-sm mb-3 px-1">{month.label}</h2>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground" aria-hidden>
                {WEEKDAYS.map((day) => (
                  <span key={day} className="pb-1">
                    {day}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: lead }, (_, index) => (
                  <span key={`lead-${index}`} aria-hidden />
                ))}
                {month.nights.map((night) => {
                  const past = night.date < today;
                  const selected = range && night.date >= range.from && night.date <= range.to;
                  const soldOut = night.available === 0;
                  const label = `${fmt(night.date)}: ${formatPrice(night.price)}${night.override ? " (custom price)" : ""}, ${night.booked} of ${inventory} booked${night.blocked ? `, ${night.blocked} blocked` : ""}`;
                  return (
                    <button
                      key={night.date}
                      type="button"
                      data-date={night.date}
                      disabled={past}
                      aria-pressed={Boolean(selected)}
                      aria-label={label}
                      onPointerDown={(event) => {
                        if (event.pointerType === "mouse" && event.button === 0) {
                          setDragging(true);
                          pick(night.date, event.shiftKey);
                        }
                      }}
                      onPointerEnter={() => {
                        if (dragging) setSelection((current) => (current ? { ...current, end: night.date } : current));
                      }}
                      onClick={(event) => {
                        // Mouse presses were handled on pointerdown; this covers touch and keyboard.
                        if (event.detail === 0 || (event.nativeEvent as PointerEvent).pointerType !== "mouse") pick(night.date, event.shiftKey);
                      }}
                      onKeyDown={(event) => onKeyDown(event, night.date)}
                      className={cn(
                        "relative flex min-h-16 flex-col items-start justify-between rounded-lg border p-1.5 text-left outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-soft sm:min-h-[4.5rem] sm:p-2",
                        "focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
                        night.override ? "border-primary/40 bg-primary/8" : "border-border bg-background hover:border-input",
                        night.blocked > 0 && "bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,var(--muted)_6px,var(--muted)_8px)]",
                        selected && "border-primary bg-primary/18 ring-1 ring-primary",
                      )}
                    >
                      <span className={cn("text-xs font-medium tabular-nums", night.date === today && "rounded-full bg-foreground px-1.5 text-background")}>
                        {Number(night.date.slice(8))}
                      </span>
                      <span className={cn("text-xs font-semibold tabular-nums sm:text-sm", night.override && "text-primary")}>
                        {formatPrice(night.price)}
                      </span>
                      <span
                        className={cn(
                          "text-xs leading-tight tabular-nums",
                          soldOut ? "font-semibold text-destructive" : night.blocked ? "text-warning" : "text-muted-foreground",
                        )}
                      >
                        {soldOut ? (
                          <>
                            <span className="sm:hidden">Full</span>
                            <span className="hidden sm:inline">Sold out</span>
                          </>
                        ) : night.blocked ? (
                          <>
                            {night.blocked}
                            <span className="hidden sm:inline"> blocked</span>
                          </>
                        ) : (
                          <>
                            {night.available}
                            <span className="hidden sm:inline"> left</span>
                          </>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground 2xl:col-span-2" aria-label="Legend">
          <li className="flex items-center gap-2">
            <span className="size-3.5 rounded border bg-background" aria-hidden />
            Base price ({formatPrice(basePrice)})
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3.5 rounded border border-primary/40 bg-primary/8" aria-hidden />
            Custom price
          </li>
          <li className="flex items-center gap-2">
            <span className="size-3.5 rounded border bg-[repeating-linear-gradient(135deg,transparent,transparent_3px,var(--muted)_3px,var(--muted)_5px)]" aria-hidden />
            Rooms blocked
          </li>
          <li>Drag across dates, or tap a start and an end date. Shift and the arrow keys extend the selection.</li>
        </ul>
      </div>

      {range && !panelVisible && (
        <div className="fixed inset-x-gutter bottom-4 z-20 flex items-center justify-between gap-3 rounded-xl border bg-popover p-3 pl-4 shadow-overlay xl:hidden">
          <p className="text-sm">
            <span className="font-semibold">{pluralize(span(range.from, range.to), "night")}</span>
            <span className="text-muted-foreground"> selected</span>
          </p>
          <Button size="sm" onClick={() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
            Change prices or rooms
          </Button>
        </div>
      )}

      <aside ref={panelRef} aria-label="Change the selected dates" className="grid scroll-mt-24 gap-4 rounded-xl border bg-card p-5 xl:sticky xl:top-24">
        {range ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Selected</p>
                <p className="font-semibold">
                  {fmt(range.from)}
                  {range.to !== range.from && ` to ${fmt(range.to)}`}
                </p>
                <p className="text-sm text-muted-foreground">{pluralize(span(range.from, range.to), "night")}</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setSelection(null)}>
                <XIcon aria-hidden />
                <span className="sr-only">Clear selection</span>
              </Button>
            </div>
            <Tabs defaultValue="price" variant="segmented" className="gap-4">
              <TabsList className="w-full">
                <TabsTrigger value="price" className="flex-1">
                  Price
                </TabsTrigger>
                <TabsTrigger value="availability" className="flex-1">
                  Availability
                </TabsTrigger>
              </TabsList>
              <TabsContent value="price" className="grid gap-3">
                <Field label="Nightly price (USD)" hint={`Base price is ${formatPrice(basePrice)}`}>
                  <Input type="number" min={1} step="0.01" inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} placeholder={String(basePrice / 100)} />
                </Field>
                <Button disabled={!priceValid || pending} loading={pending} onClick={() => apply({ action: "price", price })}>
                  <CircleDollarSignIcon aria-hidden />
                  Set price
                </Button>
                <Button variant="ghost" disabled={pending} onClick={() => apply({ action: "reset" })}>
                  <RotateCcwIcon aria-hidden />
                  Back to base price
                </Button>
              </TabsContent>
              <TabsContent value="availability" className="grid gap-3">
                <Field label="Rooms to block" hint={`Out of ${pluralize(inventory, "room")}. Booked rooms are not affected.`}>
                  <Input type="number" min={1} max={inventory} inputMode="numeric" value={rooms} onChange={(event) => setRooms(event.target.value)} />
                </Field>
                <Field label="Reason" hint="Optional, for example Maintenance">
                  <Input value={reason} maxLength={120} onChange={(event) => setReason(event.target.value)} />
                </Field>
                <Button variant="secondary" disabled={!roomsValid || pending} loading={pending} onClick={() => apply({ action: "block", rooms, reason })}>
                  <BanIcon aria-hidden />
                  Block rooms
                </Button>
                <Button variant="ghost" disabled={pending} onClick={() => apply({ action: "unblock" })}>
                  <LockOpenIcon aria-hidden />
                  Remove blocks
                </Button>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="grid gap-2 py-6 text-center">
            <CircleDollarSignIcon className="mx-auto size-8 text-muted-foreground" aria-hidden />
            <p className="font-medium">Select dates to change them</p>
            <p className="text-sm text-muted-foreground">Drag across the calendar to set a price or block rooms for many nights at once.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
