import type { ReactNode } from 'react'

interface Props {
  label: string
  title: ReactNode
  subtitle?: ReactNode
}

export default function ContextBanner({ label, title, subtitle }: Props) {
  return (
    <div style={{ padding: '10px 14px', background: 'var(--accent-tint)', borderRadius: 10 }}>
      <div className="tiny muted" style={{ marginBottom: 3 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
      {subtitle && <div className="small muted" style={{ marginTop: 4 }}>{subtitle}</div>}
    </div>
  )
}
