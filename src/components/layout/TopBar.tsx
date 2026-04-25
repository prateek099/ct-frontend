import { Link, useLocation } from 'react-router-dom'
import Icon from '../shared/Icon'
import { TOOLS } from '../../data/tools'

interface Props {
  onOpenProjects?: () => void
  projectsCount?: number
}

export default function TopBar({ onOpenProjects, projectsCount = 0 }: Props) {
  const loc = useLocation()
  const tool = TOOLS.find(t => t.path === loc.pathname)
  const onDashboard = loc.pathname === '/'
  const onUsers = loc.pathname === '/users'

  return (
    <header className="topbar">
      <div className="crumbs">
        <span>Workspace</span>
        <span className="sep">/</span>
        {onDashboard ? (
          <b>Dashboard</b>
        ) : onUsers ? (
          <><span>Manage</span><span className="sep">/</span><b>Users</b></>
        ) : tool ? (
          <>
            <span>Tools</span>
            <span className="sep">/</span>
            <b>{tool.name}</b>
            <span className="badge" style={{ marginLeft: 4 }}>{tool.code}</span>
          </>
        ) : (
          <b>—</b>
        )}
      </div>

      <div className="search">
        <Icon name="search" size={14} />
        <input placeholder="Ask anything or search tools…" readOnly />
        <kbd className="kbd">⌘K</kbd>
      </div>

      <button className="icon-btn relative" title="Notifications">
        <Icon name="bell" />
        <span className="dot" />
      </button>
      {onOpenProjects && (
        <button
          onClick={onOpenProjects}
          className="btn"
          style={{ position: 'relative' }}
          title="Saved projects"
        >
          <Icon name="grid" size={14} />
          Projects
          {projectsCount > 0 && (
            <span style={{
              background: 'var(--coral)', color: 'white',
              fontSize: 10, fontWeight: 800, padding: '1px 6px',
              borderRadius: 99, marginLeft: 2,
            }}>{projectsCount}</span>
          )}
        </button>
      )}
      <Link to="/idea" className="btn accent">
        <Icon name="plus" size={14} />
        New video
      </Link>
    </header>
  )
}
