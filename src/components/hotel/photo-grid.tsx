"use client";

import * as React from "react";
import Image from "next/image";
import { Grid2x2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ImageGallery, Lightbox, type GalleryImage } from "@/components/ui/image-gallery";
import { cn } from "@/lib/utils";

/**
 * Editorial photo grid on tablet and desktop (one large photo, four small),
 * a swipeable gallery on phones. Every photo opens the fullscreen lightbox.
 */
// The phone gallery and the desktop grid show the same first photo. With the
// same sizes, the browser picks the same file for both and downloads it once.
const LEAD_SIZES = "(min-width: 1280px) 640px, (min-width: 768px) 50vw, 100vw";

export function PhotoGrid({ images, hotelName }: { images: GalleryImage[]; hotelName: string }) {
  const [open, setOpen] = React.useState(false);
  const [start, setStart] = React.useState(0);
  const tiles = images.slice(0, 5);

  function show(index: number) {
    setStart(index);
    setOpen(true);
  }

  return (
    <>
      <div className="md:hidden">
        <ImageGallery images={images} priority sizes={LEAD_SIZES} className="aspect-4/3" />
      </div>

      <div className="relative hidden h-[min(60vh,32rem)] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl md:grid">
        {tiles.map((image, index) => (
          <button
            key={image.url}
            type="button"
            onClick={() => show(index)}
            aria-label={`Open photo ${index + 1} of ${images.length} of ${hotelName}: ${image.alt}`}
            className={cn(
              "group relative overflow-hidden bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
              index === 0 && "col-span-2 row-span-2",
            )}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              preload={index === 0}
              fetchPriority={index === 0 ? "high" : undefined}
              sizes={index === 0 ? LEAD_SIZES : "(min-width: 1280px) 320px, 25vw"}
              className="object-cover transition-[transform,filter] duration-500 ease-soft group-hover:scale-[1.03] group-hover:brightness-95"
            />
          </button>
        ))}
        <Button variant="outline" size="sm" className="absolute right-4 bottom-4 bg-card/95 shadow-xs" onClick={() => show(0)}>
          <Grid2x2Icon aria-hidden />
          Show all {images.length} photos
        </Button>
      </div>

      <Lightbox images={images} open={open} onOpenChange={setOpen} startIndex={start} />
    </>
  );
}
