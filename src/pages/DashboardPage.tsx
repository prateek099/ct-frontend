import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { useAuth } from '../context/AuthContext'

const IN_FLIGHT = [
  { title: 'Why I quit my 9–5 (and what I do now)', step: 3, total: 6, steps: ['Idea', 'Script', 'Title', 'Thumb', 'Tags', 'Publish'], due: 'Tue · Apr 21', thumb: 'coral' },
  { title: '5 AI tools that changed my channel',    step: 5, total: 6, steps: ['Idea', 'Script', 'Title', 'Thumb', 'Tags', 'Publish'], due: 'Thu · Apr 23', thumb: 'violet' },
  { title: 'My $0 editing setup (Premiere free)',   step: 2, total: 6, steps: ['Idea', 'Script', 'Title', 'Thumb', 'Tags', 'Publish'], due: 'Sat · Apr 25', thumb: 'mint' },
]

const QUICK_TOOLS = [
  { path: '/idea',      icon: 'lightbulb', label: 'New idea',       sub: 'Hook-scored, trend-aware' },
  { path: '/script',    icon: 'pencil',    label: 'Write a script', sub: 'From outline to draft' },
  { path: '/thumbnail', icon: 'image',     label: 'Thumbnail lab',  sub: '4 designs in 10s' },
  { path: '/trending',  icon: 'trend',     label: "What's hot?",    sub: 'Niche + region' },
]

const WEEK = [
  { day: 'Mon', date: 21, event: null },
  { day: 'Tue', date: 22, event: { label: 'Publish · AI tools', kind: '' }, today: true },
  { day: 'Wed', date: 23, event: null },
  { day: 'Thu', date: 24, event: { label: 'Record · 9-5 video', kind: 'violet' } },
  { day: 'Fri', date: 25, event: null },
  { day: 'Sat', date: 26, event: { label: 'Shorts drop', kind: 'mint' } },
  { day: 'Sun', date: 27, event: { label: 'Script review', kind: 'sky' } },
]

const STATS = [
  { label: '7-day views', value: '184.2k', delta: '+12.4%', up: true },
  { label: 'Avg. watch',  value: '4:12',   delta: '+0:18',  up: true },
  { label: 'Avg. CTR',    value: '6.4%',   delta: '−0.3%',  up: false },
  { label: 'Subs gained', value: '1,284',  delta: '+8.1%',  up: true },
]

function greeting(name: string) {
  const h = new Date().getHours()
  const time = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
  return `Good ${time}, ${name.split(' ')[0]}.`
}

export default function DashboardPage() {
  const { user } = useAuth()
  const name = user?.name ?? 'Creator'

  return (
    <div className="stack-24">
      {/* Hero */}
      <section className="hero">
        <svg className="hero-squiggle" viewBox="0 0 120 40" fill="none">
          <path d="M2 20 Q 18 2 34 20 T 66 20 T 98 20 T 130 20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <div className="eyebrow">Creator OS · Workspace</div>
        <h1 className="h-display" style={{ marginTop: 6 }}>
          {greeting(name)} <em>Three videos</em> in the oven.
        </h1>
        <p className="muted" style={{ maxWidth: 560, marginTop: 10, fontSize: 14 }}>
          Use the pipeline to take your next video from idea to publish — one step at a time.
        </p>
        <div className="row" style={{ marginTop: 18, gap: 10 }}>
          <Link to="/idea" className="btn primary">
            <Icon name="sparkles" size={14} /> Start a new video
          </Link>
          <Link to="/calendar" className="btn">
            <Icon name="calendar" size={14} /> Open calendar
          </Link>
          <div className="row" style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 13 }}>
            <span className="pulse" /> <span>AI copilot online</span>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="grid-4">
        {STATS.map(s => (
          <div className="card" key={s.label}>
            <div className="eyebrow">{s.label}</div>
            <div className="row between" style={{ marginTop: 8 }}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.015em' }}>{s.value}</div>
              <span className={'badge ' + (s.up ? 'mint' : 'accent')}>
                <Icon name="trend" size={12} style={{ transform: s.up ? 'none' : 'scaleY(-1)' }} />
                {s.delta}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid-2-1">
        {/* In-flight videos */}
        <div className="card">
          <div className="card-title">
            <div>
              <h3 className="h2">In flight</h3>
              <div className="small muted" style={{ marginTop: 4 }}>Videos moving through the pipeline</div>
            </div>
            <Link to="/calendar" className="btn sm ghost">See all <Icon name="arrowRight" size={12} /></Link>
          </div>
          <div className="stack-12">
            {IN_FLIGHT.map(v => (
              <div className="row" key={v.title} style={{ gap: 16, padding: 12, border: '1px solid var(--line)', borderRadius: 14 }}>
                <div className={'thumb ' + v.thumb} style={{ width: 140, flex: '0 0 140px' }}>
                  {v.title.split(' ').slice(0, 3).join(' ')}
                  <span className="corner">{v.thumb.toUpperCase()}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row between">
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{v.title}</div>
                    <span className="muted small">{v.due}</span>
                  </div>
                  <div className="row" style={{ gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {v.steps.map((s, i) => {
                      const done = i < v.step, active = i === v.step
                      return (
                        <span key={s} className={'chip sm ' + (done ? 'filled' : active ? 'accent' : '')}>
                          {done && <Icon name="check" size={10} />}{s}
                        </span>
                      )
                    })}
                  </div>
                  <div className="row" style={{ marginTop: 10, gap: 12 }}>
                    <div className="bar accent" style={{ flex: 1 }}>
                      <i style={{ width: `${(v.step / v.total) * 100}%` }} />
                    </div>
                    <span className="small muted" style={{ minWidth: 60 }}>Step {v.step}/{v.total}</span>
                    <Link to="/idea" className="btn sm">Continue <Icon name="arrowRight" size={12} /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick tools + mini calendar */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-title">
              <h3 className="h2">Quick tools</h3>
              <span className="small muted">19 total</span>
            </div>
            <div className="grid-2" style={{ gap: 10 }}>
              {QUICK_TOOLS.map(q => (
                <Link to={q.path} key={q.path} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg-soft)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
                    <Icon name={q.icon} size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{q.label}</div>
                    <div className="tiny muted" style={{ marginTop: 2 }}>{q.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <h3 className="h2">This week</h3>
              <Link to="/calendar" className="btn sm ghost">Full calendar <Icon name="arrowRight" size={12} /></Link>
            </div>
            <div className="calendar">
              {WEEK.map(d => (
                <div key={d.date} className={'day' + (d.today ? ' today' : '')}>
                  <div className="date">{d.day} · {d.date}</div>
                  {d.event && <div className={'event ' + d.event.kind}>{d.event.label}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI copilot + recent activity */}
      <section className="grid-2">
        <div className="card" style={{ padding: 20 }}>
          <div className="card-title">
            <div>
              <h3 className="h2">AI copilot</h3>
              <div className="small muted" style={{ marginTop: 4 }}>Any of your 19 tools, one line away</div>
            </div>
            <span className="chip sm"><Icon name="sparkles" size={11} /> Claude 4.7</span>
          </div>
          <div className="col" style={{ gap: 10 }}>
            <div className="bubble me">Give me 5 title options for the AI-tools video, ranked by CTR</div>
            <div className="bubble">
              <div className="small muted" style={{ marginBottom: 6 }}>
                <span className="chip sm accent"><Icon name="tag" size={11} /> Title Generator · T3</span>
              </div>
              <div className="col" style={{ gap: 6 }}>
                <div>1. <b>"I tried 5 AI tools — here's what actually won"</b> <span className="muted small">· CTR ~9.2%</span></div>
                <div>2. <b>"The $0 AI creator stack in 2026"</b></div>
                <div>3. <b>"Stop paying for these tools — free AI that beats them"</b></div>
              </div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <input className="input" placeholder="Type a prompt or press ⌘K…" readOnly />
              <button className="btn primary"><Icon name="arrowRight" size={14} /> Send</button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            <h3 className="h2">Recent activity</h3>
            <button className="btn sm ghost">Filter</button>
          </div>
          <table className="table">
            <thead>
              <tr><th>Event</th><th>Tool</th><th>When</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Generated 10 video ideas · "AI tools"</td>
                <td><span className="chip sm">T1 Ideas</span></td>
                <td className="muted">12 min ago</td>
              </tr>
              <tr>
                <td>Drafted 4-min script</td>
                <td><span className="chip sm">T2 Script</span></td>
                <td className="muted">42 min ago</td>
              </tr>
              <tr>
                <td>Thumbnail variant approved</td>
                <td><span className="chip sm">T5 Thumbnail</span></td>
                <td className="muted">Yesterday</td>
              </tr>
              <tr>
                <td>Copyright flag · 3s music match</td>
                <td><span className="chip sm accent">T19 Copyright</span></td>
                <td className="muted">Yesterday</td>
              </tr>
              <tr>
                <td>Repurposed for Shorts + TikTok</td>
                <td><span className="chip sm">T14 Repurpose</span></td>
                <td className="muted">2d</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
