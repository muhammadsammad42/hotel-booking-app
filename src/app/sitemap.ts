import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";
import { publicSiteUrl } from "@/lib/site-url";

// Rebuilt at most once an hour.
export const revalidate = 3600;

/** Public pages and every live hotel. Account, booking and admin pages are private. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicSiteUrl();
  const hotels = await prisma.hotel.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true }, orderBy: { name: "asc" } });
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/destinations`, changeFrequency: "weekly", priority: 0.7 },
    ...hotels.map((hotel) => ({
      url: `${base}/hotels/${hotel.slug}`,
      lastModified: hotel.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];
}
