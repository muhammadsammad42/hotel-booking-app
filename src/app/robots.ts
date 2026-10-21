import type { MetadataRoute } from "next";

import { publicSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = publicSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/book", "/api/", "/login", "/register"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
