// Data for the admin overview. Server only.
import { prisma } from "@/lib/prisma";

import { change, monthStart, monthlySeries, stayMetrics, type Range } from "./metrics";

const SOLD = ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] as const;

const bookingRow = {
  id: true,
  reference: true,
  status: true,
  checkIn: true,
  checkOut: true,
  guests: true,
  rooms: true,
  guestName: true,
  totalPrice: true,
  currency: true,
  createdAt: true,
  roomType: { select: { name: true, hotel: { select: { name: true, city: true } } } },
} as const;

async function stayMetricsFor(range: Range) {
  const [stays, rooms, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: { status: { in: [...SOLD] }, checkIn: { lt: range.to }, checkOut: { gt: range.from } },
      select: { checkIn: true, checkOut: true, rooms: true, subtotal: true },
    }),
    prisma.roomType.aggregate({ where: { isActive: true, hotel: { isActive: true } }, _sum: { totalInventory: true } }),
    prisma.availabilityBlock.aggregate({
      where: { date: { gte: range.from, lt: range.to }, roomType: { isActive: true, hotel: { isActive: true } } },
      _sum: { roomsBlocked: true },
    }),
  ]);
  return stayMetrics(stays, rooms._sum.totalInventory ?? 0, blocks._sum.roomsBlocked ?? 0, range);
}

/**
 * Headline numbers. Revenue and bookings compare this month to date with the
 * same days of last month. Occupancy and ADR are for the whole month, as
 * booked so far ("on the books"), against the whole of last month.
 */
export async function getOverview(now = new Date()) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const thisMonth = { from: monthStart(now), to: monthStart(now, 1) };
  const lastMonth = { from: monthStart(now, -1), to: monthStart(now) };
  const elapsed = now.getTime() - thisMonth.from.getTime();
  // The same point in last month, capped at its end (31 March vs 28 February).
  const lastMonthToDate = new Date(Math.min(lastMonth.from.getTime() + elapsed, lastMonth.to.getTime()));
  const yearAgo = monthStart(now, -11);

  const [revenueNow, revenueBefore, bookingsNow, bookingsBefore, occupancyNow, occupancyBefore, payments, made, arrivals, departures, recent] =
    await Promise.all([
      prisma.payment.aggregate({ where: { status: "SUCCEEDED", paidAt: { gte: thisMonth.from, lte: now } }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: "SUCCEEDED", paidAt: { gte: lastMonth.from, lte: lastMonthToDate } }, _sum: { amount: true } }),
      prisma.booking.count({ where: { status: { notIn: ["PENDING", "EXPIRED"] }, createdAt: { gte: thisMonth.from, lte: now } } }),
      prisma.booking.count({ where: { status: { notIn: ["PENDING", "EXPIRED"] }, createdAt: { gte: lastMonth.from, lte: lastMonthToDate } } }),
      stayMetricsFor(thisMonth),
      stayMetricsFor(lastMonth),
      prisma.payment.findMany({ where: { status: "SUCCEEDED", paidAt: { gte: yearAgo } }, select: { amount: true, paidAt: true } }),
      prisma.booking.findMany({ where: { status: { notIn: ["PENDING", "EXPIRED"] }, createdAt: { gte: yearAgo } }, select: { createdAt: true } }),
      prisma.booking.findMany({
        where: { checkIn: today, status: { in: ["CONFIRMED", "CHECKED_IN"] } },
        orderBy: { guestName: "asc" },
        select: bookingRow,
      }),
      prisma.booking.findMany({
        where: { checkOut: today, status: { in: ["CHECKED_IN", "CHECKED_OUT"] } },
        orderBy: { guestName: "asc" },
        select: bookingRow,
      }),
      prisma.booking.findMany({
        where: { status: { not: "EXPIRED" } },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: bookingRow,
      }),
    ]);

  const revenue = { current: revenueNow._sum.amount ?? 0, previous: revenueBefore._sum.amount ?? 0 };
  return {
    kpis: {
      revenue: { ...revenue, change: change(revenue.current, revenue.previous) },
      bookings: { current: bookingsNow, previous: bookingsBefore, change: change(bookingsNow, bookingsBefore) },
      occupancy: {
        current: occupancyNow.occupancy,
        previous: occupancyBefore.occupancy,
        change: change(occupancyNow.occupancy, occupancyBefore.occupancy),
      },
      adr: { current: occupancyNow.adr, previous: occupancyBefore.adr, change: change(occupancyNow.adr, occupancyBefore.adr) },
    },
    revenueByMonth: monthlySeries(payments, (row) => row.paidAt, (row) => row.amount, now),
    bookingsByMonth: monthlySeries(made, (row) => row.createdAt, () => 1, now),
    arrivals,
    departures,
    recent,
  };
}

export type Overview = Awaited<ReturnType<typeof getOverview>>;
export type BookingRow = Overview["recent"][number];
