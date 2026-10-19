import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeftIcon,
  BedDoubleIcon,
  CalendarPlusIcon,
  CircleCheckIcon,
  ExternalLinkIcon,
  InfoIcon,
  MailIcon,
  MapPinIcon,
  MessageSquareTextIcon,
  PhoneIcon,
  RotateCcwIcon,
  StarIcon,
  UserRoundIcon,
} from "lucide-react";

import { CancelBookingDialog } from "@/components/account/cancel-booking-dialog";
import { PrintButton } from "@/components/account/print-button";
import { Receipt } from "@/components/account/receipt";
import { ReviewForm } from "@/components/account/review-form";
import { relativeDay } from "@/components/account/trip-card";
import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { CopyButton } from "@/components/booking/copy-button";
import { PriceBreakdown } from "@/components/booking/price-breakdown";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/rating-stars";
import { getTrip, nightsOf, type TripDetail } from "@/lib/account/trips";
import { requireUser } from "@/lib/auth/guards";
import { BOOKING_CONFIG } from "@/lib/booking/config";
import { daysUntil, guestCancellation } from "@/lib/booking/policy";
import { bookingQuote } from "@/lib/booking/snapshot";
import { formatPrice, formatStayDate, pluralize } from "@/lib/format";
import { idSchema } from "@/lib/validation/account";

export const metadata: Metadata = {
  title: "Your trip",
  robots: { index: false },
};

const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const deadlineFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** "15:00 on Sat 17 Oct 2026", in hotel time. */
function formatDeadline(date: Date) {
  const parts = Object.fromEntries(deadlineFormat.formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.hour}:${parts.minute} on ${parts.weekday} ${parts.day} ${parts.month} ${parts.year}`;
}

function StatusBanner({ trip, now }: { trip: TripDetail; now: Date }) {
  const refunded = trip.payments.filter((payment) => payment.status === "REFUNDED").reduce((sum, payment) => sum + payment.amount, 0);
  const banners = {
    CONFIRMED: { tone: "success", icon: CircleCheckIcon, text: `Your stay is confirmed. Check-in is ${relativeDay(daysUntil(trip.checkIn, now)).toLowerCase()}.` },
    CHECKED_IN: { tone: "success", icon: CircleCheckIcon, text: "You are checked in. Enjoy your stay." },
    CHECKED_OUT: { tone: "neutral", icon: StarIcon, text: "We hope it was wonderful. Thank you for staying with Sarai." },
    CANCELLED: {
      tone: "neutral",
      icon: RotateCcwIcon,
      text: refunded > 0 ? `This booking is cancelled. We refunded ${formatPrice(refunded, trip.currency)} to your card.` : "This booking is cancelled. Nothing was charged.",
    },
  } as const;
  const banner = banners[trip.status as keyof typeof banners];
  if (!banner) return null;
  const Icon = banner.icon;
  return (
    <p
      className={
        banner.tone === "success"
          ? "flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success"
          : "flex items-start gap-3 rounded-xl border bg-muted/60 px-4 py-3 text-sm font-medium"
      }
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      {banner.text}
    </p>
  );
}

function Detail({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
      {sub && <dd className="text-sm text-muted-foreground">{sub}</dd>}
    </div>
  );
}

export default async function TripPage({ params }: PageProps<"/account/trips/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/account/trips/${id}`);
  if (!idSchema.safeParse(id).success) redirect("/account/trips");
  const trip = await getTrip(id, user.id);
  // Unpaid and lapsed holds are handled by the booking flow.
  if (trip.status === "PENDING" || trip.status === "EXPIRED") redirect(`/book/${trip.id}`);

  const now = new Date();
  const { hotel } = trip.roomType;
  const nights = nightsOf(trip);
  const cancellation = guestCancellation(trip, hotel.checkInTime, now);
  const calendar = ["CONFIRMED", "CHECKED_IN"].includes(trip.status);
  const directions = `https://www.google.com/maps/search/?api=1&query=${hotel.latitude},${hotel.longitude}`;

  return (
    <>
      <Receipt trip={trip} />
      <div className="grid gap-8 print:hidden">
        <Link
          href={`/account/trips${trip.status === "CHECKED_OUT" ? "?tab=past" : trip.status === "CANCELLED" ? "?tab=cancelled" : ""}`}
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors duration-150 ease-soft hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          All trips
        </Link>

        <header className="grid gap-5">
          <div className="relative aspect-16/9 overflow-hidden rounded-2xl bg-muted sm:aspect-21/9">
            <Image src={hotel.coverImageUrl} alt={hotel.coverImageAlt} fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <BookingStatusBadge status={trip.status} />
                <span className="text-sm text-muted-foreground">
                  {formatStayDate(trip.checkIn)} to {formatStayDate(trip.checkOut, true)} · {pluralize(nights, "night")}
                </span>
              </div>
              <h1 className="type-title-lg mt-2">{hotel.name}</h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPinIcon className="size-3.5" aria-hidden />
                {hotel.city}, {hotel.country}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-card py-2 pr-2 pl-4">
              <div>
                <p className="text-xs text-muted-foreground">Booking reference</p>
                <p className="font-mono font-semibold tracking-wider">{trip.reference}</p>
              </div>
              <CopyButton value={trip.reference} label="Copy booking reference" />
            </div>
          </div>
          <StatusBanner trip={trip} now={now} />
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid gap-8">
            {trip.status === "CHECKED_OUT" && (
              <section id="review" aria-labelledby="review-heading" className="scroll-mt-28 rounded-2xl border bg-card p-5 sm:p-6">
                {trip.review ? (
                  <div className="grid gap-3">
                    <h2 id="review-heading" className="type-title-md">
                      Your review
                    </h2>
                    <RatingStars value={trip.review.rating} size="lg" />
                    {trip.review.comment && <p className="leading-relaxed text-muted-foreground">“{trip.review.comment}”</p>}
                    <p className="text-sm text-muted-foreground">
                      Published {longDate.format(trip.review.createdAt)} on the{" "}
                      <Link href={`/hotels/${hotel.slug}#reviews`} className="font-medium text-foreground underline underline-offset-4">
                        {hotel.name} page
                      </Link>
                      .
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5">
                    <div>
                      <h2 id="review-heading" className="type-title-md">
                        Rate your stay
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">Reviews come only from guests who stayed, which is why travellers trust them.</p>
                    </div>
                    <ReviewForm bookingId={trip.id} hotelName={hotel.name} />
                  </div>
                )}
              </section>
            )}

            <section aria-labelledby="stay-heading" className="grid gap-5 rounded-2xl border bg-card p-5 sm:p-6">
              <h2 id="stay-heading" className="type-title-md">
                Your stay
              </h2>
              <dl className="grid grid-cols-2 gap-5">
                <Detail label="Check-in" value={formatStayDate(trip.checkIn, true)} sub={`From ${hotel.checkInTime}`} />
                <Detail label="Check-out" value={formatStayDate(trip.checkOut, true)} sub={`By ${hotel.checkOutTime}`} />
                <Detail
                  label="Room"
                  value={`${trip.roomType.name}${trip.rooms > 1 ? ` × ${trip.rooms}` : ""}`}
                  sub={`${trip.roomType.beds} · ${trip.roomType.sizeSqm} m²`}
                />
                <Detail label="Guests" value={pluralize(trip.guests, "guest")} sub={pluralize(trip.rooms, "room")} />
              </dl>
              <dl className="grid gap-3 border-t pt-5 text-sm">
                <div className="flex items-center gap-3">
                  <dt>
                    <UserRoundIcon className="size-4 text-muted-foreground" aria-hidden />
                    <span className="sr-only">Lead guest</span>
                  </dt>
                  <dd>{trip.guestName}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <dt>
                    <MailIcon className="size-4 text-muted-foreground" aria-hidden />
                    <span className="sr-only">Email</span>
                  </dt>
                  <dd className="min-w-0 truncate">{trip.guestEmail}</dd>
                </div>
                {trip.guestPhone && (
                  <div className="flex items-center gap-3">
                    <dt>
                      <PhoneIcon className="size-4 text-muted-foreground" aria-hidden />
                      <span className="sr-only">Phone</span>
                    </dt>
                    <dd>{trip.guestPhone}</dd>
                  </div>
                )}
                {trip.specialRequests && (
                  <div className="flex items-start gap-3">
                    <dt>
                      <MessageSquareTextIcon className="mt-0.5 size-4 text-muted-foreground" aria-hidden />
                      <span className="sr-only">Special requests</span>
                    </dt>
                    <dd className="text-muted-foreground">{trip.specialRequests}</dd>
                  </div>
                )}
              </dl>
            </section>

            <section aria-labelledby="location-heading" className="grid gap-4 rounded-2xl border bg-card p-5 sm:p-6">
              <h2 id="location-heading" className="type-title-md">
                Getting there
              </h2>
              <p className="flex items-start gap-3 text-sm">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                {hotel.address}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <a href={directions} target="_blank" rel="noreferrer">
                    <ExternalLinkIcon aria-hidden />
                    Get directions
                    <span className="sr-only">(opens Google Maps in a new tab)</span>
                  </a>
                </Button>
                <Button asChild variant="ghost">
                  <Link href={`/hotels/${hotel.slug}`}>
                    <BedDoubleIcon aria-hidden />
                    View hotel
                  </Link>
                </Button>
              </div>
            </section>

            {["CONFIRMED", "CHECKED_IN"].includes(trip.status) && (
              <section aria-labelledby="manage-heading" className="grid gap-4 rounded-2xl border bg-card p-5 sm:p-6">
                <h2 id="manage-heading" className="type-title-md">
                  Cancellation
                </h2>
                {cancellation.allowed ? (
                  <>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Free cancellation until <strong className="font-semibold text-foreground">{formatDeadline(cancellation.deadline)}</strong> (hotel
                      time), {BOOKING_CONFIG.cancellationHours} hours before check-in. You get a full refund.
                    </p>
                    <div>
                      <CancelBookingDialog
                        bookingId={trip.id}
                        hotelName={hotel.name}
                        refund={formatPrice(trip.totalPrice, trip.currency)}
                        deadline={formatDeadline(cancellation.deadline)}
                      />
                    </div>
                  </>
                ) : (
                  <p className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                    <InfoIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {trip.status === "CHECKED_IN"
                      ? "You are checked in, so this booking can no longer be cancelled online. Speak to the front desk about any changes."
                      : `Free cancellation closed at ${formatDeadline(cancellation.deadline)}, ${BOOKING_CONFIG.cancellationHours} hours before check-in. Contact the hotel about changes.`}
                  </p>
                )}
              </section>
            )}
          </div>

          <aside aria-labelledby="price-heading" className="grid gap-4 lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)]">
            <div className="grid gap-4 rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 id="price-heading" className="type-title-md">
                  Price details
                </h2>
                <span className="text-xs text-muted-foreground">{trip.currency}</span>
              </div>
              <PriceBreakdown quote={bookingQuote(trip)} />
              <ul className="grid gap-2 border-t pt-4 text-sm">
                {trip.payments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      {payment.status === "REFUNDED" ? (
                        <RotateCcwIcon className="size-4" aria-hidden />
                      ) : (
                        <CircleCheckIcon className="size-4 text-success" aria-hidden />
                      )}
                      {payment.status === "REFUNDED" ? `Refunded ${longDate.format(payment.updatedAt)}` : `Paid ${payment.paidAt ? longDate.format(payment.paidAt) : ""}`}
                    </span>
                    <span className="font-medium tabular-nums">{formatPrice(payment.amount, payment.currency)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <PrintButton />
              {calendar && (
                <Button asChild variant="ghost">
                  <a href={`/book/${trip.id}/calendar.ics`} download>
                    <CalendarPlusIcon aria-hidden />
                    Add to calendar
                  </a>
                </Button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
