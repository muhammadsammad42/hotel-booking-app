"use client";

// Leaflet touches `window`, so this module is only ever loaded in the browser
// through next/dynamic (see ./index.tsx).
import * as React from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { formatPrice } from "@/lib/format";

export type MapPin = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Cents; shown on the pin. Omit for a plain location marker. */
  price?: number;
};

type LeafletMapProps = {
  pins: MapPin[];
  activeId?: string | null;
  onActiveChange?: (id: string | null) => void;
  onSelect?: (id: string) => void;
  /** Zoom used when there is a single pin. */
  zoom?: number;
  interactive?: boolean;
  className?: string;
};

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function pinIcon(pin: MapPin, active: boolean) {
  const label = pin.price !== undefined ? formatPrice(pin.price) : "";
  const base =
    "absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full border font-sans text-sm font-semibold tabular-nums shadow-lift transition-transform duration-150";
  const html =
    pin.price !== undefined
      ? `<span class="${base} px-3 py-1.5 ${active ? "scale-110 border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}">${label}</span>`
      : `<span class="${base} flex size-10 items-center justify-center border-primary-foreground bg-primary text-primary-foreground"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.99-5.54 10.19-7.4 11.79a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></span>`;
  return L.divIcon({ html, className: "", iconSize: [0, 0] });
}

/** Keeps every pin in view when the set of pins changes. */
function FitBounds({ pins, zoom }: { pins: MapPin[]; zoom: number }) {
  const map = useMap();
  const key = pins.map((pin) => pin.id).join(",");

  React.useEffect(() => {
    if (pins.length === 0) return;
    if (pins.length === 1) {
      map.setView([pins[0].latitude, pins[0].longitude], zoom);
      return;
    }
    map.fitBounds(L.latLngBounds(pins.map((pin) => [pin.latitude, pin.longitude])), { padding: [48, 48], maxZoom: 9 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refit only when the pins change
  }, [key, map, zoom]);

  return null;
}

export default function LeafletMap({
  pins,
  activeId = null,
  onActiveChange,
  onSelect,
  zoom = 12,
  interactive = true,
  className,
}: LeafletMapProps) {
  const first = pins[0];

  return (
    <MapContainer
      center={first ? [first.latitude, first.longitude] : [20, 0]}
      zoom={pins.length === 1 ? zoom : 2}
      scrollWheelZoom={false}
      dragging={interactive}
      zoomControl={interactive}
      worldCopyJump
      className={className}
    >
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
      <FitBounds pins={pins} zoom={zoom} />
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          position={[pin.latitude, pin.longitude]}
          icon={pinIcon(pin, pin.id === activeId)}
          zIndexOffset={pin.id === activeId ? 1000 : 0}
          title={pin.name}
          alt={pin.price !== undefined ? `${pin.name}, from ${formatPrice(pin.price)} a night` : pin.name}
          eventHandlers={{
            mouseover: () => onActiveChange?.(pin.id),
            mouseout: () => onActiveChange?.(null),
            click: () => onSelect?.(pin.id),
          }}
        />
      ))}
    </MapContainer>
  );
}
