import type { ReactNode } from 'react'
import Icon from '../shared/Icon'

interface PageHeaderProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: string
  code?: string
  icon?: string
  actions?: ReactNode
}

export default function PageHeader({ eyebrow, title, subtitle, code, icon, actions }: PageHeaderProps) {
  return (
    <header className="row between" style={{ alignItems: 'flex-start', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            {eyebrow} {code && <span style={{ color: 'var(--accent)' }}>· {code}</span>}
          </div>
        )}
        <h1 className="h-display" style={{ fontSize: 36, lineHeight: 1.1, display: 'flex', alignItems: 'center', gap: 14 }}>
          {icon && (
            <span style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--ink)', color: 'var(--accent)',
              display: 'grid', placeItems: 'center', flex: '0 0 44px',
            }}>
              <Icon name={icon} size={20} />
            </span>
          )}
          {title}
        </h1>
        {subtitle && <p className="muted" style={{ maxWidth: 640, marginTop: 8, fontSize: 14 }}>{subtitle}</p>}
      </div>
      {actions && <div className="row" style={{ gap: 8 }}>{actions}</div>}
    </header>
  )
}
