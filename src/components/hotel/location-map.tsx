"use client";

import { SaraiMap } from "@/components/map";

/** A single hotel on the map. */
export function LocationMap({ id, name, latitude, longitude }: { id: string; name: string; latitude: number; longitude: number }) {
  return (
    <div className="h-80 overflow-hidden rounded-2xl border bg-muted md:h-96">
      <SaraiMap pins={[{ id, name, latitude, longitude }]} zoom={13} className="size-full" />
    </div>
  );
}
