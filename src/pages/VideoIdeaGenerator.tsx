// Step 1 — video idea generation. Writes channelData + ideas + selectedIdea into the workflow.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PipelineStepper from '../components/pipeline/PipelineStepper'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'
import { useWorkflow } from '../context/WorkflowContext'
import { useFetchChannel, useGenerateIdeas } from '../api/useWorkflow'
import { useSaveIdea } from '../api/useSavedIdeas'
import {
  useChannels,
  useDeleteChannel,
} from '../api/useChannels'
import type { SavedChannel } from '../types/channel'
import type { ChannelData, VideoIdea } from '../types/workflow'
import { getApiErrorMessage } from '../types/api'
import BackgroundGenerationBanner from '../components/pipeline/BackgroundGenerationBanner'
import IdeaSidebar from './idea/IdeaSidebar'

const TONES = ['Casual', 'Professional', 'Funny', 'Dramatic', 'Urgent']
const DEFAULT_COUNT = 5

function detectInputType(val: string): 'channel' | 'niche' {
  const v = val.trim()
  return v.startsWith('http') || v.startsWith('@') ? 'channel' : 'niche'
}

export default function VideoIdeaGenerator() {
  const {
    channelData, setChannelData,
    ideas, selectedIdea, setSelectedIdea,
    resetFromIdeas, ideasPending,
    startIdeas, stopIdeas,
  } = useWorkflow()

  const navigate = useNavigate()

  // Single unified input — URL / @handle / niche text
  const [input, setInput] = useState('')
  const [count, setCount] = useState(DEFAULT_COUNT)

  // Regen modal state
  const [showRegenModal, setShowRegenModal] = useState(false)
  const [regenDesc, setRegenDesc] = useState('')
  const [regenTone, setRegenTone] = useState('Casual')

  // Per-idea reasoning expansion
  const [expandedReasoning, setExpandedReasoning] = useState<number | null>(null)

  const fetchChannel = useFetchChannel()
  const generateIdeas = useGenerateIdeas()
  const saveIdea = useSaveIdea()
  const { data: savedChannels = [] } = useChannels()
  const deleteChannel = useDeleteChannel()
  const [savedFlash, setSavedFlash] = useState(false)

  const savedChannelToWorkflow = (c: SavedChannel): ChannelData => ({
    channel_id: c.youtube_channel_id,
    channel_name: c.channel_name,
    handle: c.handle ?? '',
    description: c.description ?? '',
    subscriber_count: c.subscriber_count ?? 0,
    total_views: c.total_views ?? 0,
    video_count: c.video_count ?? 0,
    thumbnail_url: c.thumbnail_url ?? '',
    recent_videos: c.recent_videos ?? [],
    average_duration_seconds: c.average_duration_seconds ?? 0,
  })

  const handleSelectSaved = (id: string) => {
    if (!id) return
    const match = savedChannels.find(c => String(c.id) === id)
    if (match) setChannelData(savedChannelToWorkflow(match))
  }

  const handleSaveIdea = () => {
    if (!selectedIdea) return
    saveIdea.mutate(
      {
        title: selectedIdea.title,
        hook: selectedIdea.hook || null,
        angle: selectedIdea.angle || null,
        format: selectedIdea.format || null,
        reasoning: selectedIdea.reasoning || null,
        source_prompt: input || null,
      },
      {
        onSuccess: () => {
          setSavedFlash(true)
          window.setTimeout(() => setSavedFlash(false), 2000)
        },
      },
    )
  }

  const fireGenerate = (opts: { prompt: string; inputType: 'channel' | 'niche'; extraContext?: string }) => {
    resetFromIdeas()
    const controller = new AbortController()
    startIdeas(controller)
    const effectivePrompt = opts.extraContext
      ? `${opts.prompt}. Additional context: ${opts.extraContext}`
      : opts.prompt
    generateIdeas.mutate({
      prompt: effectivePrompt,
      input_type: opts.inputType,
      count,
      channel_context: channelData ? {
        channel_name: channelData.channel_name,
        handle: channelData.handle,
        description: channelData.description,
        subscriber_count: channelData.subscriber_count,
        average_duration_seconds: channelData.average_duration_seconds,
        recent_video_titles: channelData.recent_videos?.map(v => v.title) || [],
      } : undefined,
      signal: controller.signal,
    })
  }

  const handleGenerate = () => {
    const inputType = detectInputType(input)
    if (inputType === 'channel' && input.trim()) {
      // Fetch channel data first, then generate
      fetchChannel.mutate({ url: input.trim() }, {
        onSuccess: (data) => {
          setChannelData(data)
          fireGenerate({ prompt: data.channel_name || input.trim(), inputType: 'channel' })
        },
        onError: () => {
          // Fall back to niche if channel fetch fails
          fireGenerate({ prompt: input.trim(), inputType: 'niche' })
        },
      })
    } else {
      fireGenerate({ prompt: input.trim() || 'Engaging YouTube videos', inputType: inputType || 'niche' })
    }
  }

  const handleRegen = () => {
    setShowRegenModal(false)
    const inputType = detectInputType(input)
    fireGenerate({
      prompt: input.trim() || channelData?.channel_name || 'Engaging YouTube videos',
      inputType,
      extraContext: regenDesc || regenTone !== 'Casual' ? `Tone: ${regenTone}${regenDesc ? `. ${regenDesc}` : ''}` : undefined,
    })
  }

  const pickIdea = (idea: VideoIdea) => {
    setSelectedIdea(idea)
    navigate('/script')
  }

  const isGenerating = ideasPending || generateIdeas.isPending

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Step 1 of 5 · Ideation"
        code="T1"
        icon="lightbulb"
        title={<>Video <em>Ideas</em></>}
        subtitle="Brainstorm hook-scored, trend-aware ideas — ranked by what's most likely to pop in your niche right now."
        actions={
          <>
            <button
              className="btn"
              disabled={!selectedIdea || saveIdea.isPending}
              onClick={handleSaveIdea}
            >
              <Icon name={savedFlash ? 'check' : 'save'} size={14} />
              {savedFlash ? 'Saved' : saveIdea.isPending ? 'Saving…' : 'Save to idea bank'}
            </button>
            <Link
              to="/script"
              className={'btn primary' + (!selectedIdea ? ' disabled' : '')}
              style={!selectedIdea ? { opacity: 0.4, pointerEvents: 'none' } : {}}
            >
              <Icon name="arrowRight" size={14} /> Next: Script
            </Link>
          </>
        }
      />

      <PipelineStepper active={1} />

      {ideasPending && !generateIdeas.isPending && (
        <BackgroundGenerationBanner
          message="Generating ideas in the background — results will appear when ready."
          onStop={stopIdeas}
        />
      )}

      <section className="grid-2-1">
        {/* Left: input + results */}
        <div className="col" style={{ gap: 16 }}>

          {/* Combined input card */}
          <div className="card">
            <div className="field-label"><Icon name="sparkles" size={12} /> Your niche or channel</div>

            {savedChannels.length > 0 && (
              <div className="row" style={{ gap: 8, marginBottom: 10 }}>
                <select
                  className="input"
                  value={
                    channelData
                      ? String(savedChannels.find(c => c.youtube_channel_id === channelData.channel_id)?.id ?? '')
                      : ''
                  }
                  onChange={e => handleSelectSaved(e.target.value)}
                >
                  <option value="">Use a saved channel…</option>
                  {savedChannels.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.channel_name} {c.handle ? `(${c.handle})` : ''}
                    </option>
                  ))}
                </select>
                {channelData && savedChannels.some(c => c.youtube_channel_id === channelData.channel_id) && (
                  <button
                    className="btn sm ghost"
                    title="Remove from saved"
                    onClick={() => {
                      const match = savedChannels.find(c => c.youtube_channel_id === channelData.channel_id)
                      if (match) { deleteChannel.mutate(match.id); setChannelData(null) }
                    }}
                  >
                    <Icon name="x" size={12} />
                  </button>
                )}
              </div>
            )}

            <input
              className="input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste YouTube channel URL, @handle, or your niche (e.g. Kids Science)"
              onKeyDown={e => e.key === 'Enter' && !isGenerating && handleGenerate()}
            />

            {channelData && (
              <div className="row" style={{ marginTop: 10, padding: '10px 12px', background: 'var(--bg-soft)', borderRadius: 10, gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{channelData.channel_name}</div>
                  <div className="row" style={{ gap: 8, marginTop: 4 }}>
                    <span className="chip sm">{channelData.handle}</span>
                    {channelData.subscriber_count > 0 && (
                      <span className="chip sm mint">{(channelData.subscriber_count / 1000).toFixed(0)}k subs</span>
                    )}
                    {(channelData.recent_videos?.length ?? 0) > 0 && (
                      <span className="chip sm">{channelData.recent_videos.length} videos loaded</span>
                    )}
                  </div>
                </div>
                <button className="btn sm ghost" onClick={() => setChannelData(null)}><Icon name="x" size={12} /></button>
              </div>
            )}

            {fetchChannel.error && (
              <div className="error-row" style={{ marginTop: 8 }}>
                <Icon name="x" size={13} /> Couldn't fetch that channel — generating niche ideas instead.
              </div>
            )}

            <div className="row between" style={{ marginTop: 14 }}>
              <div className="segmented">
                {[5, 10, 20].map(n => (
                  <button key={n} className={count === n ? 'on' : ''} onClick={() => setCount(n)}>{n} ideas</button>
                ))}
              </div>
              <div className="row" style={{ gap: 8 }}>
                {isGenerating && (
                  <button className="btn" onClick={stopIdeas}>
                    <Icon name="x" size={14} /> Stop
                  </button>
                )}
                <button className="btn accent" onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating
                    ? <><Icon name="refresh" size={14} className="spin" /> Generating…</>
                    : <><Icon name="sparkles" size={14} /> Generate {count} ideas</>}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {(ideas.length > 0 || generateIdeas.isError) && (
            <div className="card">
              <div className="card-title">
                <div>
                  <h3 className="h2">Results</h3>
                  <div className="small muted" style={{ marginTop: 4 }}>
                    Ranked by <b>hook strength</b> · {ideas.length} ideas generated
                  </div>
                </div>
                <button className="btn sm" onClick={() => setShowRegenModal(true)} disabled={isGenerating}>
                  <Icon name="refresh" size={12} /> Regenerate
                </button>
              </div>

              {generateIdeas.isError && (
                <div className="error-row" style={{ marginBottom: 12 }}>
                  <Icon name="x" size={13} />
                  {getApiErrorMessage(generateIdeas.error, 'Failed to generate ideas.')}
                </div>
              )}

              <div className="stack-8">
                {ideas.map((idea, i) => {
                  const picked = selectedIdea?.title === idea.title
                  const reasoningOpen = expandedReasoning === i
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
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="row" style={{ gap: 10 }}>
                            <span className="muted small" style={{ width: 18 }}>{i + 1}.</span>
                            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.005em' }}>
                              {picked ? <span className="underline-accent">{idea.title}</span> : idea.title}
                            </div>
                          </div>
                          {idea.hook && (
                            <div className="small muted" style={{ marginTop: 6, marginLeft: 28, lineHeight: 1.4 }}>
                              {idea.hook}
                            </div>
                          )}
                          {idea.angle && (
                            <div className="small muted" style={{ marginTop: 4, marginLeft: 28, lineHeight: 1.4, fontStyle: 'italic' }}>
                              {idea.angle}
                            </div>
                          )}
                          <div className="row" style={{ gap: 6, marginTop: 8, marginLeft: 28, flexWrap: 'wrap' }}>
                            {idea.format && <span className="chip sm"><Icon name="film" size={11} /> {idea.format}</span>}
                          </div>
                          {reasoningOpen && idea.reasoning && (
                            <div className="small" style={{ marginTop: 10, marginLeft: 28, padding: '8px 12px', background: 'var(--bg-soft)', borderRadius: 8, lineHeight: 1.55, color: 'var(--ink-2)' }}>
                              <b style={{ color: 'var(--ink)' }}>Why this works: </b>{idea.reasoning}
                            </div>
                          )}
                        </div>
                        <div className="row" style={{ gap: 6, flexShrink: 0 }}>
                          {idea.reasoning && (
                            <button
                              className={'btn sm ghost' + (reasoningOpen ? ' accent' : '')}
                              title={reasoningOpen ? 'Hide reasoning' : 'Show reasoning'}
                              onClick={() => setExpandedReasoning(reasoningOpen ? null : i)}
                            >
                              <Icon name="lightbulb" size={13} />
                            </button>
                          )}
                          <button
                            className={'btn sm ' + (picked ? 'accent' : '')}
                            onClick={() => pickIdea(idea)}
                          >
                            {picked ? <>Picked <Icon name="check" size={12} /></> : '→ Script'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {selectedIdea && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                  <Link to="/script" className="btn primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Continue with "{selectedIdea.title.slice(0, 40)}{selectedIdea.title.length > 40 ? '…' : ''}" <Icon name="arrowRight" size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <IdeaSidebar channelData={channelData} onPickSaved={pickIdea} />
      </section>

      {/* Regen modal */}
      {showRegenModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={e => e.target === e.currentTarget && setShowRegenModal(false)}
        >
          <div className="card" style={{ width: 480, padding: 24, gap: 16, display: 'flex', flexDirection: 'column' }}>
            <div className="row between">
              <div className="h2">Regenerate ideas</div>
              <button className="btn sm ghost" onClick={() => setShowRegenModal(false)}><Icon name="x" size={14} /></button>
            </div>

            <div>
              <div className="field-label" style={{ marginBottom: 6 }}>Additional context (optional)</div>
              <textarea
                className="textarea"
                value={regenDesc}
                onChange={e => setRegenDesc(e.target.value)}
                placeholder="Describe what you're looking for — e.g. 'beginner-friendly tutorials', 'viral shorts format'…"
                style={{ minHeight: 80 }}
              />
            </div>

            <div>
              <div className="field-label" style={{ marginBottom: 8 }}>Tone</div>
              <div className="row wrap" style={{ gap: 6 }}>
                {TONES.map(t => (
                  <button key={t} className={'chip' + (regenTone === t ? ' accent' : '')} onClick={() => setRegenTone(t)}>{t}</button>
                ))}
              </div>
            </div>

            <div className="row" style={{ gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <button className="btn" onClick={() => setShowRegenModal(false)}>Cancel</button>
              <button className="btn accent" onClick={handleRegen}>
                <Icon name="sparkles" size={14} /> Regenerate {count} ideas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
