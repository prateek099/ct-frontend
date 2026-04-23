import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'

const STYLES_LIST = ['Talking head', 'B-roll heavy', 'Slides', 'Animation']

export default function VideoGenerator() {
  const [step, setStep]          = useState(1)
  const [videoStyle, setVideoStyle] = useState('Talking head')
  const [generated, setGenerated]   = useState(false)

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Create"
        code="T13"
        icon="film"
        title={<>Video <em>generator</em></>}
        subtitle="Generate a full video from your script + assets."
      />

      {/* 3-step flow */}
      <div className="card">
        {/* Step indicator */}
        <div className="row" style={{ gap: 0, marginBottom: 24 }}>
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="row" style={{ flex: i < 2 ? '1 1 0' : 'unset', alignItems: 'center' }}>
              <div
                onClick={() => setStep(s)}
                style={{
                  width: 32, height: 32, borderRadius: '50%', cursor: 'pointer',
                  background: step >= s ? 'var(--accent)' : 'var(--bg-sunken)',
                  color: step >= s ? 'white' : 'var(--ink-3)',
                  display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0,
                }}
              >
                {step > s ? <Icon name="check" size={14} /> : s}
              </div>
              {i < 2 && (
                <div style={{
                  flex: 1, height: 2,
                  background: step > s ? 'var(--accent)' : 'var(--line)',
                  margin: '0 4px',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Assets */}
        {step === 1 && (
          <div className="col" style={{ gap: 16 }}>
            <div className="h2">Step 1 — Assets</div>

            <div style={{
              border: '2px dashed var(--line)', borderRadius: 12,
              padding: 40, textAlign: 'center', cursor: 'pointer',
              background: 'var(--bg-soft)',
            }}>
              <div style={{ marginBottom: 10 }}><Icon name="upload" size={28} /></div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Drop B-roll, images, or audio here</div>
              <div className="small muted">MP4, MOV, JPG, PNG, MP3 · up to 500MB</div>
              <button className="btn" style={{ marginTop: 12 }}>Browse files</button>
            </div>

            <div className="row" style={{ gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              <span className="small muted">or use existing</span>
              <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>

            <div className="row" style={{ gap: 8 }}>
              <span className="chip mint"><Icon name="check" size={11} /> Script ready</span>
              <span className="chip violet"><Icon name="check" size={11} /> Voiceover MP3</span>
              <span className="chip amber">No B-roll</span>
            </div>

            <button className="btn primary" style={{ alignSelf: 'flex-end' }} onClick={() => setStep(2)}>
              Next: Style <Icon name="arrowRight" size={14} />
            </button>
          </div>
        )}

        {/* Step 2: Style */}
        {step === 2 && (
          <div className="col" style={{ gap: 16 }}>
            <div className="h2">Step 2 — Style</div>
            <div className="grid-2" style={{ gap: 10 }}>
              {STYLES_LIST.map(s => (
                <button
                  key={s}
                  onClick={() => setVideoStyle(s)}
                  style={{
                    padding: '14px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    border: `1px solid ${videoStyle === s ? 'var(--accent)' : 'var(--line)'}`,
                    background: videoStyle === s ? 'var(--accent-tint)' : 'var(--bg-elev)',
                    fontWeight: 600, fontSize: 14,
                  }}
                >
                  {videoStyle === s && <Icon name="check" size={13} />} {s}
                </button>
              ))}
            </div>
            <div className="row" style={{ gap: 8, justifyContent: 'space-between', marginTop: 8 }}>
              <button className="btn" onClick={() => setStep(1)}><Icon name="arrowLeft" size={14} /> Back</button>
              <button className="btn primary" onClick={() => setStep(3)}>Next: Generate <Icon name="arrowRight" size={14} /></button>
            </div>
          </div>
        )}

        {/* Step 3: Generate */}
        {step === 3 && (
          <div className="col" style={{ gap: 16 }}>
            <div className="h2">Step 3 — Generate</div>
            <div className="card tinted">
              <div className="col" style={{ gap: 8 }}>
                {[
                  { label: 'Script',    val: 'Ready',          badge: 'mint' },
                  { label: 'Voiceover', val: 'MP3 loaded',     badge: 'mint' },
                  { label: 'Style',     val: videoStyle,       badge: 'violet' },
                  { label: 'B-roll',    val: 'AI-sourced',     badge: 'amber' },
                ].map(r => (
                  <div key={r.label} className="row between small">
                    <span className="muted">{r.label}</span>
                    <span className={`badge ${r.badge}`}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="row" style={{ gap: 8, justifyContent: 'space-between' }}>
              <button className="btn" onClick={() => setStep(2)}><Icon name="arrowLeft" size={14} /> Back</button>
              <button
                className="btn accent"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { setGenerated(true) }}
              >
                <Icon name="sparkles" size={14} /> Generate video
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Output */}
      {generated && (
        <div className="card">
          <div className="row between" style={{ marginBottom: 14 }}>
            <div className="h2">Your video</div>
            <span className="badge mint">Ready</span>
          </div>
          <div className="thumb coral" style={{ position: 'relative', maxWidth: 480 }}>
            <span style={{ fontWeight: 900, fontSize: 20 }}>PREVIEW</span>
            <button
              style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer',
                display: 'grid', placeItems: 'center', color: 'white',
              }}
            >
              <Icon name="play" size={22} />
            </button>
          </div>
          <div className="row" style={{ gap: 8, marginTop: 14 }}>
            <button className="btn accent"><Icon name="download" size={14} /> Download MP4</button>
            <button className="btn"><Icon name="split" size={14} /> Repurpose</button>
            <button className="btn sm ghost"><Icon name="refresh" size={13} /> Regenerate</button>
          </div>
        </div>
      )}
    </div>
  )
}
