import { useState } from 'react'
import { Link } from 'react-router-dom'
import PipelineStepper from '../components/PipelineStepper'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import { useWorkflow } from '../context/WorkflowContext'
import { useFetchChannel, useGenerateIdeas } from '../api/useWorkflow'
import type { VideoIdea } from '../types/workflow'

const TONES = ['Casual', 'Documentary', 'Educational', 'Hype', 'Story-driven']

export default function VideoIdeaGenerator() {
  const { channelData, setChannelData, setIdeas, ideas, setSelectedIdea, selectedIdea, resetFromIdeas } = useWorkflow()

  const [channelUrl, setChannelUrl] = useState('')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('Casual')
  const [count, setCount] = useState(10)

  const fetchChannel = useFetchChannel()
  const generateIdeas = useGenerateIdeas()

  const handleFetch = () => {
    if (!channelUrl.trim()) return
    fetchChannel.mutate({ url: channelUrl.trim() }, {
      onSuccess: (data) => setChannelData(data),
    })
  }

  const handleGenerate = async () => {
    resetFromIdeas()
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
    }
    generateIdeas.mutate(payload, { onSuccess: (data) => setIdeas(data) })
  }

  const pickIdea = (idea: VideoIdea) => setSelectedIdea(idea)

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
            <button className="btn" disabled={!selectedIdea}>
              <Icon name="save" size={14} /> Save to idea bank
            </button>
            <Link to="/script" className={'btn primary' + (!selectedIdea ? ' disabled' : '')}
              style={!selectedIdea ? { opacity: 0.4, pointerEvents: 'none' } : {}}>
              <Icon name="arrowRight" size={14} /> Next: Script
            </Link>
          </>
        }
      />

      <PipelineStepper active={1} />

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
              <button className="btn accent" onClick={handleGenerate} disabled={generateIdeas.isPending}>
                {generateIdeas.isPending
                  ? <><Icon name="refresh" size={14} /> Generating…</>
                  : <><Icon name="sparkles" size={14} /> Generate {count} ideas</>}
              </button>
            </div>
          </div>

          {/* Results */}
          {(ideas.length > 0 || generateIdeas.error) && (
            <div className="card">
              <div className="card-title">
                <div>
                  <h3 className="h2">Results</h3>
                  <div className="small muted" style={{ marginTop: 4 }}>
                    Ranked by <b>hook strength</b> · {ideas.length} ideas generated
                  </div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn sm" onClick={handleGenerate} disabled={generateIdeas.isPending}>
                    <Icon name="refresh" size={12} /> Regenerate
                  </button>
                </div>
              </div>

              {generateIdeas.error && (
                <div className="error-row" style={{ marginBottom: 12 }}>
                  <Icon name="x" size={13} />
                  {(generateIdeas.error as { response?: { data?: { error?: { detail?: string } } }; message?: string })?.response?.data?.error?.detail || 'Failed to generate ideas.'}
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

        {/* Right sidebar helpers */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-title">
              <h3 className="h2">Your style DNA</h3>
              <span className="chip sm">Learned</span>
            </div>
            <div className="col" style={{ gap: 10 }}>
              <div>
                <div className="tiny muted" style={{ marginBottom: 4 }}>Common hook type</div>
                <div className="row between">
                  <span style={{ fontWeight: 600 }}>Numbered list ("5 things…")</span>
                  <span className="small muted">62%</span>
                </div>
                <div className="bar accent" style={{ marginTop: 6 }}><i style={{ width: '62%' }} /></div>
              </div>
              <div>
                <div className="tiny muted" style={{ marginBottom: 4 }}>Average length</div>
                <div className="row between">
                  <span style={{ fontWeight: 600 }}>4:12</span>
                  <span className="small muted">sweet spot</span>
                </div>
                <div className="bar mint" style={{ marginTop: 6 }}><i style={{ width: '72%' }} /></div>
              </div>
              <div>
                <div className="tiny muted" style={{ marginBottom: 4 }}>Top-performing CTA</div>
                <div style={{ fontWeight: 600 }}>"Subscribe if this saved you time"</div>
              </div>
            </div>
          </div>

          <div className="card tinted">
            <div className="card-title">
              <h3 className="h2">Trend radar</h3>
              <Link to="/trending" className="btn sm ghost">Open <Icon name="arrowRight" size={12} /></Link>
            </div>
            <div className="col" style={{ gap: 10 }}>
              {[
                { t: 'AI tools for creators',  d: '↑ 340%' },
                { t: 'Claude vs ChatGPT 2026', d: '↑ 210%' },
                { t: 'Free alternatives to…',  d: '↑ 155%' },
                { t: 'Channel makeovers',      d: '↑ 88%' },
              ].map(r => (
                <div key={r.t} className="row between">
                  <span style={{ fontSize: 13 }}>{r.t}</span>
                  <span className="badge mint">{r.d}</span>
                </div>
              ))}
            </div>
          </div>

          {channelData?.recent_videos?.length ? (
            <div className="card">
              <div className="card-title">
                <h3 className="h2">Recent videos</h3>
                <span className="small muted">{channelData.channel_name}</span>
              </div>
              <div className="col" style={{ gap: 8 }}>
                {channelData.recent_videos.slice(0, 5).map((v, i) => (
                  <div key={i} className="row between" style={{ fontSize: 13 }}>
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-title">
                <h3 className="h2">Idea bank</h3>
                <span className="small muted">23 saved</span>
              </div>
              <div className="col" style={{ gap: 8 }}>
                {['"Why free tools beat paid ones"', '"30 days of Claude"', '"Editing in 1 hour"'].map(idea => (
                  <div className="row between" key={idea} style={{ fontSize: 13 }}>
                    <span>{idea}</span>
                    <button className="btn sm ghost"><Icon name="arrowRight" size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
