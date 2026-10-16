import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDaysIcon, LockIcon, ShieldCheckIcon } from "lucide-react";

import { HoldCountdown } from "@/components/booking/hold-countdown";
import { BookingSteps, StaySummary } from "@/components/booking/stay-summary";
import { PageContainer, Section } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { checkoutSessionFor } from "@/lib/booking/holds";
import { bookingQuote } from "@/lib/booking/snapshot";
import { formatPrice } from "@/lib/format";
import { siteOrigin } from "@/lib/site-url";

import { getOwnBooking, holdIsActive, rebookHref } from "../booking";

export const metadata: Metadata = {
  title: "Payment not completed",
  robots: { index: false },
};

/** Where Stripe sends the guest after they back out of Checkout. */
export default async function CancelledPage({ params }: PageProps<"/book/[id]/cancelled">) {
  const { id } = await params;
  const booking = await getOwnBooking(id, `/book/${id}/cancelled`);
  if (["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"].includes(booking.status)) redirect(`/book/${id}/confirmed`);
  if (!holdIsActive(booking)) redirect(`/book/${id}`);

  let payUrl: string | null = null;
  try {
    payUrl = (await checkoutSessionFor(booking.id, await siteOrigin()))?.url ?? null;
  } catch (error) {
    console.error("[booking] Could not load checkout session:", error);
  }

  return (
    <Section spacing="compact">
      <PageContainer width="app">
        <div className="grid gap-6">
          <BookingSteps current={1} />
          <h1 className="type-title-lg">No problem, nothing was charged</h1>
        </div>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section aria-label="Your options" className="grid gap-5 rounded-2xl border bg-card p-5 sm:p-6">
            <p className="flex items-start gap-3 text-sm leading-relaxed">
              <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
              <span>
                You left the payment page before paying, so your card has not been charged. Your room is still held
                for you, so you can pick up where you left off.
              </span>
            </p>
            <HoldCountdown expiresAt={booking.expiresAt!.toISOString()} />
            <div className="flex flex-col gap-3 sm:flex-row">
              {payUrl && (
                <Button asChild size="lg">
                  <a href={payUrl}>
                    <LockIcon aria-hidden />
                    Try again: pay {formatPrice(booking.totalPrice, booking.currency)}
                  </a>
                </Button>
              )}
              <Button asChild size="lg" variant="outline">
                <Link href={`/hotels/${booking.roomType.hotel.slug}`}>
                  <CalendarDaysIcon aria-hidden />
                  Change dates
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Want to change the guest details instead?{" "}
              <Link href={rebookHref(booking)} className="font-medium text-foreground underline underline-offset-4">
                Edit and continue
              </Link>
            </p>
          </section>
          <StaySummary
            hotel={booking.roomType.hotel}
            roomName={booking.roomType.name}
            checkIn={booking.checkIn}
            checkOut={booking.checkOut}
            guests={booking.guests}
            quote={bookingQuote(booking)}
          />
        </div>
      </PageContainer>
    </Section>
  );
}
