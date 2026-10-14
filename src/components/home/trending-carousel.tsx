"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

import { HotelCard } from "@/components/hotel/hotel-card";
import { Button } from "@/components/ui/button";
import type { HotelCardData } from "@/lib/catalog/hotels";

type TrendingCarouselProps = {
  hotels: HotelCardData[];
  savedIds: string[];
  signedIn: boolean;
  labelledBy: string;
};

/** A swipeable row of hotel cards with arrow buttons on larger screens. */
export function TrendingCarousel({ hotels, savedIds, signedIn, labelledBy }: TrendingCarouselProps) {
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  const [edges, setEdges] = React.useState({ prev: false, next: true });
  const saved = new Set(savedIds);

  React.useEffect(() => {
    if (!embla) return;
    const update = () => setEdges({ prev: embla.canScrollPrev(), next: embla.canScrollNext() });
    update();
    embla.on("select", update);
    embla.on("reInit", update);
    return () => {
      embla.off("select", update);
      embla.off("reInit", update);
    };
  }, [embla]);

  return (
    <div role="region" aria-roledescription="carousel" aria-labelledby={labelledBy} className="relative">
      <div className="absolute -top-16 right-0 hidden gap-2 md:flex">
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => embla?.scrollPrev()} disabled={!edges.prev}>
          <ChevronLeftIcon aria-hidden />
          <span className="sr-only">Previous stays</span>
        </Button>
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => embla?.scrollNext()} disabled={!edges.next}>
          <ChevronRightIcon aria-hidden />
          <span className="sr-only">More stays</span>
        </Button>
      </div>
      <div ref={emblaRef} className="-mx-gutter overflow-hidden px-gutter">
        <ul className="-ml-5 flex">
          {hotels.map((hotel) => (
            <li
              key={hotel.id}
              className="min-w-0 shrink-0 grow-0 basis-[82%] pb-2 pl-5 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              role="group"
              aria-roledescription="slide"
            >
              <HotelCard
                hotel={hotel}
                href={`/hotels/${hotel.slug}`}
                saved={saved.has(hotel.id)}
                signedIn={signedIn}
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 82vw"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
