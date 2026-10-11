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
