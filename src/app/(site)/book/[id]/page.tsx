import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCardIcon, LockIcon, RotateCwIcon, TimerOffIcon } from "lucide-react";

import { CopyButton } from "@/components/booking/copy-button";
import { HoldCountdown } from "@/components/booking/hold-countdown";
import { BookingSteps, StaySummary } from "@/components/booking/stay-summary";
import { PageContainer, Section } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { checkoutSessionFor } from "@/lib/booking/holds";
import { bookingQuote } from "@/lib/booking/snapshot";
import { formatPrice } from "@/lib/format";
import { siteOrigin } from "@/lib/site-url";

import { getOwnBooking, holdIsActive, rebookHref } from "./booking";

export const metadata: Metadata = {
  title: "Confirm and pay",
  robots: { index: false },
};

const paidStatuses = ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"];

export default async function PaymentPage({ params }: PageProps<"/book/[id]">) {
  const { id } = await params;
  const booking = await getOwnBooking(id, `/book/${id}`);
  if (paidStatuses.includes(booking.status)) redirect(`/book/${id}/confirmed`);

  const active = holdIsActive(booking);
  let payUrl: string | null = null;
  if (active) {
    try {
      payUrl = (await checkoutSessionFor(booking.id, await siteOrigin()))?.url ?? null;
    } catch (error) {
      console.error("[booking] Could not load checkout session:", error);
    }
  }
  const quote = bookingQuote(booking);
  const testMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_");

  return (
    <Section spacing="compact">
      <PageContainer width="app">
        <div className="grid gap-6">
          <BookingSteps current={1} />
          <h1 className="type-title-lg">{active ? "Confirm and pay" : "This hold has ended"}</h1>
        </div>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {active ? (
            <section aria-labelledby="pay-heading" className="grid gap-5 rounded-2xl border bg-card p-5 sm:p-6">
              <h2 id="pay-heading" className="sr-only">
                Payment
              </h2>
              <HoldCountdown expiresAt={booking.expiresAt!.toISOString()} />
              <div className="grid gap-1">
                <p className="type-title-md">Pay securely with Stripe</p>
                <p className="text-sm text-muted-foreground">
                  You will go to Stripe to pay {formatPrice(booking.totalPrice, booking.currency)} by card, then come
                  straight back here. Booking {booking.reference} is confirmed the moment your payment goes through.
                </p>
              </div>
              {payUrl ? (
                <Button asChild size="lg" fullWidth>
                  <a href={payUrl}>
                    <LockIcon aria-hidden />
                    Pay {formatPrice(booking.totalPrice, booking.currency)}
                  </a>
                </Button>
              ) : (
                <div className="grid gap-3 rounded-xl bg-destructive/8 p-4 text-sm text-destructive" role="alert">
                  <p>We could not open the payment page just now. You have not been charged.</p>
                  <Button asChild variant="outline" size="sm" className="justify-self-start">
                    <Link href={`/book/${booking.id}`}>
                      <RotateCwIcon aria-hidden />
                      Try again
                    </Link>
                  </Button>
                </div>
              )}
              {testMode && (
                <aside aria-label="Demo mode" className="grid gap-3 rounded-xl border border-dashed border-brass/70 bg-brass/8 px-4 py-3.5 text-sm">
                  <p className="flex items-center gap-2 font-semibold">
                    <CreditCardIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    Demo mode
                    <span className="font-normal text-muted-foreground">· no real money moves</span>
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <dl className="grid gap-0.5 text-muted-foreground">
                      <div className="flex gap-2">
                        <dt className="sr-only">Card number</dt>
                        <dd className="font-mono text-base tracking-wider text-foreground">4242 4242 4242 4242</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="sr-only">Expiry and CVC</dt>
                        <dd>Any future expiry date and any CVC</dd>
                      </div>
                    </dl>
                    <CopyButton value="4242424242424242" label="Copy the test card number" />
                  </div>
                </aside>
              )}
              <p className="text-sm text-muted-foreground">
                Need to change something?{" "}
                <Link href={rebookHref(booking)} className="font-medium text-foreground underline underline-offset-4">
                  Edit guest details
                </Link>
              </p>
            </section>
          ) : (
            <Card>
              <EmptyState
                headingLevel="h2"
                title={booking.status === "CANCELLED" ? "This booking was cancelled" : "Your hold has expired"}
                description={
                  booking.status === "CANCELLED"
                    ? "Nothing more is needed. You can book these dates again if the room is still free."
                    : "We held the room for 30 minutes, and the time ran out before payment. You have not been charged. The room may still be free."
                }
                action={
                  <Button asChild size="lg">
                    <Link href={rebookHref(booking)}>
                      <TimerOffIcon aria-hidden />
                      Check availability again
                    </Link>
                  </Button>
                }
              />
            </Card>
          )}
          <StaySummary
            hotel={booking.roomType.hotel}
            roomName={booking.roomType.name}
            checkIn={booking.checkIn}
            checkOut={booking.checkOut}
            guests={booking.guests}
            quote={quote}
          />
        </div>
      </PageContainer>
    </Section>
  );
}
