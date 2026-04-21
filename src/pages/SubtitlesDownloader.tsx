import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Auto-detect']
const FORMATS    = ['SRT', 'VTT', 'TXT']

const MOCK_SUBTITLES = `1
00:00:00,000 --> 00:00:03,200
Hey, what's up everyone — welcome back to the channel.

2
00:00:03,400 --> 00:00:07,800
Today I'm pulling back the curtain on the exact YouTube growth strategy

3
00:00:07,900 --> 00:00:12,100
that took me from zero to a hundred thousand subscribers in just 11 months.

4
00:00:12,400 --> 00:00:16,600
This isn't about lucky breaks. There's a very specific system I've built.

5
00:00:16,800 --> 00:00:21,200
And I'm going to hand it to you piece by piece.

6
00:00:21,500 --> 00:00:26,000
Stick around until the end — I've got a free resource that ties everything together.

7
00:00:26,200 --> 00:00:28,000
Let's get into it.`

export default function SubtitlesDownloader() {
  const [url, setUrl]         = useState('')
  const [fetched, setFetched] = useState(false)
  const [language, setLanguage] = useState('English')
  const [format, setFormat]   = useState('SRT')

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Utilities"
        code="T18"
        icon="download"
        title={<>Subtitles <em>downloader</em></>}
        subtitle="Download captions from any YouTube video in SRT, VTT, or TXT."
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
          <button className="btn accent" onClick={() => setFetched(true)}>
            <Icon name="search" size={14} /> Fetch
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="card">
        <div className="row wrap" style={{ gap: 24 }}>
          <div>
            <div className="field-label" style={{ marginBottom: 8 }}>Language</div>
            <div className="row wrap" style={{ gap: 6 }}>
              {LANGUAGES.map(l => (
                <button
                  key={l}
                  className={`chip sm${language === l ? ' filled' : ''}`}
                  onClick={() => setLanguage(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="field-label" style={{ marginBottom: 8 }}>Format</div>
            <div className="segmented">
              {FORMATS.map(f => (
                <button key={f} className={format === f ? 'on' : ''} onClick={() => setFormat(f)}>{f}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview + download */}
      {fetched && (
        <section className="grid-2-1">
          <div className="card">
            <div className="row between" style={{ marginBottom: 12 }}>
              <div className="h2">Preview — {format}</div>
              <div className="row" style={{ gap: 6 }}>
                <span className="badge mint">{language}</span>
                <span className="chip sm">{MOCK_SUBTITLES.split('\n\n').length} cues</span>
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
              {MOCK_SUBTITLES}
            </div>

            <div className="row" style={{ gap: 8 }}>
              <button className="btn accent" style={{ flex: 1, justifyContent: 'center' }}>
                <Icon name="download" size={14} /> Download .{format.toLowerCase()}
              </button>
              <button className="btn" onClick={() => navigator.clipboard?.writeText(MOCK_SUBTITLES)}>
                <Icon name="copy" size={14} /> Copy
              </button>
            </div>
          </div>

          <div className="col" style={{ gap: 16 }}>
            <div className="card">
              <div className="h2" style={{ marginBottom: 12 }}>Video info</div>
              <div className="thumb coral" style={{ marginBottom: 12, borderRadius: 10, fontSize: 12 }}>PREVIEW</div>
              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, marginBottom: 6 }}>
                10 AI Tools That Will Change Content Creation Forever
              </div>
              <div className="small muted">TechCreator · 14:22</div>
            </div>

            <div className="card tinted">
              <div className="h2" style={{ marginBottom: 10 }}>Available languages</div>
              <div className="col" style={{ gap: 6 }}>
                {['English (manual)', 'Spanish (auto)', 'French (auto)', 'German (auto)'].map(l => (
                  <div key={l} className="row" style={{ gap: 8 }}>
                    <Icon name="check" size={12} />
                    <span className="small">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
