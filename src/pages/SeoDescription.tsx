// Step 4 — SEO description + tags + hashtags. Reads selectedIdea + script + title; writes seoDescription.
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PipelineStepper from '../components/pipeline/PipelineStepper'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'
import { useWorkflow } from '../context/WorkflowContext'
import { useGenerateSeoDescription } from '../api/useWorkflow'
import { getApiErrorMessage } from '../types/api'
import BackgroundGenerationBanner from '../components/pipeline/BackgroundGenerationBanner'
import NoIdeaSelectedCard from '../components/pipeline/NoIdeaSelectedCard'
import ContextBanner from '../components/pipeline/ContextBanner'

const SEO_METRICS = [
  { label: 'Keyword density',    v: 82 },
  { label: 'First-15 word punch', v: 91 },
  { label: 'Timestamp coverage', v: 100 },
  { label: 'CTA placement',      v: 65 },
]

export default function SeoDescription() {
  const {
    selectedIdea, generatedScript, channelData, selectedTitle,
    seoDescription, resetFromTitles, seoPending,
    startSeo, stopSeo,
  } = useWorkflow()

  const [editableDesc, setEditableDesc] = useState(seoDescription?.description || '')
  const [editableTags, setEditableTags] = useState(seoDescription?.tags || '')
  const generateSeo = useGenerateSeoDescription()
  const isGenerating = seoPending || generateSeo.isPending

  // Sync editable fields when context seoDescription arrives (e.g. after tab switch)
  useEffect(() => {
    if (seoDescription) {
      setEditableDesc(seoDescription.description || '')
      setEditableTags(seoDescription.tags || '')
    }
  }, [seoDescription])

  const handleGenerate = () => {
    resetFromTitles()
    setEditableDesc('')
    setEditableTags('')
    const controller = new AbortController()
    startSeo(controller)
    const scriptOutline = generatedScript?.script?.sections?.map(s => s.name).join(' → ') || null
    const activeTitle = selectedTitle?.title || selectedIdea?.title || ''
    generateSeo.mutate({
      title: activeTitle,
      topic: selectedIdea?.title || activeTitle,
      script_outline: scriptOutline,
      niche: channelData?.description?.slice(0, 150) || null,
      channel_context: channelData ? {
        channel_name: channelData.channel_name,
        handle: channelData.handle,
        recent_video_titles: channelData.recent_videos?.map(v => v.title) || [],
      } : undefined,
      signal: controller.signal,
    })
  }

  const descWordCount = editableDesc ? editableDesc.trim().split(/\s+/).filter(Boolean).length : 0
  const tagsCharCount = editableTags.length

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Step 4 of 6 · Packaging"
        code="T4"
        icon="align"
        title={<>Description <em>&amp;</em> hashtags</>}
        subtitle="A description YouTube's algorithm can read, with timestamps pulled from your script automatically."
        actions={
          <>
            <Link to="/title" className="btn"><Icon name="arrowLeft" size={14} /> Back</Link>
            <button className="btn" onClick={() => navigator.clipboard?.writeText(editableDesc)} disabled={!editableDesc}>
              <Icon name="copy" size={14} /> Copy
            </button>
            <Link to="/thumbnail" className="btn primary">
              Next: Thumbnail <Icon name="arrowRight" size={14} />
            </Link>
          </>
        }
      />

      <PipelineStepper active={4} />

      {!selectedIdea && <NoIdeaSelectedCard />}

      {selectedIdea && seoPending && !generateSeo.isPending && (
        <BackgroundGenerationBanner
          message="Generating description in the background — results will appear when ready."
          onStop={stopSeo}
        />
      )}

      {selectedIdea && (
        <section className="grid-2-1">
          <div className="col" style={{ gap: 16 }}>
            <ContextBanner
              label="Writing description for"
              title={selectedTitle?.title || selectedIdea.title}
            />

            {/* Generate button */}
            <div className="row" style={{ gap: 8 }}>
              {isGenerating && (
                <button className="btn" onClick={stopSeo} style={{ flexShrink: 0 }}>
                  <Icon name="x" size={14} /> Stop
                </button>
              )}
              <button className="btn accent" style={{ flex: 1, justifyContent: 'center' }} onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating
                  ? <><Icon name="refresh" size={14} className="spin" /> Generating…</>
                  : seoDescription
                    ? <><Icon name="refresh" size={14} /> Regenerate</>
                    : <><Icon name="sparkles" size={14} /> Generate description</>}
              </button>
            </div>

            {generateSeo.isError && (
              <div className="error-row">
                <Icon name="x" size={13} />
                {getApiErrorMessage(generateSeo.error, 'Failed to generate.')}
              </div>
            )}

            {/* Description editor */}
            {(seoDescription || editableDesc) && (
              <div className="card">
                <div className="row between" style={{ marginBottom: 10 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="chip sm"><Icon name="check" size={11} /> SEO-tuned</span>
                    <span className="chip sm">{descWordCount} words</span>
                    {seoDescription?.primary_keyword && (
                      <span className="chip sm violet">{seoDescription.primary_keyword}</span>
                    )}
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    <button className="btn sm" onClick={handleGenerate} disabled={isGenerating}>
                      <Icon name="refresh" size={12} className={isGenerating ? 'spin' : ''} /> Regenerate
                    </button>
                    <button className="btn sm" onClick={() => navigator.clipboard?.writeText(editableDesc)}>
                      <Icon name="copy" size={12} />
                    </button>
                  </div>
                </div>
                <div className="bar accent" style={{ marginBottom: 10 }}>
                  <i style={{ width: `${Math.min((descWordCount / 2000) * 100, 100)}%` }} />
                </div>
                <textarea
                  className="textarea"
                  style={{ minHeight: 340, fontSize: 14, lineHeight: 1.6 }}
                  value={editableDesc}
                  onChange={e => setEditableDesc(e.target.value)}
                  placeholder="Description will appear here…"
                />
                <p className="tiny muted" style={{ marginTop: 6 }}>{descWordCount} / 2000 words · Edit directly before copying.</p>
              </div>
            )}

            {/* Hashtags */}
            {seoDescription?.hashtags?.length ? (
              <div className="card">
                <div className="card-title">
                  <h3 className="h2">Hashtags ({seoDescription.hashtags.length})</h3>
                  <button className="btn sm" onClick={() => navigator.clipboard?.writeText((seoDescription.hashtags || []).join(' '))}>
                    <Icon name="copy" size={12} /> Copy all
                  </button>
                </div>
                <div className="row wrap" style={{ gap: 6 }}>
                  {seoDescription.hashtags.map((h, i) => (
                    <span key={h} className={'chip ' + (i < 3 ? 'accent' : '')}>{h}</span>
                  ))}
                </div>
                <div className="small muted" style={{ marginTop: 10 }}>
                  First 3 hashtags appear above your title on YouTube.
                </div>
              </div>
            ) : null}

            {/* Tags */}
            {(seoDescription || editableTags) && (
              <div className="card">
                <div className="card-title">
                  <h3 className="h2">YouTube Tags</h3>
                  <button className="btn sm" onClick={() => navigator.clipboard?.writeText(editableTags)}>
                    <Icon name="copy" size={12} /> Copy
                  </button>
                </div>
                <div className="bar amber" style={{ marginBottom: 10 }}>
                  <i style={{ width: `${Math.min((tagsCharCount / 500) * 100, 100)}%` }} />
                </div>
                <textarea
                  className="textarea"
                  rows={3}
                  style={{ minHeight: 80 }}
                  value={editableTags}
                  onChange={e => setEditableTags(e.target.value)}
                  placeholder="tag1, tag2, tag3…"
                />
                <p className="tiny muted" style={{ marginTop: 6 }}>{tagsCharCount} / 500 chars · Paste into YouTube Studio → Tags.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col" style={{ gap: 16 }}>
            {seoDescription && (
              <div className="card">
                <div className="card-title"><h3 className="h2">SEO signal</h3></div>
                <div className="col" style={{ gap: 10 }}>
                  {SEO_METRICS.map(m => (
                    <div key={m.label}>
                      <div className="row between small">
                        <span>{m.label}</span>
                        <b>{m.v}%</b>
                      </div>
                      <div className={'bar ' + (m.v >= 80 ? 'mint' : m.v >= 60 ? 'amber' : 'accent')} style={{ marginTop: 5 }}>
                        <i style={{ width: `${m.v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {seoDescription?.secondary_keywords?.length ? (
              <div className="card">
                <div className="card-title">
                  <h3 className="h2">Keyword targets</h3>
                </div>
                <div className="row wrap" style={{ gap: 6 }}>
                  {seoDescription.secondary_keywords.map(k => (
                    <span key={k} className="chip sm">{k}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {seoDescription && (
              <>
                <div className="card tinted">
                  <div className="card-title"><h3 className="h2">Pre-flight reminder</h3></div>
                  <div className="small" style={{ lineHeight: 1.55 }}>
                    YouTube indexes the first <b>150 characters</b>. Make sure your primary keyword appears in the opening line.
                  </div>
                </div>

                <div className="card" style={{ border: '2px solid var(--mint)', background: 'var(--mint-soft)', textAlign: 'center', padding: 24 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--mint)', display: 'grid', placeItems: 'center', margin: '0 auto 12px', color: 'white' }}>
                    <Icon name="check" size={20} />
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--mint)', marginBottom: 4 }}>Pipeline complete!</div>
                  <div className="small muted">You have everything to publish. Next: Thumbnail.</div>
                  <Link to="/thumbnail" className="btn" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
                    <Icon name="image" size={14} /> Thumbnail Lab
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
