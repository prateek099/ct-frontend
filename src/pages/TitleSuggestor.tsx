// Step 3 — title generation. Reads selectedIdea + generatedScript; writes suggestedTitles via mutation.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import PipelineStepper from '../components/pipeline/PipelineStepper'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'
import { useWorkflow } from '../context/WorkflowContext'
import { useGenerateTitles } from '../api/useWorkflow'
import { getApiErrorMessage } from '../types/api'
import BackgroundGenerationBanner from '../components/pipeline/BackgroundGenerationBanner'
import NoIdeaSelectedCard from '../components/pipeline/NoIdeaSelectedCard'
import { useABTests, useCreateABTest } from '../api/useABTests'
import type { TitleItem } from '../types/workflow'

const ANGLE_COLORS: Record<string, string> = {
  curiosity: 'violet', fear: 'accent', aspiration: 'mint',
  'social proof': 'sky', value: 'amber', contrarian: 'accent',
  story: 'violet', authority: 'sky', listicle: 'mint',
}

export default function TitleSuggestor() {
  const {
    selectedIdea, generatedScript, channelData,
    suggestedTitles, selectedTitle, setSelectedTitle,
    resetFromTitles, titlesPending,
    startTitles, stopTitles,
    currentProjectId,
  } = useWorkflow()

  const [steer, setSteer] = useState('')
  const generateTitles = useGenerateTitles()
  const isGenerating = titlesPending || generateTitles.isPending

  const [abOpen, setAbOpen] = useState(false)
  const [abA, setAbA] = useState<string>('')
  const [abB, setAbB] = useState<string>('')
  const [abError, setAbError] = useState<string | null>(null)

  const createABTest = useCreateABTest()
  const { data: abTests = [] } = useABTests(
    currentProjectId != null ? { project_id: currentProjectId } : {},
  )
  const runningTest = abTests.find(t => t.status === 'running') || null

  const openAbModal = () => {
    setAbA(selectedTitle?.title || suggestedTitles[0]?.title || '')
    setAbB(suggestedTitles[1]?.title || '')
    setAbError(null)
    setAbOpen(true)
  }

  const submitAbTest = () => {
    if (!currentProjectId) {
      setAbError('Save your project first — generate an idea to start a draft.')
      return
    }
    if (!abA.trim() || !abB.trim()) {
      setAbError('Pick two titles.')
      return
    }
    if (abA.trim() === abB.trim()) {
      setAbError('Pick two different titles.')
      return
    }
    setAbError(null)
    createABTest.mutate(
      { project_id: currentProjectId, title_a: abA.trim(), title_b: abB.trim() },
      {
        onSuccess: () => setAbOpen(false),
        onError: (err: unknown) =>
          setAbError(getApiErrorMessage(err, 'Failed to create A/B test.')),
      },
    )
  }

  const handleGenerate = () => {
    if (!selectedIdea) return
    resetFromTitles()
    const controller = new AbortController()
    startTitles(controller)
    const scriptSummary = generatedScript?.script?.sections?.map(s => s.name).join(' → ') || null
    generateTitles.mutate({
      topic: selectedIdea.title,
      hook: selectedIdea.hook,
      angle: selectedIdea.angle,
      format: selectedIdea.format,
      script_summary: scriptSummary,
      channel_context: channelData ? {
        channel_name: channelData.channel_name,
        handle: channelData.handle,
        recent_video_titles: channelData.recent_videos?.map(v => v.title) || [],
      } : undefined,
      signal: controller.signal,
    })
  }

  const pickTitle = (t: TitleItem) => setSelectedTitle(selectedTitle?.title === t.title ? null : t)

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Step 3 of 6 · Packaging"
        code="T3"
        icon="tag"
        title={<>Title <em>generator</em></>}
        subtitle="Write a title that earns the click. CTR predictions use your channel's history + YouTube trends."
        actions={
          <>
            <Link to="/script" className="btn"><Icon name="arrowLeft" size={14} /> Back</Link>
            <Link
              to="/description"
              className={'btn primary' + (!selectedTitle ? ' disabled' : '')}
              style={!selectedTitle ? { opacity: 0.4, pointerEvents: 'none' } : {}}
            >
              Next: Description <Icon name="arrowRight" size={14} />
            </Link>
          </>
        }
      />

      <PipelineStepper active={3} />

      {!selectedIdea && <NoIdeaSelectedCard />}

      {selectedIdea && titlesPending && !generateTitles.isPending && (
        <BackgroundGenerationBanner
          message="Generating titles in the background — results will appear when ready."
          onStop={stopTitles}
        />
      )}

      {selectedIdea && (
        <section className="grid-2-1">
          <div className="col" style={{ gap: 16 }}>
            {/* Source material */}
            <div className="card">
              <div className="field-label">Source material</div>
              <div className="card tinted" style={{ padding: 14, fontSize: 13, lineHeight: 1.5 }}>
                <b>{selectedIdea.title}</b>
                {selectedIdea.hook && <span className="muted"> · "{selectedIdea.hook}"</span>}
                {generatedScript && (
                  <div className="tiny muted" style={{ marginTop: 4 }}>
                    Script: {generatedScript.script?.sections?.map(s => s.name).join(' → ')}
                  </div>
                )}
              </div>

              <div className="row wrap" style={{ marginTop: 14, gap: 8 }}>
                <span className="field-label" style={{ margin: 0 }}>Steer:</span>
                {['Curiosity', 'Value', 'Contrarian', 'Social proof', 'Story', 'Listicle'].map(s => (
                  <button key={s} className={'chip' + (steer === s ? ' filled' : '')} onClick={() => setSteer(steer === s ? '' : s)}>{s}</button>
                ))}
              </div>

              <div className="row between" style={{ marginTop: 16 }}>
                <button className="btn" onClick={handleGenerate} disabled={isGenerating}>
                  <Icon name="sparkles" size={14} /> Generate 10 more
                </button>
                <div className="row" style={{ gap: 8 }}>
                  {isGenerating && (
                    <button className="btn" onClick={stopTitles}>
                      <Icon name="x" size={14} /> Stop
                    </button>
                  )}
                  <button className="btn accent" onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating
                      ? <><Icon name="refresh" size={14} className="spin" /> Generating…</>
                      : suggestedTitles.length
                        ? <><Icon name="refresh" size={14} /> Regenerate</>
                        : <><Icon name="sparkles" size={14} /> Generate titles</>}
                  </button>
                </div>
              </div>

              {generateTitles.isError && (
                <div className="error-row" style={{ marginTop: 10 }}>
                  <Icon name="x" size={13} />
                  {getApiErrorMessage(generateTitles.error, 'Failed to generate titles.')}
                </div>
              )}
            </div>

            {/* Title results */}
            {suggestedTitles.length > 0 && (
              <div className="card">
                <div className="card-title">
                  <h3 className="h2">{suggestedTitles.length} titles · ranked by predicted CTR</h3>
                  <div className="segmented">
                    <button className="on">Best</button>
                    <button>Safe</button>
                    <button>Bold</button>
                  </div>
                </div>

                <div className="stack-8">
                  {suggestedTitles.map((t, i) => {
                    const picked = selectedTitle?.title === t.title
                    const angleKey = (t.ctr_angle || '').toLowerCase()
                    const angleColor = ANGLE_COLORS[angleKey] || ''
                    return (
                      <div
                        key={i}
                        className="card"
                        style={{
                          padding: 14,
                          borderColor: picked ? 'var(--accent)' : 'var(--line)',
                          background: picked ? 'var(--accent-tint)' : 'var(--bg-elev)',
                        }}
                      >
                        <div className="row between" style={{ alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="row" style={{ gap: 10 }}>
                              <span className="muted small" style={{ width: 18 }}>{i + 1}.</span>
                              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, lineHeight: 1.25 }}>
                                {picked ? <span className="underline-accent">{t.title}</span> : t.title}
                              </div>
                            </div>
                            <div className="row" style={{ gap: 8, marginTop: 10, marginLeft: 28, flexWrap: 'wrap' }}>
                              <span className="chip sm">{t.title.length} chars</span>
                              {t.ctr_angle && <span className={`chip sm ${angleColor}`}>{t.ctr_angle}</span>}
                              {t.style && <span className="chip sm violet">{t.style}</span>}
                            </div>
                          </div>
                          <div className="row" style={{ gap: 6 }}>
                            <button className="btn sm ghost" title="Copy" onClick={() => navigator.clipboard?.writeText(t.title)}>
                              <Icon name="copy" size={13} />
                            </button>
                            <button className={'btn sm ' + (picked ? 'accent' : '')} onClick={() => pickTitle(t)}>
                              {picked ? <>Chosen <Icon name="check" size={12} /></> : 'Pick'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {selectedTitle && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                    <Link to="/description" className="btn primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Continue with this title <Icon name="arrowRight" size={14} />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col" style={{ gap: 16 }}>
            {selectedTitle && (
              <div className="card">
                <div className="card-title"><h3 className="h2">Preview on YouTube</h3></div>
                <div className="card flat" style={{ padding: 12, border: '1px solid var(--line)' }}>
                  <div className="thumb coral" style={{ marginBottom: 10 }}>
                    {selectedTitle.title.split(' ').slice(0, 4).join(' ')}
                    <span className="overlay">4:12</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{selectedTitle.title}</div>
                  <div className="row small muted" style={{ marginTop: 6, gap: 4 }}>
                    <span>{channelData?.channel_name || 'Your Channel'}</span>
                    <span className="dot-sep" />
                    <span>2h ago</span>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-title">
                <h3 className="h2">Title DNA</h3>
              </div>
              <div className="col" style={{ gap: 10 }}>
                <div className="row between"><span>Best length</span><b>42–52 chars</b></div>
                <div className="row between"><span>Strongest hook</span><b>Curiosity</b></div>
                <div className="row between"><span>Top emoji</span><b>none (always)</b></div>
                <div className="row between"><span>Avg. CTR</span><b>6.4%</b></div>
              </div>
            </div>

            <div className="card tinted">
              <div className="card-title"><h3 className="h2">A/B test</h3><span className="chip sm accent">NEW</span></div>
              {runningTest ? (
                <>
                  <div className="small muted" style={{ marginBottom: 10 }}>
                    A live test is already running for this project.
                  </div>
                  <div className="card flat" style={{ padding: 10, fontSize: 12, lineHeight: 1.4 }}>
                    <div><b>A:</b> {runningTest.title_a}</div>
                    <div style={{ marginTop: 4 }}><b>B:</b> {runningTest.title_b}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="small muted" style={{ marginBottom: 10 }}>
                    Run two titles — pick a winner when you have data.
                  </div>
                  <button
                    className="btn"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={openAbModal}
                    disabled={suggestedTitles.length < 2 || !currentProjectId}
                    title={
                      !currentProjectId
                        ? 'Generate an idea first to start a project draft.'
                        : suggestedTitles.length < 2
                          ? 'Generate at least two titles first.'
                          : ''
                    }
                  >
                    <Icon name="split" size={14} /> Set up A/B test
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {abOpen && (
        <div
          onClick={() => !createABTest.isPending && setAbOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card"
            style={{ width: 480, maxWidth: '90vw' }}
          >
            <div className="card-title"><h3 className="h2">Set up A/B test</h3></div>
            <div className="col" style={{ gap: 12 }}>
              <label className="field-label">Title A</label>
              <select className="input" value={abA} onChange={e => setAbA(e.target.value)}>
                {suggestedTitles.map((t, i) => (
                  <option key={i} value={t.title}>{t.title}</option>
                ))}
              </select>
              <label className="field-label">Title B</label>
              <select className="input" value={abB} onChange={e => setAbB(e.target.value)}>
                {suggestedTitles.map((t, i) => (
                  <option key={i} value={t.title}>{t.title}</option>
                ))}
              </select>
              {abError && <div className="error-row"><Icon name="x" size={13} /> {abError}</div>}
              <div className="row between" style={{ marginTop: 6 }}>
                <button className="btn ghost" onClick={() => setAbOpen(false)} disabled={createABTest.isPending}>
                  Cancel
                </button>
                <button className="btn accent" onClick={submitAbTest} disabled={createABTest.isPending}>
                  {createABTest.isPending ? 'Creating…' : 'Start test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
