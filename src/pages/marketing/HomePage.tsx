import { Link } from "react-router-dom";
import MarketingNav from "../../components/marketing/MarketingNav";
import MarketingFooter from "../../components/marketing/MarketingFooter";
import "../../components/marketing/marketing.css";

const ARROW = (
  <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 8h9M9 4.5 12.5 8 9 11.5" />
  </svg>
);

const CHEVRON_DOWN = (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
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

/* Per-tool thumbnail motifs — small SVG illustrations layered on the gradient backdrop. */
const TH_VIEWBOX = "0 0 200 88";
const TH_PROPS = { viewBox: TH_VIEWBOX, preserveAspectRatio: "xMidYMid meet", className: "thumb-svg" } as const;

const TH_IDEAS = (
  <svg {...TH_PROPS}>
    <g transform="translate(28, 16)" fill="rgba(255,255,255,.95)">
      <path d="M0 6 L2.4 0 L4.8 6 L11 8.4 L4.8 10.8 L2.4 17 L0 10.8 L-6.2 8.4 Z" />
    </g>
    <rect x="44" y="22" width="116" height="9" rx="4" fill="rgba(255,255,255,.95)" />
    <rect x="58" y="40" width="92" height="8" rx="4" fill="rgba(255,255,255,.65)" />
    <rect x="68" y="56" width="72" height="7" rx="3.5" fill="rgba(255,255,255,.45)" />
    <g fill="rgba(255,255,255,.92)">
      <circle cx="172" cy="20" r="2" />
      <circle cx="178" cy="32" r="1.4" opacity=".7" />
      <circle cx="166" cy="34" r="1.2" opacity=".5" />
    </g>
  </svg>
);

const TH_SCRIPT = (
  <svg {...TH_PROPS}>
    <rect x="58" y="12" width="94" height="64" rx="6" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.7)" strokeWidth="1.2" />
    <line x1="68" y1="26" x2="138" y2="26" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="68" y1="36" x2="128" y2="36" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity=".75" />
    <line x1="68" y1="46" x2="118" y2="46" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
    <line x1="68" y1="56" x2="100" y2="56" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity=".4" />
    <g transform="translate(102, 50) rotate(35)">
      <path d="M0 0 L18 0 L20 4 L18 8 L0 8 Z" fill="white" />
      <path d="M20 4 L26 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

const TH_TITLE = (
  <svg {...TH_PROPS}>
    <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(255,255,255,.85)" fontWeight="700">
      <text x="30" y="22">1</text>
      <text x="30" y="46">2</text>
      <text x="30" y="70">3</text>
    </g>
    <rect x="42" y="14" width="106" height="10" rx="3" fill="rgba(255,255,255,.95)" />
    <rect x="42" y="38" width="86" height="10" rx="3" fill="rgba(255,255,255,.7)" />
    <rect x="42" y="62" width="64" height="10" rx="3" fill="rgba(255,255,255,.5)" />
    <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="white" fontWeight="700">
      <text x="156" y="22">9.4</text>
    </g>
    <g fontFamily="JetBrains Mono, monospace" fontSize="8" fill="rgba(255,255,255,.7)" fontWeight="600">
      <text x="138" y="46">7.1</text>
      <text x="118" y="70">6.0</text>
    </g>
  </svg>
);

const TH_DESC = (
  <svg {...TH_PROPS}>
    <rect x="30" y="12" width="124" height="6" rx="3" fill="rgba(255,255,255,.85)" />
    <rect x="30" y="24" width="142" height="6" rx="3" fill="rgba(255,255,255,.6)" />
    <rect x="30" y="36" width="100" height="6" rx="3" fill="rgba(255,255,255,.45)" />
    <g transform="translate(30, 52)" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700">
      <rect x="0" y="0" width="42" height="16" rx="8" fill="rgba(255,255,255,.22)" />
      <text x="6" y="11" fill="white">#yt</text>
      <rect x="48" y="0" width="50" height="16" rx="8" fill="rgba(255,255,255,.22)" />
      <text x="54" y="11" fill="white">#tips</text>
      <rect x="104" y="0" width="46" height="16" rx="8" fill="rgba(255,255,255,.22)" />
      <text x="110" y="11" fill="white">#new</text>
    </g>
  </svg>
);

const TH_THUMBLAB = (
  <svg {...TH_PROPS}>
    <rect x="22" y="18" width="74" height="50" rx="5" fill="rgba(255,255,255,.92)" />
    <rect x="30" y="46" width="40" height="6" rx="3" fill="rgba(0,0,0,.25)" />
    <text x="28" y="34" fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#1F1815" fontWeight="700">A</text>
    <text x="76" y="64" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="rgba(0,0,0,.45)" fontWeight="700">7.8%</text>
    <text x="98" y="48" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(255,255,255,.6)" fontWeight="700">VS</text>
    <rect x="116" y="18" width="74" height="50" rx="5" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.85)" strokeWidth="1.2" strokeDasharray="4 3" />
    <text x="122" y="34" fontFamily="JetBrains Mono, monospace" fontSize="13" fill="white" fontWeight="700">B</text>
    <text x="170" y="64" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="white" fontWeight="700">9.1%</text>
  </svg>
);

const TH_VO = (
  <svg {...TH_PROPS}>
    <line x1="20" y1="44" x2="180" y2="44" stroke="rgba(255,255,255,.3)" strokeWidth="1" />
    {[6, 14, 22, 16, 30, 18, 38, 26, 44, 28, 36, 22, 30, 14, 22, 12, 16, 8].map((h, i) => (
      <rect key={i} x={22 + i * 9} y={44 - h / 2} width="4" height={h} rx="2" fill="white" opacity={i % 4 === 0 ? 1 : 0.6} />
    ))}
  </svg>
);

const TH_VIDGEN = (
  <svg {...TH_PROPS}>
    <rect x="14" y="22" width="172" height="44" rx="3" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.55)" strokeWidth="1" />
    <g fill="rgba(255,255,255,.92)">
      <rect x="22" y="30" width="34" height="28" rx="2" />
      <rect x="60" y="30" width="34" height="28" rx="2" opacity=".75" />
      <rect x="98" y="30" width="34" height="28" rx="2" opacity=".55" />
      <rect x="136" y="30" width="34" height="28" rx="2" opacity=".4" />
    </g>
    <g fill="rgba(255,255,255,.55)">
      {[18, 56, 94, 132, 170].map((x) => (<rect key={`t-${x}`} x={x} y="16" width="4" height="3" rx="1" />))}
      {[18, 56, 94, 132, 170].map((x) => (<rect key={`b-${x}`} x={x} y="69" width="4" height="3" rx="1" />))}
    </g>
    <polygon points="74,40 74,52 86,46" fill="rgba(31,24,21,.9)" />
  </svg>
);

const TH_REVIEW = (
  <svg {...TH_PROPS}>
    <rect x="50" y="10" width="92" height="68" rx="6" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.7)" strokeWidth="1.2" />
    <line x1="60" y1="22" x2="118" y2="22" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity=".85" />
    <line x1="60" y1="34" x2="132" y2="34" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity=".55" />
    <line x1="60" y1="46" x2="110" y2="46" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity=".5" />
    <line x1="60" y1="58" x2="124" y2="58" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity=".35" />
    <rect x="60" y="32" width="44" height="4" fill="#F25C3D" opacity=".55" />
    <g transform="translate(150, 26)">
      <circle r="11" fill="#F25C3D" />
      <path d="M-5 0 L-1 4 L6 -4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

const TH_TREND = (
  <svg {...TH_PROPS}>
    <path d="M20 70 L50 60 L80 50 L110 32 L150 18 L180 10 L180 78 L20 78 Z" fill="rgba(255,255,255,.18)" />
    <path d="M20 70 L50 60 L80 50 L110 32 L150 18 L180 10" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="180" cy="10" r="4" fill="white" />
    <circle cx="180" cy="10" r="8" fill="white" opacity=".25" />
    <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="white" fontWeight="700">
      <text x="146" y="32">↑24%</text>
    </g>
  </svg>
);

const TH_STATS = (
  <svg {...TH_PROPS}>
    <line x1="22" y1="68" x2="178" y2="68" stroke="rgba(255,255,255,.45)" strokeWidth="1" />
    <g fill="white">
      {[14, 24, 18, 32, 26, 40, 30, 48].map((h, i) => (
        <rect key={i} x={28 + i * 19} y={66 - h} width="13" height={h} rx="1.5" opacity={i === 7 ? 1 : 0.6} />
      ))}
    </g>
    <path d="M34 60 L53 52 L72 56 L91 46 L110 50 L129 38 L148 42 L167 28" stroke="rgba(255,255,255,.95)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 3" />
  </svg>
);

const TH_BIO = (
  <svg {...TH_PROPS}>
    <rect x="74" y="6" width="52" height="76" rx="8" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.65)" strokeWidth="1" />
    <circle cx="100" cy="14" r="3" fill="rgba(255,255,255,.6)" />
    <circle cx="100" cy="14" r="1" fill="rgba(0,0,0,.3)" />
    <rect x="80" y="22" width="40" height="10" rx="3" fill="rgba(255,255,255,.95)" />
    <rect x="80" y="36" width="40" height="10" rx="3" fill="rgba(255,255,255,.75)" />
    <rect x="80" y="50" width="40" height="10" rx="3" fill="rgba(255,255,255,.55)" />
    <rect x="80" y="64" width="40" height="10" rx="3" fill="rgba(255,255,255,.4)" />
  </svg>
);

const TH_SHOP = (
  <svg {...TH_PROPS}>
    <path d="M68 28 H132 L136 76 H64 L68 28 Z" fill="rgba(255,255,255,.18)" stroke="white" strokeWidth="1.6" />
    <path d="M82 30 V20 a18 18 0 0 1 36 0 V30" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <g transform="translate(146, 34)">
      <path d="M0 0 L26 0 L36 12 L26 24 L0 24 Z" fill="white" />
      <circle cx="6.5" cy="12" r="2.6" fill="rgba(31,24,21,.9)" />
      <text x="14" y="16" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" fill="rgba(31,24,21,.9)">$24</text>
    </g>
  </svg>
);

const TH_MCS = (
  <svg {...TH_PROPS}>
    <rect x="20" y="14" width="48" height="36" rx="4" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.55)" strokeWidth="1" />
    <text x="26" y="32" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="rgba(255,255,255,.7)" fontWeight="700">CAM 1</text>
    <rect x="76" y="22" width="48" height="36" rx="4" fill="rgba(255,255,255,.92)" />
    <text x="82" y="40" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="rgba(31,24,21,.9)" fontWeight="700">CAM 2</text>
    <rect x="132" y="14" width="48" height="36" rx="4" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.55)" strokeWidth="1" />
    <text x="138" y="32" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="rgba(255,255,255,.7)" fontWeight="700">CAM 3</text>
    <g transform="translate(78, 64)">
      {[3, 6, 9, 5, 8, 4, 7, 5, 6].map((h, i) => (
        <rect key={i} x={i * 5} y={-h / 2} width="2.5" height={h} rx="1" fill="white" opacity=".75" />
      ))}
    </g>
  </svg>
);

interface Tool { cat: string; h: string; p: string; thumb: React.ReactNode; dark?: boolean; }
const TOOLS: Tool[] = [
  { cat: "Create",   h: "Video Ideas",            p: "Trend-aware ranked ideas with hook angles", thumb: TH_IDEAS },
  { cat: "Create",   h: "Script Writer",          p: "Outline → draft, in your trained voice",     thumb: TH_SCRIPT },
  { cat: "Create",   h: "Title Generator",        p: "Eight titles ranked by predicted CTR",       thumb: TH_TITLE },
  { cat: "Create",   h: "Description + Hashtags", p: "SEO-shaped with auto-chapters and tiers",    thumb: TH_DESC },
  { cat: "Create",   h: "Thumbnail Lab",          p: "Drafts, A/B variants, CTR scoring",          thumb: TH_THUMBLAB },
  { cat: "Create",   h: "AI Voiceover",           p: "Studio VO in your trained voice",            thumb: TH_VO },
  { cat: "Create",   h: "Video Generator",        p: "B-roll, transitions, subtitle pass",         thumb: TH_VIDGEN },
  { cat: "Improve",  h: "Review My Script",       p: "Retention notes on a draft",                 thumb: TH_REVIEW },
  { cat: "Research", h: "Trending Finder",        p: "What's heating up in your niche",            thumb: TH_TREND },
  { cat: "Research", h: "Channel Stats",          p: "Performance, growth, audience",              thumb: TH_STATS },
  { cat: "Publish",  h: "Link in Bio",            p: "Branded link page, video-aware",             thumb: TH_BIO },
  { cat: "Publish",  h: "My Shop",                p: "Products tied to your videos",               thumb: TH_SHOP },
  { cat: "Soon",     h: "Multi-camera Sync",      p: "Auto-align takes, pick best shot", dark: true, thumb: TH_MCS },
];

export default function HomePage() {
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
              <a href="#tools" className="btn btn-line btn-lg">
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

        {/* Scroll cue — leads to the tools section */}
        <a href="#tools" className="hero-scroll-cue" aria-label="See the 13 tools">
          <span className="hero-scroll-label">13 tools</span>
          <span className="hero-scroll-arrow">{CHEVRON_DOWN}</span>
        </a>
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

      {/* === Tool grid === */}
      <section id="tools" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow"><span className="accent">13</span> tools, one workspace</span>
            <h2>Every tool, <span className="serif accent">already here.</span></h2>
            <p>Pre-trained on your channel. Pre-wired to your pipeline.</p>
          </div>
          <div className="tool-grid">
            {TOOLS.map((t) => (
              <a
                key={t.h}
                className={`tool-card thumb-${t.cat.toLowerCase()}${t.dark ? " tool-card-dark" : ""}`}
                href="#cta"
              >
                <div className="thumb">
                  {t.thumb}
                  <span className="thumb-cat">{t.cat}</span>
                </div>
                <div className="tool-body">
                  <h4>{t.h}</h4>
                  <p>{t.p}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA strip === */}
      <section id="cta" style={{ paddingTop: 0, paddingBottom: 64 }}>
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
