import { expireLapsedHolds } from "@/lib/booking/holds";
import { pruneRateLimits } from "@/lib/rate-limit";

/**
 * Marks lapsed booking holds as EXPIRED, closes their Stripe sessions and
 * clears old rate-limit windows. Vercel Cron calls it on the schedule in
 * vercel.json and sends `Authorization: Bearer $CRON_SECRET` by itself.
 * In production the secret is required; in development the route is open.
 */
async function handle(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    if (request.headers.get("authorization") !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorised." }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "CRON_SECRET is not set, so this route is disabled." }, { status: 503 });
  }

  const [holds, rateLimits] = await Promise.all([expireLapsedHolds(), pruneRateLimits()]);
  return Response.json({ ...holds, rateLimitsCleared: rateLimits });
}

// Never cached: every call does the work.
export const dynamic = "force-dynamic";
export const GET = handle;
export const POST = handle;
