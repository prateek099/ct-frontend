import { expect, test } from "@playwright/test";

/**
 * Lightweight happy-path: visit `/`, then the public admin login page,
 * confirm the form renders. We deliberately don't attempt an actual login
 * here — that would need a backend running with a seeded admin row, and
 * this spec is for CI-style structural checks of the static FE bundle.
 */

test.describe("happy path", () => {
  test("homepage renders", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/); // any title (HomePage doesn't pin one currently)
    // Look for the marketing nav's brand or a Sign in / Start CTA. These are
    // the most stable signals from `MarketingNav.tsx`.
    await expect(page.getByText(/creator os/i).first()).toBeVisible();
  });

  test("admin login page renders without an active session", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /sign in to admin/i })).toBeVisible();
    // Email + password fields are present and the submit button is enabled
    // (the form hasn't been submitted yet).
    const email = page.getByLabel(/admin email/i);
    const password = page.getByLabel(/^password$/i);
    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeEnabled();
  });

  test("admin route bounces unauthenticated visitors to /admin/login", async ({ page }) => {
    await page.goto("/admin/llm-cache");
    // AdminRoute should redirect — the URL settles on /admin/login with a
    // `next` param preserving the intended destination.
    await page.waitForURL(/\/admin\/login(\?.*)?$/);
    await expect(page.getByRole("heading", { name: /sign in to admin/i })).toBeVisible();
  });
});
