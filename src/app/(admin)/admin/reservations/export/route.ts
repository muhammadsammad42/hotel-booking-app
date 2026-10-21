import { getAdmin } from "@/lib/admin/guard";
import { exportReservations, parseReservationFilters, toCsv } from "@/lib/admin/reservations";
import { toIso } from "@/lib/booking/stay";

/** The reservations that match the table's filters, as a CSV download. */
export async function GET(request: Request) {
  if (!(await getAdmin())) return Response.json({ error: "Admins only." }, { status: 403 });

  const url = new URL(request.url);
  const filters = parseReservationFilters(Object.fromEntries(url.searchParams));
  const rows = await exportReservations(filters);
  const money = (cents: number) => (cents / 100).toFixed(2);

  const csv = toCsv([
    [
      "Reference",
      "Status",
      "Guest",
      "Email",
      "Phone",
      "Hotel",
      "Room",
      "Rooms",
      "Guests",
      "Check-in",
      "Check-out",
      "Nights",
      "Subtotal",
      "Taxes",
      "Service fee",
      "Total",
      "Currency",
      "Booked at (UTC)",
    ],
    ...rows.map((row) => [
      row.reference,
      row.status,
      row.guestName,
      row.guestEmail,
      row.guestPhone,
      row.roomType.hotel.name,
      row.roomType.name,
      row.rooms,
      row.guests,
      toIso(row.checkIn),
      toIso(row.checkOut),
      Math.round((row.checkOut.getTime() - row.checkIn.getTime()) / 86_400_000),
      money(row.subtotal),
      money(row.taxes),
      money(row.serviceFee),
      money(row.totalPrice),
      row.currency,
      row.createdAt.toISOString(),
    ]),
  ]);

  // A byte order mark so Excel opens the file as UTF-8.
  return new Response(`﻿${csv}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sarai-reservations-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
