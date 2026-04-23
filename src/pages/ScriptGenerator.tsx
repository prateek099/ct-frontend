// Step 2 — script generation. Auto-generates a single script using a flavor
// inferred from the idea's format. Regenerating opens a modal to steer
// flavor + tone/audience/length/POV.
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import PipelineStepper from '../components/pipeline/PipelineStepper'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'
import { useWorkflow } from '../context/WorkflowContext'
import { useGenerateScript } from '../api/useWorkflow'
import { getApiErrorMessage } from '../types/api'
import BackgroundGenerationBanner from '../components/pipeline/BackgroundGenerationBanner'
import NoIdeaSelectedCard from '../components/pipeline/NoIdeaSelectedCard'
import ContextBanner from '../components/pipeline/ContextBanner'
import ReviewPanel from './script/ReviewPanel'
import type { VideoIdea } from '../types/workflow'

const FLAVORS = ['educational', 'entertaining', 'storytelling', 'documentary', 'review'] as const
type Flavor = typeof FLAVORS[number] | 'auto'

const FLAVOR_LABELS: Record<Flavor, string> = {
  auto:          'Auto-detected',
  educational:   'Educational',
  entertaining:  'Entertaining',
  storytelling:  'Story-driven',
  documentary:   'Documentary',
  review:        'Review',
}

const TONES   = ['Casual', 'Professional', 'Funny', 'Dramatic', 'Urgent']
const LENGTHS = [
  { key: 'short',  label: 'Short (~3 min)' },
  { key: 'medium', label: 'Medium (~7 min)' },
  { key: 'long',   label: 'Long (~15 min)' },
] as const
const POV_OPTIONS = [
  { key: 'first_person_story', label: 'First-person story' },
  { key: 'narrator_tutorial',  label: 'Narrator / tutorial' },
  { key: 'listicle',           label: 'Listicle' },
  { key: 'review',             label: 'Review' },
] as const

// First-pass flavor = 'auto': the LLM infers the mood from the idea's
// title/hook/angle/reasoning instead of us guessing from the format string.
// Users can still override via the regen modal.
function defaultFlavorForIdea(_idea: VideoIdea): Flavor {
  return 'auto'
}

interface Steering {
  tone?: string
  audience?: string
  length?: 'short' | 'medium' | 'long'
  pov?: 'first_person_story' | 'narrator_tutorial' | 'listicle' | 'review'
}

export default function ScriptGenerator() {
  const {
    selectedIdea, generatedScript, channelData,
    setGeneratedScript,
    resetFromScript, scriptPending,
    startScript, stopScript,
  } = useWorkflow()

  const generateScript = useGenerateScript()
  const isGenerating = scriptPending || generateScript.isPending

  const [currentFlavor, setCurrentFlavor] = useState<Flavor>(
    (generatedScript?.flavor as Flavor) || 'educational',
  )
  const initialSections = generatedScript?.script?.sections ?? []
  const [sectionContents, setSectionContents] = useState<string[]>(
    initialSections.length
      ? initialSections.map(s => s.content || '')
      : generatedScript?.script?.full_script
        ? [generatedScript.script.full_script]
        : [],
  )
  const [activeIdx, setActiveIdx] = useState(0)
  const sectionRefs = useRef<Array<HTMLDivElement | null>>([])

  // Regen modal
  const [showRegenModal, setShowRegenModal] = useState(false)
  const [regenFlavor, setRegenFlavor]       = useState<Flavor>(currentFlavor)
  const [regenTone, setRegenTone]           = useState('Casual')
  const [regenAudience, setRegenAudience]   = useState('')
  const [regenLength, setRegenLength]       = useState<'short' | 'medium' | 'long' | ''>('')
  const [regenPov, setRegenPov]             = useState<string>('')

  // Sync editor when a new script arrives (mutation success, project resume, etc.)
  useEffect(() => {
    const secs = generatedScript?.script?.sections ?? []
    if (secs.length) {
      setSectionContents(secs.map(s => s.content || ''))
    } else if (generatedScript?.script?.full_script) {
      setSectionContents([generatedScript.script.full_script])
    }
    if (generatedScript?.flavor) {
      setCurrentFlavor(generatedScript.flavor as Flavor)
    }
  }, [generatedScript])

  // Auto-fire once per idea on arrival. Ref-based guard survives StrictMode's
  // double-invocation AND covers the "pick a new idea" case.
  const firedForRef = useRef<string | null>(null)
  useEffect(() => {
    if (!selectedIdea) return
    if (firedForRef.current === selectedIdea.title) return
    firedForRef.current = selectedIdea.title

    // Resume case — script already loaded for this idea. Nothing to do.
    if (generatedScript?.title === selectedIdea.title) return

    // Switching to a different idea → clear the prior idea's script.
    if (generatedScript) {
      setGeneratedScript(null)
      setSectionContents([])
      setActiveIdx(0)
    }

    // Cancel any in-flight generation for a previous idea.
    if (scriptPending) stopScript()

    const flavor = defaultFlavorForIdea(selectedIdea)
    setCurrentFlavor(flavor)
    fireScriptGeneration(flavor)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdea?.title])

  const fireScriptGeneration = (flavor: Flavor, steering?: Steering) => {
    if (!selectedIdea) return
    const controller = new AbortController()
    startScript(controller)
    generateScript.mutate({
      title:     selectedIdea.title,
      hook:      selectedIdea.hook || '',
      angle:     selectedIdea.angle || selectedIdea.title,
      format:    selectedIdea.format || 'educational',
      reasoning: selectedIdea.reasoning || undefined,
      flavor,
      tone:     steering?.tone && steering.tone !== 'Casual' ? steering.tone : undefined,
      audience: steering?.audience || undefined,
      length:   steering?.length || undefined,
      pov_structure: steering?.pov || undefined,
      channel_context: channelData ? {
        channel_name: channelData.channel_name,
        average_duration_seconds: channelData.average_duration_seconds,
        recent_video_titles: channelData.recent_videos?.map(v => v.title) || [],
      } : undefined,
      signal: controller.signal,
    })
  }

  const openRegenModal = () => {
    setRegenFlavor(currentFlavor === 'auto' ? 'educational' : currentFlavor)
    setRegenTone('Casual')
    setRegenAudience('')
    setRegenLength('')
    setRegenPov('')
    setShowRegenModal(true)
  }

  const handleRegen = () => {
    if (!selectedIdea) return
    setShowRegenModal(false)
    resetFromScript()
    setGeneratedScript(null)
    setSectionContents([])
    setActiveIdx(0)
    setCurrentFlavor(regenFlavor)
    fireScriptGeneration(regenFlavor, {
      tone: regenTone,
      audience: regenAudience,
      length: (regenLength as 'short' | 'medium' | 'long') || undefined,
      pov: (regenPov as Steering['pov']) || undefined,
    })
  }

  const sections  = generatedScript?.script?.sections || []
  const fullScript = sectionContents.join('\n\n')
  const wordCount = fullScript ? fullScript.trim().split(/\s+/).filter(Boolean).length : 0
  const estMins   = Math.round(wordCount / 140)

  const scrollToSection = (i: number) => {
    setActiveIdx(i)
    sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const updateSection = (i: number, val: string) => {
    setSectionContents(prev => {
      const next = [...prev]
      next[i] = val
      return next
    })
  }

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Step 2 of 5 · Writing"
        code="T2"
        icon="pencil"
        title={<>Script <em>writer</em></>}
        subtitle="One script at a time, tuned to your idea. Regenerate to steer flavor, tone, length, or structure."
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

      {!selectedIdea && <NoIdeaSelectedCard message="No idea selected — go back and pick one first." />}

      {selectedIdea && scriptPending && !generateScript.isPending && (
        <BackgroundGenerationBanner
          message="Generating your script in the background — results will appear when ready."
          onStop={stopScript}
        />
      )}

      {selectedIdea && (
        <section className="grid-2-1">
          <div className="col" style={{ gap: 16 }}>

            <ContextBanner
              label="Writing script for"
              title={selectedIdea.title}
              subtitle={selectedIdea.hook}
            />

            {selectedIdea.reasoning && (
              <div className="card" style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                  <Icon name="lightbulb" size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Why this works
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--ink-2)' }}>
                  {selectedIdea.reasoning}
                </p>
              </div>
            )}

            {/* Loading state — first generation, no script yet */}
            {!generatedScript && isGenerating && (
              <div className="card">
                <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                  <Icon name="refresh" size={16} className="spin" />
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      Writing a <span style={{ textTransform: 'lowercase' }}>{FLAVOR_LABELS[currentFlavor]}</span> script…
                    </div>
                    <div className="small muted" style={{ marginTop: 2 }}>
                      Tailoring it to "{selectedIdea.title}". This usually takes 15–30 seconds.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error — first generation failed */}
            {!generatedScript && !isGenerating && generateScript.isError && (
              <div className="card">
                <div className="error-row" style={{ marginBottom: 12 }}>
                  <Icon name="x" size={13} />
                  {getApiErrorMessage(generateScript.error, 'Failed to generate script.')}
                </div>
                <button
                  className="btn accent"
                  onClick={() => fireScriptGeneration(currentFlavor)}
                >
                  <Icon name="refresh" size={13} /> Try again
                </button>
              </div>
            )}

            {/* Editor — shown once a script exists */}
            {generatedScript && (
              <div className="card">
                <div className="row between" style={{ marginBottom: 12 }}>
                  <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                    <span className="chip"><Icon name="clock" size={11} /> ~{estMins} min</span>
                    <span className="chip">{wordCount} words</span>
                    <span className="chip accent">{FLAVOR_LABELS[currentFlavor] ?? currentFlavor}</span>
                    <span className="chip mint"><Icon name="check" size={11} /> Generated</span>
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn sm ghost"><Icon name="copy" size={12} /> Copy</button>
                    <button
                      className="btn sm"
                      onClick={openRegenModal}
                      disabled={isGenerating}
                    >
                      <Icon name="refresh" size={12} className={isGenerating ? 'spin' : ''} /> Regenerate
                    </button>
                  </div>
                </div>

                {generateScript.isError && (
                  <div className="error-row" style={{ marginBottom: 10 }}>
                    <Icon name="x" size={13} />
                    {getApiErrorMessage(generateScript.error, 'Failed to regenerate script.')}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: sections.length ? '180px 1fr' : '1fr', gap: 20 }}>
                  {sections.length > 0 && (
                    <div style={{ position: 'sticky', top: 16, alignSelf: 'start' }}>
                      <div className="eyebrow" style={{ marginBottom: 8 }}>Outline</div>
                      <div className="col" style={{ gap: 2 }}>
                        {sections.map((s, i) => {
                          const isActive = i === activeIdx
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => scrollToSection(i)}
                              className="row"
                              style={{
                                padding: '7px 10px',
                                borderRadius: 8,
                                background: isActive ? 'var(--ink)' : 'transparent',
                                color: isActive ? 'var(--bg)' : 'inherit',
                                gap: 8,
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%',
                                transition: 'background 0.15s ease, color 0.15s ease',
                              }}
                            >
                              <span className="tiny" style={{ color: isActive ? 'var(--accent)' : 'var(--ink-4)', width: 24 }}>{i + 1}.</span>
                              <span style={{ fontSize: 12.5, fontWeight: isActive ? 700 : 500 }}>{s.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="eyebrow" style={{ marginBottom: 8 }}>Script</div>
                    {sections.length > 0 ? (
                      <div className="col" style={{ gap: 18 }}>
                        {sections.map((s, i) => (
                          <div
                            key={i}
                            ref={el => { sectionRefs.current[i] = el }}
                            style={{ scrollMarginTop: 16 }}
                          >
                            <div className="row" style={{ alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                              <span className="tiny" style={{ color: 'var(--ink-4)', fontWeight: 700, letterSpacing: '0.05em' }}>
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{s.name}</h4>
                            </div>
                            <textarea
                              className="textarea"
                              style={{ minHeight: 140, fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.65 }}
                              value={sectionContents[i] ?? ''}
                              onChange={e => updateSection(i, e.target.value)}
                              onFocus={() => setActiveIdx(i)}
                              placeholder={`Write the ${s.name.toLowerCase()} here…`}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        className="textarea"
                        style={{ minHeight: 380, fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 1.65 }}
                        value={sectionContents[0] ?? ''}
                        onChange={e => setSectionContents([e.target.value])}
                        placeholder="Your generated script will appear here…"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <ReviewPanel hasScript={!!generatedScript} />
        </section>
      )}

      {/* Regen modal — flavor first, then steering knobs */}
      {showRegenModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={e => e.target === e.currentTarget && setShowRegenModal(false)}
        >
          <div className="card" style={{ width: 560, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="row between">
              <div className="h2">Regenerate script</div>
              <button className="btn sm ghost" onClick={() => setShowRegenModal(false)}><Icon name="x" size={14} /></button>
            </div>

            <div>
              <div className="field-label" style={{ marginBottom: 8 }}>Flavor</div>
              <div className="row wrap" style={{ gap: 6 }}>
                {FLAVORS.map(f => (
                  <button
                    key={f}
                    className={'chip' + (regenFlavor === f ? ' accent' : '')}
                    onClick={() => setRegenFlavor(f)}
                  >
                    {FLAVOR_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="field-label" style={{ marginBottom: 8 }}>Tone</div>
              <div className="row wrap" style={{ gap: 6 }}>
                {TONES.map(t => (
                  <button key={t} className={'chip' + (regenTone === t ? ' accent' : '')} onClick={() => setRegenTone(t)}>{t}</button>
                ))}
              </div>
            </div>

            <div>
              <div className="field-label" style={{ marginBottom: 6 }}>Target audience</div>
              <input
                className="input"
                value={regenAudience}
                onChange={e => setRegenAudience(e.target.value)}
                placeholder="e.g. beginner Python developers, stay-at-home parents…"
              />
            </div>

            <div>
              <div className="field-label" style={{ marginBottom: 8 }}>Length</div>
              <div className="row" style={{ gap: 6 }}>
                {LENGTHS.map(l => (
                  <button key={l.key} className={'chip' + (regenLength === l.key ? ' accent' : '')} onClick={() => setRegenLength(l.key)}>{l.label}</button>
                ))}
                {regenLength && <button className="chip" onClick={() => setRegenLength('')}>Clear</button>}
              </div>
            </div>

            <div>
              <div className="field-label" style={{ marginBottom: 8 }}>Structure / POV</div>
              <div className="row wrap" style={{ gap: 6 }}>
                {POV_OPTIONS.map(p => (
                  <button
                    key={p.key}
                    className={'chip' + (regenPov === p.key ? ' accent' : '')}
                    onClick={() => setRegenPov(regenPov === p.key ? '' : p.key)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="row" style={{ gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <button className="btn" onClick={() => setShowRegenModal(false)}>Cancel</button>
              <button className="btn accent" onClick={handleRegen}>
                <Icon name="sparkles" size={14} /> Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
