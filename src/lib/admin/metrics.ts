// Pure hotel metrics for the admin dashboard. All dates are midnight UTC.
const DAY = 86_400_000;

export type StayRow = {
  checkIn: Date;
  checkOut: Date;
  rooms: number;
  /** Room revenue before taxes and fees, in cents. */
  subtotal: number;
};

export type Range = { from: Date; to: Date };

/** First day of the month containing `date`, plus `offset` months. */
export function monthStart(date: Date, offset = 0) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));
}

export function daysIn(range: Range) {
  return Math.round((range.to.getTime() - range.from.getTime()) / DAY);
}

/** Nights of a stay that fall inside the range (check-out exclusive). */
export function nightsInRange(stay: Pick<StayRow, "checkIn" | "checkOut">, range: Range) {
  const start = Math.max(stay.checkIn.getTime(), range.from.getTime());
  const end = Math.min(stay.checkOut.getTime(), range.to.getTime());
  return Math.max(0, Math.round((end - start) / DAY));
}

export type StayMetrics = {
  /** Room-nights sold in the range. */
  roomNights: number;
  /** Room-nights that could be sold: inventory × nights, minus blocks. */
  capacity: number;
  /** Sold share of capacity, 0 to 1. */
  occupancy: number;
  /** Average daily rate: room revenue per room-night sold, in cents. */
  adr: number;
  /** Room revenue earned on the nights in the range, in cents. */
  roomRevenue: number;
};

/**
 * Occupancy and average daily rate for the nights in a range. A stay's room
 * revenue is spread evenly over its nights, so a stay that crosses the range
 * edge only counts the nights inside it.
 */
export function stayMetrics(stays: StayRow[], inventory: number, blockedRoomNights: number, range: Range): StayMetrics {
  let roomNights = 0;
  let roomRevenue = 0;
  for (const stay of stays) {
    const nights = nightsInRange(stay, range);
    if (!nights) continue;
    const total = Math.round((stay.checkOut.getTime() - stay.checkIn.getTime()) / DAY);
    roomNights += nights * stay.rooms;
    roomRevenue += (stay.subtotal * nights) / total;
  }
  const capacity = Math.max(0, inventory * daysIn(range) - blockedRoomNights);
  return {
    roomNights,
    capacity,
    occupancy: capacity ? Math.min(1, roomNights / capacity) : 0,
    adr: roomNights ? Math.round(roomRevenue / roomNights) : 0,
    roomRevenue: Math.round(roomRevenue),
  };
}

/** Change from `previous` to `current` as a fraction, or null when there is no base. */
export function change(current: number, previous: number) {
  if (!previous) return current ? null : 0;
  return (current - previous) / previous;
}

const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });

/** Sums values into the last `months` calendar months, oldest first. */
export function monthlySeries<T>(rows: T[], dateOf: (row: T) => Date | null, valueOf: (row: T) => number, now: Date, months = 12) {
  const start = monthStart(now, -(months - 1));
  const buckets = Array.from({ length: months }, (_, index) => {
    const month = monthStart(start, index);
    return { key: month.toISOString().slice(0, 7), label: monthLabel.format(month), value: 0 };
  });
  for (const row of rows) {
    const date = dateOf(row);
    if (!date || date < start) continue;
    const bucket = buckets.find((item) => item.key === date.toISOString().slice(0, 7));
    if (bucket) bucket.value += valueOf(row);
  }
  return buckets;
}
