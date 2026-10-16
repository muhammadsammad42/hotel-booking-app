// Booking rules in one place. Rates are fractions of the room subtotal.
export const BOOKING_CONFIG = {
  /** Local taxes, charged on the room subtotal. */
  taxRate: 0.1,
  /** Sarai service fee, charged on the room subtotal. */
  serviceFeeRate: 0.05,
  /** Longest stay that can be booked in one reservation. */
  maxNights: 30,
  /** How far ahead check-in can be. */
  maxAdvanceDays: 365,
  /** How many rooms of one type a single booking can take. */
  maxRooms: 4,
  /**
   * How long a pending booking holds its rooms while the guest pays. Stripe
   * Checkout Sessions must stay open at least 30 minutes, and the session
   * expires with the hold.
   */
  holdMinutes: 30,
  /** Rooms left at which the "Only N left" badge appears. */
  lowAvailability: 2,
  currency: "USD",
} as const;
