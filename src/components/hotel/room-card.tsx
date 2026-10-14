"use client";

import * as React from "react";
import Image from "next/image";
import { BedDoubleIcon, CheckIcon, RulerIcon, UsersIcon } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

import { AmenityIcon } from "@/components/hotel/amenity-icon";
import { LowAvailabilityBadge } from "@/components/hotel/booking-card";
import { useHotelBooking } from "@/components/hotel/booking-context";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/ui/price-tag";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

export type RoomCardData = {
  id: string;
  name: string;
  description: string;
  maxGuests: number;
  beds: string;
  sizeSqm: number;
  basePrice: number;
  images: { url: string; alt: string }[];
  amenities: { name: string; iconKey: string }[];
};

function RoomPhotos({ images, name }: { images: RoomCardData["images"]; name: string }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: images.length > 1 });
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (!embla) return;
    const update = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", update);
    return () => {
      embla.off("select", update);
    };
  }, [embla]);

  return (
    <div className="relative aspect-4/3 overflow-hidden bg-muted md:aspect-auto md:h-full md:min-h-56">
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {images.map((image) => (
            <div key={image.url} className="relative h-full min-w-0 shrink-0 grow-0 basis-full">
              <Image src={image.url} alt={image.alt} fill sizes="(min-width: 768px) 320px, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {images.map((image, dot) => (
            <button
              key={image.url}
              type="button"
              onClick={() => embla?.scrollTo(dot)}
              aria-label={`Show photo ${dot + 1} of ${name}`}
              aria-current={dot === index ? "true" : undefined}
              className="flex size-6 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-lightbox-foreground"
            >
              <span
                className={cn(
                  "size-1.5 rounded-full bg-lightbox-foreground/60 transition-[background-color,transform] duration-200 ease-soft",
                  dot === index && "scale-125 bg-lightbox-foreground",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** A room type with photos, the facts that matter and a Select button. */
export function RoomCard({ room }: { room: RoomCardData }) {
  const booking = useHotelBooking();
  const selected = booking.room.id === room.id;
  const bookable = booking.rooms.find((item) => item.id === room.id);
  const stay = bookable ? booking.stayFor(bookable) : null;

  function select() {
    booking.setRoomId(room.id);
    if (!booking.checkIn) booking.setDatesOpen(true);
    else if (window.matchMedia("(min-width: 1024px)").matches) {
      document.getElementById("booking-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <article
      className={cn(
        "grid overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow] duration-200 ease-soft md:grid-cols-[18rem_minmax(0,1fr)]",
        selected && "border-primary/70 shadow-lift",
      )}
    >
      <RoomPhotos images={room.images} name={room.name} />
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div>
          <h3 className="type-display-sm">{room.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{room.description}</p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <li className="flex items-center gap-2">
            <UsersIcon className="size-4 text-muted-foreground" aria-hidden />
            Up to {pluralize(room.maxGuests, "guest")}
          </li>
          <li className="flex items-center gap-2">
            <BedDoubleIcon className="size-4 text-muted-foreground" aria-hidden />
            {room.beds}
          </li>
          <li className="flex items-center gap-2">
            <RulerIcon className="size-4 text-muted-foreground" aria-hidden />
            {room.sizeSqm} m²
          </li>
        </ul>
        <ul className="flex flex-wrap gap-2" aria-label="Room amenities">
          {room.amenities.slice(0, 5).map((amenity) => (
            <li key={amenity.name} className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs">
              <AmenityIcon iconKey={amenity.iconKey} className="size-3.5 text-muted-foreground" />
              {amenity.name}
            </li>
          ))}
          {room.amenities.length > 5 && (
            <li className="rounded-full px-1 py-1 text-xs text-muted-foreground">+{room.amenities.length - 5} more</li>
          )}
        </ul>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="grid gap-1">
            {stay ? (
              stay.bookable ? (
                <>
                  <PriceTag amount={stay.quote.averageNightly} />
                  <LowAvailabilityBadge available={stay.minAvailable} />
                </>
              ) : (
                <p className="text-sm font-medium text-warning">Not available for your dates</p>
              )
            ) : (
              <PriceTag amount={room.basePrice} prefix="From" />
            )}
          </div>
          <Button variant={selected ? "secondary" : "outline"} onClick={select} aria-pressed={selected}>
            {selected && <CheckIcon aria-hidden />}
            {selected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </article>
  );
}
