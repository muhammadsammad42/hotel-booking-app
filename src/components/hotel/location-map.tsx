"use client";

import { MapIcon } from "lucide-react";

import { SaraiMap } from "@/components/map";
import { LazyMount } from "@/components/ui/lazy-mount";

/** A single hotel on the map. The map code loads only as the guest scrolls near it. */
export function LocationMap({ id, name, latitude, longitude }: { id: string; name: string; latitude: number; longitude: number }) {
  return (
    <LazyMount
      className="h-80 overflow-hidden rounded-2xl border bg-muted md:h-96"
      fallback={
        <div className="flex size-full items-center justify-center text-muted-foreground">
          <MapIcon className="size-6" aria-hidden />
          <span className="sr-only">Map of {name}</span>
        </div>
      }
    >
      <SaraiMap pins={[{ id, name, latitude, longitude }]} zoom={13} className="size-full" />
    </LazyMount>
  );
}
