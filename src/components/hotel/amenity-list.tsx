"use client";

import { AmenityIcon } from "@/components/hotel/amenity-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Amenity = { name: string; iconKey: string };

function AmenityGrid({ amenities }: { amenities: Amenity[] }) {
  return (
    <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {amenities.map((amenity) => (
        <li key={amenity.name} className="flex items-center gap-3">
          <AmenityIcon iconKey={amenity.iconKey} className="text-muted-foreground" />
          {amenity.name}
        </li>
      ))}
    </ul>
  );
}

/** The first ten amenities, with the rest in a dialog. */
export function AmenityList({ amenities, hotelName }: { amenities: Amenity[]; hotelName: string }) {
  const visible = amenities.slice(0, 10);

  return (
    <div className="grid gap-6">
      <AmenityGrid amenities={visible} />
      {amenities.length > visible.length && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="justify-self-start">
              Show all {amenities.length} amenities
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>What this place offers</DialogTitle>
              <DialogDescription>Everything included at {hotelName}.</DialogDescription>
            </DialogHeader>
            <AmenityGrid amenities={amenities} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
