"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";

import { AmenityIcon } from "@/components/hotel/amenity-icon";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export type AmenityOption = { id: string; name: string; iconKey: string; category: string };

const categoryLabel = (category: string) => category.charAt(0) + category.slice(1).toLowerCase();

/** Every amenity as a checkbox, grouped by category, with a filter. */
export function AmenityPicker({ options, value, onChange }: { options: AmenityOption[]; value: string[]; onChange: (ids: string[]) => void }) {
  const [filter, setFilter] = React.useState("");
  const selected = new Set(value);
  const shown = options.filter((option) => option.name.toLowerCase().includes(filter.trim().toLowerCase()));
  const groups = [...new Set(shown.map((option) => option.category))];

  function toggle(id: string, on: boolean) {
    const next = new Set(selected);
    if (on) next.add(id);
    else next.delete(id);
    onChange([...next]);
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="relative w-full sm:w-64">
          <span className="sr-only">Filter amenities</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter amenities" className="h-10 pl-10" />
        </label>
        <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
          {value.length} selected
        </p>
      </div>
      {groups.length === 0 && <p className="text-sm text-muted-foreground">No amenity matches “{filter}”.</p>}
      {groups.map((group) => (
        <fieldset key={group} className="grid gap-2">
          <legend className="type-eyebrow mb-1 text-muted-foreground">{categoryLabel(group)}</legend>
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {shown
              .filter((option) => option.category === group)
              .map((option) => (
                <label
                  key={option.id}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2.5 text-sm transition-colors duration-150 ease-soft hover:bg-accent has-[[data-state=checked]]:bg-primary/8"
                >
                  <Checkbox checked={selected.has(option.id)} onCheckedChange={(on) => toggle(option.id, on === true)} />
                  <AmenityIcon iconKey={option.iconKey} className="size-4 text-muted-foreground" />
                  {option.name}
                </label>
              ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
