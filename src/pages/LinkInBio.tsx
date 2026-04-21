import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'

interface BioLink {
  id: string
  label: string
  url: string
  icon: string
}

const INITIAL_LINKS: BioLink[] = [
  { id: '1', label: 'My YouTube Channel',   url: 'https://youtube.com/@mychannel',  icon: 'play'      },
  { id: '2', label: 'Free Creator Toolkit',  url: 'https://example.com/toolkit',    icon: 'download'  },
  { id: '3', label: 'Brand Deals — Enquire', url: 'https://example.com/contact',    icon: 'bag'        },
  { id: '4', label: 'Latest Video',          url: 'https://youtube.com/watch?v=xyz', icon: 'film'      },
]

export default function LinkInBio() {
  const [name, setName]     = useState('Alex Reeves')
  const [bio, setBio]       = useState('Creator, storyteller, coffee addict. Teaching 100k+ creators to grow on YouTube.')
  const [links, setLinks]   = useState<BioLink[]>(INITIAL_LINKS)
  const [newLabel, setNewLabel] = useState('')
  const [newUrl, setNewUrl]     = useState('')

  const addLink = () => {
    if (!newLabel.trim() || !newUrl.trim()) return
    setLinks(prev => [...prev, { id: Date.now().toString(), label: newLabel, url: newUrl, icon: 'link' }])
    setNewLabel('')
    setNewUrl('')
  }

  const removeLink = (id: string) => setLinks(prev => prev.filter(l => l.id !== id))

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Publish"
        code="T15"
        icon="link"
        title={<>Link <em>in bio</em></>}
        subtitle="Build your creator link-in-bio page."
        actions={
          <>
            <button className="btn"><Icon name="copy" size={14} /> Copy URL</button>
            <button className="btn primary"><Icon name="save" size={14} /> Publish</button>
          </>
        }
      />

      <section className="grid-1-2">
        {/* Phone preview */}
        <div className="col" style={{ alignItems: 'center', gap: 12 }}>
          <div className="eyebrow" style={{ marginBottom: 0 }}>Live preview</div>
          <div style={{
            width: 220,
            background: 'var(--bg-elev)',
            borderRadius: 36,
            border: '6px solid var(--ink)',
            padding: '28px 16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          }}>
            {/* Phone notch */}
            <div style={{ width: 60, height: 8, borderRadius: 4, background: 'var(--ink)', margin: '0 auto 20px' }} />

            {/* Avatar */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--accent)', margin: '0 auto 10px',
              display: 'grid', placeItems: 'center', color: 'white', fontWeight: 900, fontSize: 20,
            }}>
              {name.split(' ').map(w => w[0]).join('')}
            </div>
            <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{name}</div>
            <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--ink-3)', marginBottom: 16, lineHeight: 1.4 }}>
              {bio.slice(0, 60)}{bio.length > 60 ? '…' : ''}
            </div>

            {/* Link buttons */}
            <div className="col" style={{ gap: 8 }}>
              {links.map(l => (
                <div key={l.id} style={{
                  padding: '9px 12px', borderRadius: 10,
                  background: 'var(--ink)', color: 'var(--bg)',
                  fontSize: 11, fontWeight: 600, textAlign: 'center',
                  cursor: 'pointer',
                }}>
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="h2" style={{ marginBottom: 14 }}>Profile</div>

            <div className="field-label">Display name</div>
            <input className="input" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 12 }} />

            <div className="field-label">Bio</div>
            <textarea
              className="textarea"
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              style={{ minHeight: 72 }}
            />
          </div>

          <div className="card">
            <div className="h2" style={{ marginBottom: 14 }}>Links</div>

            {/* Existing links */}
            <div className="col" style={{ gap: 8, marginBottom: 16 }}>
              {links.map(l => (
                <div key={l.id} className="row" style={{ gap: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--bg-soft)', border: '1px solid var(--line)' }}>
                  <button className="btn sm ghost" style={{ cursor: 'grab' }}>⠿</button>
                  <Icon name={l.icon as Parameters<typeof Icon>[0]['name']} size={14} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{l.label}</div>
                    <div className="tiny muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.url}</div>
                  </div>
                  <button className="btn sm ghost" onClick={() => removeLink(l.id)}>
                    <Icon name="x" size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add link form */}
            <div style={{ paddingTop: 12, borderTop: '1px solid var(--line)' }}>
              <div className="field-label">Add new link</div>
              <div className="col" style={{ gap: 8 }}>
                <input className="input" placeholder="Label (e.g. My Podcast)" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
                <input className="input" placeholder="URL" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
                <button className="btn accent" onClick={addLink}>
                  <Icon name="plus" size={14} /> Add link
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
