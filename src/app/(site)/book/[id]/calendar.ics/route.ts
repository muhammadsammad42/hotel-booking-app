import { getCurrentUser } from "@/lib/auth/guards";
import { buildStayIcs } from "@/lib/booking/ics";
import { toIso } from "@/lib/booking/stay";
import { prisma } from "@/lib/prisma";
import { siteOrigin } from "@/lib/site-url";

/** Downloads a confirmed stay as an .ics file for any calendar app. */
export async function GET(_request: Request, { params }: RouteContext<"/book/[id]/calendar.ics">) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to continue." }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.booking.findFirst({
    where: { id, userId: user.id, status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] } },
    include: { roomType: { select: { name: true, hotel: { select: { name: true, address: true, checkInTime: true } } } } },
  });
  if (!booking) return Response.json({ error: "Booking not found." }, { status: 404 });

  const ics = buildStayIcs({
    reference: booking.reference,
    hotelName: booking.roomType.hotel.name,
    roomName: booking.roomType.name,
    address: booking.roomType.hotel.address,
    checkIn: toIso(booking.checkIn),
    checkOut: toIso(booking.checkOut),
    checkInTime: booking.roomType.hotel.checkInTime,
    guests: booking.guests,
    url: `${await siteOrigin()}/account/trips`,
    now: new Date(),
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="sarai-${booking.reference}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
