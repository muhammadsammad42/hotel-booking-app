"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { HotelCard } from "@/components/hotel/hotel-card";
import { Button } from "@/components/ui/button";
import type { HotelCardData } from "@/lib/catalog/hotels";

type TrendingCarouselProps = {
  hotels: HotelCardData[];
  savedIds: string[];
  signedIn: boolean;
  labelledBy: string;
};

/**
 * A swipeable row of hotel cards with arrow buttons on larger screens. It is
 * native scrolling with scroll snap, so it costs nothing to start and swipes
 * feel like the platform.
 */
export function TrendingCarousel({ hotels, savedIds, signedIn, labelledBy }: TrendingCarouselProps) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [edges, setEdges] = React.useState({ prev: false, next: true });
  const saved = new Set(savedIds);

  const update = React.useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    setEdges({ prev: list.scrollLeft > 4, next: list.scrollLeft + list.clientWidth < list.scrollWidth - 4 });
  }, []);

  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => observer.disconnect();
  }, [update]);

  function scroll(direction: -1 | 1) {
    const list = listRef.current;
    if (!list) return;
    const card = list.querySelector("[role=group]");
    const step = card ? card.getBoundingClientRect().width : list.clientWidth;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollBy({ left: direction * step, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div role="region" aria-roledescription="carousel" aria-labelledby={labelledBy} className="relative">
      <div className="absolute -top-16 right-0 hidden gap-2 md:flex">
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => scroll(-1)} disabled={!edges.prev}>
          <ChevronLeftIcon aria-hidden />
          <span className="sr-only">Previous stays</span>
        </Button>
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => scroll(1)} disabled={!edges.next}>
          <ChevronRightIcon aria-hidden />
          <span className="sr-only">More stays</span>
        </Button>
      </div>
      <div
        ref={listRef}
        onScroll={update}
        className="-mx-gutter -mt-2 flex snap-x snap-mandatory scroll-px-gutter overflow-x-auto overscroll-x-contain px-gutter pt-2 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {hotels.map((hotel, index) => (
          <div
            key={hotel.id}
            className="min-w-0 shrink-0 grow-0 basis-[82%] snap-start pr-5 last:pr-0 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${hotels.length}`}
          >
            <HotelCard
              hotel={hotel}
              href={`/hotels/${hotel.slug}`}
              saved={saved.has(hotel.id)}
              signedIn={signedIn}
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 82vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
