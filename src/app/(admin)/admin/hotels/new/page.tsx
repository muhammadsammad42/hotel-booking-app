import type { Metadata } from "next";

import { BackLink } from "@/components/admin/back-link";
import { HotelForm } from "@/components/admin/hotel-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getAmenityOptions, uploadsEnabled } from "@/lib/admin/catalog";
import { EMPTY_HOTEL } from "@/lib/admin/form-values";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "New hotel" };

export default async function NewHotelPage() {
  await requireAdmin();
  const amenities = await getAmenityOptions();
  return (
    <div className="grid grid-cols-1 gap-4">
      <BackLink href="/admin/hotels">Hotels</BackLink>
      <AdminPageHeader title="New hotel" description="Add the hotel first; you can add its room types straight after." />
      <HotelForm initial={EMPTY_HOTEL} amenities={amenities} uploadsEnabled={uploadsEnabled()} />
    </div>
  );
}
