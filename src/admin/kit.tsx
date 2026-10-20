import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { store } from '../cms'
import type { GalleryItem, Img } from '../cms/types'

/* ---------------- toast + confirm ---------------- */
interface Toast { id: number; text: string; kind: 'ok' | 'err' }
const ToastCtx = createContext<(text: string, kind?: 'ok' | 'err') => void>(() => {})
export const useToast = () => useContext(ToastCtx)
type ConfirmFn = (o: { title: string; body?: string; confirm?: string; danger?: boolean }) => Promise<boolean>
const ConfirmCtx = createContext<ConfirmFn>(async () => false)
export const useConfirm = () => useContext(ConfirmCtx)

export function Feedback({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [dlg, setDlg] = useState<null | { title: string; body?: string; confirm?: string; danger?: boolean; res: (v: boolean) => void }>(null)
  const n = useRef(0)
  const push = useCallback((text: string, kind: 'ok' | 'err' = 'ok') => {
    const id = ++n.current
    setToasts((t) => [...t, { id, text, kind }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'err' ? 7000 : 3500)
  }, [])
  const confirm = useCallback<ConfirmFn>((o) => new Promise((res) => setDlg({ ...o, res })), [])
  const close = (v: boolean) => { dlg?.res(v); setDlg(null) }
  return (
    <ToastCtx.Provider value={push}>
      <ConfirmCtx.Provider value={confirm}>
        {children}
        <div className="ad-toasts" aria-live="polite">
          {toasts.map((t) => <div key={t.id} className={`ad-toast ad-toast--${t.kind}`} role={t.kind === 'err' ? 'alert' : 'status'}>{t.text}</div>)}
        </div>
        {dlg && (
          <div className="ad-modal" role="dialog" aria-modal="true" aria-label={dlg.title} onKeyDown={(e) => e.key === 'Escape' && close(false)}>
            <div className="ad-modal__box">
              <h3 className="h-md">{dlg.title}</h3>
              {dlg.body && <p className="dim">{dlg.body}</p>}
              <div className="ad-row">
                <button className="btn btn--wire btn--sm" onClick={() => close(false)} autoFocus><span>Cancel</span></button>
                <button className={`btn btn--sm ${dlg.danger ? 'btn--danger' : 'btn--solid'}`} onClick={() => close(true)}><span>{dlg.confirm ?? 'Confirm'}</span></button>
              </div>
            </div>
          </div>
        )}
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  )
}

/* ---------------- fields ---------------- */
interface FieldProps { label: string; hint?: string; error?: string; full?: boolean; children: ReactNode; htmlFor?: string }
export function Field({ label, hint, error, full, children, htmlFor }: FieldProps) {
  return (
    <div className={`ad-field ${full ? 'ad-field--full' : ''} ${error ? 'has-error' : ''}`}>
      <label className="label" htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <p className="ad-hint">{hint}</p>}
      {error && <p className="field__err" role="alert">{error}</p>}
    </div>
  )
}

let seq = 0
const useId2 = () => useRef('f' + ++seq).current

interface TextProps {
  label: string; value: string; onChange: (v: string) => void; hint?: string; error?: string; full?: boolean
  type?: string; placeholder?: string; required?: boolean; inputMode?: 'numeric' | 'decimal' | 'text' | 'email' | 'tel'
}
export function TextField({ label, value, onChange, hint, error, full, type = 'text', placeholder, required, inputMode }: TextProps) {
  const id = useId2()
  return (
    <Field label={label + (required ? ' *' : '')} hint={hint} error={error} full={full} htmlFor={id}>
      <input id={id} type={type} inputMode={inputMode} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} />
    </Field>
  )
}
export function TextArea({ label, value, onChange, hint, error, rows = 5, full = true, placeholder }: Omit<TextProps, 'type' | 'inputMode'> & { rows?: number }) {
  const id = useId2()
  return (
    <Field label={label} hint={hint} error={error} full={full} htmlFor={id}>
      <textarea id={id} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  )
}
export function SelectField({ label, value, onChange, options, hint, full }: { label: string; value: string; onChange: (v: string) => void; options: ([string, string] | string)[]; hint?: string; full?: boolean }) {
  const id = useId2()
  return (
    <Field label={label} hint={hint} full={full} htmlFor={id}>
      <span className="select"><select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return <option key={v} value={v}>{l}</option> })}
      </select></span>
    </Field>
  )
}
export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="ad-toggle">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="ad-toggle__track" aria-hidden="true"><i /></span>
      <span><strong>{label}</strong>{hint && <small className="dim">{hint}</small>}</span>
    </label>
  )
}

/* ---------------- images ---------------- */
async function uploadMany(files: File[], toast: (t: string, k?: 'ok' | 'err') => void): Promise<Img[]> {
  const out: Img[] = []
  for (const f of files) {
    try { out.push(await store.uploadImage(f)) } catch (e) { toast(`${f.name}: ${(e as Error).message}`, 'err') }
  }
  return out
}

export function ImageField({ label, value, onChange, hint, error, optional }: { label: string; value?: Img; onChange: (v: Img | undefined) => void; hint?: string; error?: string; optional?: boolean }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const id = useId2()
  const pick = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    const [img] = await uploadMany([files[0]], toast)
    setBusy(false)
    if (img) onChange(img)
  }
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id}>
      <div className="ad-img">
        <div className="ad-img__preview">{value ? <img src={value.sm} alt="" /> : <span className="dim">No image</span>}</div>
        <div className="ad-img__actions">
          <label className="btn btn--wire btn--sm ad-file">
            <span>{busy ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}</span>
            <input id={id} type="file" accept="image/*" disabled={busy} onChange={(e) => { pick(e.target.files); e.target.value = '' }} />
          </label>
          {value && optional && <button type="button" className="ad-link" onClick={() => onChange(undefined)}>Remove</button>}
        </div>
      </div>
    </Field>
  )
}

export function GalleryField({ items, onChange, error }: { items: GalleryItem[]; onChange: (v: GalleryItem[]) => void; error?: string }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const add = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    const imgs = await uploadMany(Array.from(files), toast)
    setBusy(false)
    if (imgs.length) onChange([...items, ...imgs.map((image) => ({ image, caption: '' }))])
  }
  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className={`ad-gallery ${error ? 'has-error' : ''}`}>
      <ul>
        {items.map((it, i) => (
          <li key={it.image.src.slice(-40) + i} className="ad-gallery__item">
            <img src={it.image.sm} alt="" />
            <div className="ad-gallery__body">
              <input aria-label={`Caption for photo ${i + 1}`} value={it.caption} placeholder="Caption (e.g. Living pavilion)" onChange={(e) => onChange(items.map((x, k) => (k === i ? { ...x, caption: e.target.value } : x)))} />
              <div className="ad-row">
                {i === 0 ? <span className="tag">Cover photo</span> : <button type="button" className="ad-link" onClick={() => move(i, -i)}>Make cover</button>}
                <button type="button" className="ad-link" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move photo ${i + 1} up`}>↑</button>
                <button type="button" className="ad-link" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move photo ${i + 1} down`}>↓</button>
                <button type="button" className="ad-link ad-link--danger" onClick={() => onChange(items.filter((_, k) => k !== i))}>Remove</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <label className="btn btn--wire btn--sm ad-file">
        <span>{busy ? 'Uploading…' : items.length ? 'Add more photos' : 'Upload photos'}</span>
        <input type="file" accept="image/*" multiple disabled={busy} onChange={(e) => { add(e.target.files); e.target.value = '' }} />
      </label>
      {error && <p className="field__err" role="alert">{error}</p>}
    </div>
  )
}

/* ---------------- repeatable rows ---------------- */
export interface Col<T> { key: keyof T & string; label: string; type?: 'text' | 'number' | 'textarea'; width?: string }
export function RowsField<T extends object>({ rows, onChange, cols, blank, addLabel, label }: { rows: T[]; onChange: (r: T[]) => void; cols: Col<T>[]; blank: T; addLabel: string; label: string }) {
  const set = (i: number, k: keyof T, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)))
  return (
    <div className="ad-rows" role="group" aria-label={label}>
      {rows.map((r, i) => (
        <div className="ad-rows__row" key={i} style={{ gridTemplateColumns: cols.map((c) => c.width ?? '1fr').join(' ') + ' auto' }}>
          {cols.map((c) =>
            c.type === 'textarea' ? (
              <textarea key={c.key} aria-label={`${c.label} ${i + 1}`} placeholder={c.label} rows={2} value={String(r[c.key] ?? '')} onChange={(e) => set(i, c.key, e.target.value)} />
            ) : (
              <input key={c.key} aria-label={`${c.label} ${i + 1}`} placeholder={c.label} type={c.type === 'number' ? 'number' : 'text'} value={String(r[c.key] ?? '')} onChange={(e) => set(i, c.key, e.target.value)} />
            ),
          )}
          <button type="button" className="ad-link ad-link--danger" onClick={() => onChange(rows.filter((_, j) => j !== i))} aria-label={`Remove ${label} row ${i + 1}`}>Remove</button>
        </div>
      ))}
      <button type="button" className="btn btn--wire btn--sm" onClick={() => onChange([...rows, { ...blank }])}><span>{addLabel}</span></button>
    </div>
  )
}

export function Section({ title, hint, children, open = false }: { title: string; hint?: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="ad-section" open={open}>
      <summary><span className="h-sm">{title}</span>{hint && <small className="dim">{hint}</small>}</summary>
      <div className="ad-section__body">{children}</div>
    </details>
  )
}
