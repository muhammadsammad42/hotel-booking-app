"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";

import { getAdmin, NOT_ADMIN } from "@/lib/admin/guard";
import { CancellationError, cancelBooking } from "@/lib/booking/cancellation";
import { sendBookingCancelledEmail } from "@/lib/email";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/lib/validation/account";

type Result = { ok: true; message: string } | { ok: false; formError: string };

const todayUtc = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

function refresh() {
  revalidatePath("/admin", "layout");
}

/** Front-desk moves: check a confirmed guest in on or after arrival day, or check them out. */
export async function setStayStatusAction(bookingId: string, status: "CHECKED_IN" | "CHECKED_OUT"): Promise<Result> {
  if (!(await getAdmin())) return NOT_ADMIN;
  const id = idSchema.safeParse(bookingId);
  if (!id.success || !["CHECKED_IN", "CHECKED_OUT"].includes(status)) return { ok: false, formError: "That change is not possible." };

  const today = todayUtc();
  const updated =
    status === "CHECKED_IN"
      ? await prisma.booking.updateMany({
          where: { id: id.data, status: "CONFIRMED", checkIn: { lte: today }, checkOut: { gt: today } },
          data: { status: "CHECKED_IN" },
        })
      : await prisma.booking.updateMany({ where: { id: id.data, status: "CHECKED_IN" }, data: { status: "CHECKED_OUT" } });

  if (updated.count === 0) {
    return {
      ok: false,
      formError:
        status === "CHECKED_IN"
          ? "Only confirmed bookings can be checked in, from the arrival date until check-out."
          : "Only guests who are checked in can be checked out.",
    };
  }
  refresh();
  return { ok: true, message: status === "CHECKED_IN" ? "Guest checked in." : "Guest checked out." };
}

export async function adminCancelBookingAction(bookingId: string): Promise<Result> {
  if (!(await getAdmin())) return NOT_ADMIN;
  const id = idSchema.safeParse(bookingId);
  if (!id.success) return { ok: false, formError: "We could not find this booking." };
  try {
    const { refunded, currency } = await cancelBooking({ bookingId: id.data, actor: "admin" });
    after(() => sendBookingCancelledEmail(id.data));
    refresh();
    revalidatePath("/account/trips", "layout");
    return { ok: true, message: refunded > 0 ? `Cancelled and refunded ${formatPrice(refunded, currency)}.` : "Booking cancelled." };
  } catch (error) {
    if (error instanceof CancellationError) return { ok: false, formError: error.message };
    console.error("[admin] Cancel failed:", error);
    return { ok: false, formError: "We could not cancel this booking. Nothing has changed." };
  }
}

export type CommandResults = {
  bookings: { id: string; reference: string; guestName: string; hotel: string; status: string }[];
  hotels: { id: string; name: string; city: string }[];
};

/** Bookings and hotels for the command palette. */
export async function searchCommandAction(query: string): Promise<CommandResults> {
  if (!(await getAdmin())) return { bookings: [], hotels: [] };
  const q = String(query ?? "").trim().slice(0, 60);
  if (q.length < 2) return { bookings: [], hotels: [] };

  const [bookings, hotels] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: { not: "EXPIRED" },
        OR: [
          { reference: { contains: q, mode: "insensitive" } },
          { guestName: { contains: q, mode: "insensitive" } },
          { guestEmail: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, reference: true, guestName: true, status: true, roomType: { select: { hotel: { select: { name: true } } } } },
    }),
    prisma.hotel.findMany({
      where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { city: { contains: q, mode: "insensitive" } }] },
      orderBy: { name: "asc" },
      take: 4,
      select: { id: true, name: true, city: true },
    }),
  ]);
  return {
    bookings: bookings.map((booking) => ({
      id: booking.id,
      reference: booking.reference,
      guestName: booking.guestName,
      hotel: booking.roomType.hotel.name,
      status: booking.status,
    })),
    hotels,
  };
}
