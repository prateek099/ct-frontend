// CreatePage — entry point for the Create flow.
//
// Two modes:
//   pipeline   (default): the chained idea → script → title → description → thumbnail flow
//   standalone:           launch any one tool by itself, then publish from there
//
// The choice is persisted in localStorage so returning users land back on their
// preferred mode, but first-time visitors always see Pipeline.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/shared/Icon";
import { withStandalone } from "../lib/useStandaloneMode";
import { useWorkflow } from "../context/WorkflowContext";

type Mode = "pipeline" | "standalone";

const MODE_KEY = "ct_create_mode";

interface ToolDef {
  code: string;
  name: string;
  path: string;
  icon: string;
  blurb: string;
  pipelineHint: string;
  badge?: string;
}

const TOOLS: ToolDef[] = [
  { code: "T1", name: "Video Ideas",     path: "/idea",        icon: "lightbulb", blurb: "Brainstorm hook-scored, trend-aware ideas tuned to your channel.",       pipelineHint: "Find the angle" },
  { code: "T2", name: "Script Writer",   path: "/script",      icon: "pencil",    blurb: "Turn an idea into a structured, sectioned script — your tone, your length.", pipelineHint: "Write the script" },
  { code: "T3", name: "Title Generator", path: "/title",       icon: "tag",       blurb: "Ten CTR-ranked titles, with angle tags so you know why each one works.",   pipelineHint: "Earn the click" },
  { code: "T4", name: "Description",     path: "/description", icon: "align",     blurb: "SEO-tuned description + tags + hashtags. YouTube-algorithm friendly.",    pipelineHint: "Win the algorithm" },
  { code: "T5", name: "Thumbnail Lab",   path: "/thumbnail",   icon: "image",     blurb: "Scroll-stopping thumbnails — templates, custom, or AI-generated.",        pipelineHint: "Stop the scroll" },
];

export default function CreatePage() {
  const navigate = useNavigate();
  const { resetAll } = useWorkflow();
  const [mode, setMode] = useState<Mode>("pipeline");

  useEffect(() => {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === "standalone" || stored === "pipeline") setMode(stored);
  }, []);

  const setModeAndPersist = (m: Mode) => {
    setMode(m);
    localStorage.setItem(MODE_KEY, m);
  };

  const launchPipeline = () => { resetAll(); navigate("/idea"); };
  const launchStandalone = (path: string) => { resetAll(); navigate(withStandalone(path)); };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 28 }}>
      <CreateHero mode={mode} onChange={setModeAndPersist} />

      <div style={{ position: "relative" }}>
        <div key={mode} style={{ animation: "createFade .25s ease" }}>
          {mode === "pipeline"
            ? <PipelineView onStart={launchPipeline} />
            : <StandaloneView onOpen={launchStandalone} />}
        </div>
      </div>

      <style>{`
        @keyframes createFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────── Hero with integrated mode toggle ─────────────── */

function CreateHero({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div
      style={{
        position: "relative",
        padding: "32px 32px 0",
        borderRadius: 24,
        background: "linear-gradient(135deg, var(--bg-elev) 0%, var(--accent-tint) 100%)",
        border: "1px solid var(--line)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -160,
          right: -160,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.18), transparent 60%)",
          filter: "blur(10px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -120,
          left: -120,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.10), transparent 60%)",
          filter: "blur(12px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 12px",
          borderRadius: 99,
          background: "var(--accent-soft)",
          color: "var(--accent-ink)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--accent)" }} />
          Create
        </div>

        <h1 style={{
          margin: "16px 0 8px",
          fontFamily: "var(--font-heading, var(--font-serif))",
          fontSize: 44,
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          fontWeight: 400,
        }}>
          Start <em style={{ color: "var(--accent)" }}>creating.</em>{" "}
          <span style={{ color: "var(--ink-3)", fontStyle: "normal", fontSize: 28, fontFamily: "inherit" }}>
            Your way.
          </span>
        </h1>
        <p style={{
          margin: 0,
          color: "var(--ink-3)",
          fontSize: 15,
          maxWidth: 620,
          lineHeight: 1.55,
        }}>
          Run the full guided pipeline from idea to thumbnail — or grab a single tool, do focused work, and publish on its own.
        </p>

        {/* Big mode toggle */}
        <div style={{ marginTop: 28, paddingBottom: 32 }}>
          <ModeChooser mode={mode} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

function ModeChooser({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Choose how you want to create"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 10,
        padding: 6,
        borderRadius: 18,
        background: "var(--bg-elev)",
        border: "1px solid var(--line)",
        boxShadow: "0 10px 24px -16px rgba(0,0,0,0.12)",
      }}
    >
      <ModeCard
        active={mode === "pipeline"}
        onClick={() => onChange("pipeline")}
        icon="film"
        title="Pipeline"
        sub="Idea → Script → Title → Description → Thumbnail"
        badge="Recommended"
      />
      <ModeCard
        active={mode === "standalone"}
        onClick={() => onChange("standalone")}
        icon="grid"
        title="Standalone"
        sub="Pick a single tool, finish, publish."
      />
    </div>
  );
}

function ModeCard({ active, onClick, icon, title, sub, badge }: {
  active: boolean; onClick: () => void; icon: string; title: string; sub: string; badge?: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: "14px 18px",
        borderRadius: 14,
        border: active ? "1px solid var(--accent)" : "1px solid transparent",
        background: active ? "var(--accent-soft)" : "transparent",
        color: "var(--ink)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "background .15s ease, border-color .15s ease, transform .15s ease",
        position: "relative",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-soft)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: active ? "var(--accent)" : "var(--ink)",
          color: active ? "white" : "var(--accent)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          transition: "background .15s ease, color .15s ease",
        }}
      >
        <Icon name={icon} size={20} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{title}</span>
          {badge && (
            <span style={{
              fontSize: 10,
              padding: "2px 7px",
              borderRadius: 99,
              background: active ? "var(--accent)" : "var(--ink)",
              color: "white",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{
          fontSize: 12,
          color: "var(--ink-3)",
          marginTop: 3,
          lineHeight: 1.4,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {sub}
        </div>
      </div>
      <span
        aria-hidden
        style={{
          width: 22, height: 22, borderRadius: 99, flexShrink: 0,
          border: active ? "none" : "1.5px solid var(--line-strong)",
          background: active ? "var(--accent)" : "transparent",
          color: "white",
          display: "grid", placeItems: "center",
          transition: "background .15s ease, border-color .15s ease",
        }}
      >
        {active && <Icon name="check" size={12} />}
      </span>
    </button>
  );
}

/* ─────────────── Pipeline tab ─────────────── */

function PipelineView({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          padding: 28,
          borderRadius: 22,
          background: "var(--bg-elev)",
          border: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="eyebrow"><Icon name="film" size={11} /> Guided pipeline</div>
            <h2 style={{
              margin: "8px 0 0",
              fontFamily: "var(--font-heading, var(--font-serif))",
              fontSize: 26,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}>
              Idea to publish — in <em style={{ color: "var(--accent)" }}>one chain.</em>
            </h2>
            <p className="muted" style={{ maxWidth: 540, marginTop: 6, fontSize: 13.5 }}>
              Each step carries context into the next, so nothing is re-typed and your draft auto-saves the whole way through.
            </p>
          </div>
          <button onClick={onStart} className="btn accent lg" style={{ borderRadius: 12 }}>
            <Icon name="sparkles" size={14} /> Start the pipeline
          </button>
        </div>

        <PipelineDiagram steps={TOOLS} />

        <div style={{
          display: "flex", gap: 16, color: "var(--ink-3)", fontSize: 12.5,
          flexWrap: "wrap", paddingTop: 4,
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="check" size={12} style={{ color: "var(--accent)" }} /> Auto-saved drafts
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="check" size={12} style={{ color: "var(--accent)" }} /> Resume from any step
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="check" size={12} style={{ color: "var(--accent)" }} /> Single project record
          </span>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 14,
      }}>
        <Benefit
          icon="lightbulb"
          title="Context-aware"
          body="Each step reads your previous picks — no copy-paste between tools."
        />
        <Benefit
          icon="save"
          title="Auto-saved drafts"
          body="Step away anytime — your project waits on the dashboard."
        />
        <Benefit
          icon="trend"
          title="Optimized output"
          body="CTR predictions and hook scoring tuned to your channel's history."
        />
      </div>
    </div>
  );
}

function PipelineDiagram({ steps }: { steps: ToolDef[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
        gap: 10,
        alignItems: "stretch",
      }}
    >
      {steps.map((s, i) => (
        <div key={s.code} style={{ position: "relative" }}>
          {i < steps.length - 1 && (
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: 32,
                right: -8,
                width: 16,
                height: 2,
                background: "linear-gradient(90deg, var(--accent) 0%, var(--line-strong) 100%)",
                borderRadius: 2,
                zIndex: 1,
              }}
            />
          )}
          <div
            style={{
              background: "var(--bg-elev)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "14px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              height: "100%",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--ink)",
                  color: "var(--accent)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name={s.icon} size={16} />
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent-ink)",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  padding: "2px 7px",
                  borderRadius: 99,
                  background: "var(--accent-soft)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{s.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.4 }}>{s.pipelineHint}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Benefit({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div
      style={{
        background: "var(--bg-elev)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          background: "var(--accent-soft)",
          color: "var(--accent)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Icon name={icon} size={17} />
      </span>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

/* ─────────────── Standalone tab ─────────────── */

function StandaloneView({ onOpen }: { onOpen: (path: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          padding: "20px 24px",
          background: "var(--bg-elev)",
          border: "1px solid var(--line)",
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "linear-gradient(135deg, var(--ink) 0%, var(--ink-2) 100%)",
            color: "var(--accent)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            boxShadow: "0 12px 28px -14px rgba(37,99,235,0.5)",
          }}
        >
          <Icon name="sparkles" size={20} />
        </span>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Use one tool, on its own.</div>
          <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 3 }}>
            Skip the chain — open any tool below, generate what you need, then publish or copy out.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{
            fontSize: 11,
            color: "var(--ink-3)",
            fontFamily: "var(--font-mono)",
            background: "var(--bg-soft)",
            border: "1px solid var(--line)",
            padding: "4px 10px",
            borderRadius: 99,
          }}>
            {TOOLS.length} tools
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {TOOLS.map((t, i) => (
          <StandaloneCard key={t.code} tool={t} index={i} onClick={() => onOpen(t.path)} />
        ))}
      </div>

      <div
        style={{
          padding: 20,
          background: "var(--bg-elev)",
          border: "1px dashed var(--line-strong)",
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "var(--accent-soft)",
            color: "var(--accent)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="arrowRight" size={18} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Ready to publish?</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 3 }}>
            Every standalone tool has a <b>Publish</b> button — finish your work there and push it live.
          </div>
        </div>
      </div>
    </div>
  );
}

function StandaloneCard({ tool, index, onClick }: { tool: ToolDef; index: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        background: "var(--bg-elev)",
        border: "1px solid var(--line)",
        borderRadius: 18,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        cursor: "pointer",
        fontFamily: "inherit",
        color: "inherit",
        transition: "transform .15s ease, border-color .15s ease, box-shadow .15s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 16px 36px -18px rgba(37,99,235,0.4)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: -40, right: -40,
          width: 140, height: 140,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--accent-soft), transparent 65%)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: "linear-gradient(135deg, var(--ink) 0%, var(--ink-2) 100%)",
            color: "var(--accent)",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 10px 24px -14px rgba(37,99,235,0.5)",
          }}
        >
          <Icon name={tool.icon} size={20} />
        </span>
        <span
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: "var(--ink-3)",
            fontWeight: 700,
            letterSpacing: "0.08em",
            background: "var(--bg-soft)",
            padding: "3px 8px",
            borderRadius: 99,
          }}
        >
          {tool.code} · {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div style={{ position: "relative", fontSize: 16, fontWeight: 700, marginTop: 2 }}>
        {tool.name}
      </div>
      <div style={{ position: "relative", fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.5, flex: 1 }}>
        {tool.blurb}
      </div>
      <div style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: "var(--accent)",
        fontWeight: 600,
        fontSize: 12.5,
        marginTop: 6,
        paddingTop: 12,
        borderTop: "1px dashed var(--line)",
      }}>
        Open tool <Icon name="arrowRight" size={13} />
      </div>
    </button>
  );
}
