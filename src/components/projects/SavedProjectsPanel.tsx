// Saved Projects panel — slide-in from the right.
// Reads real projects from useProjects, derives pipeline progress, and resumes via WorkflowContext.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../shared/Icon";
import { useProjects } from "../../api/useProjects";
import { useWorkflow } from "../../context/WorkflowContext";
import type { Project } from "../../types/project";

type Filter = "all" | "in-progress" | "ready";

interface Props {
  open: boolean;
  onClose: () => void;
  focusedProjectId?: string | number | null;
}

const PIPELINE_STEPS = [
  { id: "idea",   name: "Idea" },
  { id: "script", name: "Script" },
  { id: "title",  name: "Title" },
  { id: "seo",    name: "SEO" },
  { id: "thumb",  name: "Thumb" },
] as const;

const PALETTE = ["coral", "violet", "mint", "amber", "rose"] as const;
const COLOR_MAP: Record<typeof PALETTE[number], { bg: string; soft: string; ink: string }> = {
  coral:  { bg: "var(--coral)",  soft: "var(--coral-soft)",  ink: "var(--ink-on-night)" },
  violet: { bg: "var(--violet)", soft: "var(--violet-soft)", ink: "var(--ink-on-night)" },
  mint:   { bg: "var(--mint)",   soft: "var(--mint-soft)",   ink: "var(--ink-on-night)" },
  amber:  { bg: "var(--amber)",  soft: "var(--amber-soft)",  ink: "var(--ink)" },
  rose:   { bg: "#FF477E",       soft: "rgba(255,71,126,0.14)", ink: "var(--ink-on-night)" },
};

function projectProgress(p: Project): number {
  let done = 0;
  if (p.idea_json?.selectedIdea) done = Math.max(done, 1);
  if (p.script_json?.script)     done = Math.max(done, 2);
  if (p.title_json?.selectedTitle || p.title_json?.suggestedTitles?.length) done = Math.max(done, 3);
  if (p.seo_json?.seo)            done = Math.max(done, 4);
  if (p.thumbnail_json)           done = Math.max(done, 5);
  return done;
}

function projectTitle(p: Project): string {
  return p.title || p.idea_json?.selectedIdea?.title || p.idea_json?.ideas?.[0]?.title || "Untitled draft";
}

function projectGlyph(title: string): string {
  return title.split(" ").slice(0, 2).map(w => w[0] ?? "").join("").toUpperCase().slice(0, 2) || "··";
}

function relativeUpdated(iso: string): string {
  const d = new Date(iso);
  const ms = Date.now() - d.getTime();
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.round(hr / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function SavedProjectsPanel({ open, onClose, focusedProjectId }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const navigate = useNavigate();
  const { loadProject } = useWorkflow();
  const { data: drafts = [] } = useProjects({ status: "draft,saved", limit: 50 });
  const { data: published = [] } = useProjects({ status: "published", limit: 20 });

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const decorated = useMemo(() => {
    const all = [
      ...drafts.map(p => ({ p, ready: projectProgress(p) >= 5 })),
      ...published.map(p => ({ p, ready: true as const })),
    ];
    return all.map((row, i) => ({
      ...row,
      palette: PALETTE[i % PALETTE.length],
    }));
  }, [drafts, published]);

  const counts = useMemo(() => {
    const inProgress = decorated.filter(r => !r.ready).length;
    const ready = decorated.filter(r => r.ready).length;
    return { all: decorated.length, "in-progress": inProgress, ready };
  }, [decorated]);

  const list = decorated.filter(r =>
    filter === "all" ? true :
    filter === "ready" ? r.ready :
    !r.ready
  );

  const handleResume = (p: Project, ready: boolean) => {
    loadProject(p);
    onClose();
    if (ready) navigate(`/publish/${p.id}`);
    else navigate("/idea");
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(14,11,9,0.35)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          zIndex: 30,
          animation: "fadeUp .15s ease",
        }}
      />

      {/* Slide-in panel */}
      <aside style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: 460, maxWidth: "92vw",
        background: "white",
        borderLeft: "1px solid var(--line)",
        zIndex: 40,
        display: "flex", flexDirection: "column",
        boxShadow: "0 24px 60px -8px rgba(0,0,0,0.18)",
        animation: "panelSlideIn .25s cubic-bezier(.2,.8,.2,1)",
      }}>
        <style>{`@keyframes panelSlideIn { from { transform: translateX(40px); opacity: 0; } to { transform: none; opacity: 1; } }`}</style>

        <header style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.16em",
                textTransform: "uppercase", color: "var(--coral)",
              }}>Saved Projects</div>
              <h2 style={{
                margin: "6px 0 0", fontFamily: "var(--font-serif)",
                fontWeight: 400, fontSize: 32, letterSpacing: "-0.018em",
              }}>
                Your <i>video pipeline</i>
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close projects panel"
              style={{
                width: 36, height: 36, borderRadius: 10, border: "none",
                background: "var(--bg-soft)", color: "var(--ink)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-sunken)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-soft)")}
            >
              <Icon name="x" size={18} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <FilterChip label="All"               count={counts.all}            active={filter === "all"}         onClick={() => setFilter("all")} />
            <FilterChip label="In progress"       count={counts["in-progress"]} active={filter === "in-progress"} onClick={() => setFilter("in-progress")} dot="var(--amber)" />
            <FilterChip label="Ready to publish"  count={counts.ready}          active={filter === "ready"}       onClick={() => setFilter("ready")}      dot="var(--mint)" />
          </div>
        </header>

        <div style={{
          flex: 1, overflowY: "auto", padding: 16,
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {list.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
              {decorated.length === 0
                ? "No saved projects yet. Start a new video to begin."
                : "Nothing in this filter."}
            </div>
          ) : (
            list.map(({ p, ready, palette }) => (
              <ProjectCard
                key={p.id}
                project={p}
                ready={ready}
                palette={palette}
                focused={focusedProjectId === p.id}
                onOpen={() => handleResume(p, ready)}
              />
            ))
          )}
        </div>

        <footer style={{
          padding: 16, borderTop: "1px solid var(--line)", background: "var(--bg-soft)",
        }}>
          <button
            onClick={() => { onClose(); navigate("/idea"); }}
            style={{
              width: "100%", padding: "12px 16px", borderRadius: "var(--r-md)", border: "none",
              background: "var(--ink)", color: "white",
              fontWeight: 600, fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <Icon name="plus" size={16} /> New project
          </button>
        </footer>
      </aside>
    </>
  );
}

function FilterChip({ active, label, count, dot, onClick }: {
  active: boolean; label: string; count: number; dot?: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px", borderRadius: 99, border: "none",
        background: active ? "var(--ink)" : "var(--bg-soft)",
        color: active ? "white" : "var(--ink-2)",
        fontSize: 12, fontWeight: 600,
        display: "inline-flex", alignItems: "center", gap: 6,
        cursor: "pointer", fontFamily: "inherit",
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: 99, background: dot }} />}
      {label}
      <span style={{ opacity: 0.55, fontWeight: 500 }}>{count}</span>
    </button>
  );
}

function ProjectCard({ project, ready, palette, focused, onOpen }: {
  project: Project; ready: boolean; palette: typeof PALETTE[number];
  focused: boolean; onOpen: () => void;
}) {
  const c = COLOR_MAP[palette];
  const title = projectTitle(project);
  const step = projectProgress(project);
  const glyph = projectGlyph(title);
  const updated = relativeUpdated(project.updated_at);

  return (
    <div
      onClick={onOpen}
      style={{
        padding: 14, borderRadius: "var(--r-lg)",
        background: focused ? c.soft : "white",
        border: focused ? `1.5px solid ${c.bg}` : "1px solid var(--line)",
        cursor: "pointer", transition: "all .15s",
      }}
      onMouseEnter={e => {
        if (!focused) {
          e.currentTarget.style.borderColor = "var(--line-strong)";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "var(--shadow-md)";
        }
      }}
      onMouseLeave={e => {
        if (!focused) {
          e.currentTarget.style.borderColor = "var(--line)";
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{
          width: 56, height: 72, borderRadius: 10, flex: "0 0 56px",
          background: c.bg, color: c.ink,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 400, fontStyle: "italic",
          position: "relative", overflow: "hidden",
        }}>
          {glyph}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 600, lineHeight: 1.35, color: "var(--ink)",
          }}>{title}</div>
          <div style={{
            fontSize: 11, color: "var(--ink-3)", marginTop: 4,
            display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
          }}>
            <span>Updated {updated}</span>
            <span>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{
                width: 6, height: 6, borderRadius: 99,
                background: ready ? "var(--mint-bright)" : "var(--amber)",
              }} />
              {ready ? "Ready to publish" : `Step ${step}/5`}
            </span>
          </div>
        </div>
      </div>

      {/* Pipeline mini bar */}
      <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
        {PIPELINE_STEPS.map((s, i) => {
          const done = i < step;
          const cur = i === step && !ready;
          return (
            <div key={s.id} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: done ? c.bg : "var(--line)",
              position: "relative",
            }}>
              {cur && (
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 2,
                  background: c.bg, opacity: 0.4,
                  animation: "pulse-dot 1.4s infinite",
                }} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        marginTop: 6, fontSize: 10, color: "var(--ink-3)", fontWeight: 500,
      }}>
        {PIPELINE_STEPS.map(s => <span key={s.id}>{s.name}</span>)}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          onClick={e => { e.stopPropagation(); onOpen(); }}
          style={{
            flex: 1, padding: "8px 12px", borderRadius: 8, border: "none",
            fontSize: 12, fontWeight: 600,
            background: c.bg, color: c.ink,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {ready ? "Publish →" : "Resume →"}
        </button>
        <button
          aria-label="More actions"
          onClick={e => e.stopPropagation()}
          style={{
            padding: "8px 10px", borderRadius: 8, border: "none",
            background: "var(--bg-soft)", color: "var(--ink-2)",
            cursor: "pointer", display: "inline-flex", alignItems: "center",
          }}
        >
          <Icon name="ellipsis" size={16} />
        </button>
      </div>
    </div>
  );
}
