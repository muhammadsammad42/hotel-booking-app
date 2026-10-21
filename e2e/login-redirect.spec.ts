import { expect, test } from "@playwright/test";

import { fillSignIn, GUEST, reserveLink, stayDates } from "./helpers";

// A signed-out guest who reserves is asked to sign in, then lands back on the
// booking page with the same stay.
test("signing in mid-booking returns to the booking with the same stay", async ({ page }, testInfo) => {
  const { checkIn, checkOut } = stayDates(testInfo.project.name === "mobile" ? 170 : 160, 3);
  await page.goto(`/hotels/caldera-blue-suites?checkIn=${checkIn}&checkOut=${checkOut}&guests=2`);
  await reserveLink(page).click();

  await page.waitForURL(/\/login\?callbackUrl=/);
  expect(decodeURIComponent(page.url())).toContain(`checkIn=${checkIn}`);
  await fillSignIn(page, GUEST);

  await page.waitForURL(/\/book\?/);
  const url = new URL(page.url());
  expect(url.searchParams.get("checkIn")).toBe(checkIn);
  expect(url.searchParams.get("checkOut")).toBe(checkOut);
  await expect(page.getByLabel("Full name")).toHaveValue("Ayesha Khan");
  await expect(page.getByRole("button", { name: /Continue to payment/ })).toBeVisible();
});
