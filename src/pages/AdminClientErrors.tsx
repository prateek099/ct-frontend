import { useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Icon from "../components/shared/Icon";
import { useClientErrors } from "../api/useClientErrors";
import { getApiErrorMessage } from "../types/api";
import type { ClientErrorRow } from "../types/clientError";

const PAGE_SIZE = 50;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function sourceChip(source: ClientErrorRow["source"]) {
  const isRejection = source === "unhandledrejection";
  return (
    <span
      className={`chip sm ${isRejection ? "amber" : ""}`}
      style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11 }}
    >
      {isRejection ? "rejection" : "error"}
    </span>
  );
}

export default function AdminClientErrors() {
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);

  const offset = page * PAGE_SIZE;
  const { data: rows = [], isLoading, isError, error, refetch, isFetching } =
    useClientErrors({ limit: PAGE_SIZE, offset });

  const hasMore = rows.length === PAGE_SIZE;

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Admin"
        code="T9"
        icon="bell"
        title={<>Client <em>errors</em></>}
        subtitle="Frontend crashes + unhandled promise rejections captured by the in-app reporter. Bridge until Sentry is wired."
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
            <Icon name="x" size={12} /> Failed to load errors:{" "}
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
          }}
        >
          <div className="h2">Recent</div>
          <div className="tiny muted">
            Page {page + 1} · showing {rows.length} {rows.length === 1 ? "row" : "rows"}
          </div>
        </div>

        {isLoading && rows.length === 0 ? (
          <div className="tiny muted" style={{ padding: "20px 16px" }}>
            Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className="tiny muted" style={{ padding: "20px 16px" }}>
            No errors captured yet — nothing has crashed (or nothing has been reported).
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 170 }}>When</th>
                <th style={{ width: 96 }}>Source</th>
                <th style={{ width: 70 }}>User</th>
                <th>Message</th>
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
                      <td>{sourceChip(row.source)}</td>
                      <td className="small muted">
                        {row.user_id == null ? "—" : `#${row.user_id}`}
                      </td>
                      <td>
                        <div
                          style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: 12.5,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: isOpen ? "normal" : "nowrap",
                            maxWidth: "100%",
                          }}
                        >
                          {row.message}
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${row.id}-detail`}>
                        <td colSpan={4} style={{ background: "var(--surface-soft)" }}>
                          <div
                            className="col"
                            style={{ gap: 10, padding: "10px 4px" }}
                          >
                            {row.url && (
                              <div className="tiny muted">
                                <strong>URL:</strong>{" "}
                                <a href={row.url} target="_blank" rel="noreferrer">
                                  {row.url}
                                </a>
                              </div>
                            )}
                            {row.user_agent && (
                              <div className="tiny muted">
                                <strong>UA:</strong> {row.user_agent}
                              </div>
                            )}
                            {row.build_version && (
                              <div className="tiny muted">
                                <strong>Build:</strong>{" "}
                                <code>{row.build_version}</code>
                              </div>
                            )}
                            {row.stack && (
                              <pre
                                style={{
                                  margin: 0,
                                  padding: 10,
                                  background: "var(--surface)",
                                  border: "1px solid var(--line)",
                                  borderRadius: 6,
                                  fontFamily: "var(--font-mono, monospace)",
                                  fontSize: 11.5,
                                  lineHeight: 1.5,
                                  overflowX: "auto",
                                  whiteSpace: "pre",
                                }}
                              >
                                {row.stack}
                              </pre>
                            )}
                            {!row.stack && (
                              <div className="tiny muted">
                                <em>No stack trace was captured.</em>
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
