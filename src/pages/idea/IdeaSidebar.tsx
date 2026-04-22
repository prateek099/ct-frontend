import { Link } from 'react-router-dom'
import Icon from '../../components/shared/Icon'
import type { ChannelData, VideoIdea } from '../../types/workflow'
import { useSavedIdeas, useDeleteIdea } from '../../api/useSavedIdeas'

interface Props {
  channelData: ChannelData | null
  onPickSaved?: (idea: VideoIdea) => void
}

export default function IdeaSidebar({ channelData, onPickSaved }: Props) {
  const { data: savedIdeas = [] } = useSavedIdeas({ limit: 10 })
  const deleteIdea = useDeleteIdea()

  return (
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
          ].map(r => (
            <div key={r.t} className="row between">
              <span style={{ fontSize: 13 }}>{r.t}</span>
              <span className="badge mint">{r.d}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <h3 className="h2">Idea bank</h3>
          <span className="small muted">{savedIdeas.length} saved</span>
        </div>
        {savedIdeas.length === 0 ? (
          <div className="tiny muted">
            No saved ideas yet. Pick an idea and hit "Save to idea bank" to build your stash.
          </div>
        ) : (
          <div className="col" style={{ gap: 8 }}>
            {savedIdeas.slice(0, 8).map(idea => (
              <div className="row between" key={idea.id} style={{ fontSize: 13, gap: 8 }}>
                <span
                  style={{
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={idea.title}
                >
                  {idea.title}
                </span>
                <div className="row" style={{ gap: 4 }}>
                  {onPickSaved && (
                    <button
                      className="btn sm ghost"
                      title="Use this idea"
                      onClick={() =>
                        onPickSaved({
                          title: idea.title,
                          hook: idea.hook ?? '',
                          angle: idea.angle ?? '',
                          format: idea.format ?? '',
                          reasoning: idea.reasoning ?? '',
                        })
                      }
                    >
                      <Icon name="arrowRight" size={12} />
                    </button>
                  )}
                  <button
                    className="btn sm ghost"
                    title="Remove"
                    onClick={() => deleteIdea.mutate(idea.id)}
                  >
                    <Icon name="x" size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
      ) : null}
    </div>
  )
}
