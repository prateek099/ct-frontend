import { useNavigate } from 'react-router-dom'
import Icon from '../shared/Icon'

const STEPS = [
  { id: 1, label: 'Idea',        path: '/idea' },
  { id: 2, label: 'Script',      path: '/script' },
  { id: 3, label: 'Title',       path: '/title' },
  { id: 4, label: 'Description', path: '/description' },
  { id: 5, label: 'Thumbnail',   path: '/thumbnail' },
  { id: 6, label: 'Tags',        path: '/tags' },
]

export default function PipelineStepper({ active }: { active: number }) {
  const nav = useNavigate()
  return (
    <div className="stepper">
      {STEPS.map(s => {
        const state = s.id < active ? 'done' : s.id === active ? 'active' : 'upcoming'
        return (
          <div
            key={s.id}
            className={'step ' + state}
            onClick={() => nav(s.path)}
            role="button"
          >
            <span className="num">
              {state === 'done' ? <Icon name="check" size={12} /> : s.id}
            </span>
            <span>{s.label}</span>
          </div>
        )
      })}
    </div>
  )
}
