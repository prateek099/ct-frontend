import { useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Icon from "../components/shared/Icon";
import { useAuthEvents } from "../api/useAuthEvents";
import { getApiErrorMessage } from "../types/api";
import type { AuthEventRow } from "../types/authEvent";

const PAGE_SIZE = 100;

const EVENT_TYPES = [
  "register_success",
  "register_failed",
  "login_success",
  "login_failed",
  "google_success",
  "google_failed",
  "refresh_success",
  "refresh_failed",
  "logout",
  "password_reset_request",
  "password_reset_success",
  "password_reset_failed",
  "workflow_login_success",
  "workflow_login_failed",
] as const;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function successChip(success: boolean) {
  return (
    <span
      className={`chip sm ${success ? "mint" : "amber"}`}
      style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11 }}
    >
      {success ? "ok" : "fail"}
    </span>
  );
}

function eventTypeChip(event_type: AuthEventRow["event_type"]) {
  const isFailure = event_type.endsWith("_failed");
  return (
    <span
      style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 11,
        color: isFailure ? "var(--danger-ink)" : "var(--text)",
      }}
    >
      {event_type}
    </span>
  );
}

export default function AdminAuthEvents() {
  const [page, setPage] = useState(0);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("");
  const [successFilter, setSuccessFilter] = useState<"" | "true" | "false">("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const offset = page * PAGE_SIZE;
  const {
    data: rows = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAuthEvents({
    limit: PAGE_SIZE,
    offset,
    event_type: eventTypeFilter || undefined,
    success: successFilter === "" ? undefined : successFilter === "true",
  });

  const hasMore = rows.length === PAGE_SIZE;

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Admin"
        code="AE"
        icon="shield"
        title={<>Auth <em>events</em></>}
        subtitle="Append-only audit log of authentication-mutating actions: logins, registrations, refreshes, password resets."
        actions={
          <div className="row" style={{ gap: 8 }}>
            <span className="chip sm amber">
              <Icon name="shield" size={11} /> Admin only
            </span>
            <button
              className="btn sm ghost"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <Icon name="refresh" size={12} />{" "}
              {isFetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>
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
            <Icon name="x" size={12} /> Failed to load events:{" "}
            {getApiErrorMessage(error, "unknown")}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div className="h2">Recent</div>
          <div
            className="row"
            style={{
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <select
              className="input sm"
              value={eventTypeFilter}
              onChange={(e) => {
                setEventTypeFilter(e.target.value);
                setPage(0);
              }}
              style={{ fontSize: 12 }}
            >
              <option value="">All event types</option>
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              className="input sm"
              value={successFilter}
              onChange={(e) => {
                setSuccessFilter(e.target.value as "" | "true" | "false");
                setPage(0);
              }}
              style={{ fontSize: 12 }}
            >
              <option value="">Success and failure</option>
              <option value="true">Success only</option>
              <option value="false">Failure only</option>
            </select>
            <div className="tiny muted" style={{ marginLeft: 6 }}>
              Page {page + 1} · {rows.length} {rows.length === 1 ? "row" : "rows"}
            </div>
          </div>
        </div>

        {isLoading && rows.length === 0 ? (
          <div className="tiny muted" style={{ padding: "20px 16px" }}>
            Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className="tiny muted" style={{ padding: "20px 16px" }}>
            No events match this filter.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 170 }}>When</th>
                <th style={{ width: 60 }}>OK</th>
                <th style={{ width: 200 }}>Event</th>
                <th style={{ width: 80 }}>User</th>
                <th style={{ width: 130 }}>Provider</th>
                <th>IP / detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isOpen = expanded === row.id;
                return (
                  <>
                    <tr
                      key={row.id}
                      onClick={() => setExpanded(isOpen ? null : row.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="small muted" style={{ whiteSpace: "nowrap" }}>
                        {formatDate(row.created_at)}
                      </td>
                      <td>{successChip(row.success)}</td>
                      <td>{eventTypeChip(row.event_type)}</td>
                      <td className="small muted">
                        {row.user_id == null ? "—" : `#${row.user_id}`}
                      </td>
                      <td className="small muted">{row.provider ?? "—"}</td>
                      <td className="small">
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12 }}>
                          {row.ip ?? "—"}
                        </span>
                        {row.detail && (
                          <span className="muted" style={{ marginLeft: 8 }}>
                            · {row.detail.slice(0, 80)}
                            {row.detail.length > 80 ? "…" : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${row.id}-detail`}>
                        <td colSpan={6} style={{ background: "var(--surface-soft)" }}>
                          <div
                            className="col"
                            style={{ gap: 8, padding: "10px 4px" }}
                          >
                            {row.user_agent && (
                              <div className="tiny muted">
                                <strong>UA:</strong> {row.user_agent}
                              </div>
                            )}
                            {row.detail && (
                              <div className="tiny">
                                <strong>Detail:</strong>{" "}
                                <code
                                  style={{
                                    fontFamily: "var(--font-mono, monospace)",
                                    fontSize: 12,
                                  }}
                                >
                                  {row.detail}
                                </code>
                              </div>
                            )}
                            {!row.user_agent && !row.detail && (
                              <div className="tiny muted">
                                <em>No additional detail captured.</em>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}

        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            className="btn sm ghost"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isFetching}
          >
            <Icon name="arrowRight" size={12} style={{ transform: "rotate(180deg)" }} /> Prev
          </button>
          <button
            className="btn sm ghost"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore || isFetching}
          >
            Next <Icon name="arrowRight" size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
