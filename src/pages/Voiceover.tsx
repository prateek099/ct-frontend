import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'

const MOCK_SCRIPT =
  `Hey, what's up everyone — welcome back to the channel.\n\nToday I'm pulling back the curtain on the exact YouTube growth strategy that took me from zero to a hundred thousand subscribers in just 11 months.\n\nThis isn't about lucky breaks. There's a very specific system I've built — and I'm going to hand it to you piece by piece.\n\nStick around until the end, because I've got a free resource that ties everything together.\n\nLet's get into it.`

interface Voice {
  id: string
  name: string
  accent: string
  color: string
  sample: string
}

const VOICES: Voice[] = [
  { id: 'v1', name: 'Neutral US Male',     accent: 'en-US', color: 'coral',  sample: 'Deep, confident, professional' },
  { id: 'v2', name: 'Warm Female',         accent: 'en-US', color: 'violet', sample: 'Friendly, engaging, energetic' },
  { id: 'v3', name: 'British Male',        accent: 'en-GB', color: 'mint',   sample: 'Authoritative, clear, articulate' },
  { id: 'v4', name: 'Australian Female',   accent: 'en-AU', color: 'amber',  sample: 'Bright, casual, likeable' },
]

export default function Voiceover() {
  const [script, setScript]   = useState(MOCK_SCRIPT)
  const [voice, setVoice]     = useState('v1')
  const [speed, setSpeed]     = useState(1.0)
  const [pitch, setPitch]     = useState(0)
  const [generated, setGenerated] = useState(false)

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Create"
        code="T11"
        icon="mic"
        title={<>AI <em>voiceover</em></>}
        subtitle="Generate studio-quality voiceover from your script."
      />

      <section className="grid-1-2">
        {/* Left controls */}
        <div className="col" style={{ gap: 16 }}>
          {/* Voice picker */}
          <div className="card">
            <div className="h2" style={{ marginBottom: 14 }}>Select voice</div>
            <div className="col" style={{ gap: 8 }}>
              {VOICES.map(v => (
                <div
                  key={v.id}
                  className="row"
                  style={{
                    gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    border: `1px solid ${voice === v.id ? 'var(--accent)' : 'var(--line)'}`,
                    background: voice === v.id ? 'var(--accent-tint)' : 'var(--bg-elev)',
                  }}
                  onClick={() => setVoice(v.id)}
                >
                  <div className={`thumb ${v.color}`} style={{ width: 42, height: 42, flexShrink: 0, fontSize: 10, borderRadius: 10 }}>
                    <Icon name="mic" size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{v.name}</div>
                    <div className="tiny muted">{v.sample}</div>
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    <span className="chip sm">{v.accent}</span>
                    <button
                      className="btn sm ghost"
                      onClick={e => { e.stopPropagation() }}
                    >
                      <Icon name="play" size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Speed / Pitch */}
          <div className="card">
            <div className="h2" style={{ marginBottom: 14 }}>Adjustments</div>

            <div className="field-label">Speed: {speed.toFixed(1)}×</div>
            <input
              type="range" min="0.5" max="2.0" step="0.1"
              value={speed}
              onChange={e => setSpeed(parseFloat(e.target.value))}
              style={{ width: '100%', marginBottom: 16 }}
            />

            <div className="field-label">Pitch: {pitch > 0 ? '+' : ''}{pitch} st</div>
            <input
              type="range" min="-6" max="6" step="1"
              value={pitch}
              onChange={e => setPitch(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <button
            className="btn accent"
            style={{ justifyContent: 'center' }}
            onClick={() => setGenerated(true)}
          >
            <Icon name="sparkles" size={14} /> Generate voiceover
          </button>
        </div>

        {/* Right: script + output */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="row between" style={{ marginBottom: 10 }}>
              <div className="h2">Script</div>
              <span className="chip sm">{script.trim().split(/\s+/).length} words</span>
            </div>
            <textarea
              className="textarea"
              style={{ minHeight: 260, fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.65 }}
              value={script}
              onChange={e => setScript(e.target.value)}
              placeholder="Paste your script here…"
            />
          </div>

          {generated && (
            <div className="card">
              <div className="row between" style={{ marginBottom: 14 }}>
                <div className="h2">Generated voiceover</div>
                <span className="badge mint">Ready</span>
              </div>

              {/* Waveform placeholder */}
              <div style={{
                height: 64,
                borderRadius: 10,
                background: 'var(--bg-sunken)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                marginBottom: 14,
                overflow: 'hidden',
              }}>
                {Array.from({ length: 80 }).map((_, i) => (
                  <div key={i} style={{
                    width: 3,
                    height: `${20 + Math.abs(Math.sin(i * 0.4) * 35)}%`,
                    background: 'var(--accent)',
                    borderRadius: 2,
                    opacity: 0.7,
                  }} />
                ))}
              </div>

              <div className="row" style={{ gap: 8 }}>
                <button className="btn accent" style={{ flex: 1, justifyContent: 'center' }}>
                  <Icon name="play" size={14} /> Play
                </button>
                <button className="btn">
                  <Icon name="download" size={14} /> Download MP3
                </button>
                <button className="btn sm ghost">
                  <Icon name="refresh" size={13} /> Regenerate
                </button>
              </div>

              <div className="row" style={{ gap: 8, marginTop: 10 }}>
                <span className="chip sm">~{Math.round(script.trim().split(/\s+/).length / (140 * speed))} min</span>
                <span className="chip sm">{VOICES.find(v => v.id === voice)?.name}</span>
                <span className="chip sm">{speed}× speed</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
