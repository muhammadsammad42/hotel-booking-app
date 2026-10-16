import { expireLapsedHolds } from "@/lib/booking/holds";

/**
 * Marks lapsed booking holds as EXPIRED and closes their Stripe sessions.
 * Call it on a schedule (e.g. every 10 minutes). In production it requires
 * `Authorization: Bearer $CRON_SECRET`; in development it is open.
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

  const result = await expireLapsedHolds();
  return Response.json(result);
}

export const GET = handle;
export const POST = handle;
