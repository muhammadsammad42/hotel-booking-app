import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDaysIcon, UsersIcon } from "lucide-react";

import { BookingStatusBadge } from "@/components/booking/booking-status-badge";
import { PageContainer, Section } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceTag } from "@/components/ui/price-tag";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireUser } from "@/lib/auth/guards";
import { formatStayRange, pluralize } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "My trips",
};

async function getTrips(userId: string) {
  return prisma.booking.findMany({
    where: {
      userId,
      status: { not: "EXPIRED" },
      // A pending hold that has lapsed is treated as expired.
      NOT: { status: "PENDING", expiresAt: { lt: new Date() } },
    },
    orderBy: { checkIn: "asc" },
    include: {
      roomType: {
        select: {
          name: true,
          hotel: { select: { name: true, slug: true, city: true, country: true, coverImageUrl: true, coverImageAlt: true } },
        },
      },
    },
  });
}

type Trip = Awaited<ReturnType<typeof getTrips>>[number];

function TripCard({ trip }: { trip: Trip }) {
  const { hotel } = trip.roomType;
  const nights = Math.round((trip.checkOut.getTime() - trip.checkIn.getTime()) / 86_400_000);

  return (
    <Card interactive className="sm:flex-row">
      <div className="relative aspect-16/9 shrink-0 bg-muted sm:aspect-auto sm:w-56">
        <Image
          src={hotel.coverImageUrl}
          alt={hotel.coverImageAlt}
          fill
          sizes="(min-width: 640px) 224px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="type-title-md">
              <Link
                href={trip.status === "PENDING" ? `/book/${trip.id}` : `/hotels/${hotel.slug}`}
                className="outline-none after:absolute after:inset-0"
              >
                {hotel.name}
              </Link>
            </h3>
            <p className="text-sm text-muted-foreground">
              {trip.roomType.name} · {hotel.city}, {hotel.country}
            </p>
          </div>
          <BookingStatusBadge status={trip.status} />
        </div>
        <dl className="grid gap-1.5 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <dt>
              <CalendarDaysIcon className="size-4 text-muted-foreground" aria-hidden />
              <span className="sr-only">Dates</span>
            </dt>
            <dd>
              {formatStayRange(trip.checkIn, trip.checkOut)} · {pluralize(nights, "night")}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt>
              <UsersIcon className="size-4 text-muted-foreground" aria-hidden />
              <span className="sr-only">Guests</span>
            </dt>
            <dd>
              {pluralize(trip.guests, "guest")}
              {trip.rooms > 1 && ` · ${pluralize(trip.rooms, "room")}`}
            </dd>
          </div>
        </dl>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 border-t pt-3">
          <p className="font-mono text-xs text-muted-foreground">
            {trip.reference}
            {trip.status === "PENDING" && <span className="ml-2 font-sans font-semibold text-primary">Complete payment</span>}
          </p>
          <PriceTag amount={trip.totalPrice} currency={trip.currency} unit={null} size="sm" />
        </div>
      </div>
    </Card>
  );
}

function TripList({ trips, empty }: { trips: Trip[]; empty: { title: string; description: string } }) {
  if (trips.length === 0) {
    return (
      <Card>
        <EmptyState
          headingLevel="h3"
          title={empty.title}
          description={empty.description}
          action={
            <Button asChild>
              <Link href="/search">Find a stay</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <ul className="grid gap-4">
      {trips.map((trip) => (
        <li key={trip.id}>
          <TripCard trip={trip} />
        </li>
      ))}
    </ul>
  );
}

export default async function TripsPage() {
  const user = await requireUser("/account/trips");
  const trips = await getTrips(user.id);

  const upcoming = trips.filter((trip) => ["PENDING", "CONFIRMED", "CHECKED_IN"].includes(trip.status));
  const past = trips.filter((trip) => trip.status === "CHECKED_OUT").reverse();
  const cancelled = trips.filter((trip) => trip.status === "CANCELLED");

  return (
    <Section spacing="compact">
      <PageContainer width="app">
        <h1 className="type-title-lg">My trips</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everything you have booked with Sarai.</p>

        <Tabs defaultValue="upcoming" variant="segmented" className="mt-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <TripList
              trips={upcoming}
              empty={{ title: "No trips planned yet", description: "When you book a stay it will appear here." }}
            />
          </TabsContent>
          <TabsContent value="past">
            <TripList
              trips={past}
              empty={{ title: "No past stays", description: "Stays you have completed will appear here." }}
            />
          </TabsContent>
          <TabsContent value="cancelled">
            <TripList
              trips={cancelled}
              empty={{ title: "Nothing cancelled", description: "Bookings you cancel will appear here." }}
            />
          </TabsContent>
        </Tabs>
      </PageContainer>
    </Section>
  );
}
