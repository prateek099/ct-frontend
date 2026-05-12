import { reportClientError } from "../api/useClientErrors";

let installed = false;

/**
 * Wire window-level error capture once, at app boot. The ErrorBoundary
 * handles render-phase errors; this handles everything outside React's
 * call tree — event handlers, async/await rejections, setTimeout
 * callbacks, third-party script failures.
 *
 * Idempotent: safe under React StrictMode's double-effect-invocation.
 */
export function installGlobalErrorHandlers(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event: ErrorEvent) => {
    const err = event.error as Error | undefined;
    void reportClientError({
      message: err?.message || event.message || "window.onerror",
      stack: err?.stack,
      source: "error",
    });
  });

  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    const reason = event.reason as unknown;
    let message: string;
    let stack: string | undefined;
    if (reason instanceof Error) {
      message = reason.message || reason.name || "Unhandled rejection";
      stack = reason.stack;
    } else if (typeof reason === "string") {
      message = reason;
    } else {
      try {
        message = `Unhandled rejection: ${JSON.stringify(reason)}`;
      } catch {
        message = "Unhandled rejection (non-serialisable reason)";
      }
    }
    void reportClientError({ message, stack, source: "unhandledrejection" });
  });
}
