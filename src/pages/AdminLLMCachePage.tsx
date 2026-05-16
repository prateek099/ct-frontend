import { useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Icon from "../components/shared/Icon";
import {
  useDeleteLLMCacheEntry,
  useLLMCacheDetail,
  useLLMCacheList,
} from "../api/useLLMCache";
import { getApiErrorMessage } from "../types/api";

const PAGE_SIZE = 50;

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function fmtTokens(n: number | null): string {
  if (n == null) return "—";
  return n.toLocaleString();
}

function tryPretty(json: string): string {
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    return json;
  }
}

export default function AdminLLMCachePage() {
  const [page, setPage] = useState(0);
  const [endpoint, setEndpoint] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const offset = page * PAGE_SIZE;
  const list = useLLMCacheList({
    limit: PAGE_SIZE,
    offset,
    endpoint: endpoint || undefined,
    search: search || undefined,
  });

  const detail = useLLMCacheDetail(selectedId);
  const del = useDeleteLLMCacheEntry();

  const rows = list.data ?? [];
  const hasMore = rows.length === PAGE_SIZE;

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  };

  const onDelete = async (id: number) => {
    if (!window.confirm(`Delete cache entry #${id}? Next identical request will re-fetch from OpenAI.`)) {
      return;
    }
    try {
      await del.mutateAsync(id);
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      window.alert(`Delete failed: ${getApiErrorMessage(err, "unknown")}`);
    }
  };

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Admin"
        code="LC"
        icon="save"
        title={<>LLM <em>cache</em></>}
        subtitle="Content-addressable cache of OpenAI responses. Identical prompts across users serve from here instead of round-tripping to OpenAI."
        actions={
          <div className="row" style={{ gap: 8 }}>
            <span className="chip sm amber"><Icon name="shield" size={11} /> Admin only</span>
            <button className="btn sm ghost" onClick={() => list.refetch()} disabled={list.isFetching}>
              <Icon name="refresh" size={12} /> {list.isFetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div
        className="card"
        style={{
          padding: 14,
          display: "flex",
          gap: 14,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="tiny muted" style={{ marginBottom: 6, fontWeight: 600 }}>Endpoint</div>
          <select
            value={endpoint}
            onChange={(e) => { setEndpoint(e.target.value); setPage(0); }}
            style={{
              padding: "7px 10px",
              borderRadius: 8,
              border: "1px solid var(--line)",
              background: "var(--surface)",
              color: "var(--text)",
              fontSize: 12,
              fontFamily: "inherit",
              minWidth: 180,
            }}
          >
            <option value="">All endpoints</option>
            <option value="video_idea_gen">video_idea_gen</option>
            <option value="script_generator">script_generator</option>
            <option value="title_suggestor">title_suggestor</option>
            <option value="seo_description">seo_description</option>
          </select>
        </div>

        <form onSubmit={applySearch} style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 240 }}>
          <div style={{ flex: 1 }}>
            <div className="tiny muted" style={{ marginBottom: 6, fontWeight: 600 }}>Search user_prompt</div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="substring match…"
              style={{
                width: "100%",
                padding: "7px 10px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                background: "var(--surface)",
                color: "var(--text)",
                fontSize: 12,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button type="submit" className="btn sm" style={{ alignSelf: "flex-end" }}>
            <Icon name="search" size={12} /> Search
          </button>
          {search && (
            <button
              type="button"
              className="btn sm ghost"
              onClick={() => { setSearch(""); setSearchInput(""); setPage(0); }}
              style={{ alignSelf: "flex-end" }}
            >
              Clear
            </button>
          )}
        </form>

        <div className="tiny muted" style={{ marginLeft: "auto", alignSelf: "flex-end" }}>
          Page {page + 1} · {rows.length} {rows.length === 1 ? "row" : "rows"}
        </div>
      </div>

      {list.isError && (
        <div
          className="card"
          style={{
            borderColor: "var(--danger)",
            background: "var(--danger-soft)",
            color: "var(--danger-ink)",
          }}
        >
          <div className="small">
            <Icon name="x" size={12} /> Failed to load: {getApiErrorMessage(list.error, "unknown")}
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: selectedId != null ? "minmax(0, 1fr) minmax(0, 1fr)" : "1fr",
          gap: 16,
        }}
      >
        <div className="card" style={{ padding: 0, overflow: "hidden", minWidth: 0 }}>
          {list.isLoading && rows.length === 0 ? (
            <div className="tiny muted" style={{ padding: "20px 16px" }}>Loading…</div>
          ) : rows.length === 0 ? (
            <div className="tiny muted" style={{ padding: "20px 16px" }}>
              {search || endpoint ? "No entries match this filter." : "No cached responses yet."}
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 160 }}>Endpoint</th>
                  <th style={{ width: 110 }}>Model</th>
                  <th style={{ width: 80, textAlign: "right" }}>Hits</th>
                  <th style={{ width: 90, textAlign: "right" }}>Tokens</th>
                  <th style={{ width: 150 }}>Last hit</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    style={{
                      cursor: "pointer",
                      background: selectedId === r.id ? "var(--surface-soft)" : "transparent",
                    }}
                  >
                    <td>
                      <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12 }}>
                        {r.endpoint}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "var(--text-subtle)" }}>
                        {r.model}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontFamily: "var(--font-mono, monospace)", fontSize: 13, fontWeight: 600 }}>
                      {r.hit_count}
                    </td>
                    <td style={{ textAlign: "right", fontFamily: "var(--font-mono, monospace)", fontSize: 12 }}>
                      {fmtTokens(r.total_tokens)}
                    </td>
                    <td className="small muted" style={{ whiteSpace: "nowrap" }}>
                      {fmtDate(r.last_hit_at)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn sm ghost"
                        onClick={(e) => { e.stopPropagation(); onDelete(r.id); }}
                        title="Delete this cache entry"
                        disabled={del.isPending}
                      >
                        <Icon name="x" size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
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
              disabled={page === 0 || list.isFetching}
            >
              <Icon name="arrowRight" size={12} style={{ transform: "rotate(180deg)" }} /> Prev
            </button>
            <button
              className="btn sm ghost"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore || list.isFetching}
            >
              Next <Icon name="arrowRight" size={12} />
            </button>
          </div>
        </div>

        {selectedId != null && (
          <div className="card" style={{ padding: 0, overflow: "hidden", minWidth: 0 }}>
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div className="h2">Detail #{selectedId}</div>
              <button
                className="btn sm ghost"
                onClick={() => setSelectedId(null)}
                aria-label="Close detail"
              >
                <Icon name="x" size={12} />
              </button>
            </div>

            {detail.isLoading && (
              <div className="tiny muted" style={{ padding: "20px 16px" }}>Loading…</div>
            )}
            {detail.isError && (
              <div className="tiny muted" style={{ padding: "20px 16px", color: "var(--danger-ink)" }}>
                Failed to load: {getApiErrorMessage(detail.error, "unknown")}
              </div>
            )}
            {detail.data && (
              <div className="col" style={{ gap: 14, padding: 16 }}>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <Pill label="Endpoint" value={detail.data.endpoint} mono />
                  <Pill label="Model" value={detail.data.model} mono />
                  <Pill label="Hits" value={String(detail.data.hit_count)} />
                  <Pill
                    label="Tokens"
                    value={`${detail.data.prompt_tokens ?? 0}+${detail.data.completion_tokens ?? 0}=${detail.data.total_tokens ?? 0}`}
                    mono
                  />
                </div>

                <div className="tiny muted">
                  <strong>Created:</strong> {fmtDate(detail.data.created_at)}
                  {" · "}
                  <strong>Last hit:</strong> {fmtDate(detail.data.last_hit_at)}
                </div>

                <div className="tiny muted" style={{ wordBreak: "break-all" }}>
                  <strong>Key:</strong>{" "}
                  <code style={{ fontFamily: "var(--font-mono, monospace)" }}>
                    {detail.data.cache_key}
                  </code>
                </div>

                {detail.data.system_prompt && (
                  <Section title="System prompt">
                    <pre style={preStyle}>{detail.data.system_prompt}</pre>
                  </Section>
                )}

                <Section title="User prompt">
                  <pre style={preStyle}>{detail.data.user_prompt}</pre>
                </Section>

                <Section title="Response">
                  <pre style={preStyle}>{tryPretty(detail.data.response_body)}</pre>
                </Section>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const preStyle: React.CSSProperties = {
  margin: 0,
  padding: 10,
  background: "var(--surface-soft)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  fontFamily: "var(--font-mono, monospace)",
  fontSize: 11.5,
  lineHeight: 1.5,
  overflowX: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  maxHeight: 320,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-subtle)", marginBottom: 6 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Pill({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: "var(--surface-soft)",
        border: "1px solid var(--line)",
        fontSize: 11,
      }}
    >
      <span className="muted" style={{ fontWeight: 600 }}>{label}</span>
      <span style={{ fontWeight: 600, fontFamily: mono ? "var(--font-mono, monospace)" : undefined }}>
        {value}
      </span>
    </span>
  );
}
