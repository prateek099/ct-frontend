import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "./ErrorBoundary";

// Prevent reportClientError from POSTing during tests — the boundary
// fires it from componentDidCatch.
vi.mock("../../api/useClientErrors", () => ({
  reportClientError: vi.fn().mockResolvedValue(undefined),
}));

function Boom({ when = true }: { when?: boolean }) {
  if (when) throw new Error("boom from a render path");
  return <div>safe</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <div>healthy children</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText("healthy children")).toBeInTheDocument();
  });

  it("renders the default fallback when a child throws", () => {
    // React 18 logs to console.error on caught render errors — silence it
    // so the test output isn't noisy.
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
    errSpy.mockRestore();
  });

  it("reset button restores the children", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    function Toggle({ initial }: { initial: boolean }) {
      return <Boom when={initial} />;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <Toggle initial={true} />
      </ErrorBoundary>,
    );
    // Fallback is shown
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();

    // Swap the children to the non-throwing version, then click Reload.
    rerender(
      <ErrorBoundary>
        <Toggle initial={false} />
      </ErrorBoundary>,
    );
    await userEvent.click(screen.getByRole("button", { name: /reload view/i }));
    expect(screen.getByText("safe")).toBeInTheDocument();
    errSpy.mockRestore();
  });
});
