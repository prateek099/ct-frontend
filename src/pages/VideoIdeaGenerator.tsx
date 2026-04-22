// Step 1 — video idea generation. Writes channelData + ideas + selectedIdea into the workflow.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import PipelineStepper from '../components/pipeline/PipelineStepper'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'
import { useWorkflow } from '../context/WorkflowContext'
import { useFetchChannel, useGenerateIdeas } from '../api/useWorkflow'
import { useSaveIdea } from '../api/useSavedIdeas'
import type { VideoIdea } from '../types/workflow'
import { getApiErrorMessage } from '../types/api'
import BackgroundGenerationBanner from '../components/pipeline/BackgroundGenerationBanner'
import IdeaSidebar from './idea/IdeaSidebar'

const TONES = ['Casual', 'Documentary', 'Educational', 'Hype', 'Story-driven']

export default function VideoIdeaGenerator() {
  const {
    channelData, setChannelData,
    ideas, selectedIdea, setSelectedIdea,
    resetFromIdeas, ideasPending,
    startIdeas, stopIdeas,
  } = useWorkflow()

  const [channelUrl, setChannelUrl] = useState('')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('Casual')
  const [count, setCount] = useState(10)

  const fetchChannel = useFetchChannel()
  const generateIdeas = useGenerateIdeas()
  const saveIdea = useSaveIdea()
  const [savedFlash, setSavedFlash] = useState(false)

  const handleSaveIdea = () => {
    if (!selectedIdea) return
    saveIdea.mutate(
      {
        title: selectedIdea.title,
        hook: selectedIdea.hook || null,
        angle: selectedIdea.angle || null,
        format: selectedIdea.format || null,
        reasoning: selectedIdea.reasoning || null,
        source_prompt: topic || null,
      },
      {
        onSuccess: () => {
          setSavedFlash(true)
          window.setTimeout(() => setSavedFlash(false), 2000)
        },
      },
    )
  }

  const handleFetch = () => {
    if (!channelUrl.trim()) return
    fetchChannel.mutate({ url: channelUrl.trim() }, {
      onSuccess: (data) => setChannelData(data),
    })
  }

  const handleGenerate = () => {
    resetFromIdeas()
    const controller = new AbortController()
    startIdeas(controller)
    const payload = {
      prompt: topic || 'Generate engaging YouTube video ideas',
      channel_context: channelData ? {
        channel_name: channelData.channel_name,
        handle: channelData.handle,
        description: channelData.description,
        subscriber_count: channelData.subscriber_count,
        average_duration_seconds: channelData.average_duration_seconds,
        recent_video_titles: channelData.recent_videos?.map(v => v.title) || [],
      } : undefined,
      signal: controller.signal,
    }
    generateIdeas.mutate(payload)
  }

  const pickIdea = (idea: VideoIdea) => setSelectedIdea(idea)
  const isGenerating = ideasPending || generateIdeas.isPending

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Step 1 of 6 · Ideation"
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
            <Link to="/script" className={'btn primary' + (!selectedIdea ? ' disabled' : '')}
              style={!selectedIdea ? { opacity: 0.4, pointerEvents: 'none' } : {}}>
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
        {/* Left: channel + prompt + results */}
        <div className="col" style={{ gap: 16 }}>

          {/* Channel card */}
          <div className="card">
            <div className="field-label"><Icon name="chart" size={12} /> Channel context (optional)</div>
            <div className="row" style={{ gap: 8 }}>
              <input
                className="input"
                value={channelUrl}
                onChange={e => setChannelUrl(e.target.value)}
                placeholder="Paste YouTube channel URL or @handle"
                onKeyDown={e => e.key === 'Enter' && handleFetch()}
              />
              <button
                className="btn"
                onClick={handleFetch}
                disabled={fetchChannel.isPending || !channelUrl.trim()}
                style={{ flexShrink: 0 }}
              >
                {fetchChannel.isPending ? <><Icon name="refresh" size={14} className="spin" /> Fetching…</> : <><Icon name="search" size={14} /> Fetch</>}
              </button>
            </div>

            {channelData && (
              <div className="row" style={{ marginTop: 12, padding: '10px 12px', background: 'var(--bg-soft)', borderRadius: 10, gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{channelData.channel_name}</div>
                  <div className="row" style={{ gap: 8, marginTop: 4 }}>
                    <span className="chip sm">{channelData.handle}</span>
                    {channelData.subscriber_count && (
                      <span className="chip sm mint">{(channelData.subscriber_count / 1000).toFixed(0)}k subs</span>
                    )}
                    {channelData.recent_videos?.length && (
                      <span className="chip sm">{channelData.recent_videos.length} videos loaded</span>
                    )}
                  </div>
                </div>
                <button className="btn sm ghost" onClick={() => setChannelData(null)}><Icon name="x" size={12} /></button>
              </div>
            )}

            {fetchChannel.error && (
              <div className="error-row" style={{ marginTop: 10 }}>
                <Icon name="x" size={13} /> Failed to fetch channel. Check the URL and try again.
              </div>
            )}
          </div>

          {/* Prompt card */}
          <div className="card">
            <div className="field-label"><Icon name="sparkles" size={12} /> What's the video about?</div>
            <textarea
              className="textarea"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Describe the video, the audience, the angle…"
            />
            <div className="row wrap" style={{ marginTop: 8, gap: 8 }}>
              <div className="field-label" style={{ margin: 0, color: 'var(--ink-3)' }}>Tone:</div>
              {TONES.map(t => (
                <button key={t} className={'chip' + (tone === t ? ' filled' : '')} onClick={() => setTone(t)}>{t}</button>
              ))}
            </div>
            <div className="row between" style={{ marginTop: 16 }}>
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
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn sm" onClick={handleGenerate} disabled={isGenerating}>
                    <Icon name="refresh" size={12} className={isGenerating ? 'spin' : ''} /> Regenerate
                  </button>
                </div>
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
                        <div style={{ minWidth: 0 }}>
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
                          <div className="row" style={{ gap: 6, marginTop: 8, marginLeft: 28, flexWrap: 'wrap' }}>
                            {idea.format && <span className="chip sm"><Icon name="film" size={11} /> {idea.format}</span>}
                            {idea.angle && <span className="chip sm violet"><Icon name="star" size={11} /> {idea.angle}</span>}
                          </div>
                        </div>
                        <div className="row" style={{ gap: 6 }}>
                          <button className="btn sm ghost" title="Regenerate"><Icon name="refresh" size={13} /></button>
                          <button
                            className={'btn sm ' + (picked ? 'accent' : '')}
                            onClick={() => pickIdea(idea)}
                          >
                            {picked ? <>Picked <Icon name="check" size={12} /></> : 'Pick'}
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
                    Continue with "{selectedIdea.title.slice(0, 40)}…" <Icon name="arrowRight" size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <IdeaSidebar channelData={channelData} onPickSaved={pickIdea} />
      </section>
    </div>
  )
}
