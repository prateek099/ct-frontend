import { useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'
import {
  useCalendarEvents,
  useCreateEvent,
  useDeleteEvent,
} from '../api/useCalendar'
import type { CalendarEvent, CalendarEventType } from '../types/calendar'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const EVENT_COLOR: Record<CalendarEventType, string> = {
  record: 'coral',
  edit: 'violet',
  publish: 'mint',
  custom: 'amber',
}

function startOfWeek(d: Date): Date {
  const out = new Date(d)
  const day = (out.getDay() + 6) % 7 // Mon=0
  out.setDate(out.getDate() - day)
  out.setHours(0, 0, 0, 0)
  return out
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + n)
  return out
}

function formatRange(from: Date, to: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${from.toLocaleDateString(undefined, opts)} – ${to.toLocaleDateString(undefined, opts)}, ${to.getFullYear()}`
}

function dayOfWeek(iso: string, weekStart: Date): number {
  const d = new Date(iso)
  const diff = Math.floor(
    (d.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000),
  )
  return diff
}

export default function ContentCalendar() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [showAdd, setShowAdd] = useState(false)

  const weekEnd = addDays(weekStart, 7)
  const { data: events = [] } = useCalendarEvents({
    from: weekStart.toISOString(),
    to: weekEnd.toISOString(),
  })

  const createEvent = useCreateEvent()
  const deleteEvent = useDeleteEvent()

  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<CalendarEventType>('record')
  const [newWhen, setNewWhen] = useState(() => {
    const d = new Date(weekStart)
    d.setHours(10, 0, 0, 0)
    return d.toISOString().slice(0, 16)
  })

  const upcoming = useMemo(
    () =>
      [...events]
        .sort(
          (a, b) =>
            new Date(a.scheduled_for).getTime() -
            new Date(b.scheduled_for).getTime(),
        )
        .slice(0, 5),
    [events],
  )

  const eventsByDay = useMemo(() => {
    const map: CalendarEvent[][] = [[], [], [], [], [], [], []]
    for (const e of events) {
      const d = dayOfWeek(e.scheduled_for, weekStart)
      if (d >= 0 && d < 7) map[d].push(e)
    }
    return map
  }, [events, weekStart])

  const handleCreate = () => {
    if (!newTitle.trim()) return
    createEvent.mutate(
      {
        title: newTitle.trim(),
        event_type: newType,
        scheduled_for: new Date(newWhen).toISOString(),
      },
      {
        onSuccess: () => {
          setNewTitle('')
          setShowAdd(false)
        },
      },
    )
  }

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
            <button className="btn" onClick={() => setShowAdd(v => !v)}>
              <Icon name="plus" size={14} /> Add event
            </button>
          </>
        }
      />

      <div className="row" style={{ gap: 12, alignItems: 'center' }}>
        <button
          className="btn sm ghost"
          onClick={() => setWeekStart(addDays(weekStart, -7))}
        >
          <Icon name="arrowLeft" size={13} />
        </button>
        <span style={{ fontWeight: 600, fontSize: 14 }}>
          {formatRange(weekStart, addDays(weekStart, 6))}
        </span>
        <button
          className="btn sm ghost"
          onClick={() => setWeekStart(addDays(weekStart, 7))}
        >
          <Icon name="arrowRight" size={13} />
        </button>
        <button
          className="btn sm ghost"
          onClick={() => setWeekStart(startOfWeek(new Date()))}
        >
          Today
        </button>
      </div>

      {showAdd && (
        <div className="card">
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <input
              className="input"
              placeholder="Event title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              style={{ flex: '1 1 220px' }}
            />
            <select
              className="input"
              value={newType}
              onChange={e => setNewType(e.target.value as CalendarEventType)}
            >
              <option value="record">record</option>
              <option value="edit">edit</option>
              <option value="publish">publish</option>
              <option value="custom">custom</option>
            </select>
            <input
              className="input"
              type="datetime-local"
              value={newWhen}
              onChange={e => setNewWhen(e.target.value)}
            />
            <button
              className="btn accent"
              onClick={handleCreate}
              disabled={createEvent.isPending || !newTitle.trim()}
            >
              {createEvent.isPending ? 'Saving…' : 'Create'}
            </button>
          </div>
        </div>
      )}

      <div className="grid-2-1" style={{ alignItems: 'start' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              borderBottom: '1px solid var(--line)',
            }}
          >
            {DAYS.map((d, i) => {
              const date = addDays(weekStart, i)
              return (
                <div
                  key={d}
                  style={{
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: 12,
                    borderRight: i < 6 ? '1px solid var(--line)' : 'none',
                  }}
                >
                  <div className="eyebrow">{d}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
                    {date.getDate()}
                  </div>
                </div>
              )
            })}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              minHeight: 260,
            }}
          >
            {DAYS.map((_, colIdx) => (
              <div
                key={colIdx}
                style={{
                  borderRight: colIdx < 6 ? '1px solid var(--line)' : 'none',
                  padding: 6,
                  minHeight: 260,
                }}
              >
                {eventsByDay[colIdx].map(ev => (
                  <div
                    key={ev.id}
                    className={`thumb ${EVENT_COLOR[ev.event_type]}`}
                    style={{
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
                      position: 'relative',
                    }}
                    onClick={() => {
                      if (window.confirm(`Delete "${ev.title}"?`)) {
                        deleteEvent.mutate(ev.id)
                      }
                    }}
                  >
                    <div style={{ opacity: 0.8, marginBottom: 2 }}>
                      {new Date(ev.scheduled_for).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {ev.title}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="h2" style={{ marginBottom: 14 }}>Upcoming</div>
            {upcoming.length === 0 ? (
              <div className="tiny muted">
                Nothing scheduled this week. Hit "Add event" to plan one.
              </div>
            ) : (
              <div className="col" style={{ gap: 10 }}>
                {upcoming.map(e => (
                  <div
                    key={e.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                      {e.title}
                    </div>
                    <div className="row between">
                      <span className="tiny muted">
                        {new Date(e.scheduled_for).toLocaleString()}
                      </span>
                      <span className={`badge ${EVENT_COLOR[e.event_type]}`}>
                        {e.event_type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
