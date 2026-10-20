import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { store } from '../cms'
import { resetDemo, DEMO_PASSWORD } from '../cms/local'
import type { Inquiry, Kind } from '../cms/types'
import { useConfirm, useToast } from './kit'

const KINDS: [Kind, string, string][] = [['properties', 'Properties', '/admin/properties'], ['neighborhoods', 'Neighborhoods', '/admin/neighborhoods'], ['articles', 'Articles', '/admin/journal'], ['team', 'Team', '/admin/team']]

export default function Dashboard({ onChange }: { onChange: () => void }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [counts, setCounts] = useState<Record<string, [number, number]> | null>(null)
  const [inq, setInq] = useState<Inquiry[]>([])
  const load = () => {
    Promise.all(KINDS.map(([k]) => store.list(k, { all: true }))).then((all) => {
      const c: Record<string, [number, number]> = {}
      KINDS.forEach(([k], i) => { c[k] = [all[i].filter((r) => r.published).length, all[i].length] })
      setCounts(c)
    }).catch((e) => toast((e as Error).message, 'err'))
    store.listInquiries().then(setInq).catch(() => {})
  }
  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const importSample = async () => {
    if (!(await confirm({ title: 'Import sample content?', body: 'Adds the demo properties, neighborhoods, articles and team members that are not already there. Your own content is untouched.', confirm: 'Import' }))) return
    try { await store.seed(); toast('Sample content imported.'); load() } catch (e) { toast((e as Error).message, 'err') }
  }
  const reset = async () => {
    if (!(await confirm({ title: 'Reset demo data?', body: 'Deletes everything stored in this browser and restores the sample content.', confirm: 'Reset', danger: true }))) return
    resetDemo(); toast('Demo data reset.'); load(); onChange()
  }
  const total = counts ? Object.values(counts).reduce((a, [, t]) => a + t, 0) : 0
  const unread = inq.filter((q) => !q.read)

  return (
    <div>
      <div className="ad-head"><div><h1 className="h-lg">Dashboard</h1><p className="dim">Manage everything that appears on the ROYAL website.</p></div></div>

      {store.mode === 'local' ? (
        <div className="ad-banner">
          <strong>Demo mode</strong>
          <p>Content is stored only in this browser, so it is not shared online. To go live, connect Supabase (see the README: <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>). Demo password: <code>{DEMO_PASSWORD}</code>.</p>
          <button className="btn btn--wire btn--sm" onClick={reset}><span>Reset demo data</span></button>
        </div>
      ) : counts && total === 0 ? (
        <div className="ad-banner">
          <strong>Your site is empty</strong>
          <p>Add your own content, or import the sample content to see how the site looks when filled.</p>
          <button className="btn btn--solid btn--sm" onClick={importSample}><span>Import sample content</span></button>
        </div>
      ) : null}

      <div className="ad-stats">
        {KINDS.map(([k, label, to]) => (
          <Link key={k} to={to} className="card ad-stat">
            <span className="label dim">{label}</span>
            <strong>{counts ? counts[k][0] : '–'}</strong>
            <small className="dim">{counts ? `published${counts[k][1] > counts[k][0] ? ` · ${counts[k][1] - counts[k][0]} draft${counts[k][1] - counts[k][0] > 1 ? 's' : ''}` : ''}` : ''}</small>
          </Link>
        ))}
        <Link to="/admin/inquiries" className="card ad-stat">
          <span className="label dim">Inquiries</span><strong>{unread.length}</strong><small className="dim">unread of {inq.length}</small>
        </Link>
      </div>

      <div className="ad-two">
        <section className="card ad-panel">
          <h2 className="h-sm">Quick actions</h2>
          <div className="ad-actions">
            <Link className="btn btn--solid btn--sm" to="/admin/properties/new"><span>Add property</span></Link>
            <Link className="btn btn--wire btn--sm" to="/admin/journal/new"><span>Write article</span></Link>
            <Link className="btn btn--wire btn--sm" to="/admin/settings"><span>Contact details</span></Link>
            <a className="btn btn--wire btn--sm" href="/" target="_blank" rel="noopener noreferrer"><span>View website</span></a>
          </div>
        </section>
        <section className="card ad-panel">
          <h2 className="h-sm">Latest inquiries</h2>
          {inq.length === 0 ? <p className="dim">No inquiries yet.</p> : (
            <ul className="ad-mini">
              {inq.slice(0, 5).map((q) => (<li key={q.id}><Link to="/admin/inquiries"><strong>{q.name || q.email || 'Anonymous'}</strong><span className="dim">{q.subject}</span></Link>{!q.read && <span className="ad-dot" aria-label="Unread" />}</li>))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
