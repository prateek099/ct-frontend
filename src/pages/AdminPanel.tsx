import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'

interface Prompt {
  id: string
  tool: string
  code: string
  updated: string
  chars: number
  content: string
}

const PROMPTS: Prompt[] = [
  {
    id: 'p1', tool: 'Video Idea Generator', code: 'T1', updated: 'Apr 18, 2024', chars: 1842,
    content: `You are an expert YouTube content strategist. Generate 10 compelling video ideas based on the creator's niche, channel context, and current trending topics.\n\nEach idea should include:\n- A working title (hook-first, specific, benefit-driven)\n- A one-line hook sentence\n- A suggested format (educational, story, listicle, etc.)\n- A predicted virality score (1–10)\n\nRespond as a JSON array. No markdown, no commentary.`,
  },
  {
    id: 'p2', tool: 'Script Writer', code: 'T2', updated: 'Apr 15, 2024', chars: 2210,
    content: `You are a world-class YouTube scriptwriter. Write a full video script based on the idea, hook, and format provided.\n\nStructure:\n1. Hook (0–8s): Pattern interrupt, bold claim or question\n2. Thesis (0:30): What the viewer will gain\n3. Body: Numbered sections with pattern interrupts\n4. CTA (≤70% mark): Soft subscribe/follow ask\n5. Outro: Callback to the hook\n\nWrite conversationally. Avoid jargon. Aim for the specified duration.`,
  },
  {
    id: 'p3', tool: 'Title Generator', code: 'T3', updated: 'Apr 12, 2024', chars: 980,
    content: `Generate 10 YouTube video title variants. For each title include predicted_ctr (%), hook_type, and character count.\n\nTitle rules:\n- 42–58 characters ideal\n- Front-load the hook word\n- Avoid clickbait — deliver on the premise\n- Use numbers where natural\n- No ALL CAPS except first word`,
  },
  {
    id: 'p4', tool: 'SEO Description', code: 'T4', updated: 'Apr 10, 2024', chars: 1540,
    content: `Write an SEO-optimised YouTube description. Include:\n- Primary keyword in the first 150 characters\n- Timestamps matching the script outline\n- 3 relevant hashtags at the top\n- CTA with link placeholder\n- Secondary keywords naturally woven in\n\nMax 2000 words. Return JSON with description, hashtags[], tags (comma string), primary_keyword, secondary_keywords[].`,
  },
  {
    id: 'p5', tool: 'Thumbnail Lab', code: 'T5', updated: 'Apr 8, 2024', chars: 740,
    content: `Analyse the video title and suggest 4 thumbnail concepts. For each concept, describe: colour palette, text overlay (max 5 words), face position (if applicable), emotional trigger, and predicted CTR vs channel average.`,
  },
  {
    id: 'p6', tool: 'Tags Generator', code: 'T6', updated: 'Apr 6, 2024', chars: 620,
    content: `Generate YouTube tags for the provided video title and topic. Return a comma-separated string of 15–20 tags. Mix broad and specific. Total character count must not exceed 500. No hashtags — plain tags only.`,
  },
]

export default function AdminPanel() {
  const [prompts, setPrompts]     = useState<Prompt[]>(PROMPTS)
  const [selected, setSelected]   = useState<Prompt>(PROMPTS[0])
  const [editing, setEditing]     = useState(selected.content)
  const [saved, setSaved]         = useState(false)

  const handleSelect = (p: Prompt) => {
    setSelected(p)
    setEditing(p.content)
    setSaved(false)
  }

  const handleSave = () => {
    setPrompts(prev => prev.map(p => p.id === selected.id
      ? { ...p, content: editing, chars: editing.length, updated: 'Apr 20, 2024' }
      : p
    ))
    setSelected(prev => ({ ...prev, content: editing, chars: editing.length }))
    setSaved(true)
  }

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Admin"
        code="T9"
        icon="cog"
        title={<>Prompt <em>admin</em></>}
        subtitle="Manage system prompts for each AI tool."
        actions={
          <div className="row" style={{ gap: 8 }}>
            <span className="chip sm amber"><Icon name="shield" size={11} /> Admin only</span>
          </div>
        }
      />

      <section className="grid-1-2">
        {/* Left: prompts table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
            <div className="h2">System prompts</div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Updated</th>
                <th>Chars</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {prompts.map(p => (
                <tr
                  key={p.id}
                  style={{ cursor: 'pointer', background: selected.id === p.id ? 'var(--accent-tint)' : 'transparent' }}
                  onClick={() => handleSelect(p)}
                >
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.tool}</div>
                    <div className="tiny muted">{p.code}</div>
                  </td>
                  <td className="small muted">{p.updated}</td>
                  <td><span className="chip sm">{p.chars.toLocaleString()}</span></td>
                  <td>
                    <button
                      className="btn sm ghost"
                      onClick={e => { e.stopPropagation(); handleSelect(p) }}
                    >
                      <Icon name="pencil" size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: editor */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="row between" style={{ marginBottom: 14 }}>
              <div>
                <div className="h2">{selected.tool}</div>
                <div className="small muted">Code {selected.code} · {editing.length} chars</div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                {saved && <span className="badge mint"><Icon name="check" size={11} /> Saved</span>}
                <button className="btn sm ghost" onClick={() => { setEditing(selected.content); setSaved(false) }}>
                  <Icon name="refresh" size={12} /> Reset
                </button>
              </div>
            </div>

            <textarea
              className="textarea"
              style={{
                minHeight: 340, fontFamily: 'var(--font-mono, monospace)',
                fontSize: 12.5, lineHeight: 1.7,
              }}
              value={editing}
              onChange={e => { setEditing(e.target.value); setSaved(false) }}
            />

            <div style={{ marginTop: 10 }}>
              <div className="bar mint">
                <i style={{ width: `${Math.min((editing.length / 3000) * 100, 100)}%` }} />
              </div>
              <div className="tiny muted" style={{ marginTop: 5 }}>{editing.length} chars · recommended max 3000</div>
            </div>

            <div className="row" style={{ gap: 8, marginTop: 14 }}>
              <button className="btn accent" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSave}>
                <Icon name="save" size={14} /> Save prompt
              </button>
              <button className="btn" onClick={() => navigator.clipboard?.writeText(editing)}>
                <Icon name="copy" size={14} />
              </button>
            </div>
          </div>

          <div className="card tinted">
            <div className="h2" style={{ marginBottom: 10 }}>Guidelines</div>
            <ul className="col" style={{ gap: 8, paddingLeft: 0, listStyle: 'none' }}>
              {[
                'Always specify the exact output format (JSON, markdown, plain text).',
                'Include max token / character constraints where relevant.',
                'Test prompts with edge cases before deploying to production.',
                'Version-control prompt changes — include date in the updated field.',
              ].map(tip => (
                <li key={tip} className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
                  <Icon name="check" size={12} />
                  <span className="small">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
