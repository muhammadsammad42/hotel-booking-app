"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListIcon, MapIcon, RotateCcwIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

import Image from "next/image";

import { HotelCard } from "@/components/hotel/hotel-card";
import { SaraiMap, type MapPin } from "@/components/map";
import { Pagination } from "@/components/search/results-toolbar";
import { useSearchNavigation } from "@/components/search/search-navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceTag } from "@/components/ui/price-tag";
import { RatingStars } from "@/components/ui/rating-stars";
import type { HotelCardData } from "@/lib/catalog/hotels";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { duration, ease } from "@/lib/motion";
import { stayQuery } from "@/lib/search/params";
import { cn } from "@/lib/utils";

type SearchResultsProps = {
  hotels: HotelCardData[];
  page: number;
  pageCount: number;
  savedIds: string[];
  signedIn: boolean;
  priceLabel: string;
};

/** Result cards and the map, which highlight each other on hover. */
export function SearchResults({ hotels, page, pageCount, savedIds, signedIn, priceLabel }: SearchResultsProps) {
  const router = useRouter();
  const { filters, pending, update } = useSearchNavigation();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [view, setView] = React.useState<"list" | "map">("list");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const query = stayQuery(filters);
  const saved = new Set(savedIds);
  const hrefFor = (hotel: HotelCardData) => `/hotels/${hotel.slug}${query}`;

  const pins: MapPin[] = hotels.map((hotel) => ({
    id: hotel.id,
    name: hotel.name,
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    price: hotel.fromPrice,
  }));
  const selected = hotels.find((hotel) => hotel.id === activeId);

  if (hotels.length === 0) {
    return (
      <Card className="lg:col-span-2">
        <EmptyState
          headingLevel="h2"
          title="No stays match those filters"
          description="Try fewer filters, a wider price range or another destination."
          action={
            <>
              <Button
                onClick={() => update({ minPrice: null, maxPrice: null, amenities: [], stars: [], rating: null })}
              >
                <RotateCcwIcon aria-hidden />
                Reset filters
              </Button>
              <Button asChild variant="outline">
                <Link href="/search">See all stays</Link>
              </Button>
            </>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <div className={cn("min-w-0", view === "map" && "hidden lg:block")}>
        <m.ul
          key={`${page}-${hotels.map((hotel) => hotel.id).join()}`}
          className={cn(
            "grid gap-5 transition-opacity duration-200 ease-soft sm:grid-cols-2",
            pending && "pointer-events-none opacity-50",
          )}
          initial="hidden"
          animate="shown"
          variants={{ shown: { transition: { staggerChildren: 0.05 } } }}
          aria-busy={pending}
        >
          {hotels.map((hotel, index) => (
            <m.li
              key={hotel.id}
              variants={{ hidden: { opacity: 0, y: 12 }, shown: { opacity: 1, y: 0 } }}
              transition={{ duration: duration.base, ease: ease.soft }}
            >
              <HotelCard
                hotel={hotel}
                href={hrefFor(hotel)}
                saved={saved.has(hotel.id)}
                signedIn={signedIn}
                priceLabel={priceLabel}
                aspect="landscape"
                priority={index < 2}
                sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
                active={hotel.id === activeId}
                onActiveChange={(active) => setActiveId(active ? hotel.id : null)}
              />
            </m.li>
          ))}
        </m.ul>
        <Pagination page={page} pageCount={pageCount} />
      </div>

      <div
        className={cn(
          "relative overflow-hidden bg-muted lg:rounded-2xl lg:border",
          "lg:sticky lg:top-[calc(var(--spacing-header)+1.5rem)] lg:block lg:h-[calc(100dvh-var(--spacing-header)-3rem)]",
          // On phones the map fills the screen below the header.
          view === "map" ? "max-lg:fixed max-lg:inset-x-0 max-lg:top-header max-lg:bottom-0 max-lg:z-20" : "hidden",
        )}
      >
        {/* Leaflet needs a visible container to size itself, so the map mounts
            only when it is on screen. */}
        {(isDesktop || view === "map") && (
        <SaraiMap
          pins={pins}
          activeId={activeId}
          onActiveChange={setActiveId}
          onSelect={(id) => {
            const hotel = hotels.find((item) => item.id === id);
            if (!hotel) return;
            // On a phone the first tap previews the hotel; on desktop it opens it.
            if (window.matchMedia("(min-width: 1024px)").matches || activeId === id) router.push(hrefFor(hotel));
            else setActiveId(id);
          }}
          className="size-full"
        />
        )}
        <AnimatePresence>
          {view === "map" && selected && (
            <m.div
              key={selected.id}
              className="absolute inset-x-3 bottom-20 z-[500] lg:hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: duration.base, ease: ease.soft }}
            >
              <MapPreview hotel={selected} href={hrefFor(selected)} priceLabel={priceLabel} />
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center lg:hidden">
        <Button
          variant="secondary"
          className="pointer-events-auto rounded-full px-5 shadow-overlay"
          onClick={() => {
            setActiveId(null);
            setView((current) => (current === "list" ? "map" : "list"));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          {view === "list" ? <MapIcon aria-hidden /> : <ListIcon aria-hidden />}
          {view === "list" ? "Show map" : "Show list"}
        </Button>
      </div>
    </>
  );
}

/** Compact card shown over the map on phones when a pin is tapped. */
function MapPreview({ hotel, href, priceLabel }: { hotel: HotelCardData; href: string; priceLabel: string }) {
  return (
    <Link
      href={href}
      className="flex gap-3 overflow-hidden rounded-2xl border bg-card p-2.5 shadow-overlay outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
        {hotel.images[0] && <Image src={hotel.images[0].url} alt="" fill sizes="96px" className="object-cover" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-between py-0.5 pr-1">
        <span>
          <span className="type-eyebrow block truncate text-muted-foreground">{hotel.city}</span>
          <span className="type-display-sm mt-0.5 block truncate">{hotel.name}</span>
        </span>
        <span className="flex items-center justify-between gap-2">
          {hotel.rating ? <RatingStars value={hotel.rating.average} size="sm" /> : <span />}
          <PriceTag amount={hotel.fromPrice} prefix={priceLabel} size="sm" />
        </span>
      </span>
    </Link>
  );
}
