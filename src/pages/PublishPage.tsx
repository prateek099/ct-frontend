import { useNavigate, useParams, Link } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/shared/Icon'
import { useProject } from '../api/useProjects'
import { usePublishProject } from '../api/useProjects'


export default function PublishPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id ? parseInt(id, 10) : null
  const navigate = useNavigate()

  const { data: project, isLoading } = useProject(projectId)
  const publishMutation = usePublishProject()

  const handlePublish = () => {
    if (!projectId) return
    publishMutation.mutate(projectId, {
      onSuccess: () => navigate('/dashboard'),
    })
  }

  if (isLoading) {
    return <div className="muted small" style={{ padding: 24 }}>Loading…</div>
  }

  if (!project) {
    return (
      <div className="stack-24">
        <div className="card" style={{ padding: 24 }}>
          <div className="muted">Project not found. <Link to="/dashboard">Go to dashboard</Link></div>
        </div>
      </div>
    )
  }

  const title =
    project.title ||
    project.idea_json?.selectedIdea?.title ||
    project.idea_json?.ideas?.[0]?.title ||
    'Untitled draft'

  const selectedTitle = project.title_json?.selectedTitle?.title
  const scriptWords = project.script_json?.script?.script?.word_count ?? 0
  const seoDesc = project.seo_json?.seo?.description
  const idea = project.idea_json?.selectedIdea?.title ?? project.idea_json?.ideas?.[0]?.title

  const alreadyPublished = project.status === 'published'

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Final step · Publish"
        code="PUB"
        icon="sparkles"
        title={<>Ready to <em>publish?</em></>}
        subtitle="Review your video details before pushing it live."
        actions={
          <>
            <Link to={`/thumbnail`} className="btn">
              <Icon name="arrowLeft" size={14} /> Back
            </Link>
            <button
              className="btn primary"
              onClick={handlePublish}
              disabled={publishMutation.isPending || alreadyPublished}
            >
              {publishMutation.isPending ? (
                'Publishing…'
              ) : alreadyPublished ? (
                <><Icon name="check" size={14} /> Published</>
              ) : (
                <>Publish now <Icon name="arrowRight" size={14} /></>
              )}
            </button>
          </>
        }
      />

      <section className="grid-2">
        <div className="col" style={{ gap: 16 }}>
          {/* Summary card */}
          <div className="card">
            <div className="h2" style={{ marginBottom: 16 }}>Video summary</div>
            <div className="col" style={{ gap: 14 }}>
              <div>
                <div className="eyebrow">Working title</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>{title}</div>
              </div>

              {idea && (
                <div>
                  <div className="eyebrow">Idea</div>
                  <div className="small" style={{ marginTop: 4 }}>{idea}</div>
                </div>
              )}

              {selectedTitle && (
                <div>
                  <div className="eyebrow">Chosen title</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4 }}>{selectedTitle}</div>
                </div>
              )}

              {scriptWords > 0 && (
                <div>
                  <div className="eyebrow">Script</div>
                  <div className="small muted" style={{ marginTop: 4 }}>{scriptWords} words</div>
                </div>
              )}

              {seoDesc && (
                <div>
                  <div className="eyebrow">SEO description</div>
                  <div className="small" style={{ marginTop: 4, lineHeight: 1.55 }}>
                    {seoDesc.slice(0, 200)}{seoDesc.length > 200 ? '…' : ''}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col" style={{ gap: 16 }}>
          {/* Pipeline checklist */}
          <div className="card">
            <div className="h2" style={{ marginBottom: 14 }}>Pipeline checklist</div>
            <div className="col" style={{ gap: 10 }}>
              {[
                { label: 'Idea selected', done: !!project.idea_json?.selectedIdea },
                { label: 'Script written', done: !!project.script_json?.script },
                { label: 'Title chosen', done: !!project.title_json?.selectedTitle },
                { label: 'SEO description', done: !!project.seo_json?.seo },
                { label: 'Thumbnail designed', done: !!project.thumbnail_json },
              ].map(item => (
                <div key={item.label} className="row" style={{ gap: 10 }}>
                  <span className={'chip sm ' + (item.done ? 'filled' : '')}>
                    {item.done ? <Icon name="check" size={11} /> : null}
                  </span>
                  <span className={'small ' + (item.done ? '' : 'muted')}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card tinted">
            <div className="small" style={{ lineHeight: 1.55 }}>
              <b>Note:</b> Clicking "Publish now" marks this project as published in Creator OS.
              Upload your video to YouTube separately.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
