import type { Metadata } from "next";
import Link from "next/link";
import { CompassIcon } from "lucide-react";

import { NextTrip } from "@/components/account/next-trip";
import { TripCard } from "@/components/account/trip-card";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getTrips, type Trip } from "@/lib/account/trips";
import { requireUser } from "@/lib/auth/guards";
import { daysUntil, tripGroup } from "@/lib/booking/policy";

export const metadata: Metadata = {
  title: "My trips",
  robots: { index: false },
};

const TABS = ["upcoming", "past", "cancelled"] as const;

function ExploreButton() {
  return (
    <Button asChild size="lg">
      <Link href="/search">
        <CompassIcon aria-hidden />
        Explore stays
      </Link>
    </Button>
  );
}

function TripList({ trips, now, empty }: { trips: Trip[]; now: Date; empty: { title: string; description: string; action?: boolean } }) {
  if (trips.length === 0) {
    return (
      <Card>
        <EmptyState headingLevel="h2" title={empty.title} description={empty.description} action={empty.action ? <ExploreButton /> : undefined} />
      </Card>
    );
  }
  return (
    <ul className="grid gap-4">
      {trips.map((trip) => (
        <li key={trip.id}>
          <TripCard trip={trip} now={now} />
        </li>
      ))}
    </ul>
  );
}

export default async function TripsPage({ searchParams }: PageProps<"/account/trips">) {
  const user = await requireUser("/account/trips");
  const [{ tab }, trips] = await Promise.all([searchParams, getTrips(user.id)]);
  const now = new Date();

  const groups = { upcoming: [] as Trip[], past: [] as Trip[], cancelled: [] as Trip[] };
  for (const trip of trips) {
    const group = tripGroup(trip, now);
    if (group !== "hidden") groups[group].push(trip);
  }
  // Most recent first for stays that are over.
  groups.past.reverse();
  groups.cancelled.reverse();

  // A stay in progress first (unless its check-out has passed), else the next confirmed one.
  const next =
    groups.upcoming.find((trip) => trip.status === "CHECKED_IN" && daysUntil(trip.checkOut, now) >= 0) ??
    groups.upcoming.find((trip) => trip.status === "CONFIRMED");
  const initialTab = TABS.find((value) => value === tab) ?? "upcoming";
  const total = groups.upcoming.length + groups.past.length + groups.cancelled.length;

  return (
    <div className="grid grid-cols-1 gap-8">
      <header>
        <h1 className="type-title-lg">My trips</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upcoming stays, memories and receipts, all in one place.</p>
      </header>

      {total === 0 ? (
        <Card>
          <EmptyState
            headingLevel="h2"
            title="No trips yet"
            description="Overwater villas, mountain lodges, city hideaways. Your first stay is a few taps away."
            action={<ExploreButton />}
          />
        </Card>
      ) : (
        <>
          {next && <NextTrip trip={next} now={now} />}
          <AnimatedTabs
            label="Trips"
            param="tab"
            defaultValue={initialTab}
            tabs={[
              {
                value: "upcoming",
                label: "Upcoming",
                count: groups.upcoming.length,
                content: (
                  <TripList
                    trips={groups.upcoming}
                    now={now}
                    empty={{ title: "Nothing planned yet", description: "Where to next? Find a stay and it will appear here.", action: true }}
                  />
                ),
              },
              {
                value: "past",
                label: "Past",
                count: groups.past.length,
                content: (
                  <TripList
                    trips={groups.past}
                    now={now}
                    empty={{ title: "No past stays yet", description: "After you check out, your stays appear here so you can review them." }}
                  />
                ),
              },
              {
                value: "cancelled",
                label: "Cancelled",
                count: groups.cancelled.length,
                content: (
                  <TripList
                    trips={groups.cancelled}
                    now={now}
                    empty={{ title: "Nothing cancelled", description: "Bookings you cancel appear here with their refunds." }}
                  />
                ),
              },
            ]}
          />
        </>
      )}
    </div>
  );
}
