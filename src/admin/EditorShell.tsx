import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  title: string
  back: { to: string; label: string }
  saving: boolean
  dirty: boolean
  onSave: () => void
  onDelete?: () => void
  viewHref?: string
  children: ReactNode
  status?: ReactNode
}

/** Sticky title bar + save/delete shared by every editor. */
export default function EditorShell({ title, back, saving, dirty, onSave, onDelete, viewHref, children, status }: Props) {
  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])
  return (
    <form className="ad-editor" onSubmit={(e) => { e.preventDefault(); onSave() }} noValidate>
      <div className="ad-editor__bar">
        <div>
          <Link to={back.to} className="ad-link">← {back.label}</Link>
          <h1 className="h-lg">{title}</h1>
        </div>
        <div className="ad-row">
          {status}
          {dirty && <span className="ad-dirty">Unsaved changes</span>}
          {viewHref && <a className="btn btn--wire btn--sm" href={viewHref} target="_blank" rel="noopener noreferrer"><span>View on site</span></a>}
          {onDelete && <button type="button" className="btn btn--wire btn--sm btn--danger-o" onClick={onDelete}><span>Delete</span></button>}
          <button type="submit" className="btn btn--solid btn--sm" disabled={saving}><span>{saving ? 'Saving…' : 'Save'}</span></button>
        </div>
      </div>
      <div className="ad-editor__body">{children}</div>
    </form>
  )
}
