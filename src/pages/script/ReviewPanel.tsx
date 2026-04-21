import { Link } from 'react-router-dom'
import Icon from '../../components/shared/Icon'

const CHECKLIST = [
  { label: 'Hook in first 8 seconds',  done: true },
  { label: 'Clear thesis by 0:30',     done: true },
  { label: 'Pattern interrupt ≤ 90s',  done: true },
  { label: 'CTA placed before 70%',    done: false, hint: 'Suggest at 2:40' },
  { label: 'Emotion arc has a dip',    done: false, hint: 'Cut aside at 1:40' },
]

interface Props {
  hasScript: boolean
}

export default function ReviewPanel({ hasScript }: Props) {
  return (
    <div className="col" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-title">
          <div>
            <h3 className="h2">Script Review</h3>
            <div className="small muted" style={{ marginTop: 4 }}>Live quality check</div>
          </div>
          <span className="chip accent" style={{ fontWeight: 700 }}>
            {hasScript ? '78 / 100' : '—'}
          </span>
        </div>
        <div className="col" style={{ gap: 8 }}>
          {CHECKLIST.map(c => (
            <div key={c.label} className="row"
              style={{ gap: 10, padding: '8px 10px', borderRadius: 8, background: c.done ? 'transparent' : 'var(--bg-soft)' }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                background: c.done ? 'var(--mint)' : 'var(--bg-sunken)',
                color: c.done ? 'white' : 'var(--ink-3)',
                display: 'grid', placeItems: 'center',
              }}>
                <Icon name={c.done ? 'check' : 'x'} size={11} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.label}</div>
                {c.hint && <div className="tiny muted">{c.hint}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasScript && (
        <div className="card dark">
          <div className="row between" style={{ marginBottom: 12 }}>
            <div className="row" style={{ gap: 8 }}>
              <span className="pulse" />
              <span style={{ fontSize: 12, opacity: 0.75 }}>AI suggestion · live</span>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.45 }}>
            Hook lands well. Consider moving your CTA earlier — aim for the <b style={{ color: 'var(--accent)' }}>65–70%</b> mark for maximum retention.
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title"><h3 className="h2">Pipeline handoff</h3></div>
        <div className="col" style={{ gap: 8 }}>
          <Link to="/title" className="row between" style={{ padding: 10, border: '1px solid var(--line)', borderRadius: 10 }}>
            <span className="row" style={{ gap: 8 }}><Icon name="tag" size={14} /> Generate titles</span>
            <Icon name="arrowRight" size={14} />
          </Link>
          <Link to="/voiceover" className="row between" style={{ padding: 10, border: '1px solid var(--line)', borderRadius: 10 }}>
            <span className="row" style={{ gap: 8 }}><Icon name="mic" size={14} /> AI voiceover</span>
            <Icon name="arrowRight" size={14} />
          </Link>
          <Link to="/review" className="row between" style={{ padding: 10, border: '1px solid var(--line)', borderRadius: 10 }}>
            <span className="row" style={{ gap: 8 }}><Icon name="sparkles" size={14} /> Deep script review</span>
            <Icon name="arrowRight" size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
