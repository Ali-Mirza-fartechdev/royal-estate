import { useCallback, useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { store } from '../cms'
import { Feedback } from './kit'
import Login from './Login'
import Dashboard from './Dashboard'
import ListPage from './ListPage'
import PropertyEditor from './PropertyEditor'
import { ArticleEditor, NeighborhoodEditor, TeamEditor } from './SimpleEditors'
import Inquiries from './Inquiries'
import SettingsPage from './SettingsPage'
import './admin.css'

const NAV: [string, string][] = [
  ['/admin', 'Dashboard'], ['/admin/properties', 'Properties'], ['/admin/neighborhoods', 'Neighborhoods'],
  ['/admin/journal', 'Journal'], ['/admin/team', 'Team'], ['/admin/inquiries', 'Inquiries'], ['/admin/settings', 'Settings'],
]

function Shell({ email, unread, onSignOut }: { email: string; unread: number; onSignOut: () => void }) {
  return (
    <div className="ad-shell">
      <aside className="ad-side">
        <span className="wordmark">ROYAL</span>
        <small className="label dim">Admin</small>
        <nav aria-label="Admin">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => `ad-nav ${isActive ? 'is-active' : ''}`}>
              {label}{label === 'Inquiries' && unread > 0 && <span className="ad-badge" aria-label={`${unread} unread`}>{unread}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="ad-side__foot">
          <a className="ad-link" href="/" target="_blank" rel="noopener noreferrer">View website ↗</a>
          <small className="dim" title={email}>{email}</small>
          <button className="ad-link" onClick={onSignOut}>Sign out</button>
        </div>
      </aside>
      <main className="ad-main" id="main"><Outlet /></main>
    </div>
  )
}

export default function AdminApp() {
  const nav = useNavigate()
  const [email, setEmail] = useState<string | null | undefined>(undefined)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    document.title = 'Admin — ROYAL'
    let m = document.querySelector<HTMLMetaElement>('meta[name=robots]')
    if (!m) { m = document.createElement('meta'); m.name = 'robots'; document.head.appendChild(m) }
    m.content = 'noindex,nofollow'
    return () => { m?.remove() }
  }, [])
  useEffect(() => { store.auth.session().then((s) => setEmail(s?.email ?? null)).catch(() => setEmail(null)) }, [])

  const refreshUnread = useCallback(() => {
    store.listInquiries().then((r) => setUnread(r.filter((q) => !q.read).length)).catch(() => {})
  }, [])
  useEffect(() => { if (email) refreshUnread() }, [email, refreshUnread])

  const signedIn = async () => { const s = await store.auth.session(); setEmail(s?.email ?? null); nav('/admin') }
  const signOut = async () => { await store.auth.signOut(); setEmail(null); nav('/admin') }

  if (email === undefined) return <div className="ad-login"><p className="dim">Loading…</p></div>
  if (!email) return <Login onDone={signedIn} />

  return (
    <Feedback>
      <Routes>
        <Route path="/admin" element={<Shell email={email} unread={unread} onSignOut={signOut} />}>
          <Route index element={<Dashboard onChange={refreshUnread} />} />
          <Route path="properties" element={<ListPage kind="properties" />} />
          <Route path="properties/:id" element={<PropertyEditor />} />
          <Route path="neighborhoods" element={<ListPage kind="neighborhoods" />} />
          <Route path="neighborhoods/:id" element={<NeighborhoodEditor />} />
          <Route path="journal" element={<ListPage kind="articles" />} />
          <Route path="journal/:id" element={<ArticleEditor />} />
          <Route path="team" element={<ListPage kind="team" />} />
          <Route path="team/:id" element={<TeamEditor />} />
          <Route path="inquiries" element={<Inquiries onChange={refreshUnread} />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </Feedback>
  )
}
