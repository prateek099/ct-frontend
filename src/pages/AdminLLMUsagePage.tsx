import { useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Icon from "../components/shared/Icon";
import { useLLMUsage } from "../api/useAdminSystem";
import { getApiErrorMessage } from "../types/api";
import type { LLMUsageGroupBy } from "../types/admin";

const DAYS_OPTIONS = [1, 7, 30, 90] as const;

function fmt(n: number): string {
  return n.toLocaleString();
}

function fmtUsd(n: number): string {
  return `$${n.toFixed(4)}`;
}

export default function AdminLLMUsagePage() {
  const [days, setDays] = useState<number>(7);
  const [groupBy, setGroupBy] = useState<LLMUsageGroupBy>("user");

  const { data, isLoading, isError, error, refetch, isFetching } = useLLMUsage({
    days,
    group_by: groupBy,
  });

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Admin"
        code="LU"
        icon="chart"
        title={<>LLM <em>usage</em></>}
        subtitle="Token spend and call counts across the OpenAI generation endpoints. Cache hits are tracked separately and do not consume the token budget."
        actions={
          <div className="row" style={{ gap: 8 }}>
            <span className="chip sm amber"><Icon name="shield" size={11} /> Admin only</span>
            <button className="btn sm ghost" onClick={() => refetch()} disabled={isFetching}>
              <Icon name="refresh" size={12} /> {isFetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div
        className="card"
        style={{
          padding: 16,
          display: "flex",
          gap: 24,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="tiny muted" style={{ marginBottom: 6, fontWeight: 600 }}>Window</div>
          <div style={{ display: "inline-flex", gap: 4, background: "var(--surface-soft)", padding: 3, borderRadius: 8 }}>
            {DAYS_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "none",
                  background: days === d ? "var(--surface)" : "transparent",
                  color: days === d ? "var(--text)" : "var(--text-subtle)",
                  fontWeight: 500,
                  fontSize: 12,
                  cursor: "pointer",
                  boxShadow: days === d ? "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))" : "none",
                  fontFamily: "inherit",
                }}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="tiny muted" style={{ marginBottom: 6, fontWeight: 600 }}>Group by</div>
          <div style={{ display: "inline-flex", gap: 4, background: "var(--surface-soft)", padding: 3, borderRadius: 8 }}>
            {(["user", "endpoint"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "none",
                  background: groupBy === g ? "var(--surface)" : "transparent",
                  color: groupBy === g ? "var(--text)" : "var(--text-subtle)",
                  fontWeight: 500,
                  fontSize: 12,
                  cursor: "pointer",
                  boxShadow: groupBy === g ? "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))" : "none",
                  fontFamily: "inherit",
                  textTransform: "capitalize",
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {data && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 18, alignItems: "baseline" }}>
            <Stat label="Total tokens" value={fmt(data.totals.total_tokens)} />
            <Stat label="Calls" value={fmt(data.totals.total_calls)} />
            <Stat label="Cache hits" value={fmt(data.totals.cache_hits)} />
            <Stat label="Est. cost" value={fmtUsd(data.totals.cost_estimate_usd)} accent />
          </div>
        )}
      </div>

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
            <Icon name="x" size={12} /> Failed to load LLM usage: {getApiErrorMessage(error, "unknown")}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
          <div className="h2">{groupBy === "user" ? "By user" : "By endpoint"}</div>
        </div>

        {isLoading && !data ? (
          <div className="tiny muted" style={{ padding: "20px 16px" }}>Loading…</div>
        ) : !data || data.rows.length === 0 ? (
          <div className="tiny muted" style={{ padding: "20px 16px" }}>
            No usage in the selected window.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{groupBy === "user" ? "User" : "Endpoint"}</th>
                <th style={{ textAlign: "right", width: 110 }}>Calls</th>
                <th style={{ textAlign: "right", width: 130 }}>Tokens</th>
                <th style={{ textAlign: "right", width: 110 }}>Cache hits</th>
                <th style={{ textAlign: "right", width: 120 }}>Est. cost</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r, i) => (
                <tr key={`${r.key}-${i}`}>
                  <td>
                    <span style={{ fontFamily: groupBy === "endpoint" ? "var(--font-mono, monospace)" : undefined, fontSize: 13 }}>
                      {r.key}
                    </span>
                    {groupBy === "user" && r.user_id != null && (
                      <span className="tiny muted" style={{ marginLeft: 8 }}>
                        #{r.user_id}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "var(--font-mono, monospace)", fontSize: 13 }}>
                    {fmt(r.total_calls)}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "var(--font-mono, monospace)", fontSize: 13, fontWeight: 600 }}>
                    {fmt(r.total_tokens)}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "var(--font-mono, monospace)", fontSize: 13 }}>
                    {r.cache_hits > 0 ? (
                      <span style={{ color: "var(--mint-ink, #2c7a4f)" }}>{fmt(r.cache_hits)}</span>
                    ) : (
                      <span className="muted">0</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "var(--font-mono, monospace)", fontSize: 13 }}>
                    {fmtUsd(r.cost_estimate_usd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="tiny muted">
        Cost estimate uses a blended <code>$0.30 / 1M tokens</code> figure for gpt-4o-mini. Adjust the constant in
        <code> app/api/routes/admin_system.py</code> if the model mix changes.
      </div>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div className="tiny muted" style={{ marginBottom: 2 }}>{label}</div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "var(--font-mono, monospace)",
          color: accent ? "var(--coral, var(--text))" : "var(--text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
