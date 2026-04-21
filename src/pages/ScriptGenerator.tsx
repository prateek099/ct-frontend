// Step 2 — script generation. Reads selectedIdea + channelData, writes generatedScript via mutation.
import { useState, useEffect } from 'react'
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
import FlavorPicker from './script/FlavorPicker'
import ReviewPanel from './script/ReviewPanel'

export default function ScriptGenerator() {
  const {
    selectedIdea, generatedScript, channelData,
    resetFromScript, scriptPending,
    startScript, stopScript,
  } = useWorkflow()

  const [flavor, setFlavor] = useState('story')
  const [editableScript, setEditableScript] = useState(generatedScript?.script?.full_script || '')

  const generateScript = useGenerateScript()
  const isGenerating = scriptPending || generateScript.isPending

  useEffect(() => {
    if (generatedScript?.script?.full_script) {
      setEditableScript(generatedScript.script.full_script)
    }
  }, [generatedScript])

  const handleGenerate = () => {
    if (!selectedIdea) return
    resetFromScript()
    setEditableScript('')
    const controller = new AbortController()
    startScript(controller)
    generateScript.mutate({
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
      signal: controller.signal,
    })
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
            <div className="card">
              <div style={{ marginBottom: 14 }}>
                <ContextBanner
                  label="Writing script for"
                  title={selectedIdea.title}
                  subtitle={selectedIdea.hook}
                />
              </div>

              <FlavorPicker value={flavor} onChange={setFlavor} />

              <div className="row" style={{ gap: 8 }}>
                {isGenerating && (
                  <button className="btn" style={{ flex: '0 0 auto' }} onClick={stopScript}>
                    <Icon name="x" size={14} /> Stop
                  </button>
                )}
                <button
                  className="btn accent"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating
                    ? <><Icon name="refresh" size={14} className="spin" /> Generating script…</>
                    : generatedScript
                      ? <><Icon name="refresh" size={14} /> Regenerate</>
                      : <><Icon name="sparkles" size={14} /> Generate script</>}
                </button>
              </div>

              {generateScript.isError && (
                <div className="error-row" style={{ marginTop: 10 }}>
                  <Icon name="x" size={13} />
                  {getApiErrorMessage(generateScript.error, 'Failed to generate script.')}
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

          <ReviewPanel hasScript={!!generatedScript} />
        </section>
      )}
    </div>
  )
}
