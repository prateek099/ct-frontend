import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "./api";

describe("getApiErrorMessage", () => {
  it("extracts error.detail from the standard backend envelope", () => {
    const err = {
      response: { data: { error: { detail: "Email already registered." } } },
    };
    expect(getApiErrorMessage(err, "fallback")).toBe("Email already registered.");
  });

  it("falls back when error.detail is missing", () => {
    expect(getApiErrorMessage({}, "fallback")).toBe("fallback");
    expect(getApiErrorMessage(undefined, "fallback")).toBe("fallback");
    expect(getApiErrorMessage(null, "fallback")).toBe("fallback");
  });

  it("falls back when response has no error envelope", () => {
    expect(getApiErrorMessage({ response: { data: {} } }, "fallback")).toBe("fallback");
    expect(getApiErrorMessage({ response: { data: { error: {} } } }, "fallback")).toBe("fallback");
  });

  it("ignores network-error message text — only the detail is surfaced", () => {
    const err = {
      message: "Network Error",
      response: undefined,
    };
    expect(getApiErrorMessage(err, "Try again.")).toBe("Try again.");
  });
});
