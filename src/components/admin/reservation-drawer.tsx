"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CircleAlertIcon, ExternalLinkIcon, MailIcon, MessageSquareTextIcon, PhoneIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { adminCancelBookingAction } from "@/app/(admin)/admin/_actions/reservations";
import { CopyButton } from "@/components/booking/copy-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Reservation } from "@/lib/admin/reservations";
import { formatPrice, formatStayDate, pluralize } from "@/lib/format";

import { StayActions } from "./stay-actions";

const dateTime = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

const PAYMENT_LABELS: Record<string, string> = { SUCCEEDED: "Paid", REFUNDED: "Refunded", FAILED: "Payment failed", PENDING: "Awaiting payment" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

function CancelButton({ booking, onDone }: { booking: Reservation; onDone: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [pending, startTransition] = React.useTransition();
  const paid = booking.payments.filter((payment) => payment.status === "SUCCEEDED").reduce((sum, payment) => sum + payment.amount, 0);

  function confirm() {
    setError(undefined);
    startTransition(async () => {
      const result = await adminCancelBookingAction(booking.id);
      if (!result.ok) {
        setError(result.formError);
        return;
      }
      setOpen(false);
      toast.success("Booking cancelled", { description: `${booking.reference} · ${result.message}` });
      onDone();
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive hover:border-destructive hover:text-destructive">
          <XCircleIcon aria-hidden />
          Cancel booking
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel {booking.reference}?</DialogTitle>
          <DialogDescription>
            {booking.guestName}&apos;s stay at {booking.roomType.hotel.name} will be cancelled
            {paid > 0 ? ` and ${formatPrice(paid, booking.currency)} refunded to their card` : ""}. The rooms go back on sale. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={pending}>
              Keep booking
            </Button>
          </DialogClose>
          <Button variant="destructive" loading={pending} onClick={confirm}>
            {paid > 0 ? `Cancel and refund ${formatPrice(paid, booking.currency)}` : "Cancel booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Everything about one reservation, opened from the table with ?booking=. */
export function ReservationDrawer({ booking }: { booking: Reservation | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function close() {
    const next = new URLSearchParams(params.toString());
    next.delete("booking");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  }

  // Check-in opens on the arrival date (UTC, like every stay date).
  const today = new Date(new Date().toISOString().slice(0, 10));
  const arrived = booking ? booking.checkIn <= today && booking.checkOut > today : false;
  const nights = booking ? Math.round((booking.checkOut.getTime() - booking.checkIn.getTime()) / 86_400_000) : 0;

  return (
    <Sheet open={Boolean(booking)} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="w-[min(100%-1rem,28rem)]">
        {booking && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-mono">
                {booking.reference}
                <CopyButton value={booking.reference} label="Copy reference" />
              </SheetTitle>
              <SheetDescription>
                {booking.roomType.hotel.name} · booked {dateTime.format(booking.createdAt)} UTC
              </SheetDescription>
            </SheetHeader>
            <SheetBody className="grid content-start gap-6">
              <StayActions bookingId={booking.id} status={booking.status} guestName={booking.guestName} size="md" canCheckIn={arrived} />

              <section aria-label="Guest" className="grid gap-2 rounded-xl border p-4">
                <p className="font-semibold">{booking.guestName}</p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MailIcon className="size-4" aria-hidden />
                  <a href={`mailto:${booking.guestEmail}`} className="truncate hover:text-foreground hover:underline">
                    {booking.guestEmail}
                  </a>
                </p>
                {booking.guestPhone && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PhoneIcon className="size-4" aria-hidden />
                    <a href={`tel:${booking.guestPhone.replace(/[^+\d]/g, "")}`} className="hover:text-foreground hover:underline">
                      {booking.guestPhone}
                    </a>
                  </p>
                )}
                {booking.specialRequests && (
                  <p className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-sm">
                    <MessageSquareTextIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    {booking.specialRequests}
                  </p>
                )}
              </section>

              <dl className="divide-y">
                <Row label="Room">
                  {booking.roomType.name}
                  {booking.rooms > 1 && ` × ${booking.rooms}`}
                </Row>
                <Row label="Check-in">{formatStayDate(booking.checkIn, true)}</Row>
                <Row label="Check-out">{formatStayDate(booking.checkOut, true)}</Row>
                <Row label="Stay">
                  {pluralize(nights, "night")} · {pluralize(booking.guests, "guest")}
                </Row>
              </dl>

              <dl className="divide-y rounded-xl border px-4">
                <Row label="Room">{formatPrice(booking.subtotal, booking.currency)}</Row>
                <Row label="Taxes">{formatPrice(booking.taxes, booking.currency)}</Row>
                <Row label="Service fee">{formatPrice(booking.serviceFee, booking.currency)}</Row>
                <Row label="Total">
                  <span className="text-base font-semibold">{formatPrice(booking.totalPrice, booking.currency)}</span>
                </Row>
                {booking.payments.map((payment) => (
                  <Row key={payment.id} label={PAYMENT_LABELS[payment.status]}>
                    <span className="tabular-nums">{formatPrice(payment.amount, booking.currency)}</span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {payment.paidAt ? dateTime.format(payment.status === "REFUNDED" ? payment.updatedAt : payment.paidAt) : "Not paid"}
                    </span>
                  </Row>
                ))}
              </dl>
            </SheetBody>
            <SheetFooter className="flex-row flex-wrap">
              {["PENDING", "CONFIRMED"].includes(booking.status) && <CancelButton booking={booking} onDone={() => router.refresh()} />}
              <Button asChild variant="ghost">
                <Link href={`/hotels/${booking.roomType.hotel.slug}`} target="_blank">
                  <ExternalLinkIcon aria-hidden />
                  Hotel page
                </Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
