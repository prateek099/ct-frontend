import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'
import {
  useAdminPromptHistory,
  useAdminPrompts,
  usePutAdminPrompt,
} from '../api/useAdminPrompts'
import { TOOL_META, type PromptTool } from '../types/adminPrompt'

const TOOLS: PromptTool[] = ['ideas', 'script', 'title', 'seo']

function formatDate(iso?: string | null) {
  if (!iso) return 'Default (unchanged)'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

export default function AdminPanel() {
  const { data: overrides = [], isLoading } = useAdminPrompts()
  const putPrompt = usePutAdminPrompt()

  const [selectedTool, setSelectedTool] = useState<PromptTool>('ideas')
  const [systemDraft, setSystemDraft] = useState('')
  const [templateDraft, setTemplateDraft] = useState('')
  const [saved, setSaved] = useState(false)

  const { data: history = [] } = useAdminPromptHistory(selectedTool)

  const overrideByTool = useMemo(() => {
    const m: Partial<Record<PromptTool, (typeof overrides)[number]>> = {}
    for (const o of overrides) m[o.tool] = o
    return m
  }, [overrides])

  const selected = overrideByTool[selectedTool] ?? null

  useEffect(() => {
    setSystemDraft(selected?.system_prompt ?? '')
    setTemplateDraft(selected?.user_prompt_template ?? '')
    setSaved(false)
  }, [selectedTool, selected?.updated_at])

  const handleSave = async () => {
    await putPrompt.mutateAsync({
      tool: selectedTool,
      system_prompt: systemDraft || null,
      user_prompt_template: templateDraft || null,
    })
    setSaved(true)
  }

  const totalChars = systemDraft.length + templateDraft.length

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Admin"
        code="T9"
        icon="cog"
        title={<>Prompt <em>admin</em></>}
        subtitle="Override system + user prompts per AI tool. Leave blank to use the default."
        actions={
          <div className="row" style={{ gap: 8 }}>
            <span className="chip sm amber"><Icon name="shield" size={11} /> Admin only</span>
          </div>
        }
      />

      <section className="grid-1-2">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
            <div className="h2">Tools</div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Last updated</th>
                <th>Override</th>
              </tr>
            </thead>
            <tbody>
              {TOOLS.map(tool => {
                const meta = TOOL_META[tool]
                const row = overrideByTool[tool]
                const hasOverride = !!(row?.system_prompt || row?.user_prompt_template)
                return (
                  <tr
                    key={tool}
                    style={{
                      cursor: 'pointer',
                      background: selectedTool === tool ? 'var(--accent-tint)' : 'transparent',
                    }}
                    onClick={() => setSelectedTool(tool)}
                  >
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{meta.label}</div>
                      <div className="tiny muted">{meta.code}</div>
                    </td>
                    <td className="small muted">{formatDate(row?.updated_at)}</td>
                    <td>
                      {hasOverride
                        ? <span className="chip sm mint">Custom</span>
                        : <span className="chip sm">Default</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {isLoading && (
            <div className="tiny muted" style={{ padding: '10px 16px' }}>Loading…</div>
          )}
        </div>

        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="row between" style={{ marginBottom: 14 }}>
              <div>
                <div className="h2">{TOOL_META[selectedTool].label}</div>
                <div className="small muted">
                  Code {TOOL_META[selectedTool].code} · {totalChars} chars total
                </div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                {saved && <span className="badge mint"><Icon name="check" size={11} /> Saved</span>}
                <button
                  className="btn sm ghost"
                  onClick={() => {
                    setSystemDraft(selected?.system_prompt ?? '')
                    setTemplateDraft(selected?.user_prompt_template ?? '')
                    setSaved(false)
                  }}
                >
                  <Icon name="refresh" size={12} /> Reset
                </button>
              </div>
            </div>

            <div className="col" style={{ gap: 14 }}>
              <div>
                <div className="small" style={{ marginBottom: 6, fontWeight: 600 }}>
                  System prompt
                </div>
                <textarea
                  className="textarea"
                  style={{
                    minHeight: 160,
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 12.5, lineHeight: 1.7,
                  }}
                  placeholder="Leave blank to use the built-in system prompt."
                  value={systemDraft}
                  onChange={e => { setSystemDraft(e.target.value); setSaved(false) }}
                />
              </div>
              <div>
                <div className="small" style={{ marginBottom: 6, fontWeight: 600 }}>
                  User prompt template
                </div>
                <textarea
                  className="textarea"
                  style={{
                    minHeight: 220,
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 12.5, lineHeight: 1.7,
                  }}
                  placeholder="Leave blank to use the built-in template. Must keep the {placeholders} used by the tool."
                  value={templateDraft}
                  onChange={e => { setTemplateDraft(e.target.value); setSaved(false) }}
                />
              </div>
            </div>

            <div className="row" style={{ gap: 8, marginTop: 14 }}>
              <button
                className="btn accent"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleSave}
                disabled={putPrompt.isPending}
              >
                <Icon name="save" size={14} />
                {putPrompt.isPending ? 'Saving…' : 'Save override'}
              </button>
              <button
                className="btn"
                onClick={() => navigator.clipboard?.writeText(systemDraft + '\n\n' + templateDraft)}
              >
                <Icon name="copy" size={14} />
              </button>
            </div>

            {putPrompt.isError && (
              <div className="tiny" style={{ color: 'var(--danger)', marginTop: 8 }}>
                Save failed. Check that placeholders match the tool's build() function.
              </div>
            )}
          </div>

          <div className="card tinted">
            <div className="h2" style={{ marginBottom: 10 }}>History</div>
            {history.length === 0 && (
              <div className="tiny muted">No overrides applied yet.</div>
            )}
            <ul className="col" style={{ gap: 8, paddingLeft: 0, listStyle: 'none' }}>
              {history.map(h => (
                <li key={h.id} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                  <Icon name="clock" size={12} />
                  <div className="col" style={{ gap: 2 }}>
                    <span className="small">{formatDate(h.updated_at)}</span>
                    <span className="tiny muted">
                      by user #{h.updated_by_user_id ?? '—'} · sys {h.system_prompt?.length ?? 0}c ·
                      tpl {h.user_prompt_template?.length ?? 0}c
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
