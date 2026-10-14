import type { Metadata } from "next";
import { BedDoubleIcon, Building2Icon, CalendarCheckIcon, WalletIcon } from "lucide-react";

import { PageContainer, Section } from "@/components/layout/page-container";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false },
};

export default async function AdminPage() {
  const [hotels, roomTypes, upcoming, revenue] = await Promise.all([
    prisma.hotel.count({ where: { isActive: true } }),
    prisma.roomType.count({ where: { isActive: true } }),
    prisma.booking.count({ where: { status: { in: ["CONFIRMED", "CHECKED_IN"] } } }),
    prisma.payment.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amount: true } }),
  ]);

  const stats = [
    { label: "Active hotels", value: String(hotels), icon: Building2Icon },
    { label: "Room types", value: String(roomTypes), icon: BedDoubleIcon },
    { label: "Upcoming and in-house", value: String(upcoming), icon: CalendarCheckIcon },
    { label: "Payments received", value: formatPrice(revenue._sum.amount ?? 0), icon: WalletIcon },
  ];

  return (
    <Section spacing="compact">
      <PageContainer width="app">
        <h1 className="type-title-lg">Admin dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          An overview of the marketplace. Managing hotels, rates and reservations comes next.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <li key={label}>
              <Card className="gap-3 p-5">
                <Icon className="size-5 text-primary" aria-hidden />
                <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </Card>
            </li>
          ))}
        </ul>
      </PageContainer>
    </Section>
  );
}
