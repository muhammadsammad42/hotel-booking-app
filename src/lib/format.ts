/** Formats an amount in the smallest currency unit, e.g. 42000 -> "$420". */
export function formatPrice(amount: number, currency = "USD") {
  const hasFraction = amount % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(amount / 100);
}

// Stay dates are calendar dates stored as midnight UTC, so they are always
// formatted in UTC: a guest in any timezone sees the same day.
const stayDay = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });
const stayDayWithYear = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "Tue 20 Oct", or "Tue 20 Oct 2026" with `withYear`. */
export function formatStayDate(date: Date, withYear = false) {
  return (withYear ? stayDayWithYear : stayDay).format(date).replace(",", "");
}

/** "Tue 20 Oct to Sun 25 Oct 2026". */
export function formatStayRange(checkIn: Date, checkOut: Date) {
  return `${formatStayDate(checkIn)} to ${formatStayDate(checkOut, true)}`;
}

/** "1 night", "5 nights". */
export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Up to two initials for an avatar, from the name or else the email. */
export function initials(name: string | null | undefined, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}
