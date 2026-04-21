import Icon from '../shared/Icon'

interface Props {
  message: string
  onStop: () => void
}

export default function BackgroundGenerationBanner({ message, onStop }: Props) {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        background: 'var(--accent-tint)',
        border: '1px solid var(--accent)',
      }}
    >
      <Icon name="refresh" size={14} className="spin" style={{ color: 'var(--accent)', flexShrink: 0 }} />
      <span style={{ fontSize: 14, flex: 1 }}>{message}</span>
      <button className="btn sm" onClick={onStop} style={{ flexShrink: 0 }}>
        <Icon name="x" size={12} /> Stop
      </button>
    </div>
  )
}
