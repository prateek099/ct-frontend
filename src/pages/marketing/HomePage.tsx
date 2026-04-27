import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import "../../components/marketing/marketing.css";

const ARROW = (
  <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" />
  </svg>
);

const CHANNELS = [
  { name: "Mariah",            subs: "2.4M subs", color: "#F25C3D", letter: "M" },
  { name: "Devon Lin",         subs: "812k",      color: "#1F3D2E", letter: "D" },
  { name: "Yuki Cuts",         subs: "540k",      color: "#3B3631", letter: "Y" },
  { name: "Practical Pixels",  subs: "1.1M",      color: "#F25C3D", letter: "P" },
  { name: "Ajay Builds",       subs: "320k",      color: "#1F3D2E", letter: "A" },
  { name: "Noor Reviews",      subs: "1.8M",      color: "#3B3631", letter: "N" },
  { name: "Kenji's Kitchen",   subs: "680k",      color: "#F25C3D", letter: "K" },
  { name: "Sage on Tape",      subs: "410k",      color: "#1F3D2E", letter: "S" },
];

const STORY_STEPS = [
  { num: "01", h: "Catch the idea while it's hot",  p: "The copilot watches your niche. When something heats up, it surfaces ranked ideas — with predicted views and a hook angle." },
  { num: "02", h: "Draft the script in your voice", p: "Trained on your last 24 videos. Beats annotated with retention forecasts so you know which sections will hold viewers." },
  { num: "03", h: "Package it to win the click",    p: "Four thumbnail variants scored on predicted CTR, A/B-tested for 24 hours. Winner auto-promotes." },
  { num: "04", h: "Publish, measure, repeat",       p: "Title, description, chapters, hashtags — all SEO-shaped. Stats track what actually moved the needle, not vanity." },
];

const PIPE_STAGES = [
  { num: "01", h: "Idea",     p: "Trend-aware ranked ideas",
    icon: <path d="M5.5 10c-1-.7-1.5-1.8-1.5-3a4 4 0 0 1 8 0c0 1.2-.5 2.3-1.5 3v1.5a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5z M6.5 13.5h3" /> },
  { num: "02", h: "Script",   p: "Drafts in your voice",
    icon: <path d="m3 13 1-3 7-7 2 2-7 7z" /> },
  { num: "03", h: "Record",   p: "Voiceover & teleprompt",
    icon: <path d="M2.5 8h1M5 5v6M7.5 3v10M10 5.5v5M12.5 7v2" /> },
  { num: "04", h: "Edit",     p: "Auto-cut, B-roll, captions",
    icon: <><path d="M2.5 3.5h11v9h-11z" /><path d="M2.5 6.5h11M2.5 9.5h11M5 3.5v9M11 3.5v9" /></> },
  { num: "05", h: "Package",  p: "Title, thumb, A/B test",
    icon: <><path d="M2.5 3.5h11v9h-11z" /><path d="m3 11 3-3 3 3 2-2 2 2" /></> },
  { num: "06", h: "Publish",  p: "Schedule, monitor, learn",
    icon: <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" /> },
];

interface Tool { cat: string; h: string; p: string; icon: React.ReactNode; dark?: boolean; }
const TOOLS: Tool[] = [
  { cat: "Create",  h: "Video Ideas",            p: "Trend-aware ranked ideas with hook angles",
    icon: <><path d="M5.5 10c-1-.7-1.5-1.8-1.5-3a4 4 0 0 1 8 0c0 1.2-.5 2.3-1.5 3v1.5a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5z" /><path d="M6.5 13.5h3" /></> },
  { cat: "Create",  h: "Script Writer",          p: "Outline → draft, in your trained voice",
    icon: <path d="m3 13 1-3 7-7 2 2-7 7z" /> },
  { cat: "Create",  h: "Title Generator",        p: "Eight titles ranked by predicted CTR",
    icon: <path d="M3.5 3.5h9M8 3.5v10M6 13.5h4" /> },
  { cat: "Create",  h: "Description + Hashtags", p: "SEO-shaped with auto-chapters and tiers",
    icon: <path d="M3 3h5l5 5-5 5-5-5z" /> },
  { cat: "Create",  h: "Thumbnail Lab",          p: "Drafts, A/B variants, CTR scoring",
    icon: <><path d="M2.5 3.5h11v9h-11z" /><path d="m3 11 3-3 3 3 2-2 2 2" /></> },
  { cat: "Create",  h: "AI Voiceover",           p: "Studio VO in your trained voice",
    icon: <path d="M2.5 8h1M5 5v6M7.5 3v10M10 5.5v5M12.5 7v2" /> },
  { cat: "Create",  h: "Video Generator",        p: "B-roll, transitions, subtitle pass",
    icon: <><path d="M2.5 3.5h11v9h-11z" /><path d="M2.5 6.5h11M2.5 9.5h11M5 3.5v9M11 3.5v9" /></> },
  { cat: "Improve", h: "Review My Script",       p: "Retention notes on a draft",
    icon: <path d="M3.5 8.5 6 11l6.5-6.5" /> },
  { cat: "Improve", h: "Cross-Platform Repurpose", p: "Long-form → Shorts, Reels, TikToks",
    icon: <><path d="M3 6.5 5 4.5 7 6.5" /><path d="M5 4.5v5a2 2 0 0 0 2 2h6" /><path d="M13 9.5l-2 2 2 2" /></> },
  { cat: "Research", h: "Trending Finder",       p: "What's heating up in your niche",
    icon: <path d="M8 2.5v3M8 10.5v3M2.5 8h3M10.5 8h3M4 4l2 2M10 10l2 2M12 4l-2 2M6 10l-2 2" /> },
  { cat: "Research", h: "Channel Stats",         p: "Performance, growth, audience",
    icon: <><path d="M2.5 12.5 6 9l3 2 4.5-5" /><path d="M9.5 6.5h4v4" /></> },
  { cat: "Publish", h: "Link in Bio",            p: "Branded link page, video-aware",
    icon: <path d="M6.5 9.5a2.5 2.5 0 0 1 0-3.5l2-2a2.5 2.5 0 0 1 3.5 3.5l-1 1" /> },
  { cat: "Publish", h: "My Shop",                p: "Products tied to your videos",
    icon: <path d="M3.5 5.5h9l-.5 8h-8z" /> },
  { cat: "Soon",    h: "Multi-camera Sync",      p: "Auto-align takes, pick best shot", dark: true,
    icon: <path d="M8 2.5l1.5 4 4 1.5-4 1.5L8 13.5l-1.5-4-4-1.5 4-1.5z" /> },
];

const QUOTES = [
  { q: "It's the first tool that doesn't make me feel like I'm running a startup. I just press a button on Sunday and Tuesday's video is staged.",
    name: "Mariah Chen", channel: "@mariahchen · 2.4M subs", grad: "linear-gradient(135deg,#F25C3D,#1F3D2E)" },
  { q: "The retention forecast on the script alone has lifted my average view duration by 18 seconds. That compounds.",
    name: "Devon Lin",   channel: "@devonlin · 812k subs",  grad: "linear-gradient(135deg,#1F3D2E,#3B3631)" },
  { q: "I cancelled vidIQ, TubeBuddy, Opus, and a Notion template. Creator OS is the only tab I open before recording.",
    name: "Yuki Tanaka", channel: "@yukicuts · 540k subs",  grad: "linear-gradient(135deg,#3B3631,#F25C3D)" },
];

const FAQ = [
  { q: "How is this different from vidIQ or TubeBuddy?",
    a: "Those are research and analytics overlays on YouTube. Creator OS is the workspace where the video gets made — script, voiceover, thumbnail, publishing, all connected to a pipeline that knows what's blocking each video." },
  { q: "Does the AI write videos for me end-to-end?",
    a: "It can, but it shouldn't — and most creators don't want that. The copilot drafts. You direct, edit, and approve. Your trained voice model only ships if you click ship." },
  { q: "What's \u201Ctrained on my voice\u201D?",
    a: "We analyze your last 24 published videos for diction, pacing, hook patterns, and section structure. The voice model is opt-in, scoped to your channel, and you can wipe it any time." },
  { q: "Do I need to use every tool?",
    a: "No. Most creators settle into 4–6 tools. The pipeline view tells you which ones are blocking your next ship date, so you only open what you need." },
  { q: "What happens to my footage?",
    a: "Footage stays in your storage (Drive, Dropbox, or local). We hold transcripts, scripts, and thumbnails. Everything is exportable. Delete-account wipes within 30 days." },
  { q: "Is there a free plan?",
    a: "Yes — the free tier covers ideation, scripting, and titles. Voice cloning, video generation, and A/B testing are on the paid plan." },
];

function StoryStage({ active }: { active: number }) {
  return (
    <div className="story-stage">
      {/* Pane 0: Ideas */}
      <div className={`ss-pane ${active !== 0 ? "hidden" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="ss-tag">Video Ideas · Niche heat: AI</span>
          <span className="tag-coral" style={{ background: "#E2EEE6", color: "#1F5A3A" }}>Trend +240%</span>
        </div>
        <div className="idea-card top">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="ss-tag">#1 · Ranked list</span>
            <span className="tag-coral">CTR 91%</span>
          </div>
          <div className="t">This $30 AI editor replaced my $6,000 setup</div>
          <div className="meta">
            <div className="bar bar-coral"><span style={{ width: "91%" }} /></div>
            <span>180–240k views</span>
          </div>
        </div>
        <div className="idea-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="ss-tag">#2 · Personal experiment</span>
            <span style={{ fontSize: 10.5, color: "var(--muted)" }}>CTR 84%</span>
          </div>
          <div className="t">I tried Claude as my editor for 30 days. Here's the verdict.</div>
          <div className="meta"><div className="bar"><span style={{ width: "84%" }} /></div><span>160–210k views</span></div>
        </div>
        <div className="idea-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="ss-tag">#3 · Hot take</span>
            <span style={{ fontSize: 10.5, color: "var(--muted)" }}>CTR 72%</span>
          </div>
          <div className="t">Why I quit Premiere for Descript (and almost regret it)</div>
          <div className="meta"><div className="bar"><span style={{ width: "72%" }} /></div><span>90–130k views</span></div>
        </div>
      </div>

      {/* Pane 1: Script */}
      <div className={`ss-pane ${active !== 1 ? "hidden" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="ss-tag">Script Writer · Ajay v3.1 · 94% match</span>
          <span style={{ fontSize: 10.5, color: "var(--muted)" }}>9 min target</span>
        </div>
        <div className="script-block">
          <div className="beat-meta">
            <span className="tag-coral">0:00 · Hook</span>
            <span className="ret-pill">retention <div className="bar bar-coral"><span style={{ width: "100%" }} /></div> 100</span>
          </div>
          <div className="body">"I spent six grand on a Mac and Premiere just to let an AI do it for free."</div>
        </div>
        <div className="script-block">
          <div className="beat-meta">
            <span className="tag-coral" style={{ background: "#E5EBF5", color: "#2B4A8C" }}>0:15 · Promise</span>
            <span className="ret-pill">retention <div className="bar"><span style={{ width: "88%" }} /></div> 88</span>
          </div>
          <div className="body">"In the next nine minutes I'll show you the only two tools that survived 30 days, and the three I quietly dropped."</div>
        </div>
        <div className="script-block">
          <div className="beat-meta">
            <span className="tag-coral" style={{ background: "#E2EEE6", color: "#1F5A3A" }}>0:42 · Section 1</span>
            <span className="ret-pill">retention <div className="bar"><span style={{ width: "74%" }} /></div> 74</span>
          </div>
          <div className="body">"Tool one is Descript. Watch a 19-minute clip become 12 minutes by deleting words on a page."</div>
        </div>
      </div>

      {/* Pane 2: Thumbnail */}
      <div className={`ss-pane ${active !== 2 ? "hidden" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="ss-tag">Thumbnail Lab · 4 drafts · A/B ready</span>
          <span className="tag-coral" style={{ background: "#E2EEE6", color: "#1F5A3A" }}>Top pick: V1</span>
        </div>
        <div className="thumb-grid">
          <div className="thumb-card">
            <div className="thumb-img" style={{ background: "repeating-linear-gradient(135deg,#1A1714 0 14px,#2A211A 14px 28px)" }} />
            <div className="meta"><span style={{ fontWeight: 600 }}>V1 · Bold type</span><span className="ctr-tag">CTR 8.4%</span></div>
          </div>
          <div className="thumb-card">
            <div className="thumb-img" style={{ background: "repeating-linear-gradient(135deg,#F25C3D 0 14px,#D44E32 14px 28px)" }} />
            <div className="meta"><span style={{ fontWeight: 600 }}>V2 · Face</span><span className="ctr-tag" style={{ background: "rgba(20,18,14,.06)", color: "var(--ink-2)" }}>CTR 7.1%</span></div>
          </div>
          <div className="thumb-card">
            <div className="thumb-img" style={{ background: "repeating-linear-gradient(135deg,#1F3D2E 0 14px,#264735 14px 28px)" }} />
            <div className="meta"><span style={{ fontWeight: 600 }}>V3 · Editorial</span><span className="ctr-tag" style={{ background: "rgba(20,18,14,.06)", color: "var(--ink-2)" }}>CTR 6.6%</span></div>
          </div>
          <div className="thumb-card">
            <div className="thumb-img" style={{ background: "repeating-linear-gradient(135deg,#3B3631 0 14px,#48413B 14px 28px)" }} />
            <div className="meta"><span style={{ fontWeight: 600 }}>V4 · Object</span><span className="ctr-tag" style={{ background: "rgba(20,18,14,.06)", color: "var(--ink-2)" }}>CTR 5.2%</span></div>
          </div>
        </div>
        <div style={{ marginTop: "auto", background: "var(--canvas-2)", borderRadius: 8, padding: "10px 12px", fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span><strong>A/B test</strong> · V1 vs V2 · 24h split, auto-promote winner</span>
          <span style={{ color: "var(--coral)", fontWeight: 500 }}>Start →</span>
        </div>
      </div>

      {/* Pane 3: Publish */}
      <div className={`ss-pane ${active !== 3 ? "hidden" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="ss-tag">Publish · Tue 22 Apr · 9:00 AM</span>
          <span className="tag-coral" style={{ background: "#E2EEE6", color: "#1F5A3A" }}>Ready to ship</span>
        </div>
        <div className="pub-card">
          <div className="pub-row"><span style={{ color: "var(--muted)" }}>Title</span><span style={{ fontWeight: 500, maxWidth: 280, textAlign: "right" }}>This $30 AI editor replaced my $6,000 setup</span></div>
          <div className="pub-row"><span style={{ color: "var(--muted)" }}>Thumbnail</span><span className="ok">✓ V1 (winner)</span></div>
          <div className="pub-row"><span style={{ color: "var(--muted)" }}>Description</span><span className="ok">✓ 1,284 chars · SEO 82</span></div>
          <div className="pub-row"><span style={{ color: "var(--muted)" }}>Chapters</span><span className="ok">✓ 6 chapters</span></div>
          <div className="pub-row"><span style={{ color: "var(--muted)" }}>Hashtags</span><span className="ok">✓ 16 (3 tiers)</span></div>
          <div className="pub-row"><span style={{ color: "var(--muted)" }}>End screen</span><span className="ok">✓ Cross-link to part 2</span></div>
        </div>
        <div className="pub-card" style={{ background: "var(--night)", color: "var(--ink-on-night)", borderColor: "var(--night)" }}>
          <div style={{ fontSize: 11, color: "rgba(255,241,232,.55)", fontFamily: "JetBrains Mono", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>Forecast</div>
          <div style={{ display: "flex", gap: 24 }}>
            <div><div style={{ fontSize: 24, fontWeight: 600 }}>210k</div><div style={{ fontSize: 11, color: "rgba(255,241,232,.55)" }}>Expected views (7d)</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 600 }}>74%</div><div style={{ fontSize: 11, color: "rgba(255,241,232,.55)" }}>Confidence</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 600 }}>+1,400</div><div style={{ fontSize: 11, color: "rgba(255,241,232,.55)" }}>Subs gained</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [active, setActive] = useState(0);
  const storyRef = useRef<HTMLElement | null>(null);

  // Auto-cycle the story panes when the section is in view
  useEffect(() => {
    const el = storyRef.current;
    if (!el) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setInterval(() => setActive((i) => (i + 1) % STORY_STEPS.length), 4000);
        } else if (timer) {
          clearInterval(timer);
          timer = null;
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <div className="cos-page">
      <MarketingNav />

      {/* === Hero === */}
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="pill">
              <span className="dotg">★</span>
              <span>New: AI copilot now drafts your Tuesday video while you sleep</span>
            </div>
            <h1>
              The fastest way<br />
              to plan, script,<br />
              edit, <span className="serif accent it">and post.</span>
            </h1>
            <p className="lede">
              Creator OS is the workspace solo YouTubers use to ship one more video a week —
              from idea to published, without juggling 12 tools.
            </p>
            <div className="hero-ctas">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start free — connect YouTube {ARROW}
              </Link>
              <a href="#product" className="btn btn-line btn-lg">
                <svg width={12} height={12} viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.5v9l7-4.5z" /></svg>
                Watch 90s demo
              </a>
            </div>
            <div className="hero-trust">
              <span>Free 14-day trial</span><span className="dot" />
              <span>No credit card</span><span className="dot" />
              <span>Used by 4,200+ solo creators</span>
            </div>
          </div>

          {/* Stage with floating cards */}
          <div className="stage">
            {/* Calendar mini */}
            <div className="float-card fc-3">
              <div className="fc-head">
                <div className="dots"><span /><span /><span /></div>
                <span className="fc-tag">This week</span>
              </div>
              <div className="body">
                <div className="cal-day"><span style={{ fontSize: 8, color: "var(--muted)" }}>MON</span><span className="num">21</span></div>
                <div className="cal-day today"><span style={{ fontSize: 8, opacity: .6 }}>TUE</span><span className="num">22</span></div>
                <div className="cal-day"><span style={{ fontSize: 8, color: "var(--muted)" }}>WED</span><span className="num">23</span></div>
                <div className="cal-day"><span style={{ fontSize: 8, color: "var(--muted)" }}>THU</span><span className="num">24</span></div>
              </div>
            </div>

            {/* Pipeline workspace mini */}
            <div className="float-card fc-1">
              <div className="fc-head">
                <div className="dots"><span /><span /><span /></div>
                <span className="fc-tag">Pipeline · 4 in flight</span>
              </div>
              <div className="body">
                <div className="pipe-row">
                  {["Idea", "Script", "Record", "Edit", "Package", "Publish"].map((s) => (
                    <div className="pipe-col" key={s}><span className="lbl">{s}</span></div>
                  ))}
                </div>
                <div className="pipe-row">
                  <div className="pipe-col"><div className="pipe-card"><div className="stripe" /><span>Tier list · keyboards</span></div></div>
                  <div className="pipe-col"><div className="pipe-card"><div className="stripe" style={{ background: "repeating-linear-gradient(135deg,#F25C3D 0 4px,#D44E32 4px 8px)" }} /><span>Shorts · 3 hacks</span></div></div>
                  <div className="pipe-col"><div className="pipe-card"><div className="stripe" style={{ background: "repeating-linear-gradient(135deg,#1F3D2E 0 4px,#264735 4px 8px)" }} /><span>9-to-5 vlog</span></div></div>
                  <div className="pipe-col"><div className="pipe-card cur"><div className="stripe" /><span>AI tools that replaced…</span></div></div>
                  <div className="pipe-col" />
                  <div className="pipe-col" />
                </div>
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "var(--canvas)", borderRadius: 8, fontSize: 11 }}>
                  <span style={{ color: "var(--muted)" }}><strong style={{ color: "var(--ink)" }}>Tue 22 Apr</strong> · Publishing AI tools video in 6h 12m</span>
                  <span style={{ color: "var(--coral)", fontWeight: 500 }}>● Thumbnail pending</span>
                </div>
              </div>
            </div>

            {/* Copilot prompt mini */}
            <div className="float-card fc-2">
              <div className="fc-head">
                <div className="dots"><span /><span /><span /></div>
                <span className="fc-tag">Copilot</span>
              </div>
              <div className="body">
                <div className="prompt-row">
                  <span className="tag-coral">● Needs you</span>
                </div>
                <div className="prompt-title">Tuesday's video has no thumbnail</div>
                <div className="prompt-body">I drafted 4 options based on your top performers. Want me to A/B them?</div>
                <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 11, color: "var(--ink)", fontWeight: 500 }}>Open Thumbnail Lab →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* === Marquee === */}
      <div className="marquee">
        <div className="marquee-inner">
          {[...CHANNELS, ...CHANNELS].map((c, i) => (
            <span className="ch" key={i}>
              <span className="ch-mark" style={{ background: c.color }}>{c.letter}</span>
              {c.name} · <span className="mono">{c.subs}</span>
            </span>
          ))}
        </div>
      </div>

      {/* === Story / scrollytelling === */}
      <section className="story" id="product" ref={storyRef as React.RefObject<HTMLElement>}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">The flow</span>
            <h2>One idea, one workspace,<br /><span className="serif accent">one Tuesday upload.</span></h2>
            <p>Watch a single video go from a trending search to a published Tuesday upload. No tab juggling, no copy-paste, no losing the thread.</p>
          </div>

          <div className="story-grid">
            <div className="story-list">
              {STORY_STEPS.map((s, i) => (
                <div
                  key={s.num}
                  className={`story-step${i !== active ? " dim" : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                >
                  <div className="num">{s.num}</div>
                  <div>
                    <h3>{s.h}</h3>
                    <p>{s.p}</p>
                  </div>
                </div>
              ))}
            </div>
            <StoryStage active={active} />
          </div>
        </div>
      </section>

      {/* === How it works === */}
      <section id="how">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">How it works</span>
            <h2>Six stages.<br /><span className="serif accent">One pipeline.</span></h2>
            <p>Every video moves through the same six stages. The copilot knows where each one is and what's blocking it.</p>
          </div>
          <div className="pipeline-vis">
            <div className="pipe-stages">
              {PIPE_STAGES.map((s) => (
                <div className="pipe-stage" key={s.num}>
                  <span className="pn">{s.num}</span>
                  <div className="pipe-icon">
                    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                      {s.icon}
                    </svg>
                  </div>
                  <h4>{s.h}</h4>
                  <p>{s.p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === Tool grid === */}
      <section id="tools" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">14 tools, one workspace</span>
            <h2>Every tool you tab between<br /><span className="serif accent">already lives here.</span></h2>
            <p>Pre-wired, pre-trained on your channel, and connected to the rest of your pipeline. Stop exporting between apps.</p>
          </div>
          <div className="tool-grid">
            {TOOLS.map((t) => (
              <a
                key={t.h}
                className="tool-card"
                style={t.dark ? { background: "var(--night)", color: "var(--ink-on-night)", borderColor: "var(--night)" } : undefined}
                href="#cta"
              >
                <div className="tg">
                  <div
                    className="ic"
                    style={t.dark ? { background: "rgba(255,241,232,.08)", borderColor: "transparent", color: "var(--coral)" } : undefined}
                  >
                    <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                      {t.icon}
                    </svg>
                  </div>
                  <span className="cat" style={t.dark ? { color: "rgba(255,241,232,.5)" } : undefined}>{t.cat}</span>
                </div>
                <h4 style={t.dark ? { color: "var(--ink-on-night)" } : undefined}>{t.h}</h4>
                <p style={t.dark ? { color: "rgba(255,241,232,.6)" } : undefined}>{t.p}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* === Outcomes === */}
      <section style={{ paddingTop: 32 }}>
        <div className="wrap">
          <div className="outcomes">
            <div className="sec-head" style={{ marginBottom: 32 }}>
              <span className="eyebrow">What changes</span>
              <h2 style={{ fontSize: 42 }}>After 60 days, on average.</h2>
            </div>
            <div className="outcome-grid">
              <div className="outcome">
                <div className="num"><span className="accent">+1.2</span></div>
                <div className="lbl">videos shipped per week, on average</div>
              </div>
              <div className="outcome">
                <div className="num">−68<span style={{ fontSize: 32 }}>%</span></div>
                <div className="lbl">time spent on packaging (titles, thumbs, descriptions)</div>
              </div>
              <div className="outcome">
                <div className="num">+24<span style={{ fontSize: 32 }}>%</span></div>
                <div className="lbl">click-through on A/B-tested thumbnails</div>
              </div>
              <div className="outcome">
                <div className="num">12<span style={{ fontSize: 32 }}> apps</span></div>
                <div className="lbl">replaced — Notion, Premiere assist, vidIQ, Canva, etc.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === Quotes === */}
      <section id="proof" style={{ paddingTop: 32 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Creators</span>
            <h2>Built with creators<br /><span className="serif accent">who actually post.</span></h2>
          </div>
          <div className="quote-grid">
            {QUOTES.map((c) => (
              <div className="quote-card" key={c.name}>
                <div className="q">"{c.q}"</div>
                <div className="who">
                  <div className="av" style={{ background: c.grad }} />
                  <div><div className="name">{c.name}</div><div className="ch">{c.channel}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FAQ === */}
      <section id="faq" style={{ paddingTop: 32 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">FAQ</span>
            <h2>Questions, briefly answered.</h2>
          </div>
          <div className="faq">
            {FAQ.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}</summary>
                <div>
                  {f.q === "Is there a free plan?" ? (
                    <>Yes — the free tier covers ideation, scripting, and titles. Voice cloning, video generation, and A/B testing are on the paid plan. See <Link to="/pricing" style={{ color: "var(--coral)", textDecoration: "underline" }}>pricing</Link>.</>
                  ) : (
                    f.a
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA strip === */}
      <section id="cta" style={{ paddingTop: 32, paddingBottom: 96 }}>
        <div className="wrap">
          <div className="cta-strip">
            <h2>Ship one more video<br />this week. <span className="serif accent">Start free.</span></h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start free — connect YouTube {ARROW}
              </Link>
              <span style={{ fontSize: 12, color: "rgba(255,241,232,.5)" }}>14-day trial · no credit card</span>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
