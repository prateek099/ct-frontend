import PageHeader from "../components/layout/PageHeader";
import Icon from "../components/shared/Icon";
import { useSystemInfo } from "../api/useAdminSystem";
import { getApiErrorMessage } from "../types/api";

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "10px 14px",
        borderBottom: "1px solid var(--line)",
        gap: 16,
      }}
    >
      <span className="small muted" style={{ flex: "0 0 auto" }}>{label}</span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          textAlign: "right",
          fontFamily: mono ? "var(--font-mono, monospace)" : undefined,
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Yes() {
  return (
    <span className="chip sm mint" style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11 }}>
      configured
    </span>
  );
}

function No() {
  return (
    <span className="chip sm amber" style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11 }}>
      missing
    </span>
  );
}

export default function AdminSystemPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useSystemInfo();

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Admin"
        code="SY"
        icon="cog"
        title={<>System <em>overview</em></>}
        subtitle="Read-only snapshot of runtime config, third-party integrations, and database connectivity."
        actions={
          <button
            className="btn sm ghost"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <Icon name="refresh" size={12} />{" "}
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        }
      />

      {isError && (
        <div
          className="card"
          style={{
            borderColor: "var(--danger)",
            background: "var(--danger-soft)",
            color: "var(--danger-ink)",
          }}
        >
          <div className="small">
            <Icon name="x" size={12} /> Failed to load system info: {getApiErrorMessage(error, "unknown")}
          </div>
        </div>
      )}

      {isLoading && !data && (
        <div className="card">
          <div className="tiny muted">Loading…</div>
        </div>
      )}

      {data && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
              <div className="h2">App</div>
            </div>
            <Row label="Name" value={data.app.name} mono />
            <Row label="Environment" value={data.app.environment} mono />
            <Row label="Debug" value={data.app.debug ? "true" : "false"} mono />
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
              <div className="h2">Database</div>
            </div>
            <Row
              label="Connectivity"
              value={data.database.status === "ok" ? <Yes /> : <No />}
            />
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
              <div className="h2">Logging</div>
            </div>
            <Row label="Level" value={data.logging.level} mono />
            <Row label="Format" value={data.logging.format} mono />
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
              <div className="h2">Auth</div>
            </div>
            <Row label="JWT algorithm" value={data.auth.jwt_algorithm} mono />
            <Row label="Access TTL" value={`${data.auth.access_ttl_minutes} min`} />
            <Row label="Refresh TTL" value={`${data.auth.refresh_ttl_days} days`} />
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
              <div className="h2">OpenAI</div>
            </div>
            <Row label="API key" value={data.openai.configured ? <Yes /> : <No />} />
            <Row label="Default model" value={data.openai.default_model} mono />
            <Row label="User token budget" value={`${data.openai.token_budget_per_user_daily.toLocaleString()} / window`} />
            <Row label="Demo token budget" value={`${data.openai.token_budget_demo_daily.toLocaleString()} / window`} />
            <Row label="Budget window" value={`${data.openai.token_budget_window_hours} h`} />
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
              <div className="h2">Integrations</div>
            </div>
            <Row label="YouTube API key" value={data.youtube.configured ? <Yes /> : <No />} />
            <Row label="Google OAuth" value={data.google_oauth.configured ? <Yes /> : <No />} />
            <Row label="SMTP" value={data.smtp.configured ? <Yes /> : <No />} />
            {data.smtp.configured && data.smtp.from_email && (
              <Row label="SMTP from" value={data.smtp.from_email} mono />
            )}
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden", gridColumn: "1 / -1" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
              <div className="h2">CORS allow-list</div>
            </div>
            {data.cors.origins.length === 0 && (
              <div className="tiny muted" style={{ padding: "10px 14px" }}>(none — credentials-enabled CORS requires explicit origins)</div>
            )}
            {data.cors.origins.map((origin, i) => (
              <Row key={i} label={`origin ${i + 1}`} value={origin} mono />
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>
              <div className="h2">Cache</div>
            </div>
            <Row label="Idempotency TTL" value={`${data.cache.idempotency_ttl_hours} h`} />
          </div>
        </section>
      )}
    </div>
  );
}
