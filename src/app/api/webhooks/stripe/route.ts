import { after } from "next/server";
import type Stripe from "stripe";

import { confirmFromSession, expireFromSession } from "@/lib/booking/holds";
import { sendBookingConfirmedEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";

const SETUP_HINT =
  "Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, copy the whsec_... secret it prints into STRIPE_WEBHOOK_SECRET in .env, and restart the dev server.";

/**
 * Stripe webhook. Verifies the signature against the raw body, then confirms
 * or releases the booking. Every handler is idempotent, so Stripe's retries
 * and duplicate deliveries are harmless.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error(`[stripe webhook] STRIPE_WEBHOOK_SECRET is not set. ${SETUP_HINT}`);
    return Response.json({ error: `STRIPE_WEBHOOK_SECRET is not set. ${SETUP_HINT}` }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing Stripe-Signature header." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch (error) {
    console.error("[stripe webhook] Signature verification failed:", error instanceof Error ? error.message : error);
    return Response.json(
      {
        error: `Signature verification failed. Check that STRIPE_WEBHOOK_SECRET matches the secret of the endpoint or of \`stripe listen\`. ${SETUP_HINT}`,
      },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const result = await confirmFromSession(event.data.object);
        // Only the call that confirms the booking sends the email.
        const bookingId = event.data.object.metadata?.bookingId;
        if (result === "confirmed" && bookingId) after(() => sendBookingConfirmedEmail(bookingId));
        console.info(`[stripe webhook] ${event.type} ${event.data.object.id}: ${result}`);
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const released = await expireFromSession(event.data.object);
        console.info(`[stripe webhook] ${event.type} ${event.data.object.id}: released ${released}`);
        break;
      }
      default:
        // Other events are acknowledged so Stripe stops sending them.
        break;
    }
  } catch (error) {
    // A 500 makes Stripe retry later, which is safe because handlers are idempotent.
    console.error(`[stripe webhook] Failed to handle ${event.type}:`, error);
    return Response.json({ error: "Webhook handler failed; Stripe will retry." }, { status: 500 });
  }

  return Response.json({ received: true });
}
