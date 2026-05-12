import { Link, useLocation } from "react-router-dom";

export default function NotFoundPage() {
  const location = useLocation();

  return (
    <div
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
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--coral, #ff5b3c)",
            marginBottom: 12,
          }}
        >
          404
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Page not found
        </h1>
        <p
          style={{
            margin: "12px 0 24px",
            color: "var(--text-subtle, #555)",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          We couldn't find{" "}
          <code
            style={{
              padding: "2px 6px",
              borderRadius: 4,
              background: "var(--surface-soft, rgba(0,0,0,0.04))",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 13,
            }}
          >
            {location.pathname}
          </code>
          . The link may be outdated, or the page has moved.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link
            to="/"
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              border: "1px solid var(--line, rgba(0,0,0,0.1))",
              background: "transparent",
              color: "var(--text, #111)",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              border: "none",
              background: "var(--accent, #2563eb)",
              color: "white",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Open dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
