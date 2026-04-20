import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'

const INITIAL_TAGS =
  'youtube growth, how to grow on youtube, youtube algorithm 2024, grow youtube channel fast, ' +
  'youtube tips for beginners, get more views youtube, youtube seo tips, increase watch time, ' +
  'youtube monetization, youtube channel growth strategy, content creator tips, youtube success'

const SUGGESTIONS = [
  'youtube shorts strategy',
  'video SEO',
  'creator economy',
  'thumbnail design',
  'youtube analytics',
  'faceless youtube',
]

const TAG_SCORE_BARS = [
  { label: 'Broad reach',     v: 85, color: 'mint' },
  { label: 'Niche relevance', v: 72, color: 'mint' },
  { label: 'Competition',     v: 48, color: 'amber' },
  { label: 'Search volume',   v: 91, color: 'mint' },
  { label: 'Trend velocity',  v: 63, color: 'amber' },
]

const CHAR_LIMIT = 500

export default function TagsGenerator() {
  const [tags, setTags] = useState(INITIAL_TAGS)
  const charsUsed = tags.length
  const pct = Math.min((charsUsed / CHAR_LIMIT) * 100, 100)
  const overLimit = charsUsed > CHAR_LIMIT

  const addSuggestion = (s: string) => {
    const current = tags.trimEnd()
    if (!current.includes(s)) {
      const next = current ? current + ', ' + s : s
      if (next.length <= CHAR_LIMIT) setTags(next)
    }
  }

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Step 6 of 6 · Packaging"
        code="T6"
        icon="hash"
        title={<>Tags <em>generator</em></>}
        subtitle="Auto-generate YouTube tags optimised for search. 500-char limit."
        actions={
          <>
            <Link to="/thumbnail" className="btn"><Icon name="arrowLeft" size={14} /> Back</Link>
            <button className="btn" onClick={() => navigator.clipboard?.writeText(tags)}>
              <Icon name="copy" size={14} /> Copy tags
            </button>
            <button className="btn primary">
              <Icon name="check" size={14} /> Finish
            </button>
          </>
        }
      />

      <section className="grid-2-1">
        {/* Left */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="row between" style={{ marginBottom: 10 }}>
              <div className="h2">YouTube Tags</div>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn sm ghost"><Icon name="refresh" size={12} /> Regenerate</button>
                <button className="btn sm ghost" onClick={() => navigator.clipboard?.writeText(tags)}>
                  <Icon name="copy" size={12} />
                </button>
              </div>
            </div>

            <textarea
              className="textarea"
              style={{ minHeight: 160, fontSize: 13 }}
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3…"
            />

            {/* Progress bar */}
            <div style={{ marginTop: 10 }}>
              <div className="row between small" style={{ marginBottom: 4 }}>
                <span className={overLimit ? 'accent' : 'muted'}>
                  {charsUsed} / {CHAR_LIMIT} chars
                </span>
                {overLimit && <span className="badge accent">Over limit</span>}
              </div>
              <div className={'bar ' + (overLimit ? 'accent' : pct > 80 ? 'amber' : 'mint')}>
                <i style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="h2" style={{ marginBottom: 10 }}>Suggested tags</div>
            <div className="small muted" style={{ marginBottom: 12 }}>Click to add to your tag list.</div>
            <div className="row wrap" style={{ gap: 6 }}>
              {SUGGESTIONS.map(s => {
                const added = tags.includes(s)
                return (
                  <button
                    key={s}
                    className={'chip' + (added ? ' mint' : '')}
                    onClick={() => addSuggestion(s)}
                    disabled={added}
                  >
                    {added ? <><Icon name="check" size={11} /> {s}</> : <><Icon name="plus" size={11} /> {s}</>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="h2" style={{ marginBottom: 14 }}>Tag score</div>
            <div className="col" style={{ gap: 10 }}>
              {TAG_SCORE_BARS.map(b => (
                <div key={b.label}>
                  <div className="row between small">
                    <span>{b.label}</span>
                    <b>{b.v}%</b>
                  </div>
                  <div className={`bar ${b.color}`} style={{ marginTop: 4 }}>
                    <i style={{ width: `${b.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="row" style={{ marginTop: 14, justifyContent: 'space-between' }}>
              <span className="small muted">Overall</span>
              <span className="badge mint">74 / 100</span>
            </div>
          </div>

          <div className="card tinted">
            <div className="h2" style={{ marginBottom: 10 }}>Tips</div>
            <ul className="col" style={{ gap: 8, paddingLeft: 0, listStyle: 'none' }}>
              {[
                'Use 10–15 tags for best results.',
                'Mix broad (1–2 words) with specific long-tail tags.',
                'Repeat your primary keyword exactly as it appears in your title.',
                'Avoid irrelevant tags — YouTube may penalise keyword stuffing.',
              ].map(tip => (
                <li key={tip} className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
                  <Icon name="check" size={12} />
                  <span className="small">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
