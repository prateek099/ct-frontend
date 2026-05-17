/**
 * Test setup — runs once before every Vitest file.
 *
 * - Adds jest-dom custom matchers (`toBeInTheDocument`, etc.).
 * - Resets js-cookie state and the global `fetch` mock between tests so
 *   stateful modules (AuthContext, AdminAuthContext) don't leak across
 *   specs.
 */
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import Cookies from "js-cookie";

afterEach(() => {
  cleanup();
  // Prateek: wipe every js-readable cookie so the next test starts cold.
  // js-cookie has no clear-all; iterate by name.
  for (const name of Object.keys(document.cookie ? _parseCookieNames() : {})) {
    Cookies.remove(name);
  }
  vi.restoreAllMocks();
});

function _parseCookieNames(): Record<string, true> {
  return Object.fromEntries(
    document.cookie
      .split(";")
      .map((s) => s.split("=")[0].trim())
      .filter(Boolean)
      .map((n) => [n, true as const]),
  );
}
