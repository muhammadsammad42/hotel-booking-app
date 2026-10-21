"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

type Option = { id: string; name: string; isActive: boolean; roomTypes: { id: string; name: string; isActive: boolean }[] };

/** Chooses a room type (grouped by hotel) and keeps it in ?room=. */
export function RoomTypePicker({ hotels, value }: { hotels: Option[]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <Select
      value={value}
      onValueChange={(room) => {
        const next = new URLSearchParams(params.toString());
        next.set("room", room);
        router.push(`${pathname}?${next}`, { scroll: false });
      }}
    >
      <SelectTrigger aria-label="Room type" className="w-full sm:w-96">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-96">
        {hotels.map((hotel) => (
          <SelectGroup key={hotel.id}>
            <SelectLabel>
              {hotel.name}
              {!hotel.isActive && " (hidden)"}
            </SelectLabel>
            {hotel.roomTypes.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name}
                {!room.isActive && " (hidden)"}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
