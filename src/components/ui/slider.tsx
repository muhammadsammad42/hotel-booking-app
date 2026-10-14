"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/** A range slider. Pass one value for a single thumb, two for a range. */
function Slider({
  className,
  thumbLabels = [],
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & { thumbLabels?: string[] }) {
  const count = (props.value ?? props.defaultValue ?? [props.min ?? 0]).length;

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn("relative flex h-11 w-full touch-none items-center select-none data-disabled:opacity-50", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-muted">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
      </SliderPrimitive.Track>
      {Array.from({ length: count }, (_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          aria-label={thumbLabels[index]}
          className="block size-6 rounded-full border-2 border-primary bg-card shadow-xs outline-none transition-[box-shadow,transform] duration-150 ease-soft hover:scale-110 focus-visible:ring-4 focus-visible:ring-ring/30 active:scale-110"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
