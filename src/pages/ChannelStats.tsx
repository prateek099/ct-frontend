import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'
import {
  useChannelStats,
  useChannels,
  useCreateChannel,
  useRefreshChannel,
} from '../api/useChannels'
import { getApiErrorMessage } from '../types/api'

function formatCount(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function ChannelStats() {
  const channels = useChannels()
  const createChannel = useCreateChannel()
  const refreshChannel = useRefreshChannel()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (selectedId == null && channels.data && channels.data.length > 0) {
      setSelectedId(channels.data[0].id)
    }
  }, [channels.data, selectedId])

  const stats = useChannelStats(selectedId)
  const selectedChannel = useMemo(
    () => channels.data?.find(c => c.id === selectedId) ?? null,
    [channels.data, selectedId],
  )

  const handleAnalyse = async () => {
    if (!url.trim()) return
    const created = await createChannel.mutateAsync(url.trim())
    setSelectedId(created.id)
    setUrl('')
  }

  const handleRefresh = async () => {
    if (selectedId == null) return
    await refreshChannel.mutateAsync(selectedId)
  }

  const engagementPct =
    stats.data && stats.data.engagement_rate
      ? (stats.data.engagement_rate * 100).toFixed(2)
      : '0.00'

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Research"
        code="T8"
        icon="chart"
        title={<>Channel <em>stats</em></>}
        subtitle="Analyse any YouTube channel — aggregates pulled from its last uploads."
        actions={
          selectedId != null ? (
            <button
              className="btn"
              onClick={handleRefresh}
              disabled={refreshChannel.isPending}
            >
              <Icon
                name="refresh"
                size={14}
                className={refreshChannel.isPending ? 'spin' : ''}
              />{' '}
              Refresh
            </button>
          ) : undefined
        }
      />

      <div className="card">
        <div className="field-label">Add a channel</div>
        <div className="row" style={{ gap: 10, marginBottom: 12 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://youtube.com/@handle, /channel/UC..., or video URL"
          />
          <button
            className="btn accent"
            onClick={handleAnalyse}
            disabled={createChannel.isPending || !url.trim()}
          >
            <Icon name="search" size={14} /> Analyse
          </button>
        </div>

        {createChannel.isError && (
          <div className="error-row" style={{ marginBottom: 8 }}>
            <Icon name="x" size={13} />
            {getApiErrorMessage(createChannel.error, 'Failed to add channel.')}
          </div>
        )}

        {channels.data && channels.data.length > 0 && (
          <>
            <div className="field-label">Saved channels</div>
            <div className="row wrap" style={{ gap: 6 }}>
              {channels.data.map(c => (
                <button
                  key={c.id}
                  className={'chip sm' + (selectedId === c.id ? ' filled' : '')}
                  onClick={() => setSelectedId(c.id)}
                >
                  {c.channel_name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {stats.isError && (
        <div className="card">
          <div className="error-row">
            <Icon name="x" size={13} />
            {getApiErrorMessage(stats.error, 'Failed to load stats.')}
          </div>
        </div>
      )}

      {selectedId != null && stats.isLoading && (
        <div className="card"><div className="small muted">Loading stats…</div></div>
      )}

      {stats.data && (
        <>
          <div className="grid-4">
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="muted small" style={{ marginBottom: 6 }}>Subscribers</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
                {formatCount(stats.data.subscriber_count)}
              </div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="muted small" style={{ marginBottom: 6 }}>Total views</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
                {formatCount(stats.data.total_views)}
              </div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="muted small" style={{ marginBottom: 6 }}>Total videos</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
                {formatCount(stats.data.video_count)}
              </div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div className="muted small" style={{ marginBottom: 6 }}>Avg duration</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
                {formatDuration(stats.data.average_duration_seconds)}
              </div>
            </div>
          </div>

          <section className="grid-2-1">
            <div className="card">
              <div className="h2" style={{ marginBottom: 14 }}>
                Top videos · last {stats.data.sample_size} uploads
              </div>
              {stats.data.top_videos.length === 0 ? (
                <div className="small muted">No videos in the cached sample.</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Views</th>
                      <th>Likes</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.data.top_videos.map(v => (
                      <tr key={v.id}>
                        <td style={{ fontWeight: 500 }}>
                          <a
                            href={`https://www.youtube.com/watch?v=${v.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {v.title}
                          </a>
                        </td>
                        <td>{formatCount(v.view_count)}</td>
                        <td>{formatCount(v.like_count)}</td>
                        <td className="muted">{formatDuration(v.duration_seconds)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="col" style={{ gap: 16 }}>
              <div className="card">
                <div className="h2" style={{ marginBottom: 10 }}>Recent performance</div>
                <div className="col" style={{ gap: 8 }}>
                  <div className="row between small">
                    <span className="muted">Sample size</span>
                    <b>{stats.data.sample_size} videos</b>
                  </div>
                  <div className="row between small">
                    <span className="muted">Recent views</span>
                    <b>{formatCount(stats.data.recent_views_sum)}</b>
                  </div>
                  <div className="row between small">
                    <span className="muted">Avg views / video</span>
                    <b>{formatCount(stats.data.average_views_per_video)}</b>
                  </div>
                  <div className="row between small">
                    <span className="muted">Recent likes</span>
                    <b>{formatCount(stats.data.recent_likes_sum)}</b>
                  </div>
                  <div className="row between small">
                    <span className="muted">Recent comments</span>
                    <b>{formatCount(stats.data.recent_comments_sum)}</b>
                  </div>
                  <div className="row between small">
                    <span className="muted">Engagement rate</span>
                    <b>{engagementPct}%</b>
                  </div>
                  <div className="row between small">
                    <span className="muted">Publish cadence</span>
                    <b>{stats.data.videos_per_week.toFixed(2)} / week</b>
                  </div>
                </div>
              </div>

              {selectedChannel?.handle && (
                <div className="card tinted">
                  <div className="h2" style={{ marginBottom: 8 }}>Channel</div>
                  <div className="small" style={{ lineHeight: 1.5 }}>
                    <b>{stats.data.channel_name}</b>
                    <div className="muted tiny" style={{ marginTop: 4 }}>
                      {selectedChannel.handle}
                    </div>
                    <div className="muted tiny" style={{ marginTop: 4 }}>
                      Last refreshed{' '}
                      {new Date(stats.data.last_refreshed_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {!stats.data && !stats.isLoading && selectedId == null && (
        <div className="card">
          <div className="small muted">
            Add a YouTube channel above to see its stats.
          </div>
        </div>
      )}
    </div>
  )
}
