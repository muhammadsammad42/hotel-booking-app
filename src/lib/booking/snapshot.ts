import type { Quote } from "./engine";
import { eachNight, toIso } from "./stay";

type PricedBooking = {
  checkIn: Date;
  checkOut: Date;
  rooms: number;
  subtotal: number;
  taxes: number;
  serviceFee: number;
  totalPrice: number;
  currency: string;
};

/**
 * The price a booking was made at, as a Quote for PriceBreakdown. Bookings
 * store totals, not each night, so nights show the average rate.
 */
export function bookingQuote(booking: PricedBooking): Quote {
  const dates = eachNight(toIso(booking.checkIn), toIso(booking.checkOut));
  const perNight = dates.length ? Math.round(booking.subtotal / booking.rooms / dates.length) : 0;
  return {
    nights: dates.map((date) => ({ date, price: perNight, override: false })),
    nightCount: dates.length,
    rooms: booking.rooms,
    subtotal: booking.subtotal,
    taxes: booking.taxes,
    serviceFee: booking.serviceFee,
    total: booking.totalPrice,
    averageNightly: Math.round(perNight / 100) * 100,
    currency: booking.currency,
  };
}
