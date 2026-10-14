"use client";

import dynamic from "next/dynamic";
import { MapIcon } from "lucide-react";

export type { MapPin } from "./leaflet-map";

/** The map, loaded only in the browser, with a placeholder while it loads. */
export const SaraiMap = dynamic(() => import("./leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center bg-muted text-muted-foreground" role="status">
      <MapIcon className="size-6 animate-pulse" aria-hidden />
      <span className="sr-only">Loading map</span>
    </div>
  ),
});
