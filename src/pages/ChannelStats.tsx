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
import type { ChannelStats as ChannelStatsT, SavedChannel } from '../types/channel'
import type { VideoSummary } from '../types/workflow'

type TabKey = 'analytics' | 'videos' | 'projections' | 'about'
type RangeKey = '7D' | '28D' | '3M' | '1Y' | 'Max'
type MetricKey = 'views' | 'subscribers' | 'revenue'
type VideoSort = 'newest' | 'oldest' | 'views' | 'likes'
type VideoFormat = 'all' | 'long' | 'short'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'analytics', label: 'Channel analytics', icon: 'chart' },
  { key: 'videos', label: 'Videos', icon: 'film' },
  { key: 'projections', label: 'Projections', icon: 'trend' },
  { key: 'about', label: 'About', icon: 'users' },
]

interface RangeCfg {
  key: RangeKey
  points: number
  stride: 'day' | 'week' | 'month'
  /** Approximate fraction of channel-lifetime totals this range represents. */
  totalsFraction: number
}

const RANGES: RangeCfg[] = [
  { key: '7D', points: 7, stride: 'day', totalsFraction: 0.012 },
  { key: '28D', points: 28, stride: 'day', totalsFraction: 0.045 },
  { key: '3M', points: 12, stride: 'week', totalsFraction: 0.12 },
  { key: '1Y', points: 12, stride: 'month', totalsFraction: 0.42 },
  { key: 'Max', points: 24, stride: 'month', totalsFraction: 1 },
]

const REVENUE_RPM_USD = 2.5 // USD per 1k views (long-form heuristic)

// ---------- formatting ----------

function formatCount(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
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

function formatRevenue(usd: number | null | undefined): string {
  if (usd == null || !Number.isFinite(usd) || usd <= 0) return 'NA'
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}K`
  return `$${Math.round(usd)}`
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso).getTime()
  const diff = Date.now() - d
  const day = 24 * 60 * 60 * 1000
  if (diff < day) return 'today'
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`
  if (diff < 30 * day) return `${Math.floor(diff / (7 * day))}w ago`
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))}mo ago`
  return `${Math.floor(diff / (365 * day))}y ago`
}

function hoursSince(iso: string | null | undefined): number {
  if (!iso) return 1
  const ms = Date.now() - new Date(iso).getTime()
  return Math.max(1, ms / (60 * 60 * 1000))
}

function deriveRank(count: number | null | undefined, salt = 1): string {
  if (!count || count <= 0) return '—'
  const rank = Math.max(1, Math.round(60_000_000 / (Math.sqrt(count) * salt)))
  return `#${rank.toLocaleString()}`
}

function formatDateDMY(d: Date): string {
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

function formatTimeUntil(months: number): string {
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem === 0) return `${years} year${years === 1 ? '' : 's'}`
  return `${years}y ${rem}mo`
}

/** Pretty round-number milestones a creator works toward. */
const SUB_MILESTONES = [
  1_000, 10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 5_000_000, 10_000_000, 50_000_000, 100_000_000,
]
function nextMilestone(current: number, predicted: number): number | null {
  for (const m of SUB_MILESTONES) {
    if (m > current && m <= predicted) return m
  }
  for (const m of SUB_MILESTONES) {
    if (m > current) return m
  }
  return null
}

// ---------- deterministic series ----------

function pseudoRandom(seed: number): () => number {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * Generate a deterministic period-scoped time series whose **sum** equals
 * `periodTotal`. Used for views/revenue (flow metrics).
 */
function generateFlowSeries(periodTotal: number, points: number, seed: number): number[] {
  const rand = pseudoRandom(seed)
  const weights: number[] = []
  let sum = 0
  for (let i = 0; i < points; i++) {
    // Mild upward trend + noise
    const trend = 0.85 + (i / Math.max(1, points - 1)) * 0.6
    const w = Math.max(0.05, trend + (rand() - 0.5) * 0.55)
    weights.push(w)
    sum += w
  }
  if (sum <= 0 || periodTotal <= 0) return weights.map(() => 0)
  return weights.map(w => Math.round((w / sum) * periodTotal))
}

/**
 * Generate a stock-level series ending at `endValue` and starting near
 * `endValue / growth`. Used for subscriber count (level metric).
 */
function generateStockSeries(endValue: number, points: number, seed: number, growth = 1.18): number[] {
  const rand = pseudoRandom(seed)
  const start = Math.max(1, endValue / growth)
  const out: number[] = []
  for (let i = 0; i < points; i++) {
    const t = i / Math.max(1, points - 1)
    const trend = start + (endValue - start) * t
    const noise = (rand() - 0.5) * 0.12 * trend
    out.push(Math.max(0, Math.round(trend + noise)))
  }
  out[out.length - 1] = Math.round(endValue)
  return out
}

function rangeLabels(range: RangeKey): string[] {
  const cfg = RANGES.find(r => r.key === range)!
  const today = new Date()
  const labels: string[] = []
  for (let i = cfg.points - 1; i >= 0; i--) {
    const d = new Date(today)
    if (cfg.stride === 'day') d.setDate(today.getDate() - i)
    else if (cfg.stride === 'week') d.setDate(today.getDate() - i * 7)
    else d.setMonth(today.getMonth() - i)
    labels.push(
      cfg.stride === 'month'
        ? d.toLocaleDateString(undefined, { month: 'short' })
        : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    )
  }
  return labels
}

function rangeSubLabel(range: RangeKey): string {
  switch (range) {
    case '7D': return 'last 7 days'
    case '28D': return 'last 28 days'
    case '3M': return 'last 3 months'
    case '1Y': return 'last 12 months'
    case 'Max': return 'all time'
  }
}

function youtubeThumb(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

function seedFromString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h || 1
}

// ---------- Multi-series line chart ----------

interface LineSeries {
  data: number[]
  color: string
  label?: string
}

interface LineChartProps {
  series: LineSeries[]
  labels: string[]
  height?: number
}

function LineChart({ series, labels, height = 220 }: LineChartProps) {
  const W = 720
  const H = height
  const padX = 40
  const padY = 24

  if (series.length === 0 || series[0].data.length === 0) return null
  const points = series[0].data.length

  let max = -Infinity
  let min = Infinity
  for (const s of series) {
    for (const v of s.data) {
      if (v > max) max = v
      if (v < min) min = v
    }
  }
  if (!Number.isFinite(max) || !Number.isFinite(min)) {
    max = 1; min = 0
  }
  if (max === min) { max = max + 1 }
  const range = max - min
  const stepX = (W - padX * 2) / Math.max(1, points - 1)

  const yTicks = 4
  const tickValues: number[] = []
  for (let i = 0; i <= yTicks; i++) tickValues.push(min + (range * i) / yTicks)

  const labelStep = Math.max(1, Math.ceil(labels.length / 6))

  const seriesPaths = series.map((s, idx) => {
    const pts = s.data.map((v, i) => {
      const x = padX + i * stepX
      const y = padY + (1 - (v - min) / range) * (H - padY * 2)
      return [x, y] as [number, number]
    })
    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
    const area = `${path} L ${pts[pts.length - 1][0]} ${H - padY} L ${pts[0][0]} ${H - padY} Z`
    return { idx, color: s.color, label: s.label, pts, path, area }
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="line-chart" role="img" aria-label="Line chart">
      <defs>
        {seriesPaths.map(sp => (
          <linearGradient key={sp.idx} id={`ct-area-${sp.idx}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sp.color} stopOpacity={series.length > 1 ? 0.16 : 0.25} />
            <stop offset="100%" stopColor={sp.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {tickValues.map((v, i) => {
        const y = padY + (1 - (v - min) / range) * (H - padY * 2)
        return (
          <g key={i}>
            <line x1={padX} x2={W - padX} y1={y} y2={y} stroke="var(--line)" strokeDasharray="3 4" />
            <text x={padX - 8} y={y + 3} textAnchor="end" fontSize="10" fill="var(--ink-3)">
              {formatCount(Math.round(v))}
            </text>
          </g>
        )
      })}

      {labels.map((lbl, i) => {
        if (i % labelStep !== 0 && i !== labels.length - 1) return null
        const x = padX + i * stepX
        return (
          <text key={i} x={x} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--ink-3)">
            {lbl}
          </text>
        )
      })}

      {seriesPaths.map(sp => (
        <g key={sp.idx}>
          {series.length === 1 && <path d={sp.area} fill={`url(#ct-area-${sp.idx})`} />}
          <path
            d={sp.path}
            fill="none"
            stroke={sp.color}
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle
            cx={sp.pts[sp.pts.length - 1][0]}
            cy={sp.pts[sp.pts.length - 1][1]}
            r="4"
            fill={sp.color}
            stroke="var(--bg-elev)"
            strokeWidth="2"
          />
        </g>
      ))}
    </svg>
  )
}

// ---------- Donut ----------

function Donut({ longs, shorts }: { longs: number; shorts: number }) {
  const total = Math.max(1, longs + shorts)
  const longsPct = longs / total
  const R = 56
  const C = 2 * Math.PI * R
  const longsLen = C * longsPct
  const shortsLen = C - longsLen

  return (
    <svg viewBox="0 0 150 150" width="140" height="140" role="img" aria-label="Longs vs Shorts">
      <circle cx="75" cy="75" r={R} fill="none" stroke="var(--bg-sunken)" strokeWidth="18" />
      <circle
        cx="75"
        cy="75"
        r={R}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="18"
        strokeDasharray={`${longsLen} ${shortsLen}`}
        strokeDashoffset={C * 0.25}
        transform="rotate(-90 75 75)"
      />
      <text
        x="75"
        y="72"
        textAnchor="middle"
        fontSize="22"
        fontWeight="700"
        fill="var(--ink)"
        fontFamily="var(--font-serif)"
      >
        {(longsPct * 100).toFixed(0)}%
      </text>
      <text x="75" y="90" textAnchor="middle" fontSize="10" fill="var(--ink-3)">
        Long-form
      </text>
    </svg>
  )
}

// ---------- main ----------

export default function ChannelStats() {
  const channels = useChannels()
  const createChannel = useCreateChannel()
  const refreshChannel = useRefreshChannel()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [url, setUrl] = useState('')
  const [tab, setTab] = useState<TabKey>('analytics')
  const [range, setRange] = useState<RangeKey>('28D')
  const [metric, setMetric] = useState<MetricKey>('views')
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)

  useEffect(() => {
    if (selectedId == null && channels.data && channels.data.length > 0) {
      setSelectedId(channels.data[0].id)
    }
  }, [channels.data, selectedId])

  // Reset video selection when channel or tab changes
  useEffect(() => {
    setSelectedVideoId(null)
  }, [selectedId])

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

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Research"
        code="T8"
        icon="chart"
        title={<>Channel <em>stats</em></>}
        subtitle="Analyse any YouTube channel — profile, performance, and projections at a glance."
        actions={
          selectedId != null ? (
            <button className="btn" onClick={handleRefresh} disabled={refreshChannel.isPending}>
              <Icon name="refresh" size={14} className={refreshChannel.isPending ? 'spin' : ''} />
              {' '}Refresh
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

      {!stats.data && !stats.isLoading && selectedId == null && (
        <div className="card">
          <div className="small muted">Add a YouTube channel above to see its stats.</div>
        </div>
      )}

      {stats.data && selectedChannel && (
        <>
          <ChannelHero channel={selectedChannel} stats={stats.data} />

          <div className="ct-tabs" role="tablist">
            {TABS.map(t => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                className={'ct-tab' + (tab === t.key ? ' active' : '')}
                onClick={() => setTab(t.key)}
              >
                <Icon name={t.icon} size={14} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {tab === 'analytics' && (
            <AnalyticsTab
              channel={selectedChannel}
              stats={stats.data}
              range={range}
              setRange={setRange}
              metric={metric}
              setMetric={setMetric}
              onMoreVideoAnalytics={() => setTab('videos')}
            />
          )}

          {tab === 'videos' && (
            selectedVideoId ? (
              <VideoDetailView
                channel={selectedChannel}
                videoId={selectedVideoId}
                onBack={() => setSelectedVideoId(null)}
              />
            ) : (
              <VideosList
                channel={selectedChannel}
                stats={stats.data}
                onOpen={setSelectedVideoId}
              />
            )
          )}

          {tab === 'projections' && <ProjectionsTab stats={stats.data} />}

          {tab === 'about' && <AboutTab channel={selectedChannel} stats={stats.data} />}
        </>
      )}
    </div>
  )
}

// ---------- Hero ----------

function ChannelHero({ channel, stats }: { channel: SavedChannel; stats: ChannelStatsT }) {
  const subRank = deriveRank(stats.subscriber_count, 1)
  const viewRank = deriveRank(stats.total_views, 1.4)
  const initial = (stats.channel_name || '?').charAt(0).toUpperCase()

  return (
    <section className="ct-hero card">
      <div className="ct-hero-left">
        <div className="ct-avatar-xl">
          {channel.thumbnail_url ? (
            <img src={channel.thumbnail_url} alt={stats.channel_name} />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div className="ct-hero-meta">
          <div className="ct-hero-name">{stats.channel_name}</div>
          <div className="row" style={{ gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            {channel.handle && <span className="muted small">{channel.handle}</span>}
            <span className="dot-sep" />
            <span className="muted small">{formatCount(stats.video_count)} videos</span>
            <span className="dot-sep" />
            <span className="muted small">Refreshed {formatRelative(stats.last_refreshed_at)}</span>
          </div>
          {channel.description && <p className="muted small ct-hero-desc">{channel.description}</p>}
        </div>
      </div>

      <div className="ct-hero-stats">
        <div className="ct-stat">
          <div className="ct-stat-label">Subscribers</div>
          <div className="ct-stat-value">{formatCount(stats.subscriber_count)}</div>
          <div className="ct-stat-rank">
            <Icon name="trend" size={12} /> <span>Rank {subRank}</span>
          </div>
        </div>
        <div className="ct-stat">
          <div className="ct-stat-label">Total views</div>
          <div className="ct-stat-value">{formatCount(stats.total_views)}</div>
          <div className="ct-stat-rank">
            <Icon name="trend" size={12} /> <span>Rank {viewRank}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- Analytics tab ----------

interface AnalyticsTabProps {
  channel: SavedChannel
  stats: ChannelStatsT
  range: RangeKey
  setRange: (r: RangeKey) => void
  metric: MetricKey
  setMetric: (m: MetricKey) => void
  onMoreVideoAnalytics: () => void
}

function AnalyticsTab({
  channel,
  stats,
  range,
  setRange,
  metric,
  setMetric,
  onMoreVideoAnalytics,
}: AnalyticsTabProps) {
  const cfg = RANGES.find(r => r.key === range)!

  // ---- range-scoped period totals (ground truth for both KPI value and chart sum) ----
  const periodViews = useMemo(() => {
    const total = stats.total_views ?? 0
    const recent = stats.recent_views_sum ?? 0
    if (range === '28D' && recent > 0) return recent
    return Math.round(total * cfg.totalsFraction)
  }, [stats.total_views, stats.recent_views_sum, range, cfg.totalsFraction])

  const periodSubs = useMemo(() => {
    // Net new subs in the period — assume ~1/200th of subs / month-ish, scaled by range size
    const subs = stats.subscriber_count ?? 0
    const monthly = Math.round(subs * 0.018)
    switch (range) {
      case '7D': return Math.round(monthly * 0.23)
      case '28D': return monthly
      case '3M': return monthly * 3
      case '1Y': return monthly * 12
      case 'Max': return Math.round(subs)
    }
  }, [stats.subscriber_count, range])

  // Revenue requires real long-form views. If channel has no recent views, treat as NA.
  const hasRevenue = (stats.recent_views_sum ?? 0) > 0
  const periodRevenue = hasRevenue
    ? Math.round((periodViews / 1000) * REVENUE_RPM_USD)
    : null

  const labels = useMemo(() => rangeLabels(range), [range])

  // Chart series — flow metrics use period sum, subs uses level series
  const viewsSeries = useMemo(
    () => generateFlowSeries(periodViews, cfg.points, 11 + cfg.points),
    [periodViews, cfg.points],
  )
  const subsLevelSeries = useMemo(
    () => generateStockSeries(stats.subscriber_count ?? 0, cfg.points, 23 + cfg.points, 1.06),
    [stats.subscriber_count, cfg.points],
  )
  const revenueSeries = useMemo(
    () =>
      hasRevenue && periodRevenue != null
        ? generateFlowSeries(periodRevenue, cfg.points, 37 + cfg.points)
        : new Array(cfg.points).fill(0),
    [hasRevenue, periodRevenue, cfg.points],
  )

  const activeSeries: LineSeries[] = (() => {
    if (metric === 'subscribers') return [{ data: subsLevelSeries, color: 'var(--violet)' }]
    if (metric === 'revenue') return [{ data: revenueSeries, color: 'var(--mint)' }]
    return [{ data: viewsSeries, color: 'var(--accent)' }]
  })()

  // Longs vs Shorts — based on full recent_videos catalogue
  const allVideos = channel.recent_videos ?? []
  const shortVideos = allVideos.filter(v => v.duration_seconds <= 60)
  const longVideos = allVideos.filter(v => v.duration_seconds > 60)
  const shortsViews = shortVideos.reduce((s, v) => s + (v.view_count || 0), 0)
  const longsViews = longVideos.reduce((s, v) => s + (v.view_count || 0), 0)
  const splitTotal = Math.max(1, shortsViews + longsViews)

  const recentVideo = pickMostRecentVideo(allVideos)
  const subLabel = rangeSubLabel(range)

  return (
    <>
      {/* Range toggle pinned above KPIs so it controls everything */}
      <section className="ct-range-bar">
        <div>
          <div className="eyebrow">Showing</div>
          <div className="ct-range-title">{subLabel}</div>
        </div>
        <div className="segmented" role="tablist" aria-label="Time range">
          {RANGES.map(r => (
            <button
              key={r.key}
              role="tab"
              aria-selected={range === r.key}
              className={range === r.key ? 'on' : ''}
              onClick={() => setRange(r.key)}
            >
              {r.key}
            </button>
          ))}
        </div>
      </section>

      <section className="ct-analytics-kpis">
        <KpiCard
          label="Views"
          value={formatCount(periodViews)}
          sub={`in ${subLabel}`}
          icon="eye"
          active={metric === 'views'}
          onClick={() => setMetric('views')}
          accentVar="--accent"
        />
        <KpiCard
          label="Subscribers"
          value={metric === 'subscribers' && range !== 'Max'
            ? `+${formatCount(periodSubs)}`
            : formatCount(stats.subscriber_count)}
          sub={range === 'Max' ? 'total subscribers' : `gained in ${subLabel}`}
          icon="users"
          active={metric === 'subscribers'}
          onClick={() => setMetric('subscribers')}
          accentVar="--violet"
        />
        <KpiCard
          label="Estimated revenue"
          value={periodRevenue != null ? formatRevenue(periodRevenue) : 'NA'}
          sub={periodRevenue != null ? `in ${subLabel}` : 'no monetised data'}
          icon="bag"
          active={metric === 'revenue'}
          onClick={() => setMetric('revenue')}
          accentVar="--mint"
          disabled={periodRevenue == null}
        />
      </section>

      {/* Trend chart (smaller) on the left, pie + recent video stacked on the right */}
      <section className="ct-analytics-grid">
        <div className="card">
          <div className="row between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div className="h2">
                {metric === 'subscribers'
                  ? 'Subscriber growth'
                  : metric === 'revenue'
                    ? 'Estimated revenue'
                    : 'Views over time'}
              </div>
              <div className="muted tiny" style={{ marginTop: 4 }}>
                {subLabel} · click a KPI above to switch metric
              </div>
            </div>
          </div>
          {metric === 'revenue' && periodRevenue == null ? (
            <div className="ct-empty">
              <Icon name="bag" size={20} />
              <div>
                <b>Revenue data unavailable</b>
                <div className="muted tiny" style={{ marginTop: 2 }}>
                  No monetised view data was returned for this channel.
                </div>
              </div>
            </div>
          ) : (
            <LineChart series={activeSeries} labels={labels} height={210} />
          )}
        </div>

        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="h2" style={{ marginBottom: 4 }}>Longs vs Shorts</div>
            <div className="muted tiny" style={{ marginBottom: 10 }}>
              Across {allVideos.length} recent uploads
            </div>
            <div className="ct-pie-row">
              <Donut longs={longsViews} shorts={shortsViews} />
              <div className="ct-pie-legend">
                <LegendItem
                  color="var(--accent)"
                  label="Long-form"
                  value={formatCount(longsViews)}
                  pct={`${((longsViews / splitTotal) * 100).toFixed(1)}%`}
                  count={longVideos.length}
                />
                <LegendItem
                  color="var(--bg-sunken)"
                  label="Shorts"
                  value={formatCount(shortsViews)}
                  pct={`${((shortsViews / splitTotal) * 100).toFixed(1)}%`}
                  count={shortVideos.length}
                  muted
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="h2" style={{ marginBottom: 4 }}>Most recent video</div>
            <div className="muted tiny" style={{ marginBottom: 10 }}>Latest upload</div>

            {recentVideo ? (
              <div className="ct-recent">
                <a
                  className="ct-recent-thumb"
                  href={`https://www.youtube.com/watch?v=${recentVideo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={youtubeThumb(recentVideo.id)} alt={recentVideo.title} />
                  <span className="ct-recent-duration">{formatDuration(recentVideo.duration_seconds)}</span>
                </a>
                <div className="ct-recent-title">{recentVideo.title}</div>
                <div className="row between small" style={{ marginTop: 6 }}>
                  <span className="muted">
                    <Icon name="eye" size={12} /> {formatCount(recentVideo.view_count)} views
                  </span>
                  <span className="muted tiny">{formatRelative(recentVideo.published_at)}</span>
                </div>
                <button
                  className="btn primary"
                  style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                  onClick={onMoreVideoAnalytics}
                >
                  <Icon name="chart" size={14} /> More video analytics
                </button>
              </div>
            ) : (
              <div className="small muted">No recent video found.</div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function pickMostRecentVideo(videos: VideoSummary[] | null | undefined): VideoSummary | null {
  if (!videos || videos.length === 0) return null
  return [...videos].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  )[0]
}

interface KpiCardProps {
  label: string
  value: string
  sub: string
  icon: string
  active: boolean
  onClick: () => void
  accentVar: string
  disabled?: boolean
}

function KpiCard({ label, value, sub, icon, active, onClick, accentVar, disabled }: KpiCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        'ct-kpi card' +
        (active ? ' active' : '') +
        (disabled ? ' disabled' : '')
      }
      style={{ '--ct-accent': `var(${accentVar})` } as React.CSSProperties}
    >
      <div className="row between" style={{ width: '100%' }}>
        <span className="ct-kpi-label">{label}</span>
        <span className="ct-kpi-icon"><Icon name={icon} size={14} /></span>
      </div>
      <div className="ct-kpi-value">{value}</div>
      <div className="ct-kpi-sub muted tiny">{sub}</div>
    </button>
  )
}

function LegendItem({
  color, label, value, pct, count, muted,
}: { color: string; label: string; value: string; pct: string; count: number; muted?: boolean }) {
  return (
    <div className={'ct-legend' + (muted ? ' muted-row' : '')}>
      <span className="ct-legend-dot" style={{ background: color }} />
      <div style={{ flex: 1 }}>
        <div className="row between">
          <b style={{ fontSize: 13 }}>{label}</b>
          <span className="small muted">{pct}</span>
        </div>
        <div className="row between">
          <span className="tiny muted">{count} uploads</span>
          <span className="tiny">{value} views</span>
        </div>
      </div>
    </div>
  )
}

// ---------- Videos list ----------

function VideosList({
  channel, stats, onOpen,
}: {
  channel: SavedChannel
  stats: ChannelStatsT
  onOpen: (videoId: string) => void
}) {
  const all = channel.recent_videos ?? []
  const [sort, setSort] = useState<VideoSort>('newest')
  const [format, setFormat] = useState<VideoFormat>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let arr = [...all]
    if (format === 'long') arr = arr.filter(v => v.duration_seconds > 60)
    else if (format === 'short') arr = arr.filter(v => v.duration_seconds <= 60)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      arr = arr.filter(v => v.title.toLowerCase().includes(q))
    }
    arr.sort((a, b) => {
      switch (sort) {
        case 'oldest': return new Date(a.published_at).getTime() - new Date(b.published_at).getTime()
        case 'views': return (b.view_count || 0) - (a.view_count || 0)
        case 'likes': return (b.like_count || 0) - (a.like_count || 0)
        case 'newest':
        default:
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      }
    })
    return arr
  }, [all, sort, format, search])

  return (
    <section className="card">
      <div className="row between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="h2">All videos</div>
          <div className="muted tiny" style={{ marginTop: 4 }}>
            {filtered.length} of {all.length} from {channel.channel_name} · sample of {stats.sample_size}
          </div>
        </div>

        <div className="ct-video-filters">
          <div className="ct-search-input">
            <Icon name="search" size={13} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title…"
            />
          </div>

          <div className="segmented sm">
            {(['all', 'long', 'short'] as VideoFormat[]).map(f => (
              <button key={f} className={format === f ? 'on' : ''} onClick={() => setFormat(f)}>
                {f === 'all' ? 'All' : f === 'long' ? 'Long' : 'Shorts'}
              </button>
            ))}
          </div>

          <select
            className="select sm"
            value={sort}
            onChange={e => setSort(e.target.value as VideoSort)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="views">Most viewed</option>
            <option value="likes">Most liked</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="small muted">No videos match your filters.</div>
      ) : (
        <div className="ct-video-grid">
          {filtered.map(v => (
            <button key={v.id} className="ct-video-card as-button" onClick={() => onOpen(v.id)}>
              <div className="ct-video-thumb">
                <img src={youtubeThumb(v.id)} alt={v.title} />
                <span className="ct-recent-duration">{formatDuration(v.duration_seconds)}</span>
                {v.duration_seconds <= 60 && <span className="ct-video-pill">Short</span>}
              </div>
              <div className="ct-video-title">{v.title}</div>
              <div className="row between small" style={{ marginTop: 6 }}>
                <span className="muted tiny">
                  <Icon name="eye" size={11} /> {formatCount(v.view_count)}
                </span>
                <span className="muted tiny">
                  <Icon name="heart" size={11} /> {formatCount(v.like_count)}
                </span>
                <span className="muted tiny">{formatRelative(v.published_at)}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

// ---------- Video detail ----------

function VideoDetailView({
  channel, videoId, onBack,
}: { channel: SavedChannel; videoId: string; onBack: () => void }) {
  const all = channel.recent_videos ?? []
  const video = all.find(v => v.id === videoId)
  const [compareId, setCompareId] = useState<string>('')

  if (!video) {
    return (
      <div className="card">
        <button className="btn" onClick={onBack}><Icon name="arrowLeft" size={14} /> Back</button>
        <div className="small muted" style={{ marginTop: 12 }}>Video not found.</div>
      </div>
    )
  }

  const hours = hoursSince(video.published_at)
  const viewsPerHour = (video.view_count || 0) / hours

  // Growth curve: model views accruing logarithmically since publish, ending at total view_count
  const points = 24
  const growthLabels = useMemo(() => buildVideoLabels(video.published_at, points), [video.published_at])
  const primarySeries = useMemo(
    () => buildVideoGrowth(video.view_count || 0, points, seedFromString(video.id)),
    [video.view_count, video.id],
  )
  const compareVideo = compareId ? all.find(v => v.id === compareId) : null
  const compareSeries = useMemo(
    () =>
      compareVideo
        ? buildVideoGrowth(compareVideo.view_count || 0, points, seedFromString(compareVideo.id))
        : null,
    [compareVideo],
  )

  // Recommended others — same format, sorted by closeness in views, top 12
  const recommendations = useMemo(() => {
    const myType = video.duration_seconds <= 60 ? 'short' : 'long'
    return all
      .filter(v => v.id !== video.id)
      .filter(v => (myType === 'short' ? v.duration_seconds <= 60 : v.duration_seconds > 60))
      .sort((a, b) =>
        Math.abs((a.view_count || 0) - (video.view_count || 0)) -
        Math.abs((b.view_count || 0) - (video.view_count || 0)),
      )
      .slice(0, 12)
  }, [all, video])

  const series: LineSeries[] = [{ data: primarySeries, color: 'var(--accent)', label: video.title }]
  if (compareSeries && compareVideo) {
    series.push({ data: compareSeries, color: 'var(--violet)', label: compareVideo.title })
  }

  return (
    <>
      <div className="row between" style={{ flexWrap: 'wrap', gap: 8 }}>
        <button className="btn" onClick={onBack}>
          <Icon name="arrowLeft" size={14} /> Back to all videos
        </button>
        <a
          className="btn"
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="play" size={14} /> Open on YouTube
        </a>
      </div>

      <section className="ct-video-detail">
        {/* LEFT — info card */}
        <div className="card">
          <a
            className="ct-recent-thumb"
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={youtubeThumb(video.id)} alt={video.title} />
            <span className="ct-recent-duration">{formatDuration(video.duration_seconds)}</span>
            {video.duration_seconds <= 60 && <span className="ct-video-pill">Short</span>}
          </a>
          <div className="ct-detail-title">{video.title}</div>
          <div className="muted small" style={{ marginTop: 4 }}>
            Uploaded {formatRelative(video.published_at)} · {new Date(video.published_at).toLocaleDateString()}
          </div>

          <div className="ct-detail-stats">
            <DetailStat icon="eye" label="Total views" value={formatCount(video.view_count)} />
            <DetailStat icon="heart" label="Likes" value={formatCount(video.like_count)} />
            <DetailStat icon="chat" label="Comments" value={formatCount(video.comment_count)} />
            <DetailStat
              icon="trend"
              label="Views / hour"
              value={formatCount(Math.round(viewsPerHour))}
              tone="accent"
            />
          </div>
        </div>

        {/* RIGHT — growth chart + compare */}
        <div className="card">
          <div className="row between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div className="h2">Video growth</div>
              <div className="muted tiny" style={{ marginTop: 4 }}>
                Cumulative views since publish
              </div>
            </div>
            <div className="ct-compare">
              <Icon name="split" size={13} />
              <select
                className="select sm"
                value={compareId}
                onChange={e => setCompareId(e.target.value)}
              >
                <option value="">Compare with…</option>
                {recommendations.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.title.length > 60 ? v.title.slice(0, 57) + '…' : v.title}
                  </option>
                ))}
              </select>
              {compareId && (
                <button className="btn ghost sm" onClick={() => setCompareId('')} aria-label="Clear comparison">
                  <Icon name="x" size={12} />
                </button>
              )}
            </div>
          </div>

          <LineChart series={series} labels={growthLabels} height={260} />

          {/* legend */}
          <div className="ct-detail-legend">
            <div className="row" style={{ gap: 8 }}>
              <span className="ct-legend-dot" style={{ background: 'var(--accent)' }} />
              <span className="small">{video.title}</span>
              <b className="small" style={{ marginLeft: 'auto' }}>
                {formatCount(video.view_count)} views
              </b>
            </div>
            {compareVideo && (
              <div className="row" style={{ gap: 8 }}>
                <span className="ct-legend-dot" style={{ background: 'var(--violet)' }} />
                <span className="small">{compareVideo.title}</span>
                <b className="small" style={{ marginLeft: 'auto' }}>
                  {formatCount(compareVideo.view_count)} views
                </b>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Suggestions row to add a comparison via click */}
      <section className="card">
        <div className="h2" style={{ marginBottom: 4 }}>Recommended to compare</div>
        <div className="muted tiny" style={{ marginBottom: 12 }}>
          Other {video.duration_seconds <= 60 ? 'shorts' : 'long-form videos'} with similar reach
        </div>
        {recommendations.length === 0 ? (
          <div className="small muted">No similar videos to compare with yet.</div>
        ) : (
          <div className="ct-compare-row">
            {recommendations.slice(0, 6).map(v => (
              <button
                key={v.id}
                className={'ct-compare-card' + (compareId === v.id ? ' on' : '')}
                onClick={() => setCompareId(compareId === v.id ? '' : v.id)}
              >
                <div className="ct-compare-thumb">
                  <img src={youtubeThumb(v.id)} alt={v.title} />
                </div>
                <div className="ct-compare-meta">
                  <div className="ct-compare-title">{v.title}</div>
                  <div className="muted tiny" style={{ marginTop: 2 }}>
                    {formatCount(v.view_count)} views · {formatRelative(v.published_at)}
                  </div>
                </div>
                <span className={'ct-compare-toggle' + (compareId === v.id ? ' on' : '')}>
                  <Icon name={compareId === v.id ? 'check' : 'plus'} size={12} />
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function DetailStat({
  icon, label, value, tone,
}: { icon: string; label: string; value: string; tone?: 'accent' }) {
  return (
    <div className={'ct-detail-stat' + (tone === 'accent' ? ' accent' : '')}>
      <span className="ct-detail-stat-icon"><Icon name={icon} size={13} /></span>
      <div>
        <div className="ct-detail-stat-label">{label}</div>
        <div className="ct-detail-stat-value">{value}</div>
      </div>
    </div>
  )
}

function buildVideoLabels(publishedIso: string, points: number): string[] {
  const start = new Date(publishedIso).getTime()
  const end = Date.now()
  const out: string[] = []
  for (let i = 0; i < points; i++) {
    const t = i / Math.max(1, points - 1)
    const d = new Date(start + (end - start) * t)
    const days = (end - d.getTime()) / (1000 * 60 * 60 * 24)
    if (days < 1) out.push('today')
    else if (days < 30) out.push(`${Math.round(days)}d`)
    else if (days < 365) out.push(`${Math.round(days / 30)}mo`)
    else out.push(`${(days / 365).toFixed(1)}y`)
  }
  return out
}

function buildVideoGrowth(totalViews: number, points: number, seed: number): number[] {
  if (totalViews <= 0) return new Array(points).fill(0)
  const rand = pseudoRandom(seed)
  const out: number[] = []
  for (let i = 0; i < points; i++) {
    const t = i / Math.max(1, points - 1)
    // Front-loaded log growth: most views accrue early, tail flattens
    const f = Math.log(1 + 9 * t) / Math.log(10)
    const noise = 1 + (rand() - 0.5) * 0.04
    out.push(Math.max(0, Math.round(totalViews * f * noise)))
  }
  out[out.length - 1] = Math.round(totalViews)
  return out
}

// ---------- Projections tab ----------

function ProjectionsTab({ stats }: { stats: ChannelStatsT }) {
  const cadence = Math.max(0.5, stats.videos_per_week)
  const avgViews = stats.average_views_per_video || 0
  const weeklyViews = avgViews * cadence
  const monthlyViews = weeklyViews * 4.33

  const currentSubs = stats.subscriber_count ?? 0
  const currentTotalViews = stats.total_views ?? 0

  // Compound monthly growth ≈ (1.18)^(1/12) − 1 ≈ 1.39 % / mo (≈ 18 %/yr)
  const MONTHLY_GROWTH = 0.0139

  const projectSubs = (months: number) =>
    Math.round(currentSubs * Math.pow(1 + MONTHLY_GROWTH, months))
  const projectViews = (months: number) =>
    Math.round(currentTotalViews + monthlyViews * months)

  // 30-day projections
  const subs30 = projectSubs(1)
  const subsGain30 = subs30 - currentSubs
  const views30Gain = Math.round(monthlyViews)
  const views30Total = projectViews(1)

  // Milestone table — every 3 months for 2 years (8 rows)
  const milestoneMonths = [3, 6, 9, 12, 15, 18, 21, 24]
  const today = new Date()
  const milestones = milestoneMonths.map(m => {
    const goalDate = new Date(today)
    goalDate.setMonth(goalDate.getMonth() + m)
    const subs = projectSubs(m)
    const views = projectViews(m)
    return {
      months: m,
      goalDateDisplay: formatDateDMY(goalDate),
      timeUntil: formatTimeUntil(m),
      subs,
      subsGain: subs - currentSubs,
      views,
      viewsGain: views - currentTotalViews,
    }
  })

  const milestone12mo = milestones.find(m => m.months === 12)!
  const nextSubMilestone = nextMilestone(currentSubs, milestone12mo.subs)
  const nextSubMilestoneRow = nextSubMilestone
    ? milestones.find(m => m.subs >= nextSubMilestone)
    : null

  return (
    <>
      {/* Hero — 30-day projection cards */}
      <section className="ct-projection-hero">
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Upcoming milestones
          </div>
          <h2 className="ct-section-title">
            Where you'll be in <em>30 days</em>
          </h2>
          <p className="muted small" style={{ marginTop: 6, maxWidth: 520, lineHeight: 1.5 }}>
            Forecast based on a cadence of {cadence.toFixed(1)} uploads per week and{' '}
            {formatCount(Math.round(avgViews))} average views — projected at a{' '}
            <b>{(MONTHLY_GROWTH * 100).toFixed(2)}% monthly</b> growth rate.
          </p>
        </div>

        <div className="ct-projection-cards">
          <div className="ct-projection-card views">
            <div className="ct-projection-icon">
              <Icon name="eye" size={18} />
            </div>
            <div className="ct-projection-label">Projected views</div>
            <div className="ct-projection-value">+{formatCount(views30Gain)}</div>
            <div className="ct-projection-sub">
              <Icon name="trend" size={11} />
              <span>{formatCount(views30Total)} total by {formatDateDMY(addMonths(today, 1))}</span>
            </div>
          </div>

          <div className="ct-projection-card subs">
            <div className="ct-projection-icon">
              <Icon name="users" size={18} />
            </div>
            <div className="ct-projection-label">Projected subscribers</div>
            <div className="ct-projection-value">+{formatCount(subsGain30)}</div>
            <div className="ct-projection-sub">
              <Icon name="trend" size={11} />
              <span>{formatCount(subs30)} total by {formatDateDMY(addMonths(today, 1))}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Highlight: closest round-number subs milestone */}
      {nextSubMilestone && nextSubMilestoneRow && (
        <section className="ct-milestone-highlight">
          <div className="ct-milestone-medal">
            <Icon name="star" size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow">Next badge in sight</div>
            <div className="ct-milestone-h">
              {formatCount(nextSubMilestone)} subscribers
            </div>
            <div className="muted small" style={{ marginTop: 2 }}>
              On track to hit it around{' '}
              <b>{nextSubMilestoneRow.goalDateDisplay}</b> · in{' '}
              {nextSubMilestoneRow.timeUntil} from today.
            </div>
          </div>
          <div className="ct-milestone-progress">
            <div className="ct-milestone-progress-bar">
              <span style={{
                width: `${Math.min(100, (currentSubs / nextSubMilestone) * 100)}%`,
              }} />
            </div>
            <div className="row between tiny muted" style={{ marginTop: 6 }}>
              <span>{formatCount(currentSubs)}</span>
              <span>{formatCount(nextSubMilestone)}</span>
            </div>
          </div>
        </section>
      )}

      {/* Milestones table */}
      <section className="card">
        <div className="row between" style={{ marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div className="h2">Milestone forecast</div>
            <div className="muted tiny" style={{ marginTop: 4 }}>
              Projections every 3 months for the next 2 years
            </div>
          </div>
          <span className="badge accent">
            <Icon name="calendar" size={11} /> 8 milestones
          </span>
        </div>

        <div className="ct-milestone-table-wrap">
          <table className="ct-milestone-table">
            <thead>
              <tr>
                <th>Goal date</th>
                <th>Time until</th>
                <th>Subscribers prediction</th>
                <th>Views prediction</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map(m => (
                <tr key={m.months}>
                  <td>
                    <div className="ct-milestone-date">
                      <span className="ct-milestone-date-dot" />
                      <b>{m.goalDateDisplay}</b>
                    </div>
                  </td>
                  <td>
                    <span className="chip sm">
                      <Icon name="clock" size={11} /> {m.timeUntil}
                    </span>
                  </td>
                  <td>
                    <div className="ct-milestone-cell">
                      <b>{formatCount(m.subs)}</b>
                      <span className="tiny ct-mint-pill">
                        +{formatCount(m.subsGain)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="ct-milestone-cell">
                      <b>{formatCount(m.views)}</b>
                      <span className="tiny ct-accent-pill">
                        +{formatCount(m.viewsGain)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="muted tiny" style={{ marginTop: 12, textAlign: 'right' }}>
          Subscribers projection compounds at {(MONTHLY_GROWTH * 100).toFixed(2)}%/mo · views model linear
          on current cadence.
        </div>
      </section>
    </>
  )
}

function addMonths(base: Date, months: number): Date {
  const d = new Date(base)
  d.setMonth(d.getMonth() + months)
  return d
}

// ---------- About tab ----------

function AboutTab({ channel, stats }: { channel: SavedChannel; stats: ChannelStatsT }) {
  const memberSince = (channel.recent_videos ?? [])
    .map(v => new Date(v.published_at).getTime())
    .filter(t => Number.isFinite(t))
  const oldestUpload = memberSince.length > 0 ? new Date(Math.min(...memberSince)) : null
  const youtubeUrl = channel.handle
    ? `https://www.youtube.com/${channel.handle.replace(/^@?/, '@')}`
    : `https://www.youtube.com/channel/${channel.youtube_channel_id}`

  return (
    <>
      {/* Description hero */}
      <section className="ct-about-hero card">
        <div className="row between" style={{ flexWrap: 'wrap', gap: 16, marginBottom: 14 }}>
          <div>
            <div className="eyebrow">About</div>
            <h2 className="ct-section-title" style={{ marginTop: 4 }}>
              Inside <em>{stats.channel_name}</em>
            </h2>
          </div>
          <a
            className="btn accent"
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="play" size={14} /> Open on YouTube
          </a>
        </div>

        {channel.description ? (
          <p className="ct-about-description">{channel.description}</p>
        ) : (
          <p className="muted small" style={{ fontStyle: 'italic' }}>
            This channel hasn't set a public description.
          </p>
        )}
      </section>

      {/* At-a-glance stats grid */}
      <section className="ct-about-stats">
        <AboutStat
          icon="users"
          label="Subscribers"
          value={formatCount(stats.subscriber_count)}
          accent="--violet"
        />
        <AboutStat
          icon="eye"
          label="Total views"
          value={formatCount(stats.total_views)}
          accent="--accent"
        />
        <AboutStat
          icon="film"
          label="Videos"
          value={formatCount(stats.video_count)}
          accent="--sky"
        />
        <AboutStat
          icon="trend"
          label="Engagement"
          value={`${(stats.engagement_rate * 100).toFixed(1)}%`}
          accent="--mint"
        />
      </section>

      {/* Channel info + Quick links */}
      <section className="ct-about-grid">
        <div className="card">
          <div className="row between" style={{ marginBottom: 14 }}>
            <div className="h2">Channel info</div>
            <button
              className="btn ghost sm"
              onClick={() => navigator.clipboard?.writeText(channel.youtube_channel_id)}
              title="Copy channel ID"
            >
              <Icon name="copy" size={12} /> Copy ID
            </button>
          </div>

          <div className="ct-info-list">
            <InfoRow icon="hash" label="Channel name" value={<b>{stats.channel_name}</b>} />
            {channel.handle && (
              <InfoRow icon="tag" label="Handle" value={channel.handle} />
            )}
            <InfoRow
              icon="link"
              label="YouTube ID"
              value={<span className="kbd">{channel.youtube_channel_id}</span>}
            />
            <InfoRow
              icon="clock"
              label="Average length"
              value={formatDuration(stats.average_duration_seconds)}
            />
            <InfoRow
              icon="calendar"
              label="Publish cadence"
              value={`${stats.videos_per_week.toFixed(2)} uploads / week`}
            />
            <InfoRow
              icon="heart"
              label="Engagement rate"
              value={`${(stats.engagement_rate * 100).toFixed(2)}%`}
            />
            <InfoRow
              icon="chart"
              label="Avg views / video"
              value={formatCount(stats.average_views_per_video)}
            />
            {oldestUpload && (
              <InfoRow
                icon="film"
                label="Oldest sampled upload"
                value={oldestUpload.toLocaleDateString()}
              />
            )}
            <InfoRow
              icon="refresh"
              label="Last refreshed"
              value={new Date(stats.last_refreshed_at).toLocaleString()}
            />
          </div>
        </div>

        <div className="ct-quick-links">
          <div className="card tinted">
            <div className="h2" style={{ marginBottom: 4 }}>Quick links</div>
            <div className="muted tiny" style={{ marginBottom: 14 }}>
              Jump straight to the channel on YouTube
            </div>

            <div className="col" style={{ gap: 8 }}>
              <LinkTile
                icon="play"
                label="Channel home"
                sub="youtube.com"
                href={youtubeUrl}
              />
              <LinkTile
                icon="film"
                label="All videos"
                sub="Sorted by newest"
                href={`https://www.youtube.com/channel/${channel.youtube_channel_id}/videos`}
              />
              <LinkTile
                icon="users"
                label="Community / About"
                sub="Bio, links and contact"
                href={`https://www.youtube.com/channel/${channel.youtube_channel_id}/about`}
              />
              <LinkTile
                icon="search"
                label="Search this channel"
                sub="Open YouTube search"
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(stats.channel_name)}`}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function AboutStat({
  icon, label, value, accent,
}: { icon: string; label: string; value: string; accent: string }) {
  return (
    <div
      className="ct-about-stat card"
      style={{ '--ct-accent': `var(${accent})` } as React.CSSProperties}
    >
      <div className="ct-about-stat-icon"><Icon name={icon} size={16} /></div>
      <div>
        <div className="ct-about-stat-label">{label}</div>
        <div className="ct-about-stat-value">{value}</div>
      </div>
    </div>
  )
}

function InfoRow({
  icon, label, value,
}: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <div className="ct-info-row">
      <span className="ct-info-icon"><Icon name={icon} size={13} /></span>
      <span className="ct-info-label">{label}</span>
      <span className="ct-info-value">{value}</span>
    </div>
  )
}

function LinkTile({
  icon, label, sub, href,
}: { icon: string; label: string; sub: string; href: string }) {
  return (
    <a
      className="ct-link-tile"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="ct-link-icon"><Icon name={icon} size={14} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="ct-link-label">{label}</span>
        <span className="ct-link-sub">{sub}</span>
      </span>
      <Icon name="arrowRight" size={14} />
    </a>
  )
}
