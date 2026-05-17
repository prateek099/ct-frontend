import { afterEach, describe, expect, it } from "vitest";
import Cookies from "js-cookie";
import { hasAdminSessionSignal } from "./useAdminAuth";

afterEach(() => {
  Cookies.remove("admin_session");
});

describe("hasAdminSessionSignal", () => {
  it("returns false when the admin_session cookie is unset", () => {
    expect(hasAdminSessionSignal()).toBe(false);
  });

  it("returns true once the admin_session cookie is set", () => {
    Cookies.set("admin_session", "Admin Bob");
    expect(hasAdminSessionSignal()).toBe(true);
  });

  it("returns false again after the cookie is cleared", () => {
    Cookies.set("admin_session", "Admin Bob");
    expect(hasAdminSessionSignal()).toBe(true);
    Cookies.remove("admin_session");
    expect(hasAdminSessionSignal()).toBe(false);
  });
});
