import { useLocation } from 'react-router-dom'
import Icon from '../Icon'
import { TOOLS } from '../../data/tools'

export default function TopBar() {
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
      <button className="btn accent">
        <Icon name="plus" size={14} />
        New video
      </button>
    </header>
  )
}
