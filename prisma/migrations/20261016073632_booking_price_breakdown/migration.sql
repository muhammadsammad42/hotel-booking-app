-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "serviceFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subtotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "taxes" INTEGER NOT NULL DEFAULT 0;

-- The parts of the price are never negative.
ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_price_parts_check" CHECK ("subtotal" >= 0 AND "taxes" >= 0 AND "serviceFee" >= 0);
