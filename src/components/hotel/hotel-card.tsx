"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon, SparklesIcon } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

import { WishlistButton } from "@/components/hotel/wishlist-button";
import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/ui/price-tag";
import { RatingStars } from "@/components/ui/rating-stars";
import type { HotelCardData } from "@/lib/catalog/hotels";
import { cn } from "@/lib/utils";

type HotelCardProps = {
  hotel: HotelCardData;
  href: string;
  saved: boolean;
  signedIn: boolean;
  /** Price wording: "From" without dates, the nightly price for the dates. */
  priceLabel?: string;
  /** Set on hover and focus, so a map can highlight the hotel. */
  onActiveChange?: (active: boolean) => void;
  active?: boolean;
  priority?: boolean;
  /** Image proportions: tall on editorial grids, wider in search results. */
  aspect?: "portrait" | "landscape";
  sizes?: string;
  /** Passed to the wishlist heart; see WishlistButton. */
  onWishlistToggle?: () => void;
};

/** A hotel in a grid or carousel: swipeable photos, wishlist heart, rating, price. */
export function HotelCard({
  hotel,
  href,
  saved,
  signedIn,
  priceLabel = "From",
  onActiveChange,
  active = false,
  priority = false,
  aspect = "portrait",
  sizes = "(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw",
  onWishlistToggle,
}: HotelCardProps) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: hotel.images.length > 1 });
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (!embla) return;
    const update = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", update);
    return () => {
      embla.off("select", update);
    };
  }, [embla]);

  const step = (direction: -1 | 1) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (direction < 0) embla?.scrollPrev();
    else embla?.scrollNext();
  };

  return (
    <article
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground",
        "transition-[box-shadow,transform,border-color] duration-200 ease-soft hover:-translate-y-0.5 hover:border-input hover:shadow-lift",
        "has-[a[data-card-link]:focus-visible]:ring-2 has-[a[data-card-link]:focus-visible]:ring-ring",
        active && "-translate-y-0.5 border-primary/60 shadow-lift",
      )}
      onMouseEnter={() => onActiveChange?.(true)}
      onMouseLeave={() => onActiveChange?.(false)}
      onFocus={() => onActiveChange?.(true)}
      onBlur={() => onActiveChange?.(false)}
    >
      <div className={cn("relative overflow-hidden bg-muted", aspect === "portrait" ? "aspect-4/5" : "aspect-4/3")}>
        <div ref={emblaRef} className="h-full overflow-hidden">
          <div className="flex h-full">
            {hotel.images.map((image, imageIndex) => (
              <div key={image.url} className="relative h-full min-w-0 shrink-0 grow-0 basis-full">
                {/* Photos link too, so a tap opens the hotel while a swipe changes photo.
                    The text link below is the one in the tab order. */}
                <Link href={href} tabIndex={-1} aria-hidden draggable={false} className="absolute inset-0">
                <Image
                  src={image.url}
                  alt={imageIndex === 0 ? image.alt : ""}
                  fill
                  sizes={sizes}
                  priority={priority && imageIndex === 0}
                  className="object-cover transition-transform duration-500 ease-soft group-hover/card:scale-[1.03]"
                />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {hotel.guestFavourite ? (
            <Badge variant="brass" className="shadow-xs">
              <SparklesIcon aria-hidden />
              Guest favourite
            </Badge>
          ) : (
            <span />
          )}
          <span className="pointer-events-auto">
            <WishlistButton
              hotelId={hotel.id}
              hotelName={hotel.name}
              initialSaved={saved}
              signedIn={signedIn}
              onToggle={onWishlistToggle}
            />
          </span>
        </div>

        {hotel.images.length > 1 && (
          <>
            <button
              type="button"
              onClick={step(-1)}
              aria-label={`Previous photo of ${hotel.name}`}
              className="absolute top-1/2 left-2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground opacity-0 shadow-xs transition-opacity duration-150 ease-soft group-hover/card:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring md:flex"
            >
              <ChevronLeftIcon className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={step(1)}
              aria-label={`Next photo of ${hotel.name}`}
              className="absolute top-1/2 right-2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground opacity-0 shadow-xs transition-opacity duration-150 ease-soft group-hover/card:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring md:flex"
            >
              <ChevronRightIcon className="size-4" aria-hidden />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden>
              {hotel.images.map((image, dot) => (
                <span
                  key={image.url}
                  className={cn(
                    "size-1.5 rounded-full bg-lightbox-foreground/60 transition-[background-color,transform] duration-200 ease-soft",
                    dot === index && "scale-125 bg-lightbox-foreground",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="relative flex flex-1 flex-col gap-2 p-5">
        <p className="type-eyebrow flex items-center gap-1.5 text-muted-foreground">
          <MapPinIcon className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {hotel.city}, {hotel.country}
          </span>
        </p>
        <h3 className="type-display-sm">
          <Link href={href} data-card-link className="outline-none after:absolute after:inset-0">
            {hotel.name}
          </Link>
        </h3>
        <p className="sr-only">{hotel.starRating}-star hotel</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-1">
          {hotel.rating ? (
            <RatingStars value={hotel.rating.average} count={hotel.rating.count} size="sm" />
          ) : (
            <span className="text-sm text-muted-foreground">New to Sarai</span>
          )}
          <PriceTag amount={hotel.fromPrice} prefix={priceLabel || undefined} size="sm" />
        </div>
      </div>
    </article>
  );
}
