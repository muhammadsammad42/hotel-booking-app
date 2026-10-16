import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarPlusIcon, CheckIcon, CircleCheckIcon, LuggageIcon, MapPinIcon } from "lucide-react";

import { Confetti } from "@/components/booking/confetti";
import { CopyButton } from "@/components/booking/copy-button";
import { PriceBreakdown } from "@/components/booking/price-breakdown";
import { RefreshWhilePending } from "@/components/booking/refresh-while-pending";
import { BookingSteps } from "@/components/booking/stay-summary";
import { PageContainer, Section } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { confirmFromSession } from "@/lib/booking/holds";
import { bookingQuote } from "@/lib/booking/snapshot";
import { formatPrice, formatStayDate, pluralize } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

import { getOwnBooking, rebookHref } from "../booking";

export const metadata: Metadata = {
  title: "Booking confirmed",
  robots: { index: false },
};

const paidStatuses = ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"];

export default async function ConfirmedPage({ params, searchParams }: PageProps<"/book/[id]/confirmed">) {
  const { id } = await params;
  const { session_id: sessionId } = await searchParams;
  let booking = await getOwnBooking(id, `/book/${id}/confirmed`);

  // Confirm straight away from the session, in case the webhook is slower
  // than the guest. The webhook does the same thing; both are idempotent.
  if (!paidStatuses.includes(booking.status) && typeof sessionId === "string" && sessionId.startsWith("cs_")) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.metadata?.bookingId === booking.id) await confirmFromSession(session);
      booking = await getOwnBooking(id, `/book/${id}/confirmed`);
    } catch (error) {
      console.error("[booking] Could not confirm from session:", error);
    }
  }

  if (!paidStatuses.includes(booking.status)) {
    const refunded = await prisma.payment.findFirst({ where: { bookingId: booking.id, status: "REFUNDED" } });
    if (refunded) {
      return (
        <Section spacing="compact">
          <PageContainer width="app">
            <Card>
              <EmptyState
                headingLevel="h1"
                tone="error"
                title="We refunded your payment"
                description="Your payment came through after the hold had ended, and the room had been booked in the meantime. We have refunded the full amount; it can take 5 to 10 working days to appear."
                action={
                  <Button asChild size="lg">
                    <Link href={`/hotels/${booking.roomType.hotel.slug}`}>See other dates</Link>
                  </Button>
                }
              />
            </Card>
          </PageContainer>
        </Section>
      );
    }
    if (booking.status === "PENDING") {
      return (
        <Section spacing="compact">
          <PageContainer width="app">
            <RefreshWhilePending />
            <Card>
              <EmptyState
                headingLevel="h1"
                title="Confirming your payment"
                description="This usually takes a few seconds. This page updates by itself, so there is no need to pay again."
                action={
                  <Button asChild variant="outline">
                    <Link href={`/book/${booking.id}`}>Back to payment</Link>
                  </Button>
                }
              />
            </Card>
          </PageContainer>
        </Section>
      );
    }
    redirect(booking.status === "EXPIRED" ? rebookHref(booking) : `/book/${booking.id}`);
  }

  const { hotel } = booking.roomType;
  const quote = bookingQuote(booking);
  const firstName = booking.guestName.split(" ")[0];

  return (
    <Section spacing="compact">
      <Confetti />
      <PageContainer width="app">
        <BookingSteps current={2} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid content-start gap-6">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground shadow-lift">
                <CheckIcon className="size-6" strokeWidth={3} aria-hidden />
              </span>
              <div>
                <h1 className="type-title-lg">Pack your bags, {firstName}. You are going to {hotel.city}.</h1>
                <p className="mt-1 text-muted-foreground">
                  Your stay at {hotel.name} is confirmed. Everything you need is below, and in My trips whenever you need it.
                </p>
              </div>
            </div>

            <section aria-label="Booking reference" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5">
              <div>
                <p className="text-sm text-muted-foreground">Booking reference</p>
                <p className="mt-1 font-mono text-2xl font-semibold tracking-wider">{booking.reference}</p>
              </div>
              <CopyButton value={booking.reference} label="Copy booking reference" />
            </section>

            <section aria-labelledby="trip-heading" className="overflow-hidden rounded-2xl border bg-card">
              <div className="relative aspect-21/9 bg-muted">
                <Image src={hotel.coverImageUrl} alt={hotel.coverImageAlt} fill priority sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
              </div>
              <div className="grid gap-4 p-5 sm:p-6">
                <h2 id="trip-heading" className="type-title-md">
                  Your trip
                </h2>
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Check-in</dt>
                    <dd className="mt-0.5 font-medium">{formatStayDate(booking.checkIn, true)}</dd>
                    <dd className="text-muted-foreground">From {hotel.checkInTime}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Check-out</dt>
                    <dd className="mt-0.5 font-medium">{formatStayDate(booking.checkOut, true)}</dd>
                    <dd className="text-muted-foreground">By {hotel.checkOutTime}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Room</dt>
                    <dd className="mt-0.5 font-medium">
                      {booking.roomType.name}
                      {booking.rooms > 1 && ` × ${booking.rooms}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Guests</dt>
                    <dd className="mt-0.5 font-medium">{pluralize(booking.guests, "guest")}</dd>
                  </div>
                </dl>
                <p className="flex items-start gap-2 border-t pt-4 text-sm text-muted-foreground">
                  <MapPinIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {hotel.address}
                </p>
              </div>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/account/trips">
                  <LuggageIcon aria-hidden />
                  View my trips
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={`/book/${booking.id}/calendar.ics`} download>
                  <CalendarPlusIcon aria-hidden />
                  Add to calendar
                </a>
              </Button>
            </div>
          </div>

          <aside aria-label="Payment" className="lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)] lg:self-start">
            <div className="grid gap-4 rounded-2xl border bg-card p-5">
              <p className="flex items-center gap-2 text-sm font-medium text-success">
                <CircleCheckIcon className="size-4" aria-hidden />
                Paid {formatPrice(booking.totalPrice, booking.currency)}
              </p>
              <PriceBreakdown quote={quote} />
            </div>
          </aside>
        </div>
      </PageContainer>
    </Section>
  );
}
