import Stripe from "stripe";

let client: Stripe | undefined;

/** The Stripe API client. Throws a clear error if the secret key is missing. */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set. Add your Stripe test secret key (sk_test_...) to .env.");
  }
  client ??= new Stripe(key, { appInfo: { name: "Sarai" } });
  return client;
}
