import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'

const PERIODS = ['24h', '7d', '30d', '90d'] as const
const REGIONS = ['US', 'UK', 'Global'] as const
const NICHES  = ['Tech', 'Finance', 'Gaming', 'Health', 'DIY', 'Education']

const TRENDING = [
  { color: 'coral',  title: '10 AI Tools That Will Replace Your Job',    channel: 'FutureTech',   views: '2.4M', delta: '+840%', badge: 'accent' },
  { color: 'violet', title: 'I Tried 30 Days of Cold Plunge — Results',   channel: 'BiohackLab',   views: '1.1M', delta: '+310%', badge: 'mint' },
  { color: 'mint',   title: 'The Housing Market Is About to CRASH',        channel: 'MoneyMoves',   views: '980K', delta: '+220%', badge: 'amber' },
  { color: 'amber',  title: 'Claude 4 vs GPT-5: Full Comparison',          channel: 'AIDaily',      views: '3.2M', delta: '+990%', badge: 'accent' },
  { color: 'coral',  title: 'How I Made $40k With One YouTube Video',      channel: 'CreatorPro',   views: '760K', delta: '+180%', badge: 'mint' },
  { color: 'violet', title: 'Samsung Galaxy S25 Ultra — Honest Review',    channel: 'TechUnboxed',  views: '2.8M', delta: '+510%', badge: 'accent' },
]

const KEYWORDS = [
  { label: 'AI tools 2024',     v: 95 },
  { label: 'passive income',    v: 82 },
  { label: 'cold plunge',       v: 78 },
  { label: 'housing crash',     v: 71 },
  { label: 'make money online', v: 66 },
]

export default function TrendingFinder() {
  const [period, setPeriod] = useState<typeof PERIODS[number]>('7d')
  const [region, setRegion] = useState<typeof REGIONS[number]>('US')
  const [niche, setNiche]   = useState('Tech')

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Research"
        code="T7"
        icon="trend"
        title={<>What's <em>trending</em></>}
        subtitle="See what's catching fire in your niche."
        actions={
          <button className="btn primary"><Icon name="refresh" size={14} /> Refresh</button>
        }
      />

      {/* Filters */}
      <div className="card">
        <div className="row wrap" style={{ gap: 12 }}>
          <div className="segmented">
            {PERIODS.map(p => (
              <button key={p} className={period === p ? 'on' : ''} onClick={() => setPeriod(p)}>{p}</button>
            ))}
          </div>
          <div className="segmented">
            {REGIONS.map(r => (
              <button key={r} className={region === r ? 'on' : ''} onClick={() => setRegion(r)}>{r}</button>
            ))}
          </div>
          <div className="row wrap" style={{ gap: 6 }}>
            {NICHES.map(n => (
              <button key={n} className={'chip sm' + (niche === n ? ' filled' : '')} onClick={() => setNiche(n)}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      <section className="grid-2-1">
        {/* Left: trending list */}
        <div className="card">
          <div className="row between" style={{ marginBottom: 16 }}>
            <div className="h2">Trending in {niche} · {region} · {period}</div>
            <span className="chip sm mint"><Icon name="flame" size={11} /> Live</span>
          </div>

          <div className="col" style={{ gap: 12 }}>
            {TRENDING.map((v, i) => (
              <div key={i} className="row" style={{ gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <div className={`thumb ${v.color}`} style={{ width: 96, height: 54, flexShrink: 0, fontSize: 11 }}>
                  #{i + 1}
                </div>
                <div className="col" style={{ flex: 1, minWidth: 0, gap: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{v.title}</div>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="tiny muted">{v.channel}</span>
                    <span className="tiny muted">{v.views} views</span>
                    <span className={`badge ${v.badge}`}>{v.delta}</span>
                  </div>
                </div>
                <button className="btn sm">Riff on this</button>
              </div>
            ))}
          </div>
        </div>

        {/* Right col */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="h2" style={{ marginBottom: 14 }}>Breakout keywords</div>
            <div className="col" style={{ gap: 10 }}>
              {KEYWORDS.map(k => (
                <div key={k.label}>
                  <div className="row between small">
                    <span>{k.label}</span>
                    <b>{k.v}</b>
                  </div>
                  <div className="bar accent" style={{ marginTop: 4 }}>
                    <i style={{ width: `${k.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card tinted">
            <div className="row" style={{ gap: 10, marginBottom: 12 }}>
              <Icon name="sparkles" size={16} />
              <div className="h2">Content gap</div>
            </div>
            <div className="small" style={{ lineHeight: 1.6, marginBottom: 14 }}>
              <b>"AI tools for freelancers"</b> is trending +420% but fewer than 50 videos target it directly. High opportunity.
            </div>
            <button className="btn accent" style={{ width: '100%', justifyContent: 'center' }}>
              <Icon name="lightbulb" size={14} /> Generate ideas for this gap
            </button>
          </div>

          <div className="card">
            <div className="h2" style={{ marginBottom: 10 }}>Your niche pulse</div>
            <div className="col" style={{ gap: 8 }}>
              {[
                { label: 'Avg velocity',  val: '+186%' },
                { label: 'New creators',  val: '+23%' },
                { label: 'Saturation',    val: 'Medium' },
                { label: 'Best day',      val: 'Tuesday' },
              ].map(r => (
                <div key={r.label} className="row between small">
                  <span className="muted">{r.label}</span>
                  <b>{r.val}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
