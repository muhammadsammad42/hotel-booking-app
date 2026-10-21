import { headers } from "next/headers";

/**
 * The site's own origin, for links in Stripe redirects and calendar files.
 * APP_URL wins when set (production); otherwise it comes from the request.
 */
export async function siteOrigin() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, "");
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol =
    headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${protocol}://${host}`;
}

/**
 * The public URL without a request, for metadata, the sitemap and Open Graph
 * images: APP_URL, else the production domain Vercel provides, else localhost.
 */
export function publicSiteUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
