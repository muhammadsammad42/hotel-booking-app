import { expect, test } from "@playwright/test";

import { GUEST, payOnStripe, reserveLink, signIn, stayDates } from "./helpers";

// The main journey, end to end, with Stripe in test mode.
test("search, choose a hotel, book and pay, then cancel for a refund", async ({ page }, testInfo) => {
  const { checkIn, checkOut } = stayDates(testInfo.project.name === "mobile" ? 150 : 140);
  await signIn(page, GUEST);

  // Search with dates.
  await page.goto(`/search?destination=Hunza&checkIn=${checkIn}&checkOut=${checkOut}&guests=2`);
  const firstHotel = page.locator("a[data-card-link]").first();
  await expect(firstHotel).toBeVisible();
  const hotelName = (await firstHotel.textContent())?.trim() ?? "";
  await firstHotel.click();

  // Hotel page keeps the dates and shows the total.
  await page.waitForURL(/\/hotels\//);
  await expect(page.getByRole("heading", { level: 1, name: hotelName })).toBeVisible();
  await reserveLink(page).click();

  // Guest details are pre-filled from the account.
  await page.waitForURL(/\/book\?/);
  await expect(page.getByLabel("Full name")).toHaveValue("Ayesha Khan");
  await expect(page.getByLabel("Email")).toHaveValue(GUEST.email);
  await page.getByLabel("Special requests").fill("Booked by the end-to-end test.");
  await page.getByRole("button", { name: /Continue to payment/ }).click();

  // Payment step with the hold countdown, then Stripe.
  await page.waitForURL(/\/book\/[a-z0-9]+$/);
  await expect(page.getByText(/holding your room for/i)).toBeVisible();
  await page.getByRole("link", { name: /^Pay \$/ }).click();
  await payOnStripe(page);

  // Back on Sarai, confirmed.
  await page.waitForURL(/\/confirmed/, { timeout: 90_000 });
  await expect(page.getByRole("heading", { name: /Pack your bags/ })).toBeVisible();
  const reference = (await page.getByText(/^HB-[A-Z2-9]{6}$/).first().textContent())?.trim();
  expect(reference).toMatch(/^HB-/);

  // The trip is in My trips; cancelling refunds it and frees the room.
  await page.goto("/account/trips");
  await page.getByRole("listitem").filter({ hasText: reference! }).getByRole("link").first().click();
  await page.getByRole("button", { name: "Cancel booking" }).click();
  await page.getByRole("button", { name: /Cancel and refund/ }).click();
  await expect(page.getByText(/This booking is cancelled/)).toBeVisible();
});
