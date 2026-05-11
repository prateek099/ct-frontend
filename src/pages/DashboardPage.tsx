// DashboardPage — clean focal layout: Continue on Video, Channel Analytics, Streak.
// First-run onboarding is preserved on first visit.

import { useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/shared/Icon";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../api/useProjects";
import { useChannels, useChannelStats } from "../api/useChannels";
import { useWorkflow } from "../context/WorkflowContext";
import type { Project } from "../types/project";
import type { ChannelStats, SavedChannel } from "../types/channel";

const FIRST_RUN_KEY = "ct_first_run_seen";

const PIPELINE_STEPS = [
  { id: "idea",   name: "Idea",      icon: "lightbulb" },
  { id: "script", name: "Script",    icon: "pencil" },
  { id: "title",  name: "Title",     icon: "tag" },
  { id: "seo",    name: "SEO",       icon: "hash" },
  { id: "thumb",  name: "Thumbnail", icon: "image" },
] as const;

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

/** Map project progress to the pipeline route the user should resume at. */
const STEP_ROUTES = ["/idea", "/script", "/title", "/description", "/thumbnail"] as const;
function getResumeRoute(p: Project): string {
  const progress = projectProgress(p);
  if (progress >= STEP_ROUTES.length) return STEP_ROUTES[STEP_ROUTES.length - 1];
  return STEP_ROUTES[progress];
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
    navigate(getResumeRoute(p));
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
      onNewVideo={() => navigate("/idea")}
      onOpenStats={() => navigate("/stats")}
    />
  );
}

/* ====== Focal layout ====== */

interface FocalProps {
  firstName: string;
  inFlight: Project[];
  onResume: (p: Project) => void;
  onNewVideo: () => void;
  onOpenStats: () => void;
}

function DashboardFocal({ firstName, inFlight, onResume, onNewVideo, onOpenStats }: FocalProps) {
  const focusProject = inFlight[0] ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 1280, margin: "0 auto", width: "100%" }}>
      <DashboardHero
        firstName={firstName}
        hasInFlight={!!focusProject}
        onResume={() => focusProject && onResume(focusProject)}
        onNewVideo={onNewVideo}
      />

      <div className="dash-row-2">
        <ContinueVideoCard project={focusProject} onResume={onResume} onNewVideo={onNewVideo} />
        <StreakSection />
      </div>

      <ChannelAnalyticsSection onOpen={onOpenStats} />
    </div>
  );
}

/* ====== Hero ====== */

function DashboardHero({ firstName, hasInFlight, onResume, onNewVideo }: {
  firstName: string; hasInFlight: boolean; onResume: () => void; onNewVideo: () => void;
}) {
  return (
    <div className="dash-hero">
      {/* Layered backgrounds */}
      <div className="dash-hero-dots" aria-hidden />
      <div className="dash-hero-orb dash-hero-orb-1" aria-hidden />
      <div className="dash-hero-orb dash-hero-orb-2" aria-hidden />

      <div className="dash-hero-body">
        <div className="dash-hero-text">
          <div className="dash-hero-pill">
            <span className="dash-hero-pulse" />
            Dashboard · Live
          </div>
          <h1 className="dash-hero-title">
            Good {greeting()},{" "}
            <em>{firstName}</em>
            <span className="dash-hero-wave" aria-hidden>
              <svg width="120" height="14" viewBox="0 0 120 14" fill="none">
                <path d="M2 8 Q 12 1, 22 8 T 42 8 T 62 8 T 82 8 T 118 8" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="dash-hero-sub">
            {hasInFlight
              ? "Pick up where you left off — or peek at your channel's momentum."
              : "Start your next video, or check on your channel's momentum below."}
          </p>

          <div className="dash-hero-cta">
            {hasInFlight && (
              <button onClick={onResume} className="btn accent lg" style={{ borderRadius: 12 }}>
                <Icon name="play" size={14} /> Continue editing
              </button>
            )}
            <button onClick={onNewVideo} className="btn lg" style={{ borderRadius: 12 }}>
              <Icon name="plus" size={14} /> New video
            </button>
          </div>
        </div>

        <div className="dash-hero-art" aria-hidden>
          <HeroArtwork />
        </div>
      </div>
    </div>
  );
}

function HeroArtwork() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 220" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="hero-bar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="hero-trend" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.4" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Concentric rings */}
      <circle cx="170" cy="110" r="92" fill="none" stroke="var(--accent)" strokeOpacity="0.10" strokeWidth="1.5" />
      <circle cx="170" cy="110" r="68" fill="none" stroke="var(--accent)" strokeOpacity="0.18" strokeWidth="1.5" strokeDasharray="3 5" />

      {/* Bar chart */}
      <g className="hero-bars">
        <rect x="100" y="138" width="16" height="40" rx="5" fill="url(#hero-bar)" />
        <rect x="122" y="118" width="16" height="60" rx="5" fill="url(#hero-bar)" />
        <rect x="144" y="96"  width="16" height="82" rx="5" fill="url(#hero-bar)" />
        <rect x="166" y="78"  width="16" height="100" rx="5" fill="url(#hero-bar)" />
        <rect x="188" y="62"  width="16" height="116" rx="5" fill="url(#hero-bar)" />
        <rect x="210" y="48"  width="16" height="130" rx="5" fill="url(#hero-bar)" />
      </g>

      {/* Trend arrow */}
      <path d="M 88 130 Q 130 80, 200 50 T 240 30" stroke="url(#hero-trend)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="240" cy="30" r="6" fill="var(--accent)" stroke="#fff" strokeWidth="2.5" />

      {/* Sparkle icons */}
      <g className="hero-spark hero-spark-1">
        <path d="M 50 56 L 50 68 M 44 62 L 56 62" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" />
      </g>
      <g className="hero-spark hero-spark-2">
        <path d="M 270 150 L 270 162 M 264 156 L 276 156" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" />
      </g>
      <circle cx="40" cy="148" r="3.5" fill="var(--accent)" opacity="0.65" className="hero-dot hero-dot-1" />
      <circle cx="290" cy="80" r="4.5" fill="var(--accent)" opacity="0.5" className="hero-dot hero-dot-2" />
      <circle cx="68" cy="190" r="2.5" fill="var(--accent)" opacity="0.7" className="hero-dot hero-dot-3" />
      <circle cx="298" cy="180" r="3" fill="var(--accent)" opacity="0.55" className="hero-dot hero-dot-1" />

      {/* Play button accent */}
      <g transform="translate(20, 28)">
        <circle cx="0" cy="0" r="20" fill="var(--accent)" />
        <path d="M -6 -8 L -6 8 L 9 0 Z" fill="#fff" />
      </g>
    </svg>
  );
}

/* ====== Continue on Video ====== */

function ContinueVideoCard({ project, onResume, onNewVideo }: {
  project: Project | null;
  onResume: (p: Project) => void;
  onNewVideo: () => void;
}) {
  if (!project) {
    return (
      <div className="continue-card continue-empty">
        <div className="continue-empty-art" aria-hidden>
          <span className="continue-empty-glyph">
            <Icon name="film" size={28} />
          </span>
          <span className="continue-empty-spark continue-empty-spark-1" />
          <span className="continue-empty-spark continue-empty-spark-2" />
          <span className="continue-empty-spark continue-empty-spark-3" />
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Continue on video</div>
          <div className="continue-empty-title">No drafts in flight yet</div>
          <p className="continue-empty-sub">
            Start your next video — go from idea to thumbnail in a single pipeline.
          </p>
        </div>
        <button onClick={onNewVideo} className="btn primary" style={{ borderRadius: 10 }}>
          <Icon name="plus" size={14} /> Start a new video
        </button>
      </div>
    );
  }

  const step = projectProgress(project);
  const ready = step >= 5;
  const title = projectTitle(project);
  const pct = Math.min(100, Math.round((step / 5) * 100));
  const updated = parseUTC(project.updated_at);
  const updatedAgo = timeAgo(updated);
  const glyph = (title.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("") || "··")
    .toUpperCase().slice(0, 2);
  const minsLeft = Math.max(1, Math.round((1 - pct / 100) * 14));

  return (
    <button onClick={() => onResume(project)} className="continue-card">
      {/* Decorative thumbnail panel */}
      <div className="continue-thumb" aria-hidden>
        <div className="continue-thumb-grid" />
        <div className="continue-thumb-orb" />
        <span className="continue-thumb-glyph">{glyph}</span>

        {/* Animated play button */}
        <span className="continue-play">
          <span className="continue-play-ring" />
          <span className="continue-play-ring" />
          <Icon name="play" size={20} />
        </span>

        {/* Top-left status pill */}
        <span className={`continue-thumb-pill ${ready ? "ready" : ""}`}>
          <span className="continue-thumb-pulse" />
          {ready ? "Ready" : `Step ${step}/5`}
        </span>

        {/* Bottom-right runtime */}
        <span className="continue-thumb-time">~{minsLeft} min</span>
      </div>

      {/* Info panel */}
      <div className="continue-info">
        <div className="continue-eyebrow">
          <Icon name="film" size={11} /> Continue on video
        </div>
        <div className="continue-title">{title}</div>
        <div className="continue-meta">
          <Icon name="clock" size={12} /> Edited {updatedAgo}
        </div>

        {/* Pipeline rail */}
        <div className="continue-pipeline">
          {PIPELINE_STEPS.map((s, i) => {
            const done = i < step;
            const cur = i === step && !ready;
            const stateClass = done ? "done" : cur ? "cur" : "future";
            return (
              <div key={s.id} className={`continue-node ${stateClass}`}>
                <div className="continue-node-circle">
                  {done ? <Icon name="check" size={11} /> : <Icon name={s.icon} size={11} />}
                </div>
                <span className="continue-node-label">{s.name}</span>
                {i < PIPELINE_STEPS.length - 1 && (
                  <span className={`continue-link ${i < step - 1 || (i < step) ? "done" : ""}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom row: progress + CTA */}
        <div className="continue-bottom">
          <div className="continue-progress">
            <div className="continue-progress-track">
              <span className="continue-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="continue-progress-pct">{pct}%</span>
          </div>
          <span className="continue-cta">
            {ready ? "Publish" : "Resume"} <Icon name="arrowRight" size={13} />
          </span>
        </div>
      </div>
    </button>
  );
}

/* ====== Streak (compact, secondary) ====== */

const DOW = ["M", "T", "W", "T", "F", "S", "S"] as const;

function StreakSection() {
  const last7 = useMemo(() => buildStreakDays(7), []);
  const currentStreak = useMemo(() => computeCurrentStreak(buildStreakDays(28)), []);
  const activeThisWeek = last7.filter(Boolean).length;

  // Ring progress: streak / 30-day goal
  const RING_GOAL = 30;
  const ringPct = Math.min(1, currentStreak / RING_GOAL);
  const RING_R = 26;
  const RING_C = 2 * Math.PI * RING_R;
  const ringDash = `${(ringPct * RING_C).toFixed(1)} ${RING_C.toFixed(1)}`;
  const toMilestone = Math.max(0, RING_GOAL - currentStreak);

  return (
    <div className="streak-card">
      <div className="streak-deco" aria-hidden />
      <div className="streak-glow" aria-hidden />

      <div className="streak-head">
        <div className="streak-head-text">
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            <span className="streak-live-dot" /> Streak
          </div>
          <div className="streak-count">
            <span className="streak-num">{currentStreak}</span>
            <span className="streak-suffix">{currentStreak === 1 ? "day" : "days"}</span>
          </div>
          <div className="streak-this-week">
            <span className="streak-this-week-num">{activeThisWeek}</span>
            <span className="streak-this-week-total">/7 this week</span>
          </div>
        </div>

        {/* Animated ring around flame */}
        <div className="streak-ring-wrap" aria-hidden>
          <svg className="streak-ring" viewBox="0 0 64 64">
            <defs>
              <linearGradient id="streak-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffb37a" />
                <stop offset="1" stopColor="#f7651e" />
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r={RING_R} fill="none" stroke="var(--bg-soft)" strokeWidth="5" />
            <circle
              cx="32" cy="32" r={RING_R}
              fill="none"
              stroke="url(#streak-grad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={ringDash}
              transform="rotate(-90 32 32)"
              className="streak-ring-progress"
            />
          </svg>
          <span className="streak-flame">
            <Icon name="flame" size={18} />
          </span>
        </div>
      </div>

      {/* Mini 7-day timeline */}
      <div className="streak-row">
        {last7.map((on, i) => (
          <div key={i} className="streak-day" title={dayLabel(i, last7.length)}>
            <div className={`streak-dot ${on ? "on" : ""}`}>
              {on && <Icon name="check" size={10} />}
            </div>
            <span className="streak-dow">{DOW[i]}</span>
          </div>
        ))}
      </div>

      <div className="streak-foot">
        <span className="streak-milestone">
          <Icon name="star" size={11} />
          {toMilestone === 0 ? "Goal hit!" : `${toMilestone} ${toMilestone === 1 ? "day" : "days"} to ${RING_GOAL}-day badge`}
        </span>
      </div>
    </div>
  );
}

function buildStreakDays(n: number): boolean[] {
  // Mock: deterministic-but-varied pattern with current streak ending today.
  const out: boolean[] = [];
  for (let i = 0; i < n; i++) {
    const dayFromEnd = n - 1 - i;
    if (dayFromEnd < 12) out.push(true);             // current 12-day streak
    else if (dayFromEnd < 14) out.push(false);       // 2-day gap
    else if (dayFromEnd < 22) out.push(true);        // prior streak
    else out.push(i % 3 !== 0);                       // earlier mixed activity
  }
  return out;
}

function computeCurrentStreak(days: boolean[]): number {
  let count = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i]) count++;
    else break;
  }
  return count;
}

function dayLabel(i: number, total: number): string {
  const daysAgo = total - 1 - i;
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo} days ago`;
}

/** Parse a datetime string from the API as UTC, even if the timezone suffix is missing. */
function parseUTC(dateStr: string): Date {
  // If the string already has timezone info (Z, +, or -HH:MM after the time), parse as-is.
  // Otherwise append 'Z' so JavaScript interprets it as UTC, not local time.
  if (/Z|[+-]\d{2}:\d{2}$/.test(dateStr)) return new Date(dateStr);
  return new Date(dateStr + "Z");
}

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days}d ago`;
  const wks = Math.floor(days / 7);
  return `${wks}w ago`;
}

/* ====== Channel analytics (with graph) ====== */

function ChannelAnalyticsSection({ onOpen }: { onOpen: () => void }) {
  const { data: channels = [], isLoading: channelsLoading } = useChannels();
  const firstChannel = channels[0] ?? null;
  const { data: stats } = useChannelStats(firstChannel?.id ?? null);

  if (channelsLoading) return <ChannelStatsSkeleton />;
  if (!firstChannel) return <NoChannelCard onClick={onOpen} />;
  if (!stats) return <ChannelStatsSkeleton />;

  return <ChannelStatsSnapshot channel={firstChannel} stats={stats} onOpen={onOpen} />;
}

type MetricId = "views" | "subs" | "engagement";

const METRICS: { id: MetricId; label: string; icon: string }[] = [
  { id: "views",       label: "Views",       icon: "eye" },
  { id: "subs",        label: "Subscribers", icon: "users" },
  { id: "engagement",  label: "Engagement",  icon: "heart" },
];

const RANGES: { id: "7D" | "28D" | "90D"; points: number; label: string }[] = [
  { id: "7D",  points: 14, label: "7D" },
  { id: "28D", points: 28, label: "28D" },
  { id: "90D", points: 60, label: "90D" },
];

function ChannelStatsSnapshot({ channel, stats, onOpen }: {
  channel: SavedChannel; stats: ChannelStats; onOpen: () => void;
}) {
  const initial = (stats.channel_name || "?").charAt(0).toUpperCase();
  const [metric, setMetric] = useState<MetricId>("views");
  const [rangeId, setRangeId] = useState<"7D" | "28D" | "90D">("28D");
  const range = RANGES.find(r => r.id === rangeId)!;

  const metricInfo = useMemo<{ title: string; value: number; delta: string; seed: number; isPct: boolean }>(() => {
    if (metric === "views") {
      return {
        title: "Views",
        value: stats.recent_views_sum,
        delta: stats.recent_views_sum > 0 ? "+12.4%" : "—",
        seed: channel.id,
        isPct: false,
      };
    }
    if (metric === "subs") {
      return {
        title: "Subscribers",
        value: stats.subscriber_count ?? 0,
        delta: "+0.4%",
        seed: channel.id + 7,
        isPct: false,
      };
    }
    return {
      title: "Engagement",
      value: Math.round(stats.engagement_rate * 100000) / 1000,
      delta: "+0.3pp",
      seed: channel.id + 13,
      isPct: true,
    };
  }, [metric, stats.recent_views_sum, stats.subscriber_count, stats.engagement_rate, channel.id]);

  const chartData = useMemo(
    () => generateSparkline(metricInfo.value || 1, range.points, metricInfo.seed),
    [metricInfo.value, metricInfo.seed, range.points],
  );

  const peak = chartData.length > 0 ? Math.max(...chartData) : 0;
  const avg = chartData.length > 0 ? Math.round(chartData.reduce((a, b) => a + b, 0) / chartData.length) : 0;
  const total = chartData.reduce((a, b) => a + b, 0);

  const fmt = (v: number) => metricInfo.isPct ? `${(v / 1000).toFixed(1)}%` : formatCount(v);

  return (
    <div className="dash-analytics">
      {/* Decorative orbs */}
      <div className="dash-analytics-orb" aria-hidden />
      <div className="dash-analytics-orb-2" aria-hidden />

      {/* Header row */}
      <div className="dash-analytics-head">
        <div className="dash-analytics-head-left">
          <div className="dash-analytics-avatar-wrap">
            <div className="dash-analytics-avatar">
              {channel.thumbnail_url
                ? <img src={channel.thumbnail_url} alt={stats.channel_name} />
                : initial}
            </div>
            <span className="dash-analytics-verified" title="Connected channel" aria-hidden>
              <Icon name="check" size={10} />
            </span>
          </div>
          <div className="dash-analytics-info">
            <div className="dash-analytics-eyebrow">
              <Icon name="chart" size={11} />
              Channel analytics
            </div>
            <div className="dash-analytics-name">{stats.channel_name}</div>
            <div className="dash-analytics-meta">
              <span className="dash-analytics-handle">
                <span className="dash-yt-mark" aria-hidden>
                  <svg viewBox="0 0 22 16">
                    <rect width="22" height="16" rx="4" fill="#FF0000" />
                    <path d="M9 5l5.5 3L9 11z" fill="#fff" />
                  </svg>
                </span>
                {channel.handle || "YouTube"}
              </span>
              <span className="dot-sep" />
              <span>{formatCount(stats.video_count)} videos</span>
              <span className="dot-sep" />
              <span className="dash-live-chip">
                <span className="pulse" /> Live
              </span>
            </div>
          </div>
        </div>

        <button onClick={onOpen} className="dash-open-btn">
          <Icon name="sparkles" size={14} />
          Open full analytics
          <Icon name="arrowRight" size={14} />
        </button>
      </div>

      {/* Single rich chart card */}
      <div className="dash-chart-card">
        {/* Toolbar inside the card — metric tabs (left) + range tabs (right) */}
        <div className="dash-chart-toolbar">
          <div className="dash-metric-tabs">
            {METRICS.map(m => (
              <button
                key={m.id}
                onClick={() => setMetric(m.id)}
                className={`dash-metric-tab ${metric === m.id ? "on" : ""}`}
              >
                <Icon name={m.icon} size={13} />
                {m.label}
              </button>
            ))}
          </div>
          <div className="dash-range-tabs">
            {RANGES.map(r => (
              <button
                key={r.id}
                onClick={() => setRangeId(r.id)}
                className={`dash-range-tab ${rangeId === r.id ? "on" : ""}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rich summary row */}
        <div className="dash-chart-headline">
          <div className="dash-chart-headline-main">
            <div className="dash-chart-headline-label">
              {metricInfo.title} <span>· last {range.label}</span>
            </div>
            <div className="dash-chart-headline-row">
              <span className="dash-chart-value">
                {metricInfo.isPct ? `${metricInfo.value.toFixed(1)}%` : formatCount(metricInfo.value)}
              </span>
              <span className="dash-chart-delta">
                <Icon name="trend" size={12} /> {metricInfo.delta}
              </span>
            </div>
          </div>

          <div className="dash-chart-chips">
            <SummaryChip icon="star"     label="Peak"    value={fmt(peak)} />
            <SummaryChip icon="chart"    label="Average" value={fmt(avg)} />
            <SummaryChip icon="trend"    label="Total"   value={fmt(total)} />
          </div>
        </div>

        {/* Big interactive chart */}
        <InteractiveAreaChart
          data={chartData}
          rangeLabel={range.label}
          metricLabel={metricInfo.title}
          isPct={metricInfo.isPct}
        />
      </div>
    </div>
  );
}

function SummaryChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="dash-chart-chip">
      <span className="dash-chart-chip-icon">
        <Icon name={icon} size={11} />
      </span>
      <div>
        <div className="dash-chart-chip-label">{label}</div>
        <div className="dash-chart-chip-value">{value}</div>
      </div>
    </div>
  );
}


function InteractiveAreaChart({ data, rangeLabel, metricLabel, isPct }: {
  data: number[]; rangeLabel: string; metricLabel: string; isPct?: boolean;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  if (data.length === 0) return null;
  const W = 800;
  const H = 160;
  const padX = 4;
  const padTop = 12;
  const padBottom = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const stepX = (W - padX * 2) / Math.max(1, data.length - 1);
  const pts = data.map((v, i) => {
    const x = padX + i * stepX;
    const y = padTop + (H - padTop - padBottom) - ((v - min) / range) * (H - padTop - padBottom);
    return [x, y] as [number, number];
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1][0]} ${H - padBottom} L ${pts[0][0]} ${H - padBottom} Z`;
  const last = pts[pts.length - 1];

  // Y gridlines (4 zones)
  const gridY = [0.25, 0.5, 0.75].map(t => padTop + (H - padTop - padBottom) * t);

  // X labels — show ~6 across
  const labelEvery = Math.max(1, Math.floor(data.length / 6));

  const onMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const t = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(t * (data.length - 1));
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  };

  const hovered = hoverIdx !== null ? pts[hoverIdx] : null;
  const hoverVal = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div
      ref={wrapRef}
      className="dash-chart-svg-wrap"
      onMouseMove={onMove}
      onMouseLeave={() => setHoverIdx(null)}
    >
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }} aria-hidden>
        <defs>
          <linearGradient id="dash-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.36" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridY.map((y, i) => (
          <line key={i} x1="0" y1={y} x2={W} y2={y} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 4" />
        ))}

        {/* Area + Line */}
        <path d={area} fill="url(#dash-area)" className="dash-chart-area" />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" className="dash-chart-line" />

        {/* Live halo around the latest point */}
        <circle cx={last[0]} cy={last[1]} r="5" fill="var(--accent)" opacity="0.5">
          <animate attributeName="r" from="5" to="16" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.5" to="0" dur="1.8s" repeatCount="indefinite" />
        </circle>

        {/* End dot */}
        <circle cx={last[0]} cy={last[1]} r="5" fill="var(--accent)" stroke="var(--bg-elev)" strokeWidth="2.5" />

        {/* Hover */}
        {hovered && (
          <>
            <line x1={hovered[0]} y1={padTop} x2={hovered[0]} y2={H - padBottom} stroke="var(--accent)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
            <circle cx={hovered[0]} cy={hovered[1]} r="6" fill="var(--accent)" stroke="var(--bg-elev)" strokeWidth="3" />
          </>
        )}
      </svg>

      {/* Hover tooltip */}
      {hoverIdx !== null && hoverVal !== null && (
        <div
          className="dash-chart-tip"
          style={{
            left: `${(hoverIdx / Math.max(1, data.length - 1)) * 100}%`,
          }}
        >
          <div className="dash-chart-tip-label">{xLabel(hoverIdx, data.length, rangeLabel)}</div>
          <div className="dash-chart-tip-value">
            {isPct ? `${(hoverVal / 1000).toFixed(1)}%` : formatCount(hoverVal)}
            <span className="dash-chart-tip-metric">{metricLabel}</span>
          </div>
        </div>
      )}

      {/* X axis labels */}
      <div className="dash-chart-xaxis">
        {data.map((_, i) => (i % labelEvery === 0 || i === data.length - 1) ? (
          <span key={i} style={{ left: `${(i / Math.max(1, data.length - 1)) * 100}%` }}>
            {xLabel(i, data.length, rangeLabel)}
          </span>
        ) : null)}
      </div>
    </div>
  );
}

function xLabel(idx: number, total: number, rangeLabel: string): string {
  const daysAgo = total - 1 - idx;
  const date = new Date();
  if (rangeLabel === "7D") {
    // 14 half-day bins → render as "Day-N"
    date.setDate(date.getDate() - Math.round(daysAgo / 2));
  } else if (rangeLabel === "28D") {
    date.setDate(date.getDate() - daysAgo);
  } else {
    date.setDate(date.getDate() - Math.round(daysAgo * 1.5));
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function generateSparkline(periodTotal: number, points: number, seed: number): number[] {
  if (periodTotal <= 0) return new Array(points).fill(0);
  let s = (seed % 2147483647) || 1;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / Math.max(1, points - 1);
    const trend = 0.7 + t * 0.7;
    out.push(Math.max(0, Math.round((periodTotal / points) * (trend + (rand() - 0.5) * 0.5))));
  }
  return out;
}

function formatCount(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

function NoChannelCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "linear-gradient(135deg, var(--bg-soft) 0%, var(--accent-tint) 100%)",
        border: "1px dashed var(--line-strong)",
        borderRadius: 20,
        padding: 32,
        textAlign: "center",
        cursor: "pointer",
        fontFamily: "inherit",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        minHeight: 280,
        transition: "border-color .15s ease, transform .12s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--line-strong)";
        e.currentTarget.style.transform = "";
      }}
    >
      <span style={{
        width: 56, height: 56, borderRadius: 16,
        background: "var(--ink)", color: "var(--accent)",
        display: "grid", placeItems: "center",
      }}>
        <Icon name="chart" size={26} />
      </span>
      <div>
        <div className="eyebrow">Channel analytics</div>
        <div style={{
          fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 400,
          color: "var(--ink)", marginTop: 6, lineHeight: 1.2, letterSpacing: "0.01em",
        }}>
          Connect a channel to see your stats
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 8, maxWidth: 360 }}>
          Subscribers, views, engagement and a 28-day trend — all in one snapshot.
        </div>
      </div>
      <span className="btn primary" style={{ borderRadius: 10 }}>
        Add channel <Icon name="arrowRight" size={14} />
      </span>
    </button>
  );
}

function ChannelStatsSkeleton() {
  return (
    <div style={{
      background: "var(--bg-elev)",
      border: "1px solid var(--line)",
      borderRadius: 20,
      padding: 28,
      display: "flex",
      flexDirection: "column",
      gap: 22,
      minHeight: 360,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "var(--bg-soft)" }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 18, width: 160, background: "var(--bg-soft)", borderRadius: 6 }} />
          <div style={{ height: 12, width: 110, background: "var(--bg-soft)", borderRadius: 6, marginTop: 8, opacity: 0.6 }} />
        </div>
      </div>
      <div style={{ background: "var(--bg-soft)", borderRadius: 16, height: 180 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <div style={{ background: "var(--bg-soft)", borderRadius: 14, height: 78 }} />
        <div style={{ background: "var(--bg-soft)", borderRadius: 14, height: 78 }} />
        <div style={{ background: "var(--bg-soft)", borderRadius: 14, height: 78 }} />
      </div>
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
          background: "radial-gradient(circle, rgba(59,130,246,0.5), transparent 65%)",
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
        background: "var(--bg-elev)", borderRadius: 20, border: "1px solid var(--line)",
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
