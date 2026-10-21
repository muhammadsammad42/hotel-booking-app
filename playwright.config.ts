// End-to-end tests (npm run test:e2e). They drive a real browser against a
// production build, the real database and Stripe in test mode, so .env must
// have the database, Stripe test keys and the seed passwords.
import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // The tests share one database, so they run one at a time.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    // The installed Chrome, so no browser download is needed.
    channel: "chrome",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 60_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome", viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  // Set E2E_BASE_URL to test a server that is already running.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run build && npm run start -- --port ${PORT}`,
        url: `${baseURL}/login`,
        reuseExistingServer: !process.env.CI,
        timeout: 600_000,
        // Outside Vercel, Auth.js only trusts the request host when told to.
        env: { AUTH_TRUST_HOST: "true" },
        stdout: "ignore",
        stderr: "pipe",
      },
});
