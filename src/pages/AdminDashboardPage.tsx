import { Link } from "react-router-dom";
import Icon from "../components/shared/Icon";

interface Section {
  title: string;
  path: string;
  icon: string;
  blurb: string;
  accent: string;
}

const SECTIONS: Section[] = [
  {
    title: "Prompt admin",
    path: "/admin/prompts",
    icon: "cog",
    blurb:
      "Override system + user prompt templates per AI tool. Empty fields fall back to the defaults shipped in the codebase.",
    accent: "var(--amber)",
  },
  {
    title: "Users",
    path: "/admin/users",
    icon: "users",
    blurb:
      "Registered users — names, emails, admin status, registration dates.",
    accent: "var(--accent)",
  },
  {
    title: "LLM usage",
    path: "/admin/llm-usage",
    icon: "chart",
    blurb:
      "Token spend per user and per endpoint over the last 1/7/30/90 days. Cache hits and rough cost estimates included.",
    accent: "var(--mint)",
  },
  {
    title: "Auth events",
    path: "/admin/auth-events",
    icon: "shield",
    blurb:
      "Append-only audit log of every login, refresh, password reset, and Google sign-in — success and failure.",
    accent: "var(--mint)",
  },
  {
    title: "Client errors",
    path: "/admin/client-errors",
    icon: "bell",
    blurb:
      "Crashes captured by the frontend ErrorBoundary and the global unhandledrejection handler.",
    accent: "var(--coral)",
  },
  {
    title: "System",
    path: "/admin/system",
    icon: "sliders",
    blurb:
      "Runtime config snapshot — env, JWT TTLs, OpenAI / YouTube / SMTP integrations, CORS origins, database connectivity.",
    accent: "var(--text-subtle)",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="stack-24">
      <header style={{ marginBottom: 8 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-subtle)",
          }}
        >
          Admin
        </div>
        <h1
          style={{
            margin: "6px 0 6px",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Operations overview
        </h1>
        <p
          style={{
            margin: 0,
            color: "var(--text-subtle)",
            fontSize: 14,
            lineHeight: 1.5,
            maxWidth: 720,
          }}
        >
          One place to manage AI prompt overrides, audit auth activity, and review captured frontend
          errors. More tools land here as we ship them — LLM result cache up next.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {SECTIONS.map((s) => (
          <Link
            key={s.path}
            to={s.path}
            className="card"
            style={{
              textDecoration: "none",
              color: "inherit",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              borderTop: `3px solid ${s.accent}`,
              transition: "transform .14s, box-shadow .14s",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--surface-soft)",
                color: s.accent,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={s.icon} size={18} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>
              {s.title}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.5,
                color: "var(--text-subtle)",
              }}
            >
              {s.blurb}
            </p>
            <div
              style={{
                marginTop: "auto",
                fontSize: 12,
                fontWeight: 600,
                color: s.accent,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Open
              <Icon name="arrowRight" size={12} />
            </div>
          </Link>
        ))}
      </section>

      <section
        className="card tinted"
        style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}
      >
        <div className="h2" style={{ marginBottom: 4 }}>
          Coming soon
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "var(--text-subtle)",
            lineHeight: 1.5,
          }}
        >
          <strong>LLM result cache</strong> — browse, search, and consolidate cached OpenAI responses
          across all AI generation endpoints. Hit counts, recency, content-keyed lookup.
        </p>
      </section>
    </div>
  );
}
