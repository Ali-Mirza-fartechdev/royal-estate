import { useState, type FormEvent } from 'react'
import { store } from '../cms'
import { DEMO_PASSWORD } from '../cms/local'

export default function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try { await store.auth.signIn(email.trim(), password); onDone() } catch (x) { setErr((x as Error).message || 'Sign-in failed.') } finally { setBusy(false) }
  }
  return (
    <div className="ad-login">
      <form className="card ad-login__box" onSubmit={submit}>
        <span className="wordmark">ROYAL</span>
        <h1 className="h-md">Website admin</h1>
        {store.mode === 'local' && <p className="ad-note">Demo mode — use any email and the password <code>{DEMO_PASSWORD}</code>.</p>}
        <div className="ad-field"><label className="label" htmlFor="ad-email">Email</label><input id="ad-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="ad-field"><label className="label" htmlFor="ad-pw">Password</label><input id="ad-pw" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {err && <p className="field__err" role="alert">{err}</p>}
        <button className="btn btn--solid" type="submit" disabled={busy}><span>{busy ? 'Signing in…' : 'Sign in'}</span></button>
        <a className="ad-link" href="/">← Back to website</a>
      </form>
    </div>
  )
}
