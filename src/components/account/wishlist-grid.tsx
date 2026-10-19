"use client";

import * as React from "react";
import Link from "next/link";
import { HeartIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { toast } from "sonner";

import { HotelCard } from "@/components/hotel/hotel-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { HotelCardData } from "@/lib/catalog/hotels";
import { duration, ease } from "@/lib/motion";
import { setWishlisted } from "@/lib/wishlist/actions";

/**
 * Saved stays. Removing one slides it out at once and offers Undo, which
 * puts it back in the same place. The server is updated in the background.
 */
export function WishlistGrid({ initialHotels }: { initialHotels: HotelCardData[] }) {
  const [hotels, setHotels] = React.useState(initialHotels);

  function restore(hotel: HotelCardData, index: number) {
    setHotels((current) => {
      if (current.some((item) => item.id === hotel.id)) return current;
      const next = [...current];
      next.splice(Math.min(index, next.length), 0, hotel);
      return next;
    });
  }

  async function undo(hotel: HotelCardData, index: number) {
    restore(hotel, index);
    const result = await setWishlisted({ hotelId: hotel.id, saved: true });
    if (!result.ok) {
      setHotels((current) => current.filter((item) => item.id !== hotel.id));
      toast.error("We could not put it back", { description: "Please save it again from the hotel page." });
    }
  }

  async function remove(hotel: HotelCardData) {
    const index = hotels.findIndex((item) => item.id === hotel.id);
    setHotels((current) => current.filter((item) => item.id !== hotel.id));
    const result = await setWishlisted({ hotelId: hotel.id, saved: false });
    if (!result.ok) {
      restore(hotel, index);
      toast.error("We could not remove it", { description: "Please try again." });
      return;
    }
    toast("Removed from your wishlist", {
      description: hotel.name,
      action: { label: "Undo", onClick: () => void undo(hotel, index) },
    });
  }

  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {hotels.length > 0 ? `${hotels.length} ${hotels.length === 1 ? "stay" : "stays"} saved for later.` : "Nothing saved right now."}
      </p>
      <AnimatePresence mode="popLayout" initial={false}>
        {hotels.length === 0 ? (
          <m.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: duration.base, ease: ease.soft }}>
            <Card>
              <EmptyState
                title="Nothing saved yet"
                description="Tap the heart on any stay to keep it here while you decide."
                action={
                  <Button asChild size="lg">
                    <Link href="/search">
                      <HeartIcon aria-hidden />
                      Find stays to love
                    </Link>
                  </Button>
                }
              />
            </Card>
          </m.div>
        ) : (
          <m.ul key="grid" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {hotels.map((hotel) => (
                <m.li
                  key={hotel.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: duration.base, ease: ease.soft }}
                >
                  <HotelCard
                    hotel={hotel}
                    href={`/hotels/${hotel.slug}`}
                    saved
                    signedIn
                    sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                    onWishlistToggle={() => void remove(hotel)}
                  />
                </m.li>
              ))}
            </AnimatePresence>
          </m.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
