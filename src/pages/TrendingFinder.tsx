import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'
import { useTrending } from '../api/useTrending'
import { getApiErrorMessage } from '../types/api'

const REGIONS: { code: string; label: string }[] = [
  { code: 'US', label: 'US' },
  { code: 'GB', label: 'UK' },
  { code: 'IN', label: 'IN' },
  { code: 'CA', label: 'CA' },
  { code: 'AU', label: 'AU' },
  { code: 'DE', label: 'DE' },
]

// Prateek: YouTube video category ids — stable across regions per YT docs.
const CATEGORIES: { id: string | null; label: string }[] = [
  { id: null, label: 'All' },
  { id: '10', label: 'Music' },
  { id: '20', label: 'Gaming' },
  { id: '24', label: 'Entertainment' },
  { id: '25', label: 'News' },
  { id: '26', label: 'How-to' },
  { id: '28', label: 'Tech' },
  { id: '27', label: 'Education' },
]

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${n}`
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const days = Math.floor(ms / 86_400_000)
  if (days < 1) {
    const hours = Math.floor(ms / 3_600_000)
    return hours <= 0 ? 'just now' : `${hours}h ago`
  }
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function TrendingFinder() {
  const [region, setRegion] = useState('US')
  const [categoryId, setCategoryId] = useState<string | null>(null)

  const filter = useMemo(
    () => ({ region, category: categoryId, max: 20 }),
    [region, categoryId],
  )
  const qc = useQueryClient()
  const trending = useTrending(filter)

  const handleRefresh = () => {
    qc.invalidateQueries({ queryKey: ['trending'] })
    trending.refetch()
  }

  const data = trending.data
  const videos = data?.videos || []

  const regionLabel = REGIONS.find(r => r.code === region)?.label || region
  const categoryLabel =
    CATEGORIES.find(c => c.id === categoryId)?.label || 'All'

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Research"
        code="T7"
        icon="trend"
        title={<>What's <em>trending</em></>}
        subtitle="See YouTube's most-popular videos right now."
        actions={
          <button
            className="btn primary"
            onClick={handleRefresh}
            disabled={trending.isFetching}
          >
            <Icon name="refresh" size={14} className={trending.isFetching ? 'spin' : ''} /> Refresh
          </button>
        }
      />

      <div className="card">
        <div className="row wrap" style={{ gap: 12 }}>
          <div className="segmented">
            {REGIONS.map(r => (
              <button
                key={r.code}
                className={region === r.code ? 'on' : ''}
                onClick={() => setRegion(r.code)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="row wrap" style={{ gap: 6 }}>
            {CATEGORIES.map(c => (
              <button
                key={c.id ?? 'all'}
                className={'chip sm' + (categoryId === c.id ? ' filled' : '')}
                onClick={() => setCategoryId(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {trending.isError && (
        <div className="card">
          <div className="error-row">
            <Icon name="x" size={13} />
            {getApiErrorMessage(trending.error, 'Failed to load trending.')}
          </div>
        </div>
      )}

      <section className="grid-2-1">
        <div className="card">
          <div className="row between" style={{ marginBottom: 16 }}>
            <div className="h2">Trending in {categoryLabel} · {regionLabel}</div>
            {data?.cached ? (
              <span className="chip sm">Cached · {new Date(data.fetched_at).toLocaleTimeString()}</span>
            ) : (
              <span className="chip sm mint"><Icon name="flame" size={11} /> Live</span>
            )}
          </div>

          {trending.isLoading && (
            <div className="small muted">Loading…</div>
          )}

          {!trending.isLoading && videos.length === 0 && !trending.isError && (
            <div className="small muted">No trending results for this selection.</div>
          )}

          <div className="col" style={{ gap: 12 }}>
            {videos.map((v, i) => (
              <div
                key={v.id}
                className="row"
                style={{
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <a
                  href={`https://www.youtube.com/watch?v=${v.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flexShrink: 0 }}
                >
                  <img
                    src={v.thumbnail_url}
                    alt=""
                    style={{
                      width: 96,
                      height: 54,
                      borderRadius: 6,
                      objectFit: 'cover',
                    }}
                  />
                </a>
                <div className="col" style={{ flex: 1, minWidth: 0, gap: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
                    #{i + 1} · {v.title}
                  </div>
                  <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                    <span className="tiny muted">{v.channel_name}</span>
                    <span className="tiny muted">{formatViews(v.view_count)} views</span>
                    <span className="tiny muted">{timeAgo(v.published_at)}</span>
                  </div>
                </div>
                <a
                  className="btn sm"
                  href={`https://www.youtube.com/watch?v=${v.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="h2" style={{ marginBottom: 12 }}>About this list</div>
            <div className="small muted" style={{ lineHeight: 1.6 }}>
              Pulled from YouTube's <code>videos?chart=mostPopular</code> endpoint. Cached for 30 minutes per region+category to stay within the Data API quota.
            </div>
          </div>

          {data && videos.length > 0 && (
            <div className="card tinted">
              <div className="h2" style={{ marginBottom: 10 }}>Top view counts</div>
              <div className="col" style={{ gap: 8 }}>
                {[...videos]
                  .sort((a, b) => b.view_count - a.view_count)
                  .slice(0, 5)
                  .map(v => (
                    <div key={v.id} className="row between small">
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 220,
                      }}>{v.title}</span>
                      <b>{formatViews(v.view_count)}</b>
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
