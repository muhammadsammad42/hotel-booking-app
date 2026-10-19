import { Logo } from "@/components/brand/logo";
import { nightsOf, type TripDetail } from "@/lib/account/trips";
import { BOOKING_CONFIG } from "@/lib/booking/config";
import { formatPrice, formatStayDate, pluralize } from "@/lib/format";

const issued = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const percent = (rate: number) => `${Math.round(rate * 1000) / 10}%`;

/**
 * The printed receipt. Hidden on screen; when the guest prints, the rest of
 * the page is hidden and this is all that shows, on plain white paper.
 */
export function Receipt({ trip }: { trip: TripDetail }) {
  const { hotel } = trip.roomType;
  const paid = trip.payments.filter((payment) => payment.paidAt);
  const refunded = trip.payments.filter((payment) => payment.status === "REFUNDED");
  const refundedTotal = refunded.reduce((sum, payment) => sum + payment.amount, 0);
  const nights = nightsOf(trip);

  const rows: [string, string][] = [
    [`Room: ${formatPrice(Math.round(trip.subtotal / trip.rooms / Math.max(nights, 1)), trip.currency)} average × ${pluralize(nights, "night")}${trip.rooms > 1 ? ` × ${trip.rooms} rooms` : ""}`, formatPrice(trip.subtotal, trip.currency)],
    [`Taxes (${percent(BOOKING_CONFIG.taxRate)})`, formatPrice(trip.taxes, trip.currency)],
    [`Sarai service fee (${percent(BOOKING_CONFIG.serviceFeeRate)})`, formatPrice(trip.serviceFee, trip.currency)],
  ];

  return (
    <article aria-label="Receipt" className="hidden text-sm text-black print:block">
      <header className="flex items-start justify-between border-b border-black/20 pb-6">
        <Logo className="h-9 text-black" />
        <div className="text-right">
          <p className="text-xl font-semibold">Receipt</p>
          <p className="mt-1 font-mono">{trip.reference}</p>
          <p className="mt-1 text-black/70">Issued {issued.format(trip.createdAt)}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-8 border-b border-black/20 py-6">
        <div>
          <p className="font-semibold">Billed to</p>
          <p className="mt-1">{trip.guestName}</p>
          <p className="text-black/70">{trip.guestEmail}</p>
          {trip.guestPhone && <p className="text-black/70">{trip.guestPhone}</p>}
        </div>
        <div>
          <p className="font-semibold">{hotel.name}</p>
          <p className="mt-1 text-black/70">{hotel.address}</p>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-6 border-b border-black/20 py-6">
        <div>
          <p className="text-black/70">Check-in</p>
          <p className="mt-1 font-medium">{formatStayDate(trip.checkIn, true)}</p>
          <p className="text-black/70">From {hotel.checkInTime}</p>
        </div>
        <div>
          <p className="text-black/70">Check-out</p>
          <p className="mt-1 font-medium">{formatStayDate(trip.checkOut, true)}</p>
          <p className="text-black/70">By {hotel.checkOutTime}</p>
        </div>
        <div>
          <p className="text-black/70">Room</p>
          <p className="mt-1 font-medium">
            {trip.roomType.name}
            {trip.rooms > 1 && ` × ${trip.rooms}`}
          </p>
        </div>
        <div>
          <p className="text-black/70">Guests</p>
          <p className="mt-1 font-medium">{pluralize(trip.guests, "guest")}</p>
        </div>
      </section>

      <table className="mt-6 w-full tabular-nums">
        <tbody>
          {rows.map(([label, amount]) => (
            <tr key={label}>
              <td className="py-1.5">{label}</td>
              <td className="py-1.5 text-right">{amount}</td>
            </tr>
          ))}
          <tr className="border-t border-black/40 text-base font-semibold">
            <td className="pt-3">Total ({trip.currency})</td>
            <td className="pt-3 text-right">{formatPrice(trip.totalPrice, trip.currency)}</td>
          </tr>
          {paid.map((payment) => (
            <tr key={payment.id}>
              <td className="pt-1.5 text-black/70">Paid by card on {issued.format(payment.paidAt!)}</td>
              <td className="pt-1.5 text-right text-black/70">{formatPrice(payment.amount, payment.currency)}</td>
            </tr>
          ))}
          {refundedTotal > 0 && (
            <tr className="font-semibold">
              <td className="pt-1.5">Refunded</td>
              <td className="pt-1.5 text-right">−{formatPrice(refundedTotal, trip.currency)}</td>
            </tr>
          )}
        </tbody>
      </table>

      <footer className="mt-10 border-t border-black/20 pt-4 text-xs text-black/70">
        Sarai is a demonstration marketplace. Payments are processed by Stripe. Thank you for travelling with us.
      </footer>
    </article>
  );
}
