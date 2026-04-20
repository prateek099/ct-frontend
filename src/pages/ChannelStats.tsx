import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'

const STATS = [
  { label: 'Subscribers',  value: '124.3k', delta: '+2.1k',  deltaDir: 'up',   badge: 'mint' },
  { label: 'Avg CTR',      value: '6.4%',   delta: '+0.8%',  deltaDir: 'up',   badge: 'mint' },
  { label: 'Avg watch',    value: '4:12',   delta: '-0:08',  deltaDir: 'down',  badge: 'amber' },
  { label: '7d views',     value: '184.2k', delta: '+14.1k', deltaDir: 'up',   badge: 'mint' },
]

const TOP_VIDEOS = [
  { title: '10 AI Tools That Will Change Everything',  views: '412K', ctr: '9.1%', duration: '14:22' },
  { title: 'I Quit My Job to Make YouTube Full-Time',  views: '287K', ctr: '7.8%', duration: '18:04' },
  { title: 'How I Went from 0 to 100K Subscribers',    views: '261K', ctr: '8.4%', duration: '12:50' },
  { title: 'The Brutal Truth About Content Creation',  views: '198K', ctr: '6.2%', duration: '10:11' },
  { title: 'My Complete YouTube Studio Setup 2024',    views: '143K', ctr: '5.9%', duration: '22:38' },
]

const AUDIENCE_BARS = [
  { label: '18–24', v: 28, color: 'accent' },
  { label: '25–34', v: 41, color: 'mint' },
  { label: '35–44', v: 19, color: 'violet' },
  { label: '45–54', v: 8,  color: 'amber' },
  { label: '55+',   v: 4,  color: 'sky' },
]

export default function ChannelStats() {
  const [url, setUrl] = useState('https://youtube.com/@MrBeast')
  const [loaded, setLoaded] = useState(true)

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Research"
        code="T8"
        icon="chart"
        title={<>Channel <em>stats</em></>}
        subtitle="Analyse any YouTube channel — yours or a competitor's."
      />

      {/* URL input */}
      <div className="card">
        <div className="field-label">YouTube channel URL or handle</div>
        <div className="row" style={{ gap: 10 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://youtube.com/@handle or channel URL"
          />
          <button className="btn accent" onClick={() => setLoaded(true)}>
            <Icon name="search" size={14} /> Analyse
          </button>
        </div>
      </div>

      {loaded && (
        <>
          {/* Stat cards */}
          <div className="grid-4">
            {STATS.map(s => (
              <div key={s.label} className="card" style={{ textAlign: 'center' }}>
                <div className="muted small" style={{ marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span className={`badge ${s.badge}`}>
                    {s.deltaDir === 'up' ? '↑' : '↓'} {s.delta} 7d
                  </span>
                </div>
              </div>
            ))}
          </div>

          <section className="grid-2-1">
            {/* Top videos table */}
            <div className="card">
              <div className="h2" style={{ marginBottom: 14 }}>Top performing videos</div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Views</th>
                    <th>CTR</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_VIDEOS.map((v, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{v.title}</td>
                      <td>{v.views}</td>
                      <td><span className="badge mint">{v.ctr}</span></td>
                      <td className="muted">{v.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Audience sidebar */}
            <div className="col" style={{ gap: 16 }}>
              <div className="card">
                <div className="h2" style={{ marginBottom: 14 }}>Audience age breakdown</div>
                <div className="col" style={{ gap: 10 }}>
                  {AUDIENCE_BARS.map(b => (
                    <div key={b.label}>
                      <div className="row between small">
                        <span>{b.label}</span>
                        <b>{b.v}%</b>
                      </div>
                      <div className={`bar ${b.color}`} style={{ marginTop: 4 }}>
                        <i style={{ width: `${b.v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="h2" style={{ marginBottom: 10 }}>Channel health</div>
                <div className="col" style={{ gap: 8 }}>
                  {[
                    { label: 'Upload frequency', val: '2× / week' },
                    { label: 'Avg retention',    val: '48%' },
                    { label: 'Comment rate',     val: '1.2%' },
                    { label: 'Like rate',        val: '4.8%' },
                    { label: 'Total videos',     val: '184' },
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
        </>
      )}
    </div>
  )
}
