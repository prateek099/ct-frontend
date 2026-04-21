interface Flavor {
  id: string
  label: string
  desc: string
}

export const FLAVORS: Flavor[] = [
  { id: 'story',       label: 'Story-driven',  desc: 'Narrative arc, personal angle' },
  { id: 'educational', label: 'Educational',   desc: 'Clear structure, actionable' },
  { id: 'listicle',    label: 'Listicle',      desc: 'Numbered format, punchy' },
  { id: 'documentary', label: 'Documentary',   desc: 'Research-heavy, authoritative' },
]

interface Props {
  value: string
  onChange: (id: string) => void
}

export default function FlavorPicker({ value, onChange }: Props) {
  return (
    <>
      <div className="field-label">Script style</div>
      <div className="grid-2" style={{ gap: 8, marginBottom: 16 }}>
        {FLAVORS.map(f => (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            style={{
              padding: '10px 12px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
              border: `1px solid ${value === f.id ? 'var(--accent)' : 'var(--line)'}`,
              background: value === f.id ? 'var(--accent-tint)' : 'var(--bg-elev)',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13 }}>{f.label}</div>
            <div className="tiny muted" style={{ marginTop: 2 }}>{f.desc}</div>
          </button>
        ))}
      </div>
    </>
  )
}
