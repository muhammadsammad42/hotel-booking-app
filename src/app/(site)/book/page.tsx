import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, CalendarX2Icon } from "lucide-react";

import { GuestDetailsForm } from "@/components/booking/guest-details-form";
import { BookingSteps, StaySummary } from "@/components/booking/stay-summary";
import { PageContainer, Section } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/guards";
import { getRoomStays } from "@/lib/booking/data";
import { STAY_ERROR_MESSAGES, todayIso, toUtcDate, validateStay } from "@/lib/booking/stay";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { stayRequestSchema } from "@/lib/validation/booking";

export const metadata: Metadata = {
  title: "Review and book",
  robots: { index: false },
};

function Problem({ title, description, href, action }: { title: string; description: string; href: string; action: string }) {
  return (
    <Section spacing="compact">
      <PageContainer width="app">
        <Card>
          <EmptyState
            headingLevel="h1"
            title={title}
            description={description}
            action={
              <Button asChild>
                <Link href={href}>{action}</Link>
              </Button>
            }
          />
        </Card>
      </PageContainer>
    </Section>
  );
}

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const raw = await searchParams;
  const query = new URLSearchParams(
    Object.entries(raw).flatMap(([key, value]) => (typeof value === "string" ? [[key, value]] : [])),
  ).toString();
  const user = await requireUser(`/book?${query}`);

  const parsed = stayRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return (
      <Problem
        title="Choose a room and dates first"
        description="This booking link is missing some details. Start from a hotel page to pick your room and dates."
        href="/search"
        action="Find a stay"
      />
    );
  }
  const request = parsed.data;

  const room = await prisma.roomType.findFirst({
    where: { id: request.room, isActive: true, hotel: { slug: request.hotel, isActive: true } },
    include: {
      hotel: { select: { name: true, slug: true, city: true, country: true, coverImageUrl: true, coverImageAlt: true } },
    },
  });
  if (!room) {
    return (
      <Problem
        title="This room is no longer available"
        description="It may have been removed from Sarai. Have a look at other stays."
        href="/search"
        action="Find a stay"
      />
    );
  }

  const hotelHref = `/hotels/${room.hotel.slug}?${new URLSearchParams({
    room: room.id,
    checkIn: request.checkIn,
    checkOut: request.checkOut,
    guests: String(request.guests),
  })}`;

  const stay = validateStay(request.checkIn, request.checkOut, todayIso());
  if (!stay.ok) {
    return (
      <Problem
        title="Those dates cannot be booked"
        description={STAY_ERROR_MESSAGES[stay.error]}
        href={`/hotels/${room.hotel.slug}`}
        action="Choose new dates"
      />
    );
  }

  const rooms = Math.max(request.rooms, Math.ceil(request.guests / room.maxGuests));
  const result = (await getRoomStays([room], { checkIn: stay.checkIn, checkOut: stay.checkOut, rooms })).get(room.id)!;

  // Prefill from the account and, for the phone, the guest's last booking.
  const lastBooking = await prisma.booking.findFirst({
    where: { userId: user.id, guestPhone: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { guestPhone: true },
  });

  return (
    <Section spacing="compact">
      <PageContainer width="app">
        <Link
          href={hotelHref}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors duration-150 ease-soft hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" aria-hidden />
          Back to {room.hotel.name}
        </Link>
        <div className="mt-4 grid gap-6">
          <BookingSteps current={0} />
          <h1 className="type-title-lg">Review and book</h1>
        </div>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid gap-6">
            {!result.availability.bookable && (
              <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">
                <CalendarX2Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  {room.name} has just sold out for some of these nights.{" "}
                  <Link href={hotelHref} className="font-semibold underline underline-offset-4">
                    Choose other dates
                  </Link>
                </span>
              </p>
            )}
            <section aria-labelledby="guest-heading" className="rounded-2xl border bg-card p-5 sm:p-6">
              <h2 id="guest-heading" className="type-title-md">
                Who is staying?
              </h2>
              <p className="mt-1 mb-6 text-sm text-muted-foreground">
                Signed in as {user.email}. These details are shared with the hotel.
              </p>
              <GuestDetailsForm
                stay={{ ...request, checkIn: stay.checkIn, checkOut: stay.checkOut, rooms }}
                initial={{
                  name: user.name ?? "",
                  email: user.email ?? "",
                  phone: lastBooking?.guestPhone ?? "",
                  specialRequests: "",
                }}
                backHref={hotelHref}
                total={formatPrice(result.quote.total)}
              />
            </section>
          </div>
          <StaySummary
            className="order-first lg:order-last"
            hotel={room.hotel}
            roomName={room.name}
            checkIn={toUtcDate(stay.checkIn)}
            checkOut={toUtcDate(stay.checkOut)}
            guests={request.guests}
            quote={result.quote}
          />
        </div>
      </PageContainer>
    </Section>
  );
}
