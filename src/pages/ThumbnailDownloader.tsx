import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'

interface Resolution {
  label: string
  size: string
  width: number
  height: number
  badge: string
  color: string
}

const RESOLUTIONS: Resolution[] = [
  { label: 'Max',  size: '1280×720', width: 1280, height: 720, badge: 'mint',   color: 'coral'  },
  { label: 'HD',   size: '640×480',  width: 640,  height: 480, badge: 'amber',  color: 'violet' },
  { label: 'SD',   size: '320×180',  width: 320,  height: 180, badge: 'sky',    color: 'mint'   },
]

export default function ThumbnailDownloader() {
  const [url, setUrl]       = useState('')
  const [fetched, setFetched] = useState(false)

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Utilities"
        code="T17"
        icon="download"
        title={<>Thumbnail <em>downloader</em></>}
        subtitle="Download any YouTube video's thumbnail in max resolution."
      />

      {/* URL input */}
      <div className="card">
        <div className="field-label">YouTube video URL</div>
        <div className="row" style={{ gap: 10 }}>
          <input
            className="input"
            style={{ flex: 1 }}
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=…"
          />
          <button
            className="btn accent"
            onClick={() => setFetched(true)}
            disabled={!url.trim()}
          >
            <Icon name="search" size={14} /> Fetch
          </button>
        </div>
        {!url.trim() && (
          <div className="small muted" style={{ marginTop: 8 }}>
            Paste any YouTube video URL — works with youtube.com and youtu.be links.
          </div>
        )}
      </div>

      {fetched && (
        <>
          {/* Video title strip */}
          <div className="card tinted">
            <div className="row" style={{ gap: 12 }}>
              <div className="thumb coral" style={{ width: 80, height: 45, flexShrink: 0, borderRadius: 8, fontSize: 10 }}>
                PREVIEW
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>10 AI Tools That Will Change Content Creation Forever</div>
                <div className="small muted" style={{ marginTop: 4 }}>TechCreator · 2.4M views · 3 days ago</div>
              </div>
            </div>
          </div>

          {/* Resolution cards */}
          <div className="grid-3">
            {RESOLUTIONS.map(r => (
              <div key={r.label} className="card" style={{ textAlign: 'center' }}>
                <span className={`badge ${r.badge}`} style={{ marginBottom: 12 }}>{r.label}</span>
                <div className={`thumb ${r.color}`} style={{ marginBottom: 12, borderRadius: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{r.size}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-serif)' }}>{r.size}</div>
                <div className="small muted" style={{ marginTop: 4, marginBottom: 14 }}>
                  {r.width * r.height / 1000}K pixels
                </div>
                <button className="btn accent" style={{ width: '100%', justifyContent: 'center' }}>
                  <Icon name="download" size={14} /> Download
                </button>
              </div>
            ))}
          </div>

          <div className="card tinted">
            <div className="small" style={{ lineHeight: 1.6 }}>
              <b>Note:</b> Max resolution thumbnails (1280×720) are only available if the creator uploaded a custom thumbnail. If unavailable, the best available resolution will be returned automatically.
            </div>
          </div>
        </>
      )}
    </div>
  )
}
