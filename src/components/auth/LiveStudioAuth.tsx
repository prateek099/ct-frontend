// Live Studio shell — shared by Login and Signup.
// Two-column dark layout: animated pipeline preview (left) + auth form (right).

import { useEffect, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon from "../shared/Icon";

type AuthMode = "login" | "signup";

interface FormValues { name?: string; email: string; password: string; }

interface Props {
  mode: AuthMode;
  onSubmit: (values: FormValues) => Promise<void> | void;
  onGoogle: () => void;
  submitting: boolean;
  error: string;
}

const TOOLS = [
  { name: "Video Ideas", icon: "lightbulb" },
  { name: "Script Writer", icon: "pencil" },
  { name: "Title Generator", icon: "tag" },
  { name: "Description", icon: "align" },
  { name: "Thumbnail Lab", icon: "image" },
  { name: "AI Voiceover", icon: "mic" },
  { name: "Video Generator", icon: "film" },
  { name: "Review Script", icon: "check" },
  { name: "Repurpose", icon: "split" },
  { name: "Trending Finder", icon: "trend" },
  { name: "Channel Stats", icon: "chart" },
  { name: "Content Calendar", icon: "calendar" },
  { name: "Link in Bio", icon: "link" },
  { name: "My Shop", icon: "bag" },
  { name: "Subtitles DL", icon: "download" },
  { name: "Copyright Checker", icon: "shield" },
];

const PIPELINE = [
  { name: "Idea", icon: "lightbulb" },
  { name: "Script", icon: "pencil" },
  { name: "Title", icon: "tag" },
  { name: "SEO", icon: "align" },
  { name: "Thumbnail", icon: "image" },
];

const LIVE_TICKS = [
  { chip: "GENERATING IDEAS", title: "5 hook-scored ideas",     status: "Pulling trending topics in your niche…", progress: 28, tone: "coral" as const },
  { chip: "DRAFTING SCRIPT",  title: "Script v1 · 1,240 words", status: "Hook · Intro · 3 systems · CTA",          progress: 62, tone: "coral" as const },
  { chip: "QUALITY REVIEW",   title: "Live review · 84 / 100",  status: "Hook strong · CTA placement +",           progress: 88, tone: "mint"  as const },
  { chip: "TITLE CTR",        title: "+18% predicted CTR",      status: '"3 Systems That Made Me Consistent"',     progress: 96, tone: "coral" as const },
  { chip: "THUMBNAIL LAB",    title: "4 variants ready",        status: "Bold-text · Cinematic · Minimal · Meme",  progress: 74, tone: "plum"  as const },
];

const TONE_COLOR = { coral: "var(--coral)", mint: "var(--mint-bright)", plum: "#9B83FF" };

export default function LiveStudioAuth({ mode, onSubmit, onGoogle, submitting, error }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(i => (i + 1) % LIVE_TICKS.length), 2400);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void onSubmit({ name, email, password });
  };

  const cur = LIVE_TICKS[tick];
  const activeStep = Math.min(4, Math.floor((tick * PIPELINE.length) / LIVE_TICKS.length));

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "var(--night)", color: "white",
      overflow: "hidden", fontFamily: "var(--font-sans)",
    }}>
      <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "1.05fr 1fr" }}>
        {/* === LEFT — live preview === */}
        <div style={{
          position: "relative", padding: "32px 40px", overflow: "hidden",
          background:
            "radial-gradient(circle at 18% 18%, rgba(255,90,54,0.20), transparent 50%), " +
            "radial-gradient(circle at 82% 92%, rgba(107,75,255,0.20), transparent 55%), " +
            "var(--night)",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), " +
              "linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(circle at 50% 60%, black 0%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 60%, black 0%, transparent 75%)",
            pointerEvents: "none",
          }} />

          <Logo />

          <div style={{ marginTop: 44, position: "relative", zIndex: 2, maxWidth: 540 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1.8,
              color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 14,
            }}>
              ↓ Watch your next video build itself
            </div>
            <h1 style={{
              fontFamily: "var(--font-serif)", fontWeight: 400,
              fontSize: 60, lineHeight: 0.98, margin: 0, letterSpacing: "-0.025em",
            }}>
              From idea to <i style={{ color: "var(--coral)" }}>published</i><br />
              in one workspace.
            </h1>
            <p style={{
              marginTop: 16, fontSize: 15, lineHeight: 1.55,
              color: "rgba(255,255,255,0.65)", maxWidth: 460,
            }}>
              19 AI tools wired into a single pipeline. Stop tab-switching between 8 apps.
              Average creator publishes <b style={{ color: "white" }}>2× more</b> in their first month.
            </p>
          </div>

          <div style={{
            position: "absolute", left: 40, right: 40, bottom: 32, zIndex: 2,
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <PipelineStrip activeStep={activeStep} />
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
              <LiveCard cur={cur} tickKey={tick} />
              <MetricsCard />
            </div>
          </div>

          <div style={{
            position: "absolute", top: 0, right: 0, width: 200, height: "100%",
            pointerEvents: "none",
            maskImage: "linear-gradient(180deg, transparent 0%, black 18%, black 82%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 18%, black 82%, transparent 100%)",
          }}>
            <ToolReel />
          </div>
        </div>

        {/* === RIGHT — form === */}
        <FormPanel
          mode={mode}
          name={name} setName={setName}
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          showPw={showPw} setShowPw={setShowPw}
          error={error}
          submitting={submitting}
          onSubmit={handleSubmit}
          onGoogle={onGoogle}
        />
      </div>
    </div>
  );
}

/* ====== Subcomponents ====== */

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 2 }}>
      <svg width={26} height={26} viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="8" fill="var(--coral)" />
        <path d="M12 10.2l9 5.8-9 5.8z" fill="#fff" />
      </svg>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>Creator OS</div>
        <div style={{
          fontSize: 9, fontWeight: 600, letterSpacing: "0.16em",
          color: "rgba(255,255,255,0.45)", textTransform: "uppercase",
        }}>For YouTube</div>
      </div>
    </div>
  );
}

function PipelineStrip({ activeStep }: { activeStep: number }) {
  return (
    <div style={{
      display: "flex", gap: 6,
      padding: "10px 14px",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid var(--night-line)",
      borderRadius: "var(--r-md)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    }}>
      {PIPELINE.map((s, i) => {
        const done = i < activeStep;
        const cur = i === activeStep;
        return (
          <div key={s.name} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{
              width: 22, height: 22, borderRadius: 6, flex: "0 0 22px",
              background: done ? "var(--coral)" : cur ? "rgba(255,90,54,0.18)" : "rgba(255,255,255,0.06)",
              color: done ? "white" : cur ? "var(--coral)" : "rgba(255,255,255,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .35s",
            }}>
              <Icon name={s.icon} size={12} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 10, fontWeight: 600,
                color: done || cur ? "white" : "rgba(255,255,255,0.5)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{s.name}</div>
              <div style={{
                height: 2, marginTop: 3,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 99, overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: done ? "100%" : cur ? "60%" : "0%",
                  background: "var(--coral)",
                  transition: "width .8s",
                  animation: cur ? "pulse-dot 1.4s infinite" : "none",
                }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LiveCard({ cur, tickKey }: { cur: typeof LIVE_TICKS[number]; tickKey: number }) {
  const tone = TONE_COLOR[cur.tone];
  return (
    <div key={tickKey} style={{
      padding: 14, borderRadius: "var(--r-md)",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid var(--night-line)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      animation: "fadeUp .45s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{
          width: 6, height: 6, borderRadius: 99,
          background: tone, animation: "pulse-dot 1.4s infinite",
        }} />
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: tone }}>{cur.chip}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{cur.title}</div>
      <div style={{
        fontSize: 11, color: "rgba(255,255,255,0.65)",
        marginBottom: 10, minHeight: 28, lineHeight: 1.4,
      }}>{cur.status}</div>
      <div style={{
        height: 3, background: "rgba(255,255,255,0.08)",
        borderRadius: 99, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${cur.progress}%`,
          background: tone,
          transition: "width 1.6s cubic-bezier(.4,0,.2,1)",
          borderRadius: 99,
        }} />
      </div>
    </div>
  );
}

function MetricsCard() {
  const [vals, setVals] = useState({ views: 184.2, ctr: 6.4, subs: 1284 });
  useEffect(() => {
    const t = setInterval(() => setVals(v => ({
      views: +(v.views + Math.random() * 0.4).toFixed(1),
      ctr: +(v.ctr + (Math.random() - 0.5) * 0.05).toFixed(2),
      subs: v.subs + Math.floor(Math.random() * 4),
    })), 1500);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      padding: 14, borderRadius: "var(--r-md)",
      background: "rgba(255,255,255,0.04)",
      border: "1px solid var(--night-line)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{ color: "var(--mint-bright)", display: "inline-flex" }}>
          <Icon name="trend" size={12} />
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "var(--mint-bright)" }}>
          LIVE · 7-DAY
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <MetricRow label="Views" value={`${vals.views.toFixed(1)}k`} />
        <MetricRow label="CTR" value={`${vals.ctr.toFixed(1)}%`} />
        <MetricRow label="Subs" value={vals.subs.toLocaleString()} />
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "white" }}>
        {value}
      </span>
    </div>
  );
}

function ToolReel() {
  const doubled = [...TOOLS, ...TOOLS];
  return (
    <div style={{ position: "absolute", top: "50%", left: 0, right: 0, transform: "translateY(-50%)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "marquee 38s linear infinite" }}>
        {doubled.slice(0, 22).map((t, i) => (
          <div key={i} style={{
            padding: "9px 13px",
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--night-line)",
            borderRadius: "var(--r-pill)",
            fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.85)",
            whiteSpace: "nowrap",
            transform: `translateX(${i % 2 ? 36 : -8}px)`,
          }}>
            <span style={{ color: "var(--coral)", display: "inline-flex" }}>
              <Icon name={t.icon} size={12} />
            </span>
            {t.name}
          </div>
        ))}
      </div>
    </div>
  );
}

interface FormPanelProps {
  mode: AuthMode;
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  showPw: boolean; setShowPw: (v: boolean) => void;
  error: string;
  submitting: boolean;
  onSubmit: (e: FormEvent) => void;
  onGoogle: () => void;
}

function FormPanel(p: FormPanelProps) {
  const isSignup = p.mode === "signup";
  return (
    <div style={{
      position: "relative",
      padding: "32px 40px",
      display: "flex", flexDirection: "column",
      background: "var(--night-2)",
      borderLeft: "1px solid var(--night-line)",
    }}>
      <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
        {isSignup ? "Already have an account?" : "Don't have an account?"}
        <Link
          to={isSignup ? "/login" : "/signup"}
          style={{ color: "var(--coral)", fontWeight: 600, marginLeft: 6 }}
        >
          {isSignup ? "Sign in" : "Sign up"}
        </Link>
      </div>

      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        maxWidth: 380, width: "100%", margin: "0 auto",
      }}>
        <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>
        <p style={{ margin: "8px 0 28px", color: "rgba(255,255,255,0.55)", fontSize: 14 }}>
          {isSignup ? "Free for 14 days — no card needed." : "Sign in to your Creator OS workspace."}
        </p>

        {p.error && (
          <div style={{
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.35)",
            color: "#fca5a5",
            borderRadius: "var(--r-md)",
            padding: "10px 14px",
            fontSize: 13,
            marginBottom: 16,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Icon name="x" size={14} />
            {p.error}
          </div>
        )}

        <form onSubmit={p.onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isSignup && (
            <Field
              label="Full name"
              type="text"
              placeholder="Jane Doe"
              value={p.name}
              onChange={e => p.setName(e.target.value)}
              autoComplete="name"
              autoFocus
              required
            />
          )}
          <Field
            label="Email address"
            type="email"
            placeholder="your@email.com"
            value={p.email}
            onChange={e => p.setEmail(e.target.value)}
            autoComplete="email"
            autoFocus={!isSignup}
            required
          />
          <Field
            label="Password"
            type={p.showPw ? "text" : "password"}
            placeholder="••••••••"
            value={p.password}
            onChange={e => p.setPassword(e.target.value)}
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            right={
              !isSignup && (
                <Link to="/forgot-password" style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                  Forgot?
                </Link>
              )
            }
            adornment={
              <button
                type="button"
                onClick={() => p.setShowPw(!p.showPw)}
                tabIndex={-1}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  padding: 6, color: "rgba(255,255,255,0.6)",
                  background: "transparent", border: "none", cursor: "pointer",
                }}
              >
                <Icon name={p.showPw ? "eyeOff" : "eye"} size={16} />
              </button>
            }
          />

          <div style={{ marginTop: 6 }}>
            <PrimaryBtn type="submit" disabled={p.submitting}>
              {p.submitting
                ? (isSignup ? "Creating account…" : "Signing in…")
                : <>{isSignup ? "Create account" : "Sign in"} <Icon name="arrowRight" size={16} /></>}
            </PrimaryBtn>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 12, margin: "8px 0",
            color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 600, letterSpacing: "0.15em",
          }}>
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            OR
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          <GoogleBtn onClick={p.onGoogle} />
        </form>

        <div style={{
          marginTop: 28, padding: 14, borderRadius: "var(--r-md)",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <span style={{ color: "var(--coral)", marginTop: 2, display: "inline-flex" }}>
            <Icon name="sparkles" size={16} />
          </span>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
            <b style={{ color: "white" }}>{isSignup ? "Heads up:" : "New here?"}</b>{" "}
            {isSignup
              ? "We connect your channel right after sign-up and pre-build your first 3 video ideas — takes 30 seconds."
              : "After sign-up we connect your channel and pre-build your first 3 video ideas — takes 30 seconds."}
          </div>
        </div>

        <div style={{
          marginTop: 20, display: "flex", gap: 18, alignItems: "center",
          color: "rgba(255,255,255,0.5)", fontSize: 11,
        }}>
          <div style={{ display: "flex" }}>
            {(["#FF5A36", "#6B4BFF", "#19C37D", "#F4A724"] as const).map((c, i) => (
              <div key={i} style={{
                width: 22, height: 22, borderRadius: "50%",
                background: c, border: "2px solid var(--night-2)",
                marginLeft: i ? -7 : 0,
                fontSize: 9, fontWeight: 700, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {["AR", "KM", "JT", "SL"][i]}
              </div>
            ))}
          </div>
          <span><b style={{ color: "white" }}>4,200+ creators</b> publishing weekly</span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
        By continuing you agree to our <u>Terms</u> and <u>Privacy</u>.
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
  right?: ReactNode;
  adornment?: ReactNode;
}

function Field({ label, type = "text", placeholder, value, onChange, autoComplete, autoFocus, required, right, adornment }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const padRight: CSSProperties = adornment ? { paddingRight: 40 } : {};
  return (
    <label style={{ display: "block" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{label}</span>
        {right}
      </div>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: "13px 14px",
            ...padRight,
            background: focused ? "rgba(255,90,54,0.06)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${focused ? "var(--coral)" : "rgba(255,255,255,0.10)"}`,
            borderRadius: "var(--r-md)",
            color: "white", fontSize: 14, outline: "none",
            transition: "border-color .15s, background .15s",
            boxSizing: "border-box",
          }}
        />
        {adornment}
      </div>
    </label>
  );
}

function PrimaryBtn({ children, disabled, type = "button", onClick }: {
  children: ReactNode; disabled?: boolean; type?: "button" | "submit"; onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", padding: "14px 16px",
        borderRadius: "var(--r-md)", border: "none",
        background: "linear-gradient(180deg, #FF6E4D 0%, var(--coral) 100%)",
        color: "white", fontWeight: 600, fontSize: 14, letterSpacing: "0.01em",
        boxShadow: "var(--sh-cta)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
        transition: "transform .15s, box-shadow .15s",
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
    >
      {children}
    </button>
  );
}

function GoogleBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%", padding: "14px 16px",
        borderRadius: "var(--r-md)", border: "none",
        background: "white", color: "#1a1410",
        fontWeight: 600, fontSize: 14,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        cursor: "pointer",
        transition: "transform .15s ease",
      }}
      onMouseDown={e => (e.currentTarget.style.transform = "scale(0.985)")}
      onMouseUp={e => (e.currentTarget.style.transform = "")}
      onMouseLeave={e => (e.currentTarget.style.transform = "")}
    >
      <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden>
        <path fill="#4285F4" d="M17.6 9.2c0-.6 0-1.2-.2-1.8H9v3.4h4.8c-.2 1.1-.8 2-1.8 2.6v2.2h2.9c1.7-1.6 2.7-4 2.7-6.4z" />
        <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.6-1.9.9-3.1.9-2.4 0-4.4-1.6-5.1-3.7H.9v2.3A9 9 0 0 0 9 18z" />
        <path fill="#FBBC05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.5V5H.9a9 9 0 0 0 0 8.1z" />
        <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3L15 2.3A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6z" />
      </svg>
      Continue with Google
    </button>
  );
}
