"use client";

import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CarouselApi = UseEmblaCarouselType[1];
type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];

type CarouselContextValue = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: CarouselApi;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error("useCarousel must be used within a <Carousel />");
  return context;
}

/**
 * Swipeable slides built on Embla. Left and right arrow keys move between
 * slides while focus is inside the carousel.
 */
function Carousel({
  opts,
  setApi,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  opts?: CarouselOptions;
  setApi?: (api: CarouselApi) => void;
}) {
  const [carouselRef, api] = useEmblaCarousel(opts);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  React.useEffect(() => {
    if (api) setApi?.(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    const update = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    update();
    api.on("reInit", update);
    api.on("select", update);
    return () => {
      api.off("reInit", update);
      api.off("select", update);
    };
  }, [api]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollNext();
    }
  }

  return (
    <CarouselContext.Provider
      value={{ carouselRef, api, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}
    >
      <div
        data-slot="carousel"
        role="region"
        aria-roledescription="carousel"
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({
  className,
  wrapperClassName,
  ...props
}: React.ComponentProps<"div"> & { wrapperClassName?: string }) {
  const { carouselRef } = useCarousel();

  return (
    <div ref={carouselRef} data-slot="carousel-content" className={cn("overflow-hidden", wrapperClassName)}>
      <div className={cn("-ml-4 flex", className)} {...props} />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="carousel-item"
      role="group"
      aria-roledescription="slide"
      className={cn("min-w-0 shrink-0 grow-0 basis-full pl-4", className)}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn("absolute inset-y-0 -left-12 my-auto touch-manipulation rounded-full", className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="sr-only">Previous photo</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn("absolute inset-y-0 -right-12 my-auto touch-manipulation rounded-full", className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRightIcon />
      <span className="sr-only">Next photo</span>
    </Button>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
};
