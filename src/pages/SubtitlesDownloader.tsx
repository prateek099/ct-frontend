import { useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'
import { useFetchSubtitles } from '../api/useSubtitles'
import { getApiErrorMessage } from '../types/api'
import type { SubtitlesResponse } from '../types/subtitle'

const LANGUAGES: { label: string; code: string }[] = [
  { label: 'English', code: 'en' },
  { label: 'Spanish', code: 'es' },
  { label: 'French',  code: 'fr' },
  { label: 'German',  code: 'de' },
  { label: 'Portuguese', code: 'pt' },
]

type FormatKey = 'SRT' | 'VTT' | 'TXT'
const FORMATS: FormatKey[] = ['SRT', 'VTT', 'TXT']

function buildTxt(data: SubtitlesResponse): string {
  return data.entries.map(e => e.text).join('\n')
}

function pickBody(data: SubtitlesResponse, fmt: FormatKey): string {
  if (fmt === 'SRT') return data.srt
  if (fmt === 'VTT') return data.vtt
  return buildTxt(data)
}

function saveBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(href)
}

export default function SubtitlesDownloader() {
  const [url, setUrl] = useState('')
  const [langCode, setLangCode] = useState('en')
  const [format, setFormat] = useState<FormatKey>('SRT')

  const fetchSubs = useFetchSubtitles()
  const data = fetchSubs.data

  const previewBody = useMemo(
    () => (data ? pickBody(data, format) : ''),
    [data, format],
  )

  const handleFetch = () => {
    if (!url.trim()) return
    fetchSubs.mutate({ url: url.trim(), language: langCode })
  }

  const handleDownload = () => {
    if (!data) return
    const ext = format.toLowerCase()
    const mime =
      format === 'SRT'
        ? 'application/x-subrip'
        : format === 'VTT'
          ? 'text/vtt'
          : 'text/plain'
    saveBlob(previewBody, `${data.video_id}.${ext}`, mime)
  }

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Utilities"
        code="T18"
        icon="download"
        title={<>Subtitles <em>downloader</em></>}
        subtitle="Download captions from any YouTube video in SRT, VTT, or TXT."
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
            disabled={!url.trim() || fetchSubs.isPending}
          >
            {fetchSubs.isPending ? (
              <><Icon name="refresh" size={14} className="spin" /> Fetching…</>
            ) : (
              <><Icon name="search" size={14} /> Fetch</>
            )}
          </button>
        </div>
        {fetchSubs.isError && (
          <div className="error-row" style={{ marginTop: 10 }}>
            <Icon name="x" size={13} />
            {getApiErrorMessage(fetchSubs.error, 'Failed to fetch subtitles.')}
          </div>
        )}
      </div>

      <div className="card">
        <div className="row wrap" style={{ gap: 24 }}>
          <div>
            <div className="field-label" style={{ marginBottom: 8 }}>Language</div>
            <div className="row wrap" style={{ gap: 6 }}>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  className={`chip sm${langCode === l.code ? ' filled' : ''}`}
                  onClick={() => setLangCode(l.code)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="field-label" style={{ marginBottom: 8 }}>Format</div>
            <div className="segmented">
              {FORMATS.map(f => (
                <button
                  key={f}
                  className={format === f ? 'on' : ''}
                  onClick={() => setFormat(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {data && (
        <section className="grid-2-1">
          <div className="card">
            <div className="row between" style={{ marginBottom: 12 }}>
              <div className="h2">Preview — {format}</div>
              <div className="row" style={{ gap: 6 }}>
                <span className="badge mint">{data.language}</span>
                <span className="chip sm">{data.entries.length} cues</span>
              </div>
            </div>

            <div style={{
              maxHeight: 320, overflowY: 'auto',
              background: 'var(--bg-sunken)', borderRadius: 10,
              padding: '12px 14px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 12, lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              marginBottom: 14,
            }}>
              {previewBody}
            </div>

            <div className="row" style={{ gap: 8 }}>
              <button
                className="btn accent"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleDownload}
              >
                <Icon name="download" size={14} /> Download .{format.toLowerCase()}
              </button>
              <button
                className="btn"
                onClick={() => navigator.clipboard?.writeText(previewBody)}
              >
                <Icon name="copy" size={14} /> Copy
              </button>
            </div>
          </div>

          <div className="col" style={{ gap: 16 }}>
            <div className="card">
              <div className="h2" style={{ marginBottom: 12 }}>Video info</div>
              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, marginBottom: 6 }}>
                Video ID: <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{data.video_id}</span>
              </div>
              <div className="small muted">
                {data.entries.length} cues · language: {data.language}
              </div>
            </div>

            <div className="card tinted">
              <div className="small" style={{ lineHeight: 1.6 }}>
                <b>Heads up:</b> Subtitles come from YouTube's transcript endpoint. Some videos have transcripts disabled or only offer machine-generated captions — try a different language if the fetch fails.
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
