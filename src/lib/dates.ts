// Calendar dates travel between the browser and the server as "YYYY-MM-DD".
// The date picker works with local Date objects; the server and the database
// use midnight UTC (see src/lib/booking for the engine).

const pad = (value: number) => String(value).padStart(2, "0");

/** A local Date (from the date picker) as "YYYY-MM-DD". */
export function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "YYYY-MM-DD" as a local Date at midnight, for the date picker. */
export function fromIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** "YYYY-MM-DD" as midnight UTC, the form stay dates are stored in. */
export function utcDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

/** Midnight UTC of a Date, as "YYYY-MM-DD". */
export function utcIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Today in UTC as "YYYY-MM-DD". */
export function todayUtcIso(now = new Date()) {
  return utcIsoDate(now);
}

/** Whole nights between two "YYYY-MM-DD" dates. */
export function nightsBetween(checkIn: string, checkOut: string) {
  return Math.round((utcDate(checkOut).getTime() - utcDate(checkIn).getTime()) / 86_400_000);
}
