// Transactional email through Resend's HTTP API. Server only.
//
// Email is optional: without RESEND_API_KEY nothing is sent and the app says
// nothing about email. Sending never blocks or fails a booking; errors are
// logged and swallowed.
import { prisma } from "@/lib/prisma";
import { siteOrigin } from "@/lib/site-url";

import { bookingCancelledEmail, bookingConfirmedEmail, type BookingEmailData } from "./templates";

export function emailEnabled() {
  return Boolean(process.env.RESEND_API_KEY);
}

type Message = { to: string; subject: string; html: string; text: string; idempotencyKey: string };

async function send(message: Message) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      // Resend drops a repeat of the same key, so a retried webhook sends once.
      "Idempotency-Key": message.idempotencyKey,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Sarai <onboarding@resend.dev>",
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });
  if (!response.ok) throw new Error(`Resend responded ${response.status}: ${await response.text()}`);
  return true;
}

async function loadBooking(bookingId: string): Promise<BookingEmailData | null> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      roomType: {
        select: {
          name: true,
          hotel: { select: { name: true, city: true, country: true, address: true, checkInTime: true, checkOutTime: true, coverImageUrl: true } },
        },
      },
      payments: { where: { status: "REFUNDED" }, select: { amount: true } },
    },
  });
  if (!booking) return null;
  return {
    id: booking.id,
    reference: booking.reference,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    rooms: booking.rooms,
    roomName: booking.roomType.name,
    hotel: booking.roomType.hotel,
    subtotal: booking.subtotal,
    taxes: booking.taxes,
    serviceFee: booking.serviceFee,
    total: booking.totalPrice,
    refunded: booking.payments.reduce((sum, payment) => sum + payment.amount, 0),
    currency: booking.currency,
    origin: await siteOrigin().catch(() => process.env.APP_URL ?? "http://localhost:3000"),
  };
}

async function deliver(kind: "confirmed" | "cancelled", bookingId: string) {
  if (!emailEnabled()) return;
  try {
    const data = await loadBooking(bookingId);
    if (!data) return;
    const content = kind === "confirmed" ? bookingConfirmedEmail(data) : bookingCancelledEmail(data);
    await send({ to: data.guestEmail, ...content, idempotencyKey: `booking-${kind}/${bookingId}` });
  } catch (error) {
    console.error(`[email] Could not send the ${kind} email for booking ${bookingId}:`, error);
  }
}

/** Emails the guest their confirmation. Never throws. */
export function sendBookingConfirmedEmail(bookingId: string) {
  return deliver("confirmed", bookingId);
}

/** Emails the guest that their booking is cancelled, with the refund. Never throws. */
export function sendBookingCancelledEmail(bookingId: string) {
  return deliver("cancelled", bookingId);
}
