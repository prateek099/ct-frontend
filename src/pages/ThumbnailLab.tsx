import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'

const TEMPLATES = [
  { id: 'tmpl-1', color: 'coral',  label: 'Bold Text',    text: 'THE TRUTH ABOUT' },
  { id: 'tmpl-2', color: 'violet', label: 'Minimal',      text: 'How I Did It' },
  { id: 'tmpl-3', color: 'mint',   label: 'Cinematic',    text: 'EPIC JOURNEY' },
  { id: 'tmpl-4', color: 'amber',  label: 'Meme Format',  text: 'Me vs Them' },
]

const STYLES = ['Bold', 'Minimal', 'Cinematic', 'Meme']
const FACES = ['None', 'Left', 'Right', 'Centre']

const CTR_DATA = [
  { label: 'Template A', ctr: 8.2, delta: '+1.4%' },
  { label: 'Template B', ctr: 6.9, delta: '+0.1%' },
  { label: 'Template C', ctr: 7.6, delta: '+0.9%' },
  { label: 'Template D', ctr: 5.3, delta: '-0.9%' },
]

const DNA_BARS = [
  { label: 'Contrast',   v: 88 },
  { label: 'Text size',  v: 72 },
  { label: 'Face power', v: 61 },
  { label: 'Colour pop', v: 95 },
]

export default function ThumbnailLab() {
  const [tab, setTab]         = useState<'Template' | 'Custom' | 'AI-generate'>('Template')
  const [selected, setSelected] = useState('tmpl-1')
  const [titleText, setTitleText] = useState('The Truth About YouTube Growth')
  const [face, setFace]       = useState('None')
  const [style, setStyle]     = useState('Bold')

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Step 5 of 6 · Design"
        code="T5"
        icon="image"
        title={<>Thumbnail <em>lab</em></>}
        subtitle="Design scroll-stopping thumbnails. 4 AI variants in 10 seconds."
        actions={
          <>
            <Link to="/description" className="btn"><Icon name="arrowLeft" size={14} /> Back</Link>
            <Link to="/tags" className="btn primary">Next: Tags <Icon name="arrowRight" size={14} /></Link>
          </>
        }
      />

      <section className="grid-2-1">
        {/* Left */}
        <div className="col" style={{ gap: 16 }}>
          {/* Mode switcher */}
          <div className="card">
            <div className="segmented" style={{ marginBottom: 20 }}>
              {(['Template', 'Custom', 'AI-generate'] as const).map(t => (
                <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>

            {/* Thumbnail grid */}
            <div className="grid-2" style={{ gap: 12 }}>
              {TEMPLATES.map(tmpl => (
                <div key={tmpl.id} className="col" style={{ gap: 8 }}>
                  <div
                    className={`thumb ${tmpl.color}`}
                    style={{
                      cursor: 'pointer',
                      outline: selected === tmpl.id ? '2px solid var(--accent)' : '2px solid transparent',
                      outlineOffset: 2,
                    }}
                    onClick={() => setSelected(tmpl.id)}
                  >
                    <span style={{ fontWeight: 900, fontSize: 13, textAlign: 'center', padding: '0 8px' }}>
                      {titleText ? titleText.split(' ').slice(0, 4).join(' ').toUpperCase() : tmpl.text}
                    </span>
                  </div>
                  <div className="row between">
                    <span className="small" style={{ fontWeight: 500 }}>{tmpl.label}</span>
                    <button
                      className={'btn sm' + (selected === tmpl.id ? ' accent' : '')}
                      onClick={() => setSelected(tmpl.id)}
                    >
                      {selected === tmpl.id ? <><Icon name="check" size={11} /> Selected</> : 'Select'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="card">
            <div className="h2" style={{ marginBottom: 14 }}>Customise</div>

            <div className="field-label">Title text on thumbnail</div>
            <input
              className="input"
              value={titleText}
              onChange={e => setTitleText(e.target.value)}
              placeholder="Text overlay on thumbnail…"
              style={{ marginBottom: 16 }}
            />

            <div className="field-label" style={{ marginBottom: 8 }}>Face position</div>
            <div className="row wrap" style={{ gap: 6, marginBottom: 16 }}>
              {FACES.map(f => (
                <button key={f} className={'chip' + (face === f ? ' filled' : '')} onClick={() => setFace(f)}>{f}</button>
              ))}
            </div>

            <div className="field-label" style={{ marginBottom: 8 }}>Style</div>
            <div className="row wrap" style={{ gap: 6 }}>
              {STYLES.map(s => (
                <button key={s} className={'chip' + (style === s ? ' accent' : '')} onClick={() => setStyle(s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="h2" style={{ marginBottom: 14 }}>Performance prediction</div>
            <div className="col" style={{ gap: 10 }}>
              {CTR_DATA.map(r => (
                <div key={r.label} className="row between" style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--bg-soft)' }}>
                  <span className="small">{r.label}</span>
                  <div className="row" style={{ gap: 6 }}>
                    <span className="badge mint">{r.ctr}%</span>
                    <span className={'badge ' + (r.delta.startsWith('+') ? 'mint' : 'accent')}>{r.delta}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="small muted" style={{ marginTop: 12 }}>
              Predicted CTR vs your channel avg (6.4%)
            </div>
          </div>

          <div className="card">
            <div className="h2" style={{ marginBottom: 14 }}>Your thumbnail DNA</div>
            <div className="col" style={{ gap: 10 }}>
              {DNA_BARS.map(d => (
                <div key={d.label}>
                  <div className="row between small">
                    <span>{d.label}</span>
                    <b>{d.v}%</b>
                  </div>
                  <div className={'bar ' + (d.v >= 80 ? 'mint' : d.v >= 60 ? 'amber' : 'accent')} style={{ marginTop: 4 }}>
                    <i style={{ width: `${d.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card tinted">
            <div className="small" style={{ lineHeight: 1.55 }}>
              <b>Tip:</b> Thumbnails with a face in the left 40% and bold text on the right outperform by <b style={{ color: 'var(--accent)' }}>+31%</b> on your channel.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
