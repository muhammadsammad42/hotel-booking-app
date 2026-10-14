import type { Metadata } from "next";
import Link from "next/link";
import { HeartIcon } from "lucide-react";

import { HotelCard } from "@/components/hotel/hotel-card";
import { PageContainer, Section } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth/guards";
import { getTrendingHotels } from "@/lib/catalog/hotels";
import { getWishlistIds } from "@/lib/wishlist/queries";

export const metadata: Metadata = {
  title: "Your wishlist",
};

export default async function WishlistPage() {
  const user = await requireUser("/wishlist");
  const savedIds = await getWishlistIds(user.id);
  const hotels = (await getTrendingHotels(100)).filter((hotel) => savedIds.has(hotel.id));

  return (
    <Section spacing="compact">
      <PageContainer>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="type-display-lg">Your wishlist</h1>
            <p className="mt-2 text-muted-foreground">
              {hotels.length > 0
                ? `${hotels.length} ${hotels.length === 1 ? "stay" : "stays"} saved for later.`
                : "Stays you save will appear here."}
            </p>
          </div>
        </header>

        {hotels.length === 0 ? (
          <Card className="mt-8">
            <EmptyState
              title="Nothing saved yet"
              description="Tap the heart on any stay to keep it here while you decide."
              action={
                <Button asChild>
                  <Link href="/search">
                    <HeartIcon aria-hidden />
                    Find stays to love
                  </Link>
                </Button>
              }
            />
          </Card>
        ) : (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {hotels.map((hotel) => (
              <li key={hotel.id}>
                <HotelCard hotel={hotel} href={`/hotels/${hotel.slug}`} saved signedIn />
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </Section>
  );
}
