"use client";

import * as React from "react";
import Image from "next/image";
import { ExpandIcon, Loader2Icon, XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type GalleryImage = { url: string; alt: string };

type ImageGalleryProps = {
  /** Image sizes for the slides; match another layout of the same photos to share one download. */
  sizes?: string;
  images: GalleryImage[];
  /** Load the first image eagerly when the gallery is above the fold. */
  priority?: boolean;
  /** Controls the shape of the carousel, e.g. "aspect-4/3 md:aspect-16/9". */
  className?: string;
};

/** Tracks the selected slide of an Embla carousel. */
function useSelectedIndex(api: CarouselApi) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    const update = () => setIndex(api.selectedScrollSnap());
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  return index;
}

const overlayButton =
  "border-transparent bg-card/90 text-foreground shadow-xs backdrop-blur-sm hover:bg-card disabled:opacity-0";

/**
 * Photo carousel that opens a fullscreen lightbox. Swipe, drag or use the
 * arrow keys to move between photos; Escape closes the lightbox.
 */
function ImageGallery({ images, priority = false, sizes = "(min-width: 1280px) 1200px, 100vw", className }: ImageGalleryProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const index = useSelectedIndex(api);

  if (images.length === 0) return null;

  return (
    <>
      <Carousel
        setApi={setApi}
        opts={{ loop: images.length > 1 }}
        aria-label="Photos"
        className={cn("group/gallery overflow-hidden rounded-xl bg-muted", className ?? "aspect-4/3 md:aspect-16/9")}
      >
        <CarouselContent className="ml-0 h-full" wrapperClassName="h-full">
          {images.map((image, imageIndex) => (
            <CarouselItem key={image.url} className="relative h-full pl-0">
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="relative block size-full cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                aria-label={`Open photo ${imageIndex + 1} of ${images.length} in fullscreen: ${image.alt}`}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  preload={priority && imageIndex === 0}
                    fetchPriority={priority && imageIndex === 0 ? "high" : undefined}
                  sizes={sizes}
                  className="object-cover"
                />
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>

        {images.length > 1 && (
          <>
            <CarouselPrevious className={cn(overlayButton, "left-3")} />
            <CarouselNext className={cn(overlayButton, "right-3")} />
          </>
        )}

        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            className={cn(overlayButton, "pointer-events-auto")}
            onClick={() => setLightboxOpen(true)}
          >
            <ExpandIcon aria-hidden />
            View all photos
          </Button>
          <span
            className="rounded-full bg-lightbox/75 px-2.5 py-1 text-xs font-medium text-lightbox-foreground tabular-nums backdrop-blur-sm"
            aria-live="polite"
          >
            {index + 1} / {images.length}
          </span>
        </div>
      </Carousel>

      <Lightbox
        images={images}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        startIndex={index}
        onIndexChange={(next) => api?.scrollTo(next, true)}
      />
    </>
  );
}

type LightboxProps = {
  images: GalleryImage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startIndex: number;
  /** Called with the last viewed photo when the lightbox closes. */
  onIndexChange?: (index: number) => void;
};

function Lightbox({ images, open, onOpenChange, startIndex, onIndexChange }: LightboxProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const index = useSelectedIndex(api);
  const lightButton = "text-lightbox-foreground hover:bg-lightbox-foreground/15";

  function handleOpenChange(next: boolean) {
    if (!next) onIndexChange?.(index);
    onOpenChange(next);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-lightbox duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          data-slot="lightbox"
          aria-describedby={undefined}
          className="fixed inset-0 z-50 text-lightbox-foreground outline-none duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        >
          <DialogPrimitive.Title className="sr-only">Photo gallery</DialogPrimitive.Title>
          <Carousel
            setApi={setApi}
            opts={{ startIndex, loop: images.length > 1 }}
            aria-label="Photos"
            className="flex size-full flex-col"
          >
            <div className="flex h-16 shrink-0 items-center justify-between px-4">
              <p className="text-sm tabular-nums" aria-live="polite">
                {index + 1} / {images.length}
              </p>
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" className={lightButton}>
                  <XIcon className="size-5" />
                  <span className="sr-only">Close gallery</span>
                </Button>
              </DialogPrimitive.Close>
            </div>

            <div className="relative min-h-0 flex-1">
              <CarouselContent className="ml-0 h-full" wrapperClassName="h-full">
                {images.map((image) => (
                  <CarouselItem key={image.url} className="relative h-full pl-0">
                    {/* Sits behind the photo, so it shows only while loading. */}
                    <Loader2Icon
                      className="absolute inset-0 m-auto size-6 animate-spin text-lightbox-foreground/40"
                      aria-hidden
                    />
                    <Image src={image.url} alt={image.alt} fill sizes="100vw" className="object-contain" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && (
                <>
                  <CarouselPrevious
                    variant="ghost"
                    size="icon"
                    className={cn(lightButton, "left-2 bg-lightbox/60 md:left-4")}
                  />
                  <CarouselNext
                    variant="ghost"
                    size="icon"
                    className={cn(lightButton, "right-2 bg-lightbox/60 md:right-4")}
                  />
                </>
              )}
            </div>

            <p className="shrink-0 px-4 py-3 text-center text-sm text-lightbox-foreground/80">
              {images[index]?.alt}
            </p>

            <ul className="flex shrink-0 justify-start gap-2 overflow-x-auto px-4 pb-4 sm:justify-center">
              {images.map((image, imageIndex) => (
                <li key={image.url} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => api?.scrollTo(imageIndex)}
                    aria-label={`Show photo ${imageIndex + 1}`}
                    aria-current={imageIndex === index ? "true" : undefined}
                    className="relative block h-14 w-20 overflow-hidden rounded-md bg-lightbox-foreground/10 opacity-50 outline-none transition-opacity duration-150 ease-soft hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-lightbox-foreground aria-[current=true]:opacity-100 aria-[current=true]:ring-2 aria-[current=true]:ring-lightbox-foreground"
                  >
                    <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          </Carousel>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { ImageGallery, Lightbox };
export type { GalleryImage };
