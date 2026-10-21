"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALL = "all";

/** Narrows a page to one hotel, kept in ?hotel=. */
export function HotelFilter({ hotels, value }: { hotels: { id: string; name: string }[]; value?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <Select
      value={value ?? ALL}
      onValueChange={(hotel) => {
        const next = new URLSearchParams(params.toString());
        if (hotel === ALL) next.delete("hotel");
        else next.set("hotel", hotel);
        router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
      }}
    >
      <SelectTrigger aria-label="Hotel" className="w-full sm:w-72">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All live hotels</SelectItem>
        {hotels.map((hotel) => (
          <SelectItem key={hotel.id} value={hotel.id}>
            {hotel.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
