import { useState } from 'react'
import type { FormEvent } from 'react'
import { useWorkflowLogin } from '../api/useAuth'
import Icon from '../components/shared/Icon'
import { getApiErrorMessage } from '../types/api'

const FEATURES = [
  { icon: 'lightbulb', text: 'Hook-scored video ideas ranked by trend lift' },
  { icon: 'pencil',    text: 'AI script writer with live quality review' },
  { icon: 'tag',       text: 'CTR-predicted title generator' },
  { icon: 'align',     text: 'SEO description + hashtags in one click' },
]

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')

  const login = useWorkflowLogin()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login.mutateAsync({ username: btoa(username), password: btoa(password) })
      window.location.replace('/')
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Invalid username or password.'))
    }
  }

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-panel">
        <div>
          <div className="brand" style={{ padding: 0, marginBottom: 32 }}>
            <div className="brand-mark" style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.08)' }} />
            <div>
              <div className="brand-name" style={{ color: 'white' }}>Creator OS</div>
              <div className="brand-tag" style={{ color: 'rgba(255,255,255,0.4)' }}>for YouTube</div>
            </div>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 400, lineHeight: 1.1, color: 'white', margin: '0 0 12px' }}>
            Your AI-powered<br /><em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>YouTube studio.</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            From idea to published — one workspace, 19 tools, zero tab-switching.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FEATURES.map(f => (
            <div key={f.icon} className="row" style={{ gap: 14 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: 'rgba(255,77,46,0.15)',
                display: 'grid', placeItems: 'center', color: 'var(--accent)',
              }}>
                <Icon name={f.icon} size={16} />
              </div>
              <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{f.text}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          © {new Date().getFullYear()} Creator Tools · All rights reserved
        </p>
      </div>

      {/* Right form side */}
      <div className="login-form-side">
        <div className="login-form">
          <h2 className="h2" style={{ marginBottom: 6 }}>Welcome back</h2>
          <p className="muted small" style={{ marginBottom: 28 }}>Sign in to your Creator OS workspace</p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="field-label" htmlFor="username">Username or email</label>
              <input
                id="username"
                className="input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  id="password"
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                  <Icon name={showPw ? 'eyeOff' : 'eye'} size={15} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="btn primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              {login.isPending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
