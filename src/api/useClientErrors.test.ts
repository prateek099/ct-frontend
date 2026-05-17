import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the axios client BEFORE importing the module under test so the
// import binding captures the mock.
const postMock = vi.fn();
vi.mock("./client", () => ({
  default: { post: (...args: unknown[]) => postMock(...args) },
}));

import { reportClientError } from "./useClientErrors";

beforeEach(() => {
  postMock.mockReset();
  postMock.mockResolvedValue({ data: {} });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("reportClientError", () => {
  it("POSTs to /client-errors/ with the truncated payload", async () => {
    await reportClientError({
      message: "kaboom",
      stack: "at line 1",
      source: "error",
      buildVersion: "abc",
    });
    expect(postMock).toHaveBeenCalledTimes(1);
    const [path, body] = postMock.mock.calls[0];
    expect(path).toBe("/client-errors/");
    expect(body.message).toBe("kaboom");
    expect(body.stack).toBe("at line 1");
    expect(body.source).toBe("error");
    expect(body.build_version).toBe("abc");
  });

  it("truncates oversize message to the backend cap (4000)", async () => {
    await reportClientError({
      message: "x".repeat(5000),
      source: "error",
    });
    const body = postMock.mock.calls[0][1];
    expect(body.message.length).toBe(4000);
  });

  it("truncates oversize stack to 20000", async () => {
    await reportClientError({
      message: "m",
      stack: "y".repeat(25000),
      source: "error",
    });
    const body = postMock.mock.calls[0][1];
    expect(body.stack.length).toBe(20000);
  });

  it("swallows network errors silently (does not throw)", async () => {
    postMock.mockRejectedValueOnce(new Error("network down"));
    await expect(
      reportClientError({ message: "m", source: "error" }),
    ).resolves.toBeUndefined();
  });

  it('defaults missing message to "(no message)"', async () => {
    await reportClientError({ message: "", source: "error" });
    const body = postMock.mock.calls[0][1];
    expect(body.message).toBe("(no message)");
  });
});
