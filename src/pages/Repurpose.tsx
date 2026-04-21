import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'

interface Platform {
  id: string
  label: string
  format: string
  duration: string
  badge: string
  color: string
}

const PLATFORMS: Platform[] = [
  { id: 'shorts',    label: 'YouTube Shorts',   format: '9:16', duration: '≤60s',  badge: 'accent', color: 'coral'  },
  { id: 'tiktok',    label: 'TikTok',           format: '9:16', duration: '≤3min', badge: 'violet', color: 'violet' },
  { id: 'reels',     label: 'Instagram Reels',  format: '9:16', duration: '≤90s',  badge: 'amber',  color: 'amber'  },
  { id: 'linkedin',  label: 'LinkedIn',         format: '16:9', duration: '≤10min',badge: 'sky',    color: 'mint'   },
  { id: 'twitter',   label: 'Twitter / X',      format: '16:9', duration: '≤2:20', badge: 'sky',    color: 'sky'    },
]

const OUTPUTS = [
  {
    platform: 'YouTube Shorts',
    color: 'coral',
    format: '9:16 · 60s',
    badge: 'accent',
    title: '3 Systems That Made Me Consistent (60s)',
    desc: 'Motivation is unreliable. Systems aren\'t. Here are the 3 I use every week → full breakdown on the channel ⬆️',
  },
  {
    platform: 'TikTok',
    color: 'violet',
    format: '9:16 · 58s',
    badge: 'violet',
    title: 'Stop relying on motivation 😤 #contentcreator',
    desc: 'The creator secret nobody talks about: systems > motivation. Three-step breakdown below 👇 Follow for more creator tips.',
  },
  {
    platform: 'Instagram Reels',
    color: 'amber',
    format: '9:16 · 60s',
    badge: 'amber',
    title: 'What actually keeps creators consistent 🎥',
    desc: 'Swipe ➡️ for the 3 systems I use every single week. Save this for when you\'re feeling unmotivated.',
  },
]

export default function Repurpose() {
  const [selected, setSelected] = useState<Set<string>>(new Set(['shorts', 'tiktok', 'reels']))

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Improve"
        code="T14"
        icon="split"
        title={<>Cross-platform <em>repurpose</em></>}
        subtitle="Adapt your video for Shorts, TikTok, Instagram Reels, and LinkedIn."
      />

      {/* Source */}
      <div className="card tinted">
        <div className="row" style={{ gap: 12, alignItems: 'center' }}>
          <div className="thumb coral" style={{ width: 80, height: 45, flexShrink: 0, fontSize: 10, borderRadius: 8 }}>
            SOURCE
          </div>
          <div>
            <div className="tiny muted" style={{ marginBottom: 3 }}>Source video</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>3 Systems That Keep Me Consistent As a Creator</div>
            <div className="row" style={{ gap: 8, marginTop: 4 }}>
              <span className="chip sm">14:22</span>
              <span className="chip sm mint">Script ready</span>
              <span className="chip sm violet">Voiceover MP3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform selector */}
      <div className="card">
        <div className="h2" style={{ marginBottom: 12 }}>Target platforms</div>
        <div className="row wrap" style={{ gap: 8 }}>
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              className={`chip${selected.has(p.id) ? ` ${p.badge}` : ''}`}
              onClick={() => toggle(p.id)}
            >
              {selected.has(p.id) && <Icon name="check" size={11} />} {p.label}
              <span className="tiny" style={{ opacity: 0.7, marginLeft: 4 }}>{p.format} · {p.duration}</span>
            </button>
          ))}
        </div>

        <button
          className="btn accent"
          style={{ marginTop: 16, justifyContent: 'center', width: '100%' }}
        >
          <Icon name="sparkles" size={14} /> Repurpose now ({selected.size} platform{selected.size !== 1 ? 's' : ''})
        </button>
      </div>

      {/* Outputs */}
      <div className="grid-3">
        {OUTPUTS.map((o, i) => (
          <div key={i} className="card">
            <div className="row between" style={{ marginBottom: 10 }}>
              <span className={`badge ${o.badge}`}>{o.platform}</span>
              <span className="chip sm">{o.format}</span>
            </div>

            <div className={`thumb ${o.color}`} style={{ marginBottom: 12, fontSize: 12 }}>
              {o.platform.toUpperCase()}
            </div>

            <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, marginBottom: 8 }}>{o.title}</div>
            <div className="small muted" style={{ lineHeight: 1.5, marginBottom: 12 }}>{o.desc}</div>

            <div className="row" style={{ gap: 6 }}>
              <button className="btn sm" style={{ flex: 1, justifyContent: 'center' }}>
                <Icon name="copy" size={12} /> Copy
              </button>
              <button className="btn sm ghost"><Icon name="pencil" size={12} /></button>
              <button className="btn sm ghost"><Icon name="download" size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
