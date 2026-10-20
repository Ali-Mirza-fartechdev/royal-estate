import { useId, useRef, useState, type FormEvent } from 'react'
import { submitInquiry, type SubmitResult } from '../../utils/submitInquiry'
import { Arrow } from './Icons'

export interface FieldDef {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'select' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: string[]
  full?: boolean
  autoComplete?: string
}

interface Props {
  fields: FieldDef[]
  subject: string
  submitLabel: string
  note?: React.ReactNode
  successTitle?: string
  successBody?: string
  extra?: Record<string, string>
  className?: string
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE = /^[+()\d\s.-]{7,}$/

export default function InquiryForm({ fields, subject, submitLabel, note, successTitle = 'Thank you.', successBody = 'Your inquiry has been received by our private client desk.', extra, className = '' }: Props) {
  const uid = useId()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [busy, setBusy] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const validate = (d: Record<string, string>) => {
    const e: Record<string, string> = {}
    fields.forEach((f) => {
      const v = (d[f.name] || '').trim()
      if (f.required && !v) e[f.name] = `${f.label.replace(/\s*\*?$/, '')} is required.`
      else if (v && f.type === 'email' && !EMAIL.test(v)) e[f.name] = 'Enter a valid email address.'
      else if (v && f.type === 'tel' && !PHONE.test(v)) e[f.name] = 'Enter a valid phone number.'
    })
    return e
  }

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const fd = new FormData(ev.currentTarget)
    const data: Record<string, string> = {}
    fields.forEach((f) => (data[f.label.replace(/\s*\*$/, '')] = String(fd.get(f.name) ?? '').trim()))
    const flat: Record<string, string> = {}
    fields.forEach((f) => (flat[f.name] = String(fd.get(f.name) ?? '')))
    const errs = validate(flat)
    setErrors(errs)
    if (Object.keys(errs).length) {
      const first = fields.find((f) => errs[f.name])
      ;(formRef.current?.elements.namedItem(first!.name) as HTMLElement | null)?.focus()
      return
    }
    setBusy(true)
    const contact = flat.email || (flat.contact?.includes('@') ? flat.contact : '')
    const res = await submitInquiry(subject, { ...data, ...extra }, { name: flat.name || '', email: contact })
    setBusy(false)
    setResult(res)
    if (res.status === 'sent') formRef.current?.reset()
  }

  if (result?.status === 'sent')
    return (
      <div className="form-state form-state--ok" role="status">
        <h4 className="h-sm">{successTitle}</h4>
        <p>{successBody}</p>
        <button className="btn btn--wire" type="button" onClick={() => setResult(null)}><span>Send another inquiry</span></button>
      </div>
    )

  return (
    <form ref={formRef} className={`form ${className}`} onSubmit={onSubmit} noValidate>
      <div className="form__grid">
        {fields.map((f) => {
          const id = `${uid}-${f.name}`
          const err = errors[f.name]
          const common = {
            id,
            name: f.name,
            'aria-invalid': err ? true : undefined,
            'aria-describedby': err ? `${id}-err` : undefined,
            'aria-required': f.required || undefined,
            autoComplete: f.autoComplete,
          }
          return (
            <div key={f.name} className={`field ${f.full ? 'field--full' : ''} ${err ? 'has-error' : ''}`}>
              <label htmlFor={id} className="label">{f.label}{f.required ? ' *' : ''}</label>
              {f.type === 'select' ? (
                <div className="select">
                  <select {...common} defaultValue={f.options?.[0]}>
                    {f.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ) : f.type === 'textarea' ? (
                <textarea {...common} rows={4} placeholder={f.placeholder} />
              ) : (
                <input {...common} type={f.type ?? 'text'} placeholder={f.placeholder} />
              )}
              {err && <p className="field__err" id={`${id}-err`} role="alert">{err}</p>}
            </div>
          )
        })}
      </div>
      <div className="form__foot">
        <button className="btn btn--solid" type="submit" disabled={busy}>
          <span>{busy ? 'Sending…' : submitLabel}</span>
          {!busy && <Arrow />}
        </button>
        {note && <p className="form__note">{note}</p>}
      </div>
      {result && (
        <div className="form-state form-state--warn" role="alert">
          <p>
            {result.status === 'unconfigured'
              ? 'This form is not connected to a delivery service yet, so nothing has been sent.'
              : result.message}{' '}
            You can send the same details by email instead.
          </p>
          <a className="btn btn--wire" href={result.mailto}><span>Email the concierge</span><Arrow /></a>
        </div>
      )}
    </form>
  )
}
