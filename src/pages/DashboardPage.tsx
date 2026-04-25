// DashboardPage — Focal variant with optional first-run onboarding.
// First-run is detected via localStorage flag; user can skip or complete to proceed to focal view.

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/shared/Icon";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../api/useProjects";
import { useWorkflow } from "../context/WorkflowContext";
import type { Project } from "../types/project";

const FIRST_RUN_KEY = "ct_first_run_seen";

const PIPELINE_STEPS = [
  { id: "idea",   name: "Idea" },
  { id: "script", name: "Script" },
  { id: "title",  name: "Title" },
  { id: "seo",    name: "SEO" },
  { id: "thumb",  name: "Thumbnail" },
] as const;

const PALETTE = ["coral", "violet", "mint", "amber", "rose"] as const;
const COLOR_MAP: Record<typeof PALETTE[number], { bg: string; ink: string }> = {
  coral:  { bg: "#FF5A36", ink: "#fff" },
  violet: { bg: "#6B4BFF", ink: "#fff" },
  mint:   { bg: "#19C37D", ink: "#fff" },
  amber:  { bg: "#F4A724", ink: "#1a1410" },
  rose:   { bg: "#FF477E", ink: "#fff" },
};

const STATS = [
  { label: "7-day views", value: "184.2k", delta: "+12.4%", pos: true },
  { label: "Avg watch",   value: "4:12",   delta: "+0:18",  pos: true },
  { label: "CTR",         value: "6.4%",   delta: "−0.3%",  pos: false },
  { label: "Subs gained", value: "1,284",  delta: "+8.1%",  pos: true },
];

const TRENDING_HOOKS = [
  { lift: "+340%", phrase: "AI tools for creators" },
  { lift: "+210%", phrase: "Claude vs ChatGPT 2026" },
  { lift: "+155%", phrase: "Free alternatives to…" },
];

const COLLAPSE_ROW = [
  { id: "calendar", title: "This week",       subtitle: "Tue · publish AI tools · Thu · record 9-5", icon: "calendar", color: "#6B4BFF", path: "/calendar" },
  { id: "review",   title: "Recent activity", subtitle: "Script v2 reviewed · 78 / 100",             icon: "check",    color: "#19C37D", path: "/review"   },
  { id: "tools",    title: "Quick tools",     subtitle: "18 tools, one ⌘K away",                     icon: "sparkles", color: "var(--coral)", path: "/idea" },
];

const COPILOT_THOUGHTS = [
  'I\'d finish "10 Secrets to Viral" first — it\'s 80% done and ready to publish today.',
  'Your Tuesday slot is empty. "AI tools for creators" is up +340% — perfect fit for your niche.',
  'Your Avg watch is up +0:18 this week. Your audience is locking in — let\'s ride the momentum.',
];

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

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loadProject } = useWorkflow();
  const { data: inFlight = [] } = useProjects({ status: "draft,saved", limit: 10 });

  const [firstRun, setFirstRun] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(FIRST_RUN_KEY);
  });

  const completeFirstRun = () => {
    localStorage.setItem(FIRST_RUN_KEY, "1");
    setFirstRun(false);
  };

  const handleResume = (p: Project) => {
    loadProject(p);
    navigate("/idea");
  };

  const firstName = (user?.name ?? "Creator").split(" ")[0];

  if (firstRun) {
    return <FirstRun firstName={firstName} onSkip={completeFirstRun} onLaunchScript={() => { completeFirstRun(); navigate("/script"); }} />;
  }
  return (
    <DashboardFocal
      firstName={firstName}
      inFlight={inFlight}
      onResume={handleResume}
      onTrendingClick={() => navigate("/idea")}
      onCollapseClick={(path) => navigate(path)}
      onPickUp={() => {
        if (inFlight[0]) handleResume(inFlight[0]);
        else navigate("/idea");
      }}
      onNewVideo={() => navigate("/idea")}
    />
  );
}

/* ====== Focal ====== */

interface FocalProps {
  firstName: string;
  inFlight: Project[];
  onResume: (p: Project) => void;
  onTrendingClick: () => void;
  onCollapseClick: (path: string) => void;
  onPickUp: () => void;
  onNewVideo: () => void;
}

function DashboardFocal({ firstName, inFlight, onResume, onTrendingClick, onCollapseClick, onPickUp, onNewVideo }: FocalProps) {
  const focusTitle = inFlight[0] ? projectTitle(inFlight[0]) : "your next video";
  const stepNum = inFlight[0] ? projectProgress(inFlight[0]) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 1100, margin: "0 auto" }}>
      <CopilotHero
        firstName={firstName}
        focusTitle={focusTitle}
        stepNum={stepNum}
        onPickUp={onPickUp}
        onNewVideo={onNewVideo}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        <ResumeBlock inFlight={inFlight} onResume={onResume} onSeeAll={() => onCollapseClick("/calendar")} />
        <TrendingSpotlight onClick={onTrendingClick} />
      </div>
      <CollapseRow onClick={onCollapseClick} />
    </div>
  );
}

function CopilotHero({ firstName, focusTitle, stepNum, onPickUp, onNewVideo }: {
  firstName: string; focusTitle: string; stepNum: number; onPickUp: () => void; onNewVideo: () => void;
}) {
  const [phase, setPhase] = useState(0);
  const [thought, setThought] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 350);
    const t2 = setInterval(() => setThought(i => (i + 1) % COPILOT_THOUGHTS.length), 4000);
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);
  const stepLeft = Math.max(1, 5 - stepNum);
  return (
    <div style={{
      position: "relative",
      padding: "44px 48px",
      background: "linear-gradient(135deg, #FFF5F1 0%, #FFEDE6 60%, #FFE4D9 100%)",
      borderRadius: 28,
      overflow: "hidden",
      border: "1px solid #F8D8C8",
    }}>
      <svg style={{ position: "absolute", bottom: 28, right: 36, opacity: 0.55, pointerEvents: "none" }}
        width="180" height="48" viewBox="0 0 220 60" fill="none" aria-hidden>
        <path d="M2 30 Q 22 5, 42 30 T 82 30 T 122 30 T 162 30 T 218 30" stroke="var(--coral)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </svg>
      <div style={{
        position: "absolute", bottom: -60, right: -60, width: 240, height: 240, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,90,54,0.18), transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: "var(--ink)", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="sparkles" size={16} />
          </div>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
            color: "var(--ink-2)", textTransform: "uppercase",
          }}>AI Copilot</div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 8px", borderRadius: 99,
            background: "rgba(25,195,125,0.14)", color: "#0A8B53",
            fontSize: 11, fontWeight: 600,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: "var(--mint-bright)", animation: "pulse-dot 1.6s infinite" }} />
            Online
          </span>
          <span style={{
            marginLeft: "auto", fontSize: 11, color: "var(--ink-3)",
            display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
          }}>
            <span aria-hidden>🔥</span> <b style={{ color: "var(--ink)" }}>3-week streak</b>
          </span>
        </div>

        <h1 style={{
          margin: 0, fontFamily: "var(--font-serif)", fontWeight: 400,
          fontSize: 60, lineHeight: 1.0, letterSpacing: "-0.025em", color: "var(--ink)",
        }}>
          Good {greeting()}, {firstName}.<br />
          <span style={{ opacity: phase ? 1 : 0, transition: "opacity .5s" }}>
            Let's finish <i style={{ color: "var(--coral)" }}>"{focusTitle}"</i>.
          </span>
        </h1>

        <div style={{
          marginTop: 28, padding: "12px 16px", borderRadius: 12,
          background: "rgba(255,255,255,0.7)",
          border: "1px solid rgba(20,17,15,0.06)",
          maxWidth: 640,
          display: "flex", gap: 10, alignItems: "flex-start",
          position: "relative", zIndex: 1,
        }}>
          <span style={{ fontSize: 14, marginTop: 1 }} aria-hidden>💭</span>
          <div key={thought} style={{
            fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5,
            animation: "fadeUp .45s ease",
          }}>
            {COPILOT_THOUGHTS[thought]}
          </div>
        </div>

        <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={onPickUp} style={{
            padding: "14px 22px", borderRadius: 12, border: "none",
            background: "var(--ink)", color: "white", fontWeight: 600, fontSize: 14,
            display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer",
            boxShadow: "0 8px 22px -10px rgba(0,0,0,0.4)",
          }}>
            <Icon name="sparkles" size={16} /> Pick up where I left off
            <span style={{
              background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: 6, fontSize: 11,
            }}>~6 min · Step {stepNum}/5</span>
          </button>
          <button onClick={onNewVideo} style={{
            padding: "14px 18px", borderRadius: 12, background: "white", color: "var(--ink)",
            fontWeight: 600, fontSize: 14, border: "1px solid var(--line-strong)",
            display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
          }}>
            <Icon name="plus" size={16} /> Start a new video
          </button>
          <button style={{
            padding: "14px 18px", borderRadius: 12, background: "transparent",
            color: "var(--ink-2)", fontWeight: 500, fontSize: 14, border: "none",
            display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
          }}>
            <Icon name="search" size={14} /> Ask copilot anything
          </button>
        </div>

        <div style={{
          marginTop: 32, display: "flex", gap: 32,
          paddingTop: 20, borderTop: "1px solid rgba(20,17,15,0.08)",
          flexWrap: "wrap",
        }}>
          {STATS.map(s => (
            <Stat key={s.label} {...s} />
          ))}
          <span style={{ flex: 1, minWidth: 80 }} />
          {stepLeft > 0 && stepNum > 0 && (
            <span style={{ fontSize: 11, color: "var(--ink-3)", alignSelf: "flex-end" }}>
              {stepLeft} step{stepLeft === 1 ? "" : "s"} until publish
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, delta, pos }: { label: string; value: string; delta: string; pos: boolean }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: "0.14em",
        color: "var(--ink-3)", textTransform: "uppercase",
      }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: 30, fontWeight: 400, color: "var(--ink)" }}>
          {value}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600,
          color: pos ? "var(--mint-bright)" : "var(--accent-ink)",
        }}>{delta}</span>
      </div>
    </div>
  );
}

/* ====== Resume rail ====== */

function ResumeBlock({ inFlight, onResume, onSeeAll }: {
  inFlight: Project[]; onResume: (p: Project) => void; onSeeAll: () => void;
}) {
  const top = inFlight.slice(0, 2);
  const total = inFlight.length;
  return (
    <div style={{
      background: "white", borderRadius: 20, border: "1px solid var(--line)", overflow: "hidden",
    }}>
      <div style={{
        padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--line)",
      }}>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
            color: "var(--ink-3)", textTransform: "uppercase",
          }}>In flight · {total} active</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontStyle: "italic", marginTop: 2 }}>
            Resume a project
          </div>
        </div>
        {total > 2 && (
          <button onClick={onSeeAll} style={{
            fontSize: 12, fontWeight: 600, color: "var(--coral)", background: "none", border: "none",
            display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer",
          }}>
            See all {total} <Icon name="arrowRight" size={14} />
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {top.length === 0 && (
          <div style={{ padding: 20, color: "var(--ink-3)", fontSize: 13 }}>
            No drafts yet. Hit “Start a new video” to begin.
          </div>
        )}
        {top.map((p, i) => (
          <MiniProjectRow key={p.id} project={p} palette={PALETTE[i % PALETTE.length]} onClick={() => onResume(p)} />
        ))}
      </div>
    </div>
  );
}

function MiniProjectRow({ project, palette, onClick }: {
  project: Project; palette: typeof PALETTE[number]; onClick: () => void;
}) {
  const c = COLOR_MAP[palette];
  const title = projectTitle(project);
  const step = projectProgress(project);
  const ready = step >= 5;
  const glyph = title.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "··";
  return (
    <button onClick={onClick} style={{
      padding: "14px 20px", display: "flex", alignItems: "center", gap: 14,
      borderTop: "1px solid var(--line)", textAlign: "left",
      background: "transparent", border: "none", cursor: "pointer",
      transition: "background .12s",
      fontFamily: "inherit",
    }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-soft)")}
      onMouseLeave={e => (e.currentTarget.style.background = "")}
    >
      <div style={{
        width: 40, height: 52, flex: "0 0 40px", borderRadius: 8,
        background: c.bg, color: c.ink,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-serif)", fontSize: 16, fontStyle: "italic",
      }}>{glyph}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 600, color: "var(--ink)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{title}</div>
        <div style={{ display: "flex", gap: 4, marginTop: 6, alignItems: "center" }}>
          {PIPELINE_STEPS.map((s, i) => {
            const done = i < step;
            const cur = i === step && !ready;
            return (
              <div key={s.id} style={{
                width: 24, height: 3, borderRadius: 2,
                background: done ? c.bg : "var(--line)",
                opacity: cur ? 0.5 : 1,
                animation: cur ? "pulse-dot 1.4s infinite" : "none",
              }} />
            );
          })}
          <span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 8 }}>
            {ready ? "Ready · publish" : `Step ${step}/5`}
          </span>
        </div>
      </div>
      <span style={{
        color: c.bg, fontWeight: 600, fontSize: 13,
        display: "inline-flex", alignItems: "center", gap: 4,
      }}>
        {ready ? "Publish" : "Resume"} <Icon name="arrowRight" size={14} />
      </span>
    </button>
  );
}

/* ====== Trending spotlight ====== */

function TrendingSpotlight({ onClick }: { onClick: () => void }) {
  return (
    <div style={{
      background: "var(--ink)", color: "white", borderRadius: 20, padding: 20,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,90,54,0.4), transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--coral)", display: "inline-flex" }}><Icon name="flame" size={16} /></span>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
            color: "var(--coral)", textTransform: "uppercase",
          }}>Hot in your niche</span>
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontStyle: "italic", marginTop: 6 }}>
          Trending now
        </div>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {TRENDING_HOOKS.map((h, i) => (
            <button key={i} onClick={onClick} style={{
              padding: "10px 12px", borderRadius: 10, textAlign: "left",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", gap: 12, color: "white", cursor: "pointer",
              transition: "background .15s",
              fontFamily: "inherit",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            >
              <span style={{
                fontSize: 11, fontWeight: 700, color: "var(--mint-bright)",
                background: "rgba(25,195,125,0.15)", padding: "3px 7px", borderRadius: 5,
                fontFamily: "var(--font-mono)",
              }}>{h.lift}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{h.phrase}</span>
              <span style={{ color: "rgba(255,255,255,0.4)", display: "inline-flex" }}>
                <Icon name="arrowRight" size={14} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ====== Collapse row ====== */

function CollapseRow({ onClick }: { onClick: (path: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      {COLLAPSE_ROW.map(it => (
        <button key={it.id} onClick={() => onClick(it.path)} style={{
          padding: 18, background: "white", borderRadius: 16, border: "1px solid var(--line)",
          display: "flex", alignItems: "center", gap: 14, textAlign: "left",
          transition: "all .15s", cursor: "pointer", fontFamily: "inherit",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--line-strong)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.transform = ""; }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `color-mix(in srgb, ${it.color} 12%, transparent)`,
            color: it.color,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name={it.icon} size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{it.title}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{it.subtitle}</div>
          </div>
          <span style={{ color: "var(--ink-4)", display: "inline-flex" }}>
            <Icon name="arrowRight" size={16} />
          </span>
        </button>
      ))}
    </div>
  );
}

/* ====== First-run onboarding ====== */

interface FirstRunProps {
  firstName: string;
  onSkip: () => void;
  onLaunchScript: () => void;
}

const ONBOARD_IDEAS = [
  { lift: "+340%", title: "I tested every AI tool for creators in 2026", reason: "AI tools is up 340% in your niche" },
  { lift: "+210%", title: "Claude vs ChatGPT — a creator's honest breakdown", reason: "comparison-format CTR is 2.1× yours" },
  { lift: "+155%", title: "5 free tools that replaced my $200/mo stack", reason: "list format hits your audience's hook style" },
];
const TONES = [
  { name: "Punchy",      desc: "Fast cuts · short sentences", icon: "🔥" },
  { name: "Storyteller", desc: "Narrative arc · personal",    icon: "📖" },
  { name: "Educational", desc: "Step-by-step · clear",        icon: "🎓" },
];

function FirstRun({ firstName, onSkip, onLaunchScript }: FirstRunProps) {
  const [step, setStep] = useState(0);
  const [channel, setChannel] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [niche, setNiche] = useState<string | null>(null);

  const analyze = () => {
    if (!channel) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setNiche("Creator economy · Tech reviews");
      setStep(1);
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{
        position: "relative", padding: 36,
        background: "var(--ink)", color: "white",
        borderRadius: 28, overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -80, right: -80, width: 360, height: 360, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,90,54,0.5), transparent 65%)",
          filter: "blur(10px)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.16em",
              color: "var(--coral)", textTransform: "uppercase",
            }}>Welcome to Creator OS</div>
            <span style={{
              fontSize: 11, fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.5)",
            }}>· Step {step + 1} of 3</span>
          </div>
          <h1 style={{
            margin: "10px 0 0", fontFamily: "var(--font-serif)", fontWeight: 400,
            fontSize: 52, lineHeight: 1.0, letterSpacing: "-0.022em",
          }}>
            Hey {firstName} — let's get<br />
            your <i style={{ color: "var(--coral)" }}>first 3 ideas.</i>
          </h1>
          <p style={{ marginTop: 14, fontSize: 15, color: "rgba(255,255,255,0.7)", maxWidth: 520 }}>
            30 seconds. Connect your channel and I'll show you exactly what to film next, ranked by what's trending in your niche.
          </p>
          <div style={{ marginTop: 22, display: "flex", gap: 6 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: i <= step ? "var(--coral)" : "rgba(255,255,255,0.1)",
                transition: "background .3s",
              }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 24, padding: 28,
        background: "white", borderRadius: 20, border: "1px solid var(--line)",
      }}>
        <OnboardStep n={1} active={step === 0} done={step > 0} title="Connect your YouTube channel" hint="Used to personalize trending ideas — read-only.">
          {step === 0 && (
            <>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} aria-hidden>
                    <YouTubeMark />
                  </span>
                  <input
                    value={channel}
                    onChange={e => setChannel(e.target.value)}
                    placeholder="@yourchannel or paste channel URL"
                    style={{
                      width: "100%", padding: "13px 14px 13px 50px",
                      border: "1px solid var(--line-strong)", borderRadius: 10,
                      fontSize: 14, outline: "none", boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--coral)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--line-strong)")}
                  />
                </div>
                <button onClick={analyze} disabled={!channel || analyzing} style={{
                  padding: "0 22px", borderRadius: 10, border: "none",
                  background: channel ? "var(--coral)" : "var(--bg-soft)",
                  color: channel ? "white" : "var(--ink-3)",
                  fontWeight: 600, fontSize: 14,
                  display: "inline-flex", alignItems: "center", gap: 8,
                  cursor: !channel || analyzing ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}>
                  {analyzing ? "Analyzing…" : <>Connect <Icon name="arrowRight" size={14} /></>}
                </button>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "var(--ink-3)", marginRight: 4, alignSelf: "center" }}>Try:</span>
                {["@MKBHD", "@AliAbdaal", "@Veritasium"].map(c => (
                  <button key={c} onClick={() => setChannel(c)} style={{
                    padding: "5px 10px", borderRadius: 99, border: "none",
                    fontSize: 11, background: "var(--bg-soft)", color: "var(--ink-2)",
                    fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                  }}>{c}</button>
                ))}
              </div>
            </>
          )}
          {step > 0 && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-3)" }}>
              <span style={{ color: "var(--mint-bright)" }}>✓</span>
              Connected <b style={{ color: "var(--ink)" }}>{channel}</b> · niche: {niche}
            </div>
          )}
        </OnboardStep>

        <Divider />

        <OnboardStep n={2} active={step === 1} done={step > 1} title="Save the ideas you'd actually film" hint="Hand-picked from 14k trending videos in your niche this week.">
          {step === 1 && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, animation: "fadeUp .4s ease" }}>
              {ONBOARD_IDEAS.map((it, i) => {
                const sel = picked === i;
                return (
                  <button key={i} onClick={() => setPicked(i)} style={{
                    padding: 14, borderRadius: 12, textAlign: "left",
                    background: sel ? "var(--coral-soft)" : "var(--bg-soft)",
                    border: sel ? "1.5px solid var(--coral)" : "1px solid var(--line)",
                    display: "flex", alignItems: "center", gap: 14,
                    transition: "all .12s", cursor: "pointer", fontFamily: "inherit",
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: "var(--mint-bright)",
                      background: "var(--mint-soft)", padding: "3px 8px", borderRadius: 6,
                      fontFamily: "var(--font-mono)",
                    }}>{it.lift}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{it.title}</div>
                      <div style={{
                        fontSize: 11, color: "var(--ink-3)", marginTop: 2,
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <span style={{ color: "var(--coral)", display: "inline-flex" }}><Icon name="sparkles" size={11} /></span>
                        {it.reason}
                      </div>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: 99,
                      border: sel ? "none" : "1.5px solid var(--line-strong)",
                      background: sel ? "var(--coral)" : "transparent",
                      color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
                    }}>
                      {sel && "✓"}
                    </div>
                  </button>
                );
              })}
              <button onClick={() => picked !== null && setStep(2)} disabled={picked === null} style={{
                marginTop: 6, padding: 12, border: "none",
                background: picked !== null ? "var(--ink)" : "var(--bg-soft)",
                color: picked !== null ? "white" : "var(--ink-3)",
                borderRadius: 10, fontSize: 14, fontWeight: 600,
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: picked === null ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}>
                Continue with selected idea <Icon name="arrowRight" size={14} />
              </button>
            </div>
          )}
          {step > 1 && picked !== null && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-3)" }}>
              <span style={{ color: "var(--mint-bright)" }}>✓</span>
              Picked <b style={{ color: "var(--ink)" }}>{ONBOARD_IDEAS[picked].title}</b>
            </div>
          )}
        </OnboardStep>

        <Divider />

        <OnboardStep n={3} active={step === 2} done={false} title="Draft your first script in 60 seconds" hint="I'll generate 3 script variants in parallel — pick your favorite tone.">
          {step === 2 && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {TONES.map(s => (
                  <button key={s.name} style={{
                    padding: 12, borderRadius: 10,
                    background: "var(--bg-soft)", border: "1px solid var(--line)",
                    textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                  }}>
                    <div style={{ fontSize: 18 }} aria-hidden>{s.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{s.desc}</div>
                  </button>
                ))}
              </div>
              <button onClick={onLaunchScript} style={{
                padding: "14px 20px", border: "none",
                background: "var(--coral)", color: "white",
                borderRadius: 10, fontSize: 14, fontWeight: 600,
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "var(--sh-cta)", cursor: "pointer", fontFamily: "inherit",
              }}>
                <Icon name="sparkles" size={16} /> Generate 3 script variants
              </button>
            </div>
          )}
        </OnboardStep>
      </div>

      <div style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "var(--ink-3)" }}>
        Skip onboarding —{" "}
        <button onClick={onSkip} style={{
          color: "var(--coral)", fontWeight: 600, background: "none", border: "none",
          cursor: "pointer", fontFamily: "inherit", fontSize: 12,
        }}>
          explore the workspace →
        </button>
      </div>
    </div>
  );
}

function Divider() { return <div style={{ height: 1, background: "var(--line)", margin: "8px 0" }} />; }

function OnboardStep({ n, active, done, title, hint, children }: {
  n: number; active: boolean; done: boolean; title: string; hint?: string; children?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 16, padding: "8px 0", opacity: active || done ? 1 : 0.45 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flex: "0 0 32px",
        background: done ? "var(--mint-bright)" : active ? "var(--ink)" : "var(--bg-soft)",
        color: done || active ? "white" : "var(--ink-3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: 13,
      }}>{done ? "✓" : n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{title}</div>
        {hint && active && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>{hint}</div>}
        {children}
      </div>
    </div>
  );
}

function YouTubeMark() {
  return (
    <svg width={22} height={16} viewBox="0 0 22 16" aria-hidden>
      <rect width="22" height="16" rx="4" fill="#FF0000" />
      <path d="M9 5l5.5 3L9 11z" fill="#fff" />
    </svg>
  );
}
