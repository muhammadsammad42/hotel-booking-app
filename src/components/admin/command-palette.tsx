"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { BuildingIcon, ExternalLinkIcon, Loader2Icon, PlusIcon, SearchIcon, TicketIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { searchCommandAction, type CommandResults } from "@/app/(admin)/admin/_actions/reservations";
import { BOOKING_STATUSES } from "@/components/booking/booking-status-badge";
import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

import { ADMIN_NAV } from "./admin-nav";

const itemClass =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm outline-none select-none data-[selected=true]:bg-accent data-[selected=true]:text-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground";
const groupClass =
  "px-2 pb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground";

/** Opens with Ctrl+K (Cmd+K on a Mac) or the search button in the top bar. */
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return [open, setOpen] as const;
}

/** Jump to any admin page, or find a booking or hotel by name, reference or email. */
export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<CommandResults>({ bookings: [], hotels: [] });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      const next = await searchCommandAction(q).catch(() => ({ bookings: [], hotels: [] }));
      if (!cancelled) {
        setResults(next);
        setLoading(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const searching = query.trim().length >= 2;
  const shown = searching ? results : { bookings: [], hotels: [] };

  function go(href: string) {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-scrim duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content className="fixed top-[12vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-overlay outline-none duration-200 ease-soft data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Go to an admin page or search bookings and hotels.</DialogPrimitive.Description>
          {/* Server results are already filtered, so cmdk only ranks the page list. */}
          <Command label="Command palette" shouldFilter={!searching} loop>
            <div className="flex items-center gap-3 border-b px-4">
              {loading ? <Loader2Icon className="size-4 animate-spin text-muted-foreground" aria-hidden /> : <SearchIcon className="size-4 text-muted-foreground" aria-hidden />}
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search bookings, guests, hotels or pages…"
                className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
              />
              <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-sans text-xs text-muted-foreground sm:inline">Esc</kbd>
            </div>
            <Command.List className="max-h-[min(60vh,26rem)] overflow-y-auto py-1">
              <Command.Empty className="px-4 py-10 text-center text-sm text-muted-foreground">
                {loading ? "Searching…" : `Nothing matches “${query.trim()}”. Try a reference like HB-7K3M9Q or a guest's name.`}
              </Command.Empty>

              {shown.bookings.length > 0 && (
                <Command.Group heading="Bookings" className={groupClass}>
                  {shown.bookings.map((booking) => {
                    const status = BOOKING_STATUSES[booking.status as BookingStatus];
                    return (
                      <Command.Item key={booking.id} value={`booking ${booking.id}`} onSelect={() => go(`/admin/reservations?booking=${booking.id}&q=${booking.reference}`)} className={itemClass}>
                        <TicketIcon aria-hidden />
                        <span className="min-w-0 flex-1 truncate">
                          <span className="font-mono font-medium">{booking.reference}</span>
                          <span className="text-muted-foreground"> · {booking.guestName} · {booking.hotel}</span>
                        </span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              )}

              {shown.hotels.length > 0 && (
                <Command.Group heading="Hotels" className={groupClass}>
                  {shown.hotels.map((hotel) => (
                    <Command.Item key={hotel.id} value={`hotel ${hotel.id}`} onSelect={() => go(`/admin/hotels/${hotel.id}`)} className={itemClass}>
                      <BuildingIcon aria-hidden />
                      <span className="flex-1 truncate">
                        {hotel.name}
                        <span className="text-muted-foreground"> · {hotel.city}</span>
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {!searching && (
                <>
                  <Command.Group heading="Go to" className={groupClass}>
                    {ADMIN_NAV.map(({ href, label, icon: Icon, description }) => (
                      <Command.Item key={href} value={`${label} ${description}`} onSelect={() => go(href)} className={itemClass}>
                        <Icon aria-hidden />
                        <span className="flex-1">{label}</span>
                        <span className="hidden truncate text-xs text-muted-foreground sm:block">{description}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                  <Command.Group heading="Actions" className={groupClass}>
                    <Command.Item value="new hotel create" onSelect={() => go("/admin/hotels/new")} className={itemClass}>
                      <PlusIcon aria-hidden />
                      New hotel
                    </Command.Item>
                    <Command.Item value="view site public" onSelect={() => go("/")} className={itemClass}>
                      <ExternalLinkIcon aria-hidden />
                      View the public site
                    </Command.Item>
                  </Command.Group>
                </>
              )}
            </Command.List>
            <div className={cn("flex items-center gap-4 border-t px-4 py-2.5 text-xs text-muted-foreground")}>
              <span>
                <kbd className="font-sans">↑↓</kbd> to move
              </span>
              <span>
                <kbd className="font-sans">Enter</kbd> to open
              </span>
            </div>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
