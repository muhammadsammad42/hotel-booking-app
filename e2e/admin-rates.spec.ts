import { expect, test } from "@playwright/test";

import { ADMIN, signIn, stayDates } from "./helpers";

// An admin sets a nightly price; the public hotel page charges it straight away.
test("an admin rate change shows on the hotel page", async ({ page, browser }, testInfo) => {
  const { checkIn, checkOut } = stayDates(testInfo.project.name === "mobile" ? 190 : 180, 2);
  const lastNight = new Date(Date.parse(checkOut) - 86_400_000).toISOString().slice(0, 10);
  const price = testInfo.project.name === "mobile" ? 787 : 777;

  await signIn(page, ADMIN, "/admin");
  await page.goto(`/admin/rates?month=${checkIn.slice(0, 7)}`);
  const header = await page.getByRole("heading", { level: 1, name: "Rates" }).locator("xpath=following-sibling::p").textContent();
  const [hotelName, roomName] = (header ?? "").split(":")[0].split(" · ");

  // Tap the first night, then the last: the range is selected.
  await page.locator(`[data-date="${checkIn}"]`).click();
  await page.locator(`[data-date="${lastNight}"]`).click();
  const panel = page.getByRole("complementary", { name: "Change the selected dates" });
  await expect(panel.getByText("2 nights", { exact: true })).toBeVisible();
  await page.getByLabel("Nightly price (USD)").fill(String(price));
  await page.getByRole("button", { name: "Set price" }).click();
  await expect(page.getByText(`2 nights set to $${price}.`)).toBeVisible();

  // A guest sees the new price for those dates.
  const guest = await browser.newPage();
  const slug = hotelName.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  await guest.goto(`/hotels/${slug}?checkIn=${checkIn}&checkOut=${checkOut}&guests=1`);
  await expect(guest.locator("main")).toContainText(`$${price}`);
  await expect(guest.getByText(roomName.trim()).first()).toBeVisible();
  await guest.close();

  // Put the base price back.
  await page.getByRole("button", { name: "Back to base price" }).click();
  await expect(page.getByText("2 nights back to the base price.")).toBeVisible();
});
