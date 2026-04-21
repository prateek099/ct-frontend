import { useState } from 'react'
import { useUsers, useCreateUser, useDeleteUser } from '../api/useUsers'
import Icon from '../components/shared/Icon'
import PageHeader from '../components/layout/PageHeader'

export default function UsersPage() {
  const { data: users, isLoading, error } = useUsers()
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return
    createUser.mutate({ name, email }, { onSuccess: () => { setName(''); setEmail('') } })
  }

  return (
    <div className="stack-24" style={{ maxWidth: 720 }}>
      <PageHeader
        eyebrow="Manage"
        icon="users"
        title={<>Creator <em>users</em></>}
        subtitle="Manage Creator Tools accounts and access."
        actions={undefined}
      />

      {/* Add user form */}
      <div className="card">
        <h3 className="h3" style={{ marginBottom: 14 }}>Add new user</h3>
        <form onSubmit={handleSubmit}>
          <div className="row" style={{ gap: 10 }}>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full name"
              required
              style={{ flex: 1 }}
            />
            <input
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              type="email"
              required
              style={{ flex: 2 }}
            />
            <button type="submit" className="btn accent" disabled={createUser.isPending} style={{ flexShrink: 0 }}>
              {createUser.isPending ? <Icon name="refresh" size={14} /> : <Icon name="plus" size={14} />}
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Users list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading && (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <div className="muted small">Loading users…</div>
          </div>
        )}

        {error && (
          <div className="error-row" style={{ margin: 16 }}>
            <Icon name="x" size={13} /> Failed to load users.
          </div>
        )}

        {!isLoading && !error && users?.length === 0 && (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <div className="muted small">No users yet. Add one above!</div>
          </div>
        )}

        {users && users.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="row" style={{ gap: 10 }}>
                      <div className="avatar sm" style={{ background: 'linear-gradient(135deg, var(--violet), #4F3BD0)' }}>
                        {(user.name?.[0] ?? 'U').toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{user.name}</span>
                    </div>
                  </td>
                  <td className="muted">{user.email}</td>
                  <td>
                    <button
                      className="btn sm ghost"
                      onClick={() => deleteUser.mutate(user.id)}
                      disabled={deleteUser.isPending}
                      title="Delete user"
                      style={{ color: 'var(--ink-4)' }}
                    >
                      <Icon name="x" size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
