import { Link } from 'react-router-dom'
import Icon from '../../components/shared/Icon'
import type { ChannelData } from '../../types/workflow'

interface Props {
  channelData: ChannelData | null
}

export default function IdeaSidebar({ channelData }: Props) {
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
  )
}
