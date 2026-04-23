import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'

const MOCK_SCRIPT =
  `Hey everyone, welcome back.\n\nSo today I want to talk about something that completely changed how I approach content creation — and that's building systems instead of relying on motivation.\n\nMotivation is unreliable. Some days you have it, most days you don't. But a system? A system just runs.\n\nHere are the three systems I use every single week to stay consistent:\n\nFirst — a content calendar. Not complicated. Just know what you're making next.\n\nSecond — batch filming. I film four videos in one session, every two weeks. It's painful but it works.\n\nThird — a review ritual. Every Sunday, I watch the previous week's videos with fresh eyes and write down three things I'd do differently.\n\nThat's it. Three systems. If you do nothing else, do those.\n\nHit subscribe if this was useful — I post every Tuesday and Thursday.`

const CHECKLIST = [
  { label: 'Hook in first 8 seconds',  done: true,  hint: '' },
  { label: 'Clear thesis by 0:30',     done: true,  hint: '' },
  { label: 'Pattern interrupt ≤ 90s',  done: true,  hint: '' },
  { label: 'CTA placed before 70%',    done: false, hint: 'Suggest moving CTA to ~2:40' },
  { label: 'Emotion arc has a dip',    done: false, hint: 'Add a tension point around 1:40' },
  { label: 'Subscribe ask present',    done: true,  hint: '' },
  { label: 'Keyword in first 30s',     done: false, hint: 'Add "content creation" earlier' },
]

const SUGGESTIONS = [
  {
    type: 'accent',
    icon: 'x' as const,
    label: 'CTA too late',
    body: 'Your CTA appears at the 80% mark. Move it to the 65–70% range for higher conversion — viewers who make it past 65% are 3× more likely to subscribe.',
  },
  {
    type: 'amber',
    icon: 'clock' as const,
    label: 'Hook could be tighter',
    body: 'The opening "Hey everyone, welcome back" costs you 4 seconds. Cut straight to the problem statement for higher 30-second retention.',
  },
  {
    type: 'mint',
    icon: 'check' as const,
    label: 'Strong structure',
    body: 'The three-system format is clear and punchy. Numbered lists perform well for retention — viewers anticipate progress.',
  },
]

export default function ReviewScript() {
  const [script, setScript] = useState(MOCK_SCRIPT)
  const score = 78
  const doneCount = CHECKLIST.filter(c => c.done).length

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Improve"
        code="T12"
        icon="sparkles"
        title={<>Review my <em>script</em></>}
        subtitle="AI reviews your script for pacing, hook, CTA, and engagement arc."
        actions={
          <button className="btn primary"><Icon name="sparkles" size={14} /> Re-analyse</button>
        }
      />

      <section className="grid-1-2">
        {/* Left: score + checklist */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card" style={{ textAlign: 'center', paddingTop: 28, paddingBottom: 28 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--accent)', color: 'white',
              display: 'grid', placeItems: 'center',
              margin: '0 auto 12px',
              fontSize: 28, fontWeight: 900,
            }}>
              {score}
            </div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Script Score</div>
            <div className="small muted" style={{ marginTop: 4 }}>{doneCount} / {CHECKLIST.length} checks passed</div>
            <div className="bar mint" style={{ marginTop: 14 }}>
              <i style={{ width: `${score}%` }} />
            </div>
          </div>

          <div className="card">
            <div className="h2" style={{ marginBottom: 12 }}>Quality checklist</div>
            <div className="col" style={{ gap: 8 }}>
              {CHECKLIST.map(c => (
                <div key={c.label} className="row"
                  style={{ gap: 10, padding: '8px 10px', borderRadius: 8, background: c.done ? 'transparent' : 'var(--bg-soft)' }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    background: c.done ? 'var(--mint)' : 'var(--bg-sunken)',
                    color: c.done ? 'white' : 'var(--ink-3)',
                    display: 'grid', placeItems: 'center',
                  }}>
                    <Icon name={c.done ? 'check' : 'x'} size={11} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{c.label}</div>
                    {c.hint && <div className="tiny muted">{c.hint}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: script + AI card */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="row between" style={{ marginBottom: 10 }}>
              <div className="h2">Your script</div>
              <span className="chip sm">{script.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <textarea
              className="textarea"
              style={{ minHeight: 300, fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.65 }}
              value={script}
              onChange={e => setScript(e.target.value)}
              placeholder="Paste your script here…"
            />
          </div>

          {SUGGESTIONS.map((s, i) => (
            <div key={i} className="card dark">
              <div className="row" style={{ gap: 8, marginBottom: 10 }}>
                <span className={`badge ${s.type}`}><Icon name={s.icon} size={11} /> {s.label}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, lineHeight: 1.55 }}>
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
