import { store } from '../cms'
import { contactEmail } from '../cms/ContentProvider'

export type SubmitResult =
  | { status: 'sent' }
  | { status: 'unconfigured'; mailto: string }
  | { status: 'error'; message: string; mailto: string }

export const buildMailto = (subject: string, data: Record<string, string>) => {
  const body = Object.entries(data)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/**
 * Delivery order:
 *  1. Supabase inbox (when configured) — shows up in /admin → Inquiries.
 *  2. Optional VITE_FORM_ENDPOINT (e.g. Formspree) — emails the client; used
 *     on its own or alongside the inbox.
 * With neither configured nothing is sent and the UI says so, offering a
 * pre-filled email instead — submissions are never silently lost.
 */
export async function submitInquiry(
  subject: string,
  data: Record<string, string>,
  meta: { name?: string; email?: string } = {},
): Promise<SubmitResult> {
  const endpoint = import.meta.env.VITE_FORM_ENDPOINT as string | undefined
  const mailto = buildMailto(subject, data)
  const inbox = store.mode === 'supabase'
  if (!inbox && !endpoint) {
    // demo mode: keep a copy in this browser so the demo admin inbox has something to show
    store.addInquiry({ subject, name: meta.name ?? '', email: meta.email ?? '', data }).catch(() => {})
    return { status: 'unconfigured', mailto }
  }
  let saved = false
  let notified = false
  let failure = ''
  if (inbox) {
    try { await store.addInquiry({ subject, name: meta.name ?? '', email: meta.email ?? '', data }); saved = true } catch (e) { failure = (e as Error).message }
  }
  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: subject, ...data }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      notified = true
    } catch { /* handled below */ }
  }
  if (saved || notified) return { status: 'sent' }
  return { status: 'error', message: failure ? 'We could not send your inquiry just now.' : 'We could not send your inquiry just now.', mailto }
}
