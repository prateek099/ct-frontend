import { Component, ReactNode } from "react";
import { reportClientError } from "../../api/useClientErrors";

interface Props {
  children: ReactNode;
  /**
   * Optional override for the fallback UI. Default is a minimal centered
   * "Something went wrong" card with a Reload button. Marketing/auth pages
   * pass their own to stay on-brand.
   */
  fallback?: (reset: () => void, error: Error | null) => ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-phase exceptions from descendants. React 18's behaviour
 * is to unmount the whole tree on an uncaught render error — without this
 * the entire app blanks. Pair this with the global `unhandledrejection`
 * listener in `main.tsx` for async errors.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Stitch the React component stack onto the JS stack so the admin
    // viewer shows both. info.componentStack starts with a newline.
    const stack = `${error.stack ?? ""}\n--- React component stack ---${info.componentStack}`;
    void reportClientError({
      message: error.message || error.name || "Render error",
      stack,
      source: "error",
    });
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(this.reset, error);
    }

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "var(--bg, #fff)",
          color: "var(--text, #111)",
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            padding: 32,
            background: "var(--surface, #fff)",
            border: "1px solid var(--line, rgba(0,0,0,0.1))",
            borderRadius: 12,
            boxShadow: "var(--shadow-xl, 0 24px 60px -12px rgba(0,0,0,0.15))",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--coral, #ff5b3c)", marginBottom: 8 }}>
            Unexpected error
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Something went wrong.
          </h1>
          <p
            style={{
              margin: "12px 0 24px",
              color: "var(--text-subtle, #555)",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            The error has been logged. You can reload this view to try again,
            or head back to the dashboard.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={this.reset}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 8,
                border: "none",
                background: "var(--accent, #2563eb)",
                color: "white",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Reload view
            </button>
            <a
              href="/dashboard"
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid var(--line, rgba(0,0,0,0.1))",
                background: "transparent",
                color: "var(--text, #111)",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }
}
