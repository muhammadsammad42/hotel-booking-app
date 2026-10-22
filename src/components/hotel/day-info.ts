import * as React from "react";

/** A night's price and free rooms, for the hotel page calendar. */
export type DayInfo = { price: number; available: number; cheap: boolean };

export const DayInfoContext = React.createContext<(date: Date) => DayInfo | undefined>(() => undefined);

/** "$420", or "$1.1k" so long prices fit in a day cell. */
export function shortPrice(cents: number) {
  const dollars = Math.round(cents / 100);
  return dollars >= 1000 ? `$${(dollars / 1000).toFixed(1).replace(/\.0$/, "")}k` : `$${dollars}`;
}
