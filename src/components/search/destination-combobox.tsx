"use client";

import * as React from "react";
import { GlobeIcon, MapPinIcon, SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type DestinationSuggestion = { value: string; label: string; detail: string; count: number };

type DestinationComboboxProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: DestinationSuggestion[];
  className?: string;
  inputClassName?: string;
};

const normalise = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * Free-text destination field with suggestions, following the ARIA combobox
 * pattern: arrow keys move through suggestions, Enter picks one, Escape
 * closes the list.
 */
export function DestinationCombobox({
  id,
  value,
  onChange,
  suggestions,
  className,
  inputClassName,
}: DestinationComboboxProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-list`;
  const [open, setOpen] = React.useState(false);
  const [highlighted, setHighlighted] = React.useState(-1);

  const matches = React.useMemo(() => {
    const query = normalise(value.trim());
    const list = query
      ? suggestions.filter((item) => normalise(`${item.label} ${item.detail}`).includes(query))
      : suggestions.filter((item) => item.detail !== "Country");
    return list.slice(0, 8);
  }, [suggestions, value]);

  function choose(item: DestinationSuggestion) {
    onChange(item.value);
    setOpen(false);
    setHighlighted(-1);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlighted((index) => Math.min(matches.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((index) => Math.max(-1, index - 1));
    } else if (event.key === "Enter" && open && highlighted >= 0 && matches[highlighted]) {
      event.preventDefault();
      choose(matches[highlighted]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setHighlighted(-1);
    }
  }

  const showList = open && matches.length > 0;

  return (
    <div className={cn("relative", className)}>
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
        autoComplete="off"
        placeholder="City, country or hotel"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setHighlighted(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        className={cn(
          "h-11 w-full rounded-lg border border-input bg-card pr-3.5 pl-10 text-base text-foreground outline-none placeholder:text-muted-foreground md:text-[0.9375rem]",
          "transition-[border-color,box-shadow] duration-150 ease-soft hover:border-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25",
          inputClassName,
        )}
      />
      <ul
        id={listId}
        role="listbox"
        aria-label="Destinations"
        hidden={!showList}
        className="absolute inset-x-0 top-[calc(100%+6px)] z-50 max-h-80 overflow-y-auto rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-overlay"
      >
        {matches.map((item, index) => (
          <li
            key={`${item.detail}:${item.value}`}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === highlighted}
            // Keep focus in the input so the list does not close first.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => choose(item)}
            onMouseEnter={() => setHighlighted(index)}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 aria-selected:bg-accent"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              {item.detail === "Country" ? <GlobeIcon className="size-4" aria-hidden /> : <MapPinIcon className="size-4" aria-hidden />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{item.label}</span>
              <span className="block truncate text-xs text-muted-foreground">{item.detail}</span>
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {item.count} {item.count === 1 ? "stay" : "stays"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
