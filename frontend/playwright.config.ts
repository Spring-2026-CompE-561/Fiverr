import { defineConfig, devices } from "@playwright/test";

/**
 * E2E / integration tests: browser + Next.js app + FastAPI.
 *
 * - Start the API first (e.g. `docker compose up` or `uv run uvicorn ...`).
 * - Playwright can start the dev server automatically, or reuse one already on baseURL.
 *
 * Env:
 * - PLAYWRIGHT_BASE_URL — Next app (default http://127.0.0.1:3000)
 * - PLAYWRIGHT_API_URL — FastAPI (default http://127.0.0.1:8000)
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : [["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
