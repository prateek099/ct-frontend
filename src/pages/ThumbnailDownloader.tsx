import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'
import { useFetchThumbnails } from '../api/useThumbnails'
import { getApiErrorMessage } from '../types/api'
import type { ThumbnailResponse } from '../types/thumbnail'

interface Variant {
  key: keyof ThumbnailResponse['thumbnails']
  label: string
  size: string
  badge: string
  color: string
}

const VARIANTS: Variant[] = [
  { key: 'maxres',   label: 'Max',      size: '1280×720', badge: 'mint',   color: 'coral'  },
  { key: 'standard', label: 'Standard', size: '640×480',  badge: 'amber',  color: 'violet' },
  { key: 'high',     label: 'High',     size: '480×360',  badge: 'sky',    color: 'mint'   },
]

async function downloadUrl(url: string, filename: string) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Image not available at this resolution.')
    const blob = await res.blob()
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(href)
  } catch {
    window.open(url, '_blank', 'noopener')
  }
}

export default function ThumbnailDownloader() {
  const [url, setUrl] = useState('')
  const fetchThumbs = useFetchThumbnails()
  const data = fetchThumbs.data

  const handleFetch = () => {
    if (!url.trim()) return
    fetchThumbs.mutate(url.trim())
  }

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Utilities"
        code="T17"
        icon="download"
        title={<>Thumbnail <em>downloader</em></>}
        subtitle="Download any YouTube video's thumbnail in max resolution."
      />

      <div className="card">
        <div className="field-label">YouTube video URL</div>
        <div className="row" style={{ gap: 10 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=…"
            onKeyDown={e => {
              if (e.key === 'Enter') handleFetch()
            }}
          />
          <button
            className="btn accent"
            onClick={handleFetch}
            disabled={!url.trim() || fetchThumbs.isPending}
          >
            {fetchThumbs.isPending ? (
              <><Icon name="refresh" size={14} className="spin" /> Fetching…</>
            ) : (
              <><Icon name="search" size={14} /> Fetch</>
            )}
          </button>
        </div>
        {fetchThumbs.isError && (
          <div className="error-row" style={{ marginTop: 10 }}>
            <Icon name="x" size={13} />
            {getApiErrorMessage(fetchThumbs.error, 'Failed to fetch thumbnails.')}
          </div>
        )}
        {!url.trim() && !fetchThumbs.isPending && (
          <div className="small muted" style={{ marginTop: 8 }}>
            Paste any YouTube video URL — works with youtube.com, youtu.be, and /shorts/ links.
          </div>
        )}
      </div>

      {data && (
        <>
          <div className="card tinted">
            <div className="row" style={{ gap: 12, alignItems: 'center' }}>
              <img
                src={data.thumbnails.medium}
                alt=""
                style={{
                  width: 80,
                  height: 45,
                  borderRadius: 8,
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {data.title || data.video_id}
                </div>
                <div className="small muted" style={{ marginTop: 4 }}>
                  {data.channel_name || 'YouTube'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid-3">
            {VARIANTS.map(v => {
              const src = data.thumbnails[v.key]
              const filename = `${data.video_id}_${v.key}.jpg`
              return (
                <div key={v.key} className="card" style={{ textAlign: 'center' }}>
                  <span className={`badge ${v.badge}`} style={{ marginBottom: 12 }}>{v.label}</span>
                  <img
                    src={src}
                    alt={`${v.label} thumbnail`}
                    className={`thumb ${v.color}`}
                    style={{
                      marginBottom: 12,
                      borderRadius: 10,
                      width: '100%',
                      aspectRatio: '16 / 9',
                      objectFit: 'cover',
                    }}
                    onError={e => {
                      // Prateek: maxres often 404s when the creator did not upload a custom thumbnail.
                      (e.currentTarget as HTMLImageElement).style.opacity = '0.3'
                    }}
                  />
                  <div style={{ fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-serif)' }}>
                    {v.size}
                  </div>
                  <button
                    className="btn accent"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
                    onClick={() => downloadUrl(src, filename)}
                  >
                    <Icon name="download" size={14} /> Download
                  </button>
                </div>
              )
            })}
          </div>

          <div className="card tinted">
            <div className="small" style={{ lineHeight: 1.6 }}>
              <b>Note:</b> Max resolution (1280×720) is only available when the creator uploaded a custom thumbnail — otherwise the image may fail to load. Standard and High always resolve.
            </div>
          </div>
        </>
      )}
    </div>
  )
}
