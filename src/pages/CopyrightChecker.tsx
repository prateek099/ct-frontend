import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'

interface CheckResult {
  segment: string
  status: 'clear' | 'flag' | 'claim'
  chipClass: string
  detail: string
  icon: 'check' | 'x' | 'clock'
}

const RESULTS: CheckResult[] = [
  {
    segment: '0:00 – 0:45',
    status: 'clear',
    chipClass: 'mint',
    detail: 'No copyright issues detected',
    icon: 'check',
  },
  {
    segment: '1:12 – 1:15',
    status: 'flag',
    chipClass: 'accent',
    detail: 'Flag: 3s match — "Blinding Lights" by The Weeknd (Warner Music)',
    icon: 'x',
  },
  {
    segment: '3:40 – 4:02',
    status: 'claim',
    chipClass: 'amber',
    detail: 'Claim possible — "Lo-fi Study Beat #4" by ChillBeats (Content ID)',
    icon: 'clock',
  },
]

const ADVICE = [
  {
    icon: 'x' as const,
    label: 'For copyright flags',
    text: 'Mute or replace the flagged segment. Use YouTube\'s Audio Library or royalty-free alternatives like Epidemic Sound or Artlist.',
  },
  {
    icon: 'clock' as const,
    label: 'For possible claims',
    text: 'Content ID claims may mute your audio, share revenue, or block the video in certain regions. Replace music before publishing to avoid issues.',
  },
  {
    icon: 'check' as const,
    label: 'To stay safe',
    text: 'Use YouTube Audio Library, CC0 music, or licensed tracks. Always read licence terms before using third-party audio.',
  },
]

export default function CopyrightChecker() {
  const [url, setUrl]       = useState('')
  const [checked, setChecked] = useState(false)

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Utilities"
        code="T19"
        icon="shield"
        title={<>Copyright <em>checker</em></>}
        subtitle="Check your video for music and content copyright flags before publishing."
      />

      {/* URL input */}
      <div className="card">
        <div className="field-label">YouTube video URL or upload a local file</div>
        <div className="row" style={{ gap: 10 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=… or paste a video URL"
          />
          <button className="btn accent" onClick={() => setChecked(true)}>
            <Icon name="shield" size={14} /> Check
          </button>
        </div>
        <div className="small muted" style={{ marginTop: 8 }}>
          We scan for music matches, visual content, and audio fingerprints using Content ID data.
        </div>
      </div>

      {checked && (
        <section className="grid-2-1">
          {/* Results */}
          <div className="col" style={{ gap: 16 }}>
            <div className="card">
              <div className="row between" style={{ marginBottom: 16 }}>
                <div className="h2">Scan results</div>
                <div className="row" style={{ gap: 6 }}>
                  <span className="badge mint">1 clear</span>
                  <span className="badge accent">1 flag</span>
                  <span className="badge amber">1 possible</span>
                </div>
              </div>

              <div className="col" style={{ gap: 10 }}>
                {RESULTS.map((r, i) => (
                  <div key={i} style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: 'var(--bg-soft)',
                    border: `1px solid ${r.status === 'clear' ? 'var(--mint)' : r.status === 'flag' ? 'var(--accent)' : 'var(--amber, #f5a623)'}`,
                  }}>
                    <div className="row between" style={{ marginBottom: 6 }}>
                      <span className="small muted">{r.segment}</span>
                      <span className={`chip sm ${r.chipClass}`}>
                        <Icon name={r.icon} size={11} />
                        {r.status === 'clear' ? 'Clear' : r.status === 'flag' ? 'Flagged' : 'Possible claim'}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{r.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card tinted">
              <div className="row between" style={{ marginBottom: 10 }}>
                <div className="h2">Overall risk</div>
                <span className="badge amber">Medium risk</span>
              </div>
              <div className="bar amber">
                <i style={{ width: '45%' }} />
              </div>
              <div className="small muted" style={{ marginTop: 10 }}>
                2 segments need attention before publishing.
              </div>
            </div>
          </div>

          {/* Advice card */}
          <div className="col" style={{ gap: 16 }}>
            <div className="card">
              <div className="h2" style={{ marginBottom: 14 }}>What to do</div>
              <div className="col" style={{ gap: 14 }}>
                {ADVICE.map((a, i) => (
                  <div key={i} className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: a.icon === 'check' ? 'var(--mint)' : a.icon === 'x' ? 'var(--accent)' : 'var(--bg-sunken)',
                      color: 'white',
                      display: 'grid', placeItems: 'center',
                    }}>
                      <Icon name={a.icon} size={13} />
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{a.label}</div>
                      <div className="small muted" style={{ lineHeight: 1.5 }}>{a.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card tinted">
              <div className="h2" style={{ marginBottom: 10 }}>Safe music sources</div>
              <div className="col" style={{ gap: 8 }}>
                {['YouTube Audio Library', 'Epidemic Sound', 'Artlist', 'Pixabay Music', 'Free Music Archive'].map(s => (
                  <div key={s} className="row" style={{ gap: 8 }}>
                    <Icon name="check" size={12} />
                    <span className="small">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
