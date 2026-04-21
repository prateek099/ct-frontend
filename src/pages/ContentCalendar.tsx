import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface CalEvent {
  day: number
  title: string
  color: string
  time: string
}

const EVENTS: CalEvent[] = [
  { day: 1,  title: 'AI Tools Deep-Dive',          color: 'coral',  time: '10:00' },
  { day: 1,  title: 'Thumbnail batch',              color: 'violet', time: '14:00' },
  { day: 3,  title: 'Creator Economy Roundup',      color: 'mint',   time: '11:00' },
  { day: 4,  title: 'Shorts: 60s productivity tip', color: 'amber',  time: '08:00' },
  { day: 5,  title: 'Weekly Studio Vlog',           color: 'coral',  time: '09:00' },
  { day: 6,  title: 'Batch filming session',        color: 'sky',    time: '13:00' },
]

const UPCOMING = [
  { title: 'AI Tools Deep-Dive', date: 'Mon, Apr 22', status: 'Scheduled',  badge: 'mint'  },
  { title: 'Creator Economy Q2', date: 'Wed, Apr 24', status: 'Draft',      badge: 'amber' },
  { title: 'Studio Vlog #14',    date: 'Fri, Apr 26', status: 'Filming',    badge: 'violet' },
]

export default function ContentCalendar() {
  const [view, setView] = useState<'Week' | 'Month'>('Week')

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Plan"
        code="T10"
        icon="calendar"
        title={<>Content <em>calendar</em></>}
        subtitle="Plan and schedule your publishing cadence."
        actions={
          <>
            <button className="btn"><Icon name="plus" size={14} /> Add event</button>
            <button className="btn primary"><Icon name="save" size={14} /> Save</button>
          </>
        }
      />

      {/* View toggle */}
      <div className="row" style={{ gap: 12 }}>
        <div className="segmented">
          {(['Week', 'Month'] as const).map(v => (
            <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{v}</button>
          ))}
        </div>
        <button className="btn sm ghost"><Icon name="arrowLeft" size={13} /></button>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Apr 22 – 28, 2024</span>
        <button className="btn sm ghost"><Icon name="arrowRight" size={13} /></button>
      </div>

      <div className="grid-2-1" style={{ alignItems: 'start' }}>
        {/* Calendar grid */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--line)' }}>
            {DAYS.map((d, i) => (
              <div key={d} style={{
                padding: '10px 8px',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: 12,
                background: i === 0 ? 'var(--accent-tint)' : 'transparent',
                borderRight: i < 6 ? '1px solid var(--line)' : 'none',
              }}>
                <div className="eyebrow">{d}</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{22 + i}</div>
              </div>
            ))}
          </div>

          {/* Event rows */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: 260 }}>
            {DAYS.map((_, colIdx) => {
              const dayEvents = EVENTS.filter(e => e.day === colIdx)
              return (
                <div key={colIdx} style={{
                  borderRight: colIdx < 6 ? '1px solid var(--line)' : 'none',
                  padding: 6,
                  minHeight: 260,
                  background: colIdx === 0 ? 'var(--accent-tint)' : 'transparent',
                }}>
                  {dayEvents.map((ev, ei) => (
                    <div key={ei} className={`thumb ${ev.color}`} style={{
                      height: 'auto',
                      aspectRatio: 'unset',
                      padding: '5px 7px',
                      marginBottom: 6,
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      display: 'block',
                      lineHeight: 1.3,
                      cursor: 'pointer',
                    }}>
                      <div style={{ opacity: 0.8, marginBottom: 2 }}>{ev.time}</div>
                      {ev.title}
                    </div>
                  ))}
                  <button className="btn sm ghost" style={{ width: '100%', marginTop: 4, fontSize: 11, opacity: 0.5 }}>
                    <Icon name="plus" size={11} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming sidebar */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="h2" style={{ marginBottom: 14 }}>Upcoming</div>
            <div className="col" style={{ gap: 10 }}>
              {UPCOMING.map((item, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-soft)', border: '1px solid var(--line)' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{item.title}</div>
                  <div className="row between">
                    <span className="tiny muted">{item.date}</span>
                    <span className={`badge ${item.badge}`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card tinted">
            <div className="h2" style={{ marginBottom: 10 }}>Cadence insight</div>
            <div className="col" style={{ gap: 8 }}>
              {[
                { label: 'Target',         val: '2× / week' },
                { label: 'Streak',         val: '6 weeks' },
                { label: 'Next publish',   val: 'Mon 10:00' },
                { label: 'Best day',       val: 'Tuesday' },
              ].map(r => (
                <div key={r.label} className="row between small">
                  <span className="muted">{r.label}</span>
                  <b>{r.val}</b>
                </div>
              ))}
            </div>
          </div>

          <button className="btn accent" style={{ width: '100%', justifyContent: 'center' }}>
            <Icon name="sparkles" size={14} /> Auto-fill calendar
          </button>
        </div>
      </div>
    </div>
  )
}
