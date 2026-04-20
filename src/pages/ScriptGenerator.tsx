import { useState } from 'react'
import { Link } from 'react-router-dom'
import PipelineStepper from '../components/PipelineStepper'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import { useWorkflow } from '../context/WorkflowContext'
import { useGenerateScript } from '../api/useWorkflow'

const FLAVORS = [
  { id: 'story',       label: 'Story-driven',  desc: 'Narrative arc, personal angle' },
  { id: 'educational', label: 'Educational',   desc: 'Clear structure, actionable' },
  { id: 'listicle',    label: 'Listicle',      desc: 'Numbered format, punchy' },
  { id: 'documentary', label: 'Documentary',   desc: 'Research-heavy, authoritative' },
]

const CHECKLIST = [
  { label: 'Hook in first 8 seconds',  done: true },
  { label: 'Clear thesis by 0:30',     done: true },
  { label: 'Pattern interrupt ≤ 90s',  done: true },
  { label: 'CTA placed before 70%',    done: false, hint: 'Suggest at 2:40' },
  { label: 'Emotion arc has a dip',    done: false, hint: 'Cut aside at 1:40' },
]

export default function ScriptGenerator() {
  const { selectedIdea, generatedScript, setGeneratedScript, channelData, resetFromScript } = useWorkflow()
  const [flavor, setFlavor] = useState('story')
  const [editableScript, setEditableScript] = useState(generatedScript?.script?.full_script || '')

  const generateScript = useGenerateScript()

  const handleGenerate = () => {
    if (!selectedIdea) return
    resetFromScript()
    setEditableScript('')
    generateScript.mutate(
      {
        title: selectedIdea.title,
        hook: selectedIdea.hook || '',
        angle: selectedIdea.angle || selectedIdea.title,
        format: selectedIdea.format || 'educational',
        flavor,
        channel_context: channelData ? {
          channel_name: channelData.channel_name,
          average_duration_seconds: channelData.average_duration_seconds,
          recent_video_titles: channelData.recent_videos?.map(v => v.title) || [],
        } : undefined,
      },
      {
        onSuccess: (data) => {
          setGeneratedScript(data)
          setEditableScript(data.script?.full_script || '')
        },
      }
    )
  }

  const sections = generatedScript?.script?.sections || []
  const wordCount = editableScript ? editableScript.trim().split(/\s+/).filter(Boolean).length : 0
  const estMins = Math.round(wordCount / 140)

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Step 2 of 6 · Writing"
        code="T2"
        icon="pencil"
        title={<>Script <em>writer</em></>}
        subtitle="Draft, outline, and score your script. The AI reviewer grades pacing, hook strength, and CTA placement as you write."
        actions={
          <>
            <Link to="/idea" className="btn"><Icon name="arrowLeft" size={14} /> Back</Link>
            <Link
              to="/title"
              className={'btn primary' + (!generatedScript ? ' disabled' : '')}
              style={!generatedScript ? { opacity: 0.4, pointerEvents: 'none' } : {}}
            >
              Next: Title <Icon name="arrowRight" size={14} />
            </Link>
          </>
        }
      />

      <PipelineStepper active={2} />

      {!selectedIdea && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div className="muted" style={{ marginBottom: 14 }}>No idea selected — go back and pick one first.</div>
          <Link to="/idea" className="btn primary"><Icon name="arrowLeft" size={14} /> Back to Ideas</Link>
        </div>
      )}

      {selectedIdea && (
        <section className="grid-2-1">
          {/* Left: flavor + editor */}
          <div className="col" style={{ gap: 16 }}>
            <div className="card">
              {/* Idea context */}
              <div style={{ padding: '10px 12px', background: 'var(--accent-tint)', borderRadius: 10, marginBottom: 14 }}>
                <div className="tiny muted" style={{ marginBottom: 4 }}>Writing script for</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedIdea.title}</div>
                {selectedIdea.hook && <div className="small muted" style={{ marginTop: 4 }}>{selectedIdea.hook}</div>}
              </div>

              {/* Flavor picker */}
              <div className="field-label">Script style</div>
              <div className="grid-2" style={{ gap: 8, marginBottom: 16 }}>
                {FLAVORS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFlavor(f.id)}
                    style={{
                      padding: '10px 12px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                      border: `1px solid ${flavor === f.id ? 'var(--accent)' : 'var(--line)'}`,
                      background: flavor === f.id ? 'var(--accent-tint)' : 'var(--bg-elev)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{f.label}</div>
                    <div className="tiny muted" style={{ marginTop: 2 }}>{f.desc}</div>
                  </button>
                ))}
              </div>

              <button className="btn accent" style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleGenerate} disabled={generateScript.isPending}>
                {generateScript.isPending
                  ? <><Icon name="refresh" size={14} /> Generating script…</>
                  : generatedScript
                    ? <><Icon name="refresh" size={14} /> Regenerate</>
                    : <><Icon name="sparkles" size={14} /> Generate script</>}
              </button>

              {generateScript.error && (
                <div className="error-row" style={{ marginTop: 10 }}>
                  <Icon name="x" size={13} />
                  {(generateScript.error as { response?: { data?: { error?: { detail?: string } } }; message?: string })?.response?.data?.error?.detail || 'Failed to generate script.'}
                </div>
              )}
            </div>

            {generatedScript && (
              <div className="card">
                <div className="row between" style={{ marginBottom: 12 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="chip"><Icon name="clock" size={11} /> ~{estMins} min</span>
                    <span className="chip">{wordCount} words</span>
                    <span className="chip mint"><Icon name="check" size={11} /> Generated</span>
                  </div>
                  <button className="btn sm ghost"><Icon name="copy" size={12} /> Copy</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: sections.length ? '180px 1fr' : '1fr', gap: 20 }}>
                  {sections.length > 0 && (
                    <div>
                      <div className="eyebrow" style={{ marginBottom: 8 }}>Outline</div>
                      <div className="col" style={{ gap: 2 }}>
                        {sections.map((s, i) => (
                          <div key={i} className="row"
                            style={{ padding: '7px 10px', borderRadius: 8, background: i === 0 ? 'var(--ink)' : 'transparent', color: i === 0 ? 'var(--bg)' : 'inherit', gap: 8 }}>
                            <span className="tiny" style={{ color: i === 0 ? 'var(--accent)' : 'var(--ink-4)', width: 24 }}>
                              {i + 1}.
                            </span>
                            <span style={{ fontSize: 12.5, fontWeight: i === 0 ? 700 : 500 }}>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Script</div>
                    <textarea
                      className="textarea"
                      style={{ minHeight: 380, fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.65 }}
                      value={editableScript}
                      onChange={e => setEditableScript(e.target.value)}
                      placeholder="Your generated script will appear here…"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: review panel */}
          <div className="col" style={{ gap: 16 }}>
            <div className="card">
              <div className="card-title">
                <div>
                  <h3 className="h2">Script Review</h3>
                  <div className="small muted" style={{ marginTop: 4 }}>Live quality check</div>
                </div>
                <span className="chip accent" style={{ fontWeight: 700 }}>
                  {generatedScript ? '78 / 100' : '—'}
                </span>
              </div>
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

            {generatedScript && (
              <div className="card dark">
                <div className="row between" style={{ marginBottom: 12 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="pulse" />
                    <span style={{ fontSize: 12, opacity: 0.75 }}>AI suggestion · live</span>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.45 }}>
                  Hook lands well. Consider moving your CTA earlier — aim for the <b style={{ color: 'var(--accent)' }}>65–70%</b> mark for maximum retention.
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-title"><h3 className="h2">Pipeline handoff</h3></div>
              <div className="col" style={{ gap: 8 }}>
                <Link to="/title" className="row between" style={{ padding: 10, border: '1px solid var(--line)', borderRadius: 10 }}>
                  <span className="row" style={{ gap: 8 }}><Icon name="tag" size={14} /> Generate titles</span>
                  <Icon name="arrowRight" size={14} />
                </Link>
                <Link to="/voiceover" className="row between" style={{ padding: 10, border: '1px solid var(--line)', borderRadius: 10 }}>
                  <span className="row" style={{ gap: 8 }}><Icon name="mic" size={14} /> AI voiceover</span>
                  <Icon name="arrowRight" size={14} />
                </Link>
                <Link to="/review" className="row between" style={{ padding: 10, border: '1px solid var(--line)', borderRadius: 10 }}>
                  <span className="row" style={{ gap: 8 }}><Icon name="sparkles" size={14} /> Deep script review</span>
                  <Icon name="arrowRight" size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
