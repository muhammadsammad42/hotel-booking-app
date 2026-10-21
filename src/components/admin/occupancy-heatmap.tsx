"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type HeatmapRow = {
  id: string;
  name: string;
  hotel: string;
  inventory: number;
  /** Per night: rooms booked and blocked. */
  nights: { date: string; booked: number; blocked: number }[];
};

// One hue, light to dark: the share of rooms taken that night.
const STEPS = [
  { max: 0, className: "bg-muted", label: "Empty" },
  { max: 0.25, className: "bg-primary/15", label: "Up to 25%" },
  { max: 0.5, className: "bg-primary/35", label: "Up to 50%" },
  { max: 0.75, className: "bg-primary/60", label: "Up to 75%" },
  { max: 0.999, className: "bg-primary/85", label: "Up to 99%" },
  { max: 1, className: "bg-primary", label: "Full" },
];

const stepFor = (share: number) => STEPS.find((step) => share <= step.max) ?? STEPS.at(-1)!;
const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const fmt = (iso: string) => dayLabel.format(new Date(`${iso}T00:00:00Z`)).replace(",", "");

/** Occupancy per room type and night, coloured from empty to full, with a hover readout. */
export function OccupancyHeatmap({ rows, dates, today }: { rows: HeatmapRow[]; dates: string[]; today: string }) {
  const [hover, setHover] = React.useState<{ row: HeatmapRow; night: HeatmapRow["nights"][number] } | null>(null);
  const hotels = [...new Set(rows.map((row) => row.hotel))];

  return (
    <div className="grid gap-4">
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm" aria-live="polite">
        {hover ? (
          <p>
            <span className="font-semibold">{fmt(hover.night.date)}</span>
            <span className="text-muted-foreground"> · {hover.row.hotel} · {hover.row.name}: </span>
            <span className="tabular-nums">
              {hover.night.booked} of {hover.row.inventory} booked
              {hover.night.blocked > 0 && `, ${hover.night.blocked} blocked`}
            </span>
          </p>
        ) : (
          <p className="text-muted-foreground">Point at a cell to see the rooms booked that night.</p>
        )}
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground" aria-label="Legend">
          {STEPS.map((step) => (
            <li key={step.label} className="flex items-center gap-1.5">
              <span className={cn("size-3 rounded-sm", step.className)} aria-hidden />
              {step.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative overflow-x-auto rounded-xl border bg-card" onMouseLeave={() => setHover(null)}>
        <table className="border-separate border-spacing-0 text-xs">
          <caption className="sr-only">Share of rooms booked or blocked per room type and night</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 min-w-48 border-b bg-card px-4 py-2 text-left font-medium text-muted-foreground">
                Room type
              </th>
              {dates.map((date) => {
                const day = new Date(`${date}T00:00:00Z`);
                const weekend = day.getUTCDay() === 5 || day.getUTCDay() === 6;
                return (
                  <th key={date} scope="col" className={cn("border-b px-0.5 py-2 text-center font-medium", weekend ? "text-foreground" : "text-muted-foreground")}>
                    <span className="block text-xs leading-none" aria-hidden>
                      {fmt(date).slice(0, 2)}
                    </span>
                    <span className={cn("mt-1 inline-flex size-6 items-center justify-center rounded-full tabular-nums", date === today && "bg-foreground text-background")}>
                      {day.getUTCDate()}
                    </span>
                    <span className="sr-only">{fmt(date)}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          {hotels.map((hotel) => (
            <tbody key={hotel}>
              <tr>
                <th colSpan={dates.length + 1} scope="colgroup" className="sticky left-0 bg-muted/50 px-4 py-1.5 text-left text-xs font-semibold">
                  {hotel}
                </th>
              </tr>
              {rows
                .filter((row) => row.hotel === hotel)
                .map((row) => (
                  <tr key={row.id}>
                    <th scope="row" className="sticky left-0 z-10 max-w-56 truncate border-b bg-card px-4 py-1 text-left font-normal">
                      {row.name}
                      <span className="ml-1 text-muted-foreground">({row.inventory})</span>
                    </th>
                    {row.nights.map((night) => {
                      const share = row.inventory ? Math.min(1, (night.booked + night.blocked) / row.inventory) : 1;
                      return (
                        <td key={night.date} className="border-b px-0.5 py-1" onMouseEnter={() => setHover({ row, night })}>
                          <span
                            className={cn(
                              "block size-6 rounded-sm transition-transform duration-150 ease-soft hover:scale-110",
                              stepFor(share).className,
                              night.blocked > 0 && "ring-1 ring-warning ring-inset",
                            )}
                          >
                            <span className="sr-only">
                              {Math.round(share * 100)}%{night.blocked ? `, ${night.blocked} blocked` : ""}
                            </span>
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          ))}
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Cells outlined in amber have rooms blocked. Numbers in brackets are the rooms of each type.</p>
    </div>
  );
}
