import { expect, type Page } from "@playwright/test";

export const GUEST = { email: "ayesha.khan@example.com", password: process.env.SEED_GUEST_PASSWORD ?? "" };
export const ADMIN = { email: process.env.SEED_ADMIN_EMAIL ?? "", password: process.env.SEED_ADMIN_PASSWORD ?? "" };

/** "YYYY-MM-DD", `days` from today in UTC. */
export function isoDaysFromNow(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Dates far enough ahead to be inside the bookable window and outside the
 * demo data's busiest weeks. Each test and device gets its own offset, so
 * runs do not compete for the same room.
 */
export function stayDates(offset: number, nights = 2) {
  return { checkIn: isoDaysFromNow(offset), checkOut: isoDaysFromNow(offset + nights) };
}

export async function fillSignIn(page: Page, user: { email: string; password: string }) {
  expect(user.password, "Set SEED_GUEST_PASSWORD and SEED_ADMIN_PASSWORD in .env").not.toBe("");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(user.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

export async function signIn(page: Page, user: { email: string; password: string }, returnTo = "/") {
  await page.goto(`/login?callbackUrl=${encodeURIComponent(returnTo)}`);
  await fillSignIn(page, user);
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

/** The visible Reserve button: the booking card on desktop, the bottom bar on phones. */
export function reserveLink(page: Page) {
  return page.getByRole("link", { name: "Reserve", exact: true }).filter({ visible: true }).first();
}

/** Pays on Stripe's hosted Checkout page with a test card. */
export async function payOnStripe(page: Page, card = "4242424242424242") {
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 });
  // With several payment methods, Card sits in an accordion.
  const cardOption = page.locator("[data-testid=card-accordion-item-button]");
  const cardNumber = page.locator("#cardNumber");
  await page.waitForLoadState("domcontentloaded");
  const open = await cardNumber.waitFor({ state: "visible", timeout: 20_000 }).then(() => true, () => false);
  if (!open) {
    // The accordion button can be visually hidden while still clickable.
    await cardOption.evaluate((button: HTMLButtonElement) => button.click());
    await expect(cardNumber).toBeVisible({ timeout: 30_000 });
  }
  await cardNumber.fill(card);
  await page.locator("#cardExpiry").fill("12 / 34");
  await page.locator("#cardCvc").fill("123");
  const name = page.locator("#billingName");
  if (await name.isVisible()) await name.fill("Ayesha Khan");
  const country = page.locator("#billingCountry");
  if (await country.isVisible()) await country.selectOption("US");
  const postal = page.locator("#billingPostalCode");
  if (await postal.isVisible()) await postal.fill("10001");
  await page.locator("[data-testid=hosted-payment-submit-button]").click();
}
