// Email bodies. Email clients ignore stylesheets and CSS variables, so these
// use inline styles with the Sarai light palette written out as hex values.
import { formatPrice, formatStayDate, pluralize } from "@/lib/format";

export type BookingEmailData = {
  id: string;
  reference: string;
  guestName: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  rooms: number;
  roomName: string;
  hotel: { name: string; city: string; country: string; address: string; checkInTime: string; checkOutTime: string; coverImageUrl: string };
  subtotal: number;
  taxes: number;
  serviceFee: number;
  total: number;
  refunded: number;
  currency: string;
  origin: string;
};

const palette = {
  paper: "#FAF6EF",
  card: "#FFFCF7",
  ink: "#1F1A17",
  muted: "#665A50",
  border: "#E2D6C4",
  primary: "#B4532A",
  success: "#356348",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

function row(label: string, value: string, strong = false) {
  return `<tr><td style="padding:6px 0;color:${palette.muted}">${escapeHtml(label)}</td><td style="padding:6px 0;text-align:right;${strong ? "font-weight:600;" : ""}">${escapeHtml(value)}</td></tr>`;
}

function layout({ preheader, heading, intro, body, cta }: { preheader: string; heading: string; intro: string; body: string; cta: { label: string; href: string } }) {
  return `<!doctype html><html><body style="margin:0;background:${palette.paper};font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:${palette.ink}">
<span style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${palette.paper};padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${palette.card};border:1px solid ${palette.border};border-radius:14px;overflow:hidden">
<tr><td style="padding:28px 32px 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${palette.primary}">Sarai</td></tr>
<tr><td style="padding:16px 32px 0"><h1 style="margin:0;font-size:22px;line-height:1.3">${escapeHtml(heading)}</h1>
<p style="margin:12px 0 0;line-height:1.6;color:${palette.muted}">${escapeHtml(intro)}</p></td></tr>
<tr><td style="padding:24px 32px">${body}</td></tr>
<tr><td style="padding:0 32px 32px"><a href="${cta.href}" style="display:inline-block;background:${palette.primary};color:#FFFFFF;text-decoration:none;font-weight:600;padding:14px 24px;border-radius:8px">${escapeHtml(cta.label)}</a></td></tr>
</table>
<p style="margin:16px 0 0;font-size:12px;color:${palette.muted}">You are receiving this because you booked a stay on Sarai.</p>
</td></tr></table></body></html>`;
}

function stayTable(data: BookingEmailData) {
  const nights = Math.round((data.checkOut.getTime() - data.checkIn.getTime()) / 86_400_000);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-top:1px solid ${palette.border};border-bottom:1px solid ${palette.border}">
${row("Booking reference", data.reference, true)}
${row("Hotel", `${data.hotel.name}, ${data.hotel.city}`)}
${row("Room", data.rooms > 1 ? `${data.roomName} × ${data.rooms}` : data.roomName)}
${row("Check-in", `${formatStayDate(data.checkIn, true)}, from ${data.hotel.checkInTime}`)}
${row("Check-out", `${formatStayDate(data.checkOut, true)}, by ${data.hotel.checkOutTime}`)}
${row("Guests", `${pluralize(data.guests, "guest")} · ${pluralize(nights, "night")}`)}
</table>`;
}

export function bookingConfirmedEmail(data: BookingEmailData) {
  const firstName = data.guestName.split(" ")[0];
  const link = `${data.origin}/account/trips/${data.id}`;
  const prices = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-top:16px">
${row("Room", formatPrice(data.subtotal, data.currency))}
${row("Taxes", formatPrice(data.taxes, data.currency))}
${row("Sarai service fee", formatPrice(data.serviceFee, data.currency))}
${row("Paid", formatPrice(data.total, data.currency), true)}
</table>`;
  return {
    subject: `You are going to ${data.hotel.city}: booking ${data.reference} is confirmed`,
    html: layout({
      preheader: `${data.hotel.name}, ${formatStayDate(data.checkIn)} to ${formatStayDate(data.checkOut, true)}`,
      heading: `Pack your bags, ${firstName}.`,
      intro: `Your stay at ${data.hotel.name} is confirmed. Keep this email for your records; everything is also in My trips.`,
      body: stayTable(data) + prices + `<p style="margin:16px 0 0;font-size:13px;color:${palette.muted}">${escapeHtml(data.hotel.address)}</p>`,
      cta: { label: "View your trip", href: link },
    }),
    text: [
      `Pack your bags, ${firstName}. Your stay at ${data.hotel.name} is confirmed.`,
      `Reference: ${data.reference}`,
      `Check-in: ${formatStayDate(data.checkIn, true)}, from ${data.hotel.checkInTime}`,
      `Check-out: ${formatStayDate(data.checkOut, true)}, by ${data.hotel.checkOutTime}`,
      `Paid: ${formatPrice(data.total, data.currency)}`,
      `View your trip: ${link}`,
    ].join("\n"),
  };
}

export function bookingCancelledEmail(data: BookingEmailData) {
  const refund = data.refunded > 0 ? formatPrice(data.refunded, data.currency) : null;
  const link = `${data.origin}/search`;
  return {
    subject: `Booking ${data.reference} is cancelled`,
    html: layout({
      preheader: refund ? `Your refund of ${refund} is on its way.` : "Your booking is cancelled.",
      heading: "Your booking is cancelled",
      intro: refund
        ? `We have refunded ${refund} to your card. Refunds usually appear within 5 to 10 working days.`
        : "Your booking is cancelled. Nothing more is needed from you.",
      body: stayTable(data),
      cta: { label: "Find another stay", href: link },
    }),
    text: [
      `Booking ${data.reference} at ${data.hotel.name} is cancelled.`,
      refund ? `Refund: ${refund}, usually within 5 to 10 working days.` : "",
      `Find another stay: ${link}`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}
