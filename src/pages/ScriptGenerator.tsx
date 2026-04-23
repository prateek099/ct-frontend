// Step 2 — script generation. Auto-generates 5 flavour variants; user picks one.
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
import client from '../api/client'
import type { GeneratedScript } from '../types/workflow'

const FLAVORS = ['educational', 'entertaining', 'storytelling', 'documentary', 'review'] as const
type Flavor = typeof FLAVORS[number]

const FLAVOR_LABELS: Record<Flavor, string> = {
  educational:   'Educational',
  entertaining:  'Entertaining',
  storytelling:  'Story-driven',
  documentary:   'Documentary',
  review:        'Review',
}

const TONES     = ['Casual', 'Professional', 'Funny', 'Dramatic', 'Urgent']
const LENGTHS   = [{ key: 'short', label: 'Short (~3 min)' }, { key: 'medium', label: 'Medium (~7 min)' }, { key: 'long', label: 'Long (~15 min)' }] as const
const POV_OPTIONS = [
  { key: 'first_person_story', label: 'First-person story' },
  { key: 'narrator_tutorial',  label: 'Narrator / tutorial' },
  { key: 'listicle',           label: 'Listicle' },
  { key: 'review',             label: 'Review' },
] as const

export default function ScriptGenerator() {
  const {
    selectedIdea, generatedScript, channelData,
    setGeneratedScriptAndSave,
    resetFromScript, scriptPending,
    startScript, stopScript,
  } = useWorkflow()

  // Variant picker state (5 parallel auto-generated flavours)
  const [variants, setVariants] = useState<(GeneratedScript | null)[]>(FLAVORS.map(() => null))
  const [variantsLoading, setVariantsLoading] = useState(false)
  const [variantsError, setVariantsError] = useState<string | null>(null)
  const [pickedFlavor, setPickedFlavor] = useState<Flavor | null>(null)
  const autoFiredRef = useRef(false)

  // Regen modal
  const [showRegenModal, setShowRegenModal] = useState(false)
  const [regenTone, setRegenTone]       = useState('Casual')
  const [regenAudience, setRegenAudience] = useState('')
  const [regenLength, setRegenLength]   = useState<'short' | 'medium' | 'long' | ''>('')
  const [regenPov, setRegenPov]         = useState<string>('')

  // Script editor (after picking a variant or from regen)
  const [editableScript, setEditableScript] = useState(generatedScript?.script?.full_script || '')

  const generateScript = useGenerateScript()
  const isGenerating = scriptPending || generateScript.isPending

  // Sync editor to generated script
  useEffect(() => {
    if (generatedScript?.script?.full_script) {
      setEditableScript(generatedScript.script.full_script)
    }
  }, [generatedScript])

  const buildScriptPayload = (flavor: Flavor) => ({
    title:  selectedIdea!.title,
    hook:   selectedIdea!.hook || '',
    angle:  selectedIdea!.angle || selectedIdea!.title,
    format: selectedIdea!.format || 'educational',
    flavor,
    channel_context: channelData ? {
      channel_name: channelData.channel_name,
      average_duration_seconds: channelData.average_duration_seconds,
      recent_video_titles: channelData.recent_videos?.map(v => v.title) || [],
    } : undefined,
  })

  // Auto-fire 5 parallel variants on mount if idea selected + no script yet
  useEffect(() => {
    if (!selectedIdea || generatedScript || autoFiredRef.current || variantsLoading) return
    autoFiredRef.current = true
    setVariantsLoading(true)
    setVariantsError(null)

    const calls = FLAVORS.map(flavor =>
      client.post<GeneratedScript>('/script-generator', buildScriptPayload(flavor))
        .then(r => r.data)
        .catch(() => null)
    )

    Promise.allSettled(calls).then(results => {
      const resolved = results.map(r => (r.status === 'fulfilled' ? r.value : null))
      setVariants(resolved)
      setVariantsLoading(false)
      const allFailed = resolved.every(v => v === null)
      if (allFailed) setVariantsError('All script variants failed to generate. Try regenerating.')
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdea?.title])

  const handlePickVariant = (v: GeneratedScript, flavor: Flavor) => {
    setPickedFlavor(flavor)
    setGeneratedScriptAndSave(v)
  }

  const handleRegen = () => {
    if (!selectedIdea) return
    setShowRegenModal(false)
    resetFromScript()
    setEditableScript('')
    const controller = new AbortController()
    startScript(controller)
    generateScript.mutate({
      title:  selectedIdea.title,
      hook:   selectedIdea.hook || '',
      angle:  selectedIdea.angle || selectedIdea.title,
      format: selectedIdea.format || 'educational',
      flavor: pickedFlavor || 'educational',
      tone:   regenTone !== 'Casual' ? regenTone : undefined,
      audience: regenAudience || undefined,
      length: (regenLength as 'short' | 'medium' | 'long') || undefined,
      pov_structure: (regenPov as 'first_person_story' | 'narrator_tutorial' | 'listicle' | 'review') || undefined,
      channel_context: channelData ? {
        channel_name: channelData.channel_name,
        average_duration_seconds: channelData.average_duration_seconds,
        recent_video_titles: channelData.recent_videos?.map(v => v.title) || [],
      } : undefined,
      signal: controller.signal,
    })
  }

  const sections = generatedScript?.script?.sections || []
  const wordCount = editableScript ? editableScript.trim().split(/\s+/).filter(Boolean).length : 0
  const estMins = Math.round(wordCount / 140)

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Step 2 of 5 · Writing"
        code="T2"
        icon="pencil"
        title={<>Script <em>writer</em></>}
        subtitle="Draft, outline, and score your script. Pick from 5 AI-generated style variants."
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

            {/* Variant picker — shown when no script picked yet */}
            {!generatedScript && (
              <div className="card">
                <div className="card-title">
                  <div>
                    <h3 className="h2">Pick a style</h3>
                    <div className="small muted" style={{ marginTop: 4 }}>5 variants generated in parallel — choose the one that fits</div>
                  </div>
                </div>

                {variantsError && (
                  <div className="error-row" style={{ marginBottom: 12 }}>
                    <Icon name="x" size={13} /> {variantsError}
                  </div>
                )}

                <div className="col" style={{ gap: 10 }}>
                  {FLAVORS.map((flavor, i) => {
                    const variant = variants[i]
                    const loading = variantsLoading && !variant
                    return (
                      <div
                        key={flavor}
                        className="card"
                        style={{ padding: 14, background: 'var(--bg-elev)', border: '1px solid var(--line)' }}
                      >
                        <div className="row between" style={{ alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                              <span className="chip sm accent">{FLAVOR_LABELS[flavor]}</span>
                              {variant && (
                                <span className="chip sm">{variant.script.word_count} words · ~{Math.round(variant.script.estimated_duration_seconds / 60)} min</span>
                              )}
                            </div>
                            {loading && (
                              <div className="small muted row" style={{ gap: 6 }}>
                                <Icon name="refresh" size={12} className="spin" /> Generating…
                              </div>
                            )}
                            {!loading && variant && (
                              <div className="small muted" style={{ lineHeight: 1.5, WebkitLineClamp: 3, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
                                {variant.script.sections[0]?.content?.slice(0, 160)}…
                              </div>
                            )}
                            {!loading && !variant && !variantsLoading && (
                              <div className="small muted">Generation failed for this style.</div>
                            )}
                          </div>
                          <button
                            className="btn sm"
                            disabled={!variant}
                            onClick={() => variant && handlePickVariant(variant, flavor)}
                          >
                            Use this <Icon name="arrowRight" size={12} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Script editor — shown after variant is picked */}
            {generatedScript && (
              <div className="card">
                <div className="row between" style={{ marginBottom: 12 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="chip"><Icon name="clock" size={11} /> ~{estMins} min</span>
                    <span className="chip">{wordCount} words</span>
                    {pickedFlavor && <span className="chip accent">{FLAVOR_LABELS[pickedFlavor] ?? pickedFlavor}</span>}
                    <span className="chip mint"><Icon name="check" size={11} /> Generated</span>
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn sm ghost"><Icon name="copy" size={12} /> Copy</button>
                    <button
                      className="btn sm"
                      onClick={() => setShowRegenModal(true)}
                      disabled={isGenerating}
                    >
                      <Icon name="refresh" size={12} /> Regenerate
                    </button>
                  </div>
                </div>

                {generateScript.isError && (
                  <div className="error-row" style={{ marginBottom: 10 }}>
                    <Icon name="x" size={13} />
                    {getApiErrorMessage(generateScript.error, 'Failed to generate script.')}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: sections.length ? '180px 1fr' : '1fr', gap: 20 }}>
                  {sections.length > 0 && (
                    <div>
                      <div className="eyebrow" style={{ marginBottom: 8 }}>Outline</div>
                      <div className="col" style={{ gap: 2 }}>
                        {sections.map((s, i) => (
                          <div key={i} className="row"
                            style={{ padding: '7px 10px', borderRadius: 8, background: i === 0 ? 'var(--ink)' : 'transparent', color: i === 0 ? 'var(--bg)' : 'inherit', gap: 8 }}>
                            <span className="tiny" style={{ color: i === 0 ? 'var(--accent)' : 'var(--ink-4)', width: 24 }}>{i + 1}.</span>
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

          <ReviewPanel hasScript={!!generatedScript} />
        </section>
      )}

      {/* Regen modal */}
      {showRegenModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={e => e.target === e.currentTarget && setShowRegenModal(false)}
        >
          <div className="card" style={{ width: 520, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="row between">
              <div className="h2">Regenerate script</div>
              <button className="btn sm ghost" onClick={() => setShowRegenModal(false)}><Icon name="x" size={14} /></button>
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
                  <button key={p.key} className={'chip' + (regenPov === p.key ? ' accent' : '')} onClick={() => setRegenPov(regenPov === p.key ? '' : p.key)}>{p.label}</button>
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
