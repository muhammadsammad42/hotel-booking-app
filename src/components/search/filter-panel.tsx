"use client";

import * as React from "react";
import { SlidersHorizontalIcon, StarIcon } from "lucide-react";

import { AmenityIcon } from "@/components/hotel/amenity-icon";
import { useSearchNavigation } from "@/components/search/search-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { pluralize } from "@/lib/format";
import { countActiveFilters, GUEST_RATINGS } from "@/lib/search/params";
import { cn } from "@/lib/utils";

export type FilterOptions = {
  amenities: { slug: string; name: string; iconKey: string }[];
  priceBounds: { min: number; max: number };
};

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-3 border-b pb-6 last:border-b-0">
      <legend className="type-title-sm mb-3">{title}</legend>
      {children}
    </fieldset>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color,transform] duration-150 ease-soft active:scale-95",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-card text-foreground hover:border-foreground",
      )}
    >
      {children}
    </button>
  );
}

function PriceFilter({ bounds }: { bounds: FilterOptions["priceBounds"] }) {
  const { filters, update } = useSearchNavigation();
  const floor = Math.floor(bounds.min / 10) * 10;
  const ceiling = Math.max(floor + 10, Math.ceil(bounds.max / 10) * 10);
  const [value, setValue] = React.useState<number[]>([
    filters.minPrice ?? floor,
    filters.maxPrice ?? ceiling,
  ]);

  // Follow the URL when it changes elsewhere, e.g. after "Clear all".
  const urlKey = `${filters.minPrice}-${filters.maxPrice}-${floor}-${ceiling}`;
  const [seenKey, setSeenKey] = React.useState(urlKey);
  if (seenKey !== urlKey) {
    setSeenKey(urlKey);
    setValue([filters.minPrice ?? floor, filters.maxPrice ?? ceiling]);
  }

  return (
    <FilterSection title="Price per night">
      <Slider
        min={floor}
        max={ceiling}
        step={10}
        minStepsBetweenThumbs={1}
        value={value}
        onValueChange={setValue}
        onValueCommit={([min, max]) =>
          update({ minPrice: min <= floor ? null : min, maxPrice: max >= ceiling ? null : max })
        }
        thumbLabels={["Minimum price per night", "Maximum price per night"]}
      />
      <p className="flex justify-between text-sm tabular-nums text-muted-foreground" aria-live="polite">
        <span>${value[0]}</span>
        <span>
          ${value[1]}
          {value[1] >= ceiling ? "+" : ""}
        </span>
      </p>
    </FilterSection>
  );
}

/** Every filter, for the desktop sidebar and the mobile sheet. */
export function FilterFields({ options }: { options: FilterOptions }) {
  const { filters, update } = useSearchNavigation();
  const [showAllAmenities, setShowAllAmenities] = React.useState(false);
  const amenities = showAllAmenities ? options.amenities : options.amenities.slice(0, 8);

  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((value) => value !== item) : [...list, item]);

  return (
    <div className="grid gap-6">
      {options.priceBounds.max > 0 && <PriceFilter bounds={options.priceBounds} />}

      <FilterSection title="Guest rating">
        <div className="flex flex-wrap gap-2">
          <Chip pressed={filters.rating === null} onClick={() => update({ rating: null })}>
            Any
          </Chip>
          {GUEST_RATINGS.map((rating) => (
            <Chip key={rating} pressed={filters.rating === rating} onClick={() => update({ rating })}>
              {rating.toFixed(1)}+
            </Chip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Hotel class">
        <div className="flex flex-wrap gap-2">
          {[5, 4, 3].map((stars) => (
            <Chip
              key={stars}
              pressed={filters.stars.includes(stars)}
              onClick={() => update({ stars: toggle(filters.stars, stars) })}
            >
              {stars}
              <StarIcon className="size-3.5 fill-current" aria-hidden />
              <span className="sr-only">stars</span>
            </Chip>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Amenities">
        <ul className="grid gap-1">
          {amenities.map((amenity) => (
            <li key={amenity.slug}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                <Checkbox
                  checked={filters.amenities.includes(amenity.slug)}
                  onCheckedChange={() => update({ amenities: toggle(filters.amenities, amenity.slug) })}
                />
                <AmenityIcon iconKey={amenity.iconKey} className="size-4 text-muted-foreground" />
                {amenity.name}
              </label>
            </li>
          ))}
        </ul>
        {options.amenities.length > 8 && (
          <Button variant="link" className="justify-self-start" onClick={() => setShowAllAmenities((value) => !value)}>
            {showAllAmenities ? "Show fewer" : `Show all ${options.amenities.length}`}
          </Button>
        )}
      </FilterSection>
    </div>
  );
}

function ClearFilters() {
  const { filters, update } = useSearchNavigation();
  if (countActiveFilters(filters) === 0) return null;
  return (
    <Button
      variant="link"
      onClick={() => update({ minPrice: null, maxPrice: null, amenities: [], stars: [], rating: null })}
    >
      Clear all
    </Button>
  );
}

/** Sticky filter column on desktop. */
export function FilterSidebar({ options }: { options: FilterOptions }) {
  return (
    <aside aria-label="Filters" className="hidden lg:block">
      <div className="sticky top-[calc(var(--spacing-header)+1.5rem)] grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="type-title-md">Filters</h2>
          <ClearFilters />
        </div>
        <FilterFields options={options} />
      </div>
    </aside>
  );
}

/** Filters in a bottom sheet on mobile; results update behind it. */
export function FilterSheet({ options, total }: { options: FilterOptions; total: number }) {
  const { filters, pending } = useSearchNavigation();
  const active = countActiveFilters(filters);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontalIcon aria-hidden />
          Filters
          {active > 0 && (
            <Badge variant="primary" className="ml-0.5 px-1.5">
              {active}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Results update as you choose.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <FilterFields options={options} />
        </SheetBody>
        <SheetFooter className="flex-row items-center justify-between">
          <ClearFilters />
          <SheetClose asChild>
            <Button size="lg" loading={pending} className="ml-auto">
              Show {pluralize(total, "stay")}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
