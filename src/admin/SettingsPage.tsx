import { useEffect, useState } from 'react'
import { store } from '../cms'
import type { Office, Settings } from '../cms/types'
import EditorShell from './EditorShell'
import { RowsField, Section, TextArea, TextField, useToast } from './kit'

export default function SettingsPage() {
  const toast = useToast()
  const [s, setS] = useState<Settings | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<Record<string, string>>({})
  useEffect(() => { store.getSettings().then(setS).catch((e) => toast(e.message, 'err')) }, [toast])
  if (!s) return <p className="dim">Loading…</p>
  const set = (p: Partial<Settings>) => { setS({ ...s, ...p }); setDirty(true) }

  const save = async () => {
    const e: Record<string, string> = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.email)) e.email = 'Enter a valid email address.'
    setErr(e)
    if (Object.keys(e).length) { toast(Object.values(e)[0], 'err'); return }
    setSaving(true)
    try { await store.saveSettings(s); setDirty(false); toast('Settings saved.') } catch (x) { toast((x as Error).message, 'err') } finally { setSaving(false) }
  }

  return (
    <EditorShell title="Site settings" back={{ to: '/admin', label: 'Dashboard' }} saving={saving} dirty={dirty} onSave={save} viewHref="/contact">
      <Section title="Contact details" hint="Shown in the footer, the contact page and as the email for fallback links" open>
        <div className="ad-grid">
          <TextField label="Concierge email" type="email" required value={s.email} error={err.email} onChange={(v) => set({ email: v })} />
          <TextField label="Main phone" type="tel" value={s.phone} onChange={(v) => set({ phone: v })} />
          <TextField label="Toll-free / footer phone" type="tel" value={s.tollFree} onChange={(v) => set({ tollFree: v })} hint="Shown in the footer. Leave empty to use the main phone." />
          <TextField label="Instagram URL" type="url" value={s.instagram} onChange={(v) => set({ instagram: v })} placeholder="https://instagram.com/…" />
          <TextField label="LinkedIn URL" type="url" value={s.linkedin} onChange={(v) => set({ linkedin: v })} placeholder="https://linkedin.com/company/…" />
          <TextArea label="Footer description" rows={3} value={s.footerBlurb} onChange={(v) => set({ footerBlurb: v })} />
        </div>
      </Section>
      <Section title="Offices" hint="Shown in the footer and on the contact page" open>
        <RowsField<Office> label="office" rows={s.offices} onChange={(r) => set({ offices: r })} blank={{ city: '', name: '', address: '', phone: '', hours: '' }} addLabel="Add office"
          cols={[{ key: 'city', label: 'City', width: '8rem' }, { key: 'name', label: 'Office name' }, { key: 'address', label: 'Address', width: '1.4fr' }, { key: 'phone', label: 'Phone', width: '10rem' }, { key: 'hours', label: 'Hours' }]} />
      </Section>
    </EditorShell>
  )
}
