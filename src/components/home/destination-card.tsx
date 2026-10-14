import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import type { Destination } from "@/lib/catalog/hotels";
import { formatPrice } from "@/lib/format";
import { searchHref } from "@/lib/search/params";
import { cn } from "@/lib/utils";

/** A photo card for a destination; the caption lifts and the photo zooms on hover. */
export function DestinationCard({
  destination,
  large = false,
  className,
}: {
  destination: Destination;
  large?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={searchHref({ destination: destination.name })}
      className={cn(
        "group relative isolate flex min-h-64 overflow-hidden rounded-2xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Image
        src={destination.image.url}
        alt=""
        fill
        sizes={large ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"}
        className="-z-10 object-cover transition-transform duration-700 ease-soft group-hover:scale-105"
      />
      <span className="absolute inset-0 -z-10 bg-linear-to-t from-lightbox/80 via-lightbox/15 to-transparent" aria-hidden />
      <span className="mt-auto flex w-full items-end justify-between gap-3 p-5 text-lightbox-foreground transition-transform duration-500 ease-soft group-hover:-translate-y-1 sm:p-6">
        <span>
          <span className="type-eyebrow block text-lightbox-foreground/75">{destination.country}</span>
          <span className={cn("mt-1.5 block", large ? "type-display-lg" : "type-display-md")}>{destination.name}</span>
          <span className="mt-1 block text-sm text-lightbox-foreground/85">
            {destination.stays} {destination.stays === 1 ? "stay" : "stays"} · from {formatPrice(destination.fromPrice)} a night
          </span>
        </span>
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-lightbox-foreground/15 backdrop-blur-sm transition-[background-color,transform] duration-300 ease-soft group-hover:rotate-45 group-hover:bg-primary"
          aria-hidden
        >
          <ArrowUpRightIcon className="size-5" />
        </span>
      </span>
    </Link>
  );
}
