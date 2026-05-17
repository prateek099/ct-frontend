import { defineConfig, devices } from "@playwright/test";

/**
 * Local-only Playwright config. Not wired into CI yet — browser binaries
 * are heavy and we don't have a hosted preview env to point at. Run via
 * `npm run e2e:install` once to download browsers, then `npm run e2e`.
 *
 * `webServer` builds the production bundle and serves it via `vite preview`
 * so tests run against the same code the prod deploy ships.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "list" : "html",
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
