import { NavLink } from 'react-router-dom'
import Icon from '../Icon'
import { TOOLS, GROUPS } from '../../data/tools'
import { useAuth } from '../../context/AuthContext'

export default function Sidebar() {
  const { user, logout } = useAuth()

  const byGroup = GROUPS.map(g => ({
    ...g,
    items: TOOLS.filter(t => t.group === g.id),
  }))

  const initials = (user?.name ?? 'C').slice(0, 2).toUpperCase()

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" />
        <div>
          <div className="brand-name">Creator OS</div>
          <div className="brand-tag">for YouTube</div>
        </div>
      </div>

      <div className="side-search">
        <Icon name="search" size={14} />
        <span>Search tools, videos…</span>
        <kbd>⌘K</kbd>
      </div>

      <nav className="side-group">
        <NavLink to="/" end className={({ isActive }) => 'side-item' + (isActive ? ' active' : '')}>
          <Icon name="home" />
          <span>Dashboard</span>
        </NavLink>
      </nav>

      {byGroup.map(g => (
        <div className="side-group" key={g.id}>
          <div className="side-title">{g.label}</div>
          {g.items.map(t => (
            <NavLink
              key={t.id}
              to={t.path}
              className={({ isActive }) => 'side-item' + (isActive ? ' active' : '')}
            >
              <Icon name={t.icon} />
              <span>{t.name}</span>
              <span className="tag">{t.code}</span>
            </NavLink>
          ))}
        </div>
      ))}

      {/* Users admin link */}
      <div className="side-group">
        <div className="side-title">Manage</div>
        <NavLink to="/users" className={({ isActive }) => 'side-item' + (isActive ? ' active' : '')}>
          <Icon name="users" />
          <span>Users</span>
        </NavLink>
      </div>

      <div className="side-footer">
        <div className="avatar">{initials}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="user-name">{user?.name ?? 'Creator'}</div>
          <div className="user-sub">{user?.email ?? 'demo'}</div>
        </div>
        <button
          onClick={logout}
          className="icon-btn"
          title="Sign out"
          style={{ border: 'none', background: 'transparent', flexShrink: 0 }}
        >
          <Icon name="logout" size={14} />
        </button>
      </div>
    </aside>
  )
}
