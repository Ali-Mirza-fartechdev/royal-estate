import { useCallback, useEffect, useState } from 'react'
import { store } from '../cms'
import type { Inquiry } from '../cms/types'
import { useConfirm, useToast } from './kit'

const fmt = (d: string) => new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
const csvCell = (v: string) => `"${v.replace(/"/g, '""')}"`

export default function Inquiries({ onChange }: { onChange: () => void }) {
  const toast = useToast()
  const confirm = useConfirm()
  const [rows, setRows] = useState<Inquiry[] | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  const load = useCallback(() => {
    store.listInquiries().then(setRows).catch((e) => { toast((e as Error).message, 'err'); setRows([]) })
  }, [toast])
  useEffect(load, [load])

  const toggle = async (q: Inquiry) => {
    const next = open === q.id ? null : q.id
    setOpen(next)
    if (next && !q.read) { await store.setInquiryRead(q.id, true).catch(() => {}); load(); onChange() }
  }
  const setRead = async (q: Inquiry, read: boolean) => { await store.setInquiryRead(q.id, read).catch((e) => toast(e.message, 'err')); load(); onChange() }
  const del = async (q: Inquiry) => {
    if (!(await confirm({ title: 'Delete this inquiry?', body: 'It will be permanently removed.', confirm: 'Delete', danger: true }))) return
    await store.removeInquiry(q.id).catch((e) => toast(e.message, 'err'))
    toast('Inquiry deleted.'); load(); onChange()
  }
  const exportCsv = () => {
    if (!rows?.length) return
    const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r.data))))
    const head = ['Received', 'Subject', 'Name', 'Email', ...keys]
    const lines = [head, ...rows.map((r) => [r.createdAt, r.subject, r.name, r.email, ...keys.map((k) => r.data[k] ?? '')])]
    const blob = new Blob([lines.map((l) => l.map((c) => csvCell(String(c))).join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = `royal-inquiries-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div>
      <div className="ad-head">
        <div><h1 className="h-lg">Inquiries</h1><p className="dim">Messages sent through the website’s contact, tour and valuation forms.</p></div>
        <button className="btn btn--wire btn--sm" onClick={exportCsv} disabled={!rows?.length}><span>Export CSV</span></button>
      </div>
      {store.mode === 'local' && <p className="ad-note">Demo mode: only inquiries sent from this browser appear here.</p>}
      {!rows ? <p className="dim">Loading…</p> : rows.length === 0 ? (
        <div className="ad-empty card"><h3 className="h-md">No inquiries yet.</h3><p className="dim">New messages from visitors will appear here.</p></div>
      ) : (
        <ul className="ad-list">
          {rows.map((q) => (
            <li key={q.id} className={`card ad-inq ${q.read ? '' : 'is-unread'}`}>
              <button className="ad-inq__head" onClick={() => toggle(q)} aria-expanded={open === q.id}>
                <span className="ad-dot" aria-label={q.read ? 'Read' : 'Unread'} />
                <span className="ad-inq__who"><strong>{q.name || q.email || 'Anonymous'}</strong><small className="dim">{q.subject}</small></span>
                <time className="dim" dateTime={q.createdAt}>{fmt(q.createdAt)}</time>
              </button>
              {open === q.id && (
                <div className="ad-inq__body">
                  <dl>{Object.entries(q.data).filter(([, v]) => v).map(([k, v]) => (<div key={k}><dt className="label dim">{k}</dt><dd>{v}</dd></div>))}</dl>
                  <div className="ad-row">
                    {q.email && <a className="btn btn--solid btn--sm" href={`mailto:${q.email}?subject=${encodeURIComponent('Re: ' + q.subject)}`}><span>Reply by email</span></a>}
                    <button className="ad-link" onClick={() => setRead(q, !q.read)}>{q.read ? 'Mark unread' : 'Mark read'}</button>
                    <button className="ad-link ad-link--danger" onClick={() => del(q)}>Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
