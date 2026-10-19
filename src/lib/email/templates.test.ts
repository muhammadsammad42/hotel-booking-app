import { describe, expect, it } from "vitest";

import { bookingCancelledEmail, bookingConfirmedEmail, type BookingEmailData } from "./templates";

const data: BookingEmailData = {
  id: "bk_1",
  reference: "HB-7K3M9Q",
  guestName: "Ayesha <Khan>",
  guestEmail: "ayesha@example.com",
  checkIn: new Date("2026-11-10T00:00:00Z"),
  checkOut: new Date("2026-11-13T00:00:00Z"),
  guests: 2,
  rooms: 1,
  roomName: "Caldera View Suite",
  hotel: {
    name: "Caldera Blue Suites",
    city: "Santorini",
    country: "Greece",
    address: "Oia 847 02",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    coverImageUrl: "https://images.unsplash.com/photo",
  },
  subtotal: 120000,
  taxes: 12000,
  serviceFee: 6000,
  total: 138000,
  refunded: 138000,
  currency: "USD",
  origin: "https://sarai.example",
};

describe("booking emails", () => {
  it("confirms with the reference, dates, total and a link to the trip", () => {
    const email = bookingConfirmedEmail(data);
    expect(email.subject).toContain("HB-7K3M9Q");
    expect(email.html).toContain("$1,380");
    expect(email.html).toContain("https://sarai.example/account/trips/bk_1");
    expect(email.text).toContain("Check-in: Tue 10 Nov 2026, from 15:00");
  });

  it("escapes guest-provided text", () => {
    const email = bookingConfirmedEmail({ ...data, guestName: "<script>x</script> Khan" });
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
  });

  it("states the refund when a cancellation was refunded", () => {
    expect(bookingCancelledEmail(data).html).toContain("refunded $1,380");
    expect(bookingCancelledEmail({ ...data, refunded: 0 }).text).not.toContain("Refund");
  });
});
