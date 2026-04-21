import { Link } from 'react-router-dom'
import Icon from '../shared/Icon'

interface Props {
  message?: string
}

export default function NoIdeaSelectedCard({ message = 'No idea selected — start from Step 1.' }: Props) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 40 }}>
      <div className="muted" style={{ marginBottom: 14 }}>{message}</div>
      <Link to="/idea" className="btn primary">
        <Icon name="arrowLeft" size={14} /> Back to Ideas
      </Link>
    </div>
  )
}
