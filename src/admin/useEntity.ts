import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { store } from '../cms'
import type { Kind, KindMap } from '../cms/types'
import { useConfirm, useToast } from './kit'

/**
 * Shared load/save/delete flow for an editor.
 *  blank():      new entity defaults
 *  validate():   returns {field: message}; empty object = OK
 */
export function useEntity<K extends Kind, F>(opts: {
  kind: K
  base: string
  blank: () => F
  toForm: (e: KindMap[K]) => F
  fromForm: (f: F, prev?: KindMap[K]) => KindMap[K]
  validate: (f: F) => Record<string, string>
  noun: string
}) {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const nav = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()
  const [prev, setPrev] = useState<KindMap[K] | undefined>()
  const [form, setForm] = useState<F | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let live = true
    setDirty(false); setErrors({}); setMissing(false)
    if (isNew) { setPrev(undefined); setForm(opts.blank()); return }
    store.list(opts.kind, { all: true }).then((rows) => {
      if (!live) return
      const found = (rows as KindMap[K][]).find((r) => r.id === id)
      if (!found) { setMissing(true); return }
      setPrev(found); setForm(opts.toForm(found))
    }).catch((e) => toast((e as Error).message, 'err'))
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const patch = useCallback((p: Partial<F>) => { setForm((f) => (f ? { ...f, ...p } : f)); setDirty(true); setErrors((e) => { const k = Object.keys(p).filter((x) => x in e); if (!k.length) return e; const n = { ...e }; k.forEach((x) => delete n[x]); return n }) }, [])

  const save = async () => {
    if (!form) return
    const errs = opts.validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast(Object.values(errs)[0], 'err')
      document.querySelector<HTMLElement>('.has-error input, .has-error textarea, .has-error select, .has-error .ad-gallery')?.focus?.()
      return
    }
    setSaving(true)
    try {
      const saved = await store.save(opts.kind, opts.fromForm(form, prev))
      setPrev(saved); setDirty(false)
      toast(`${opts.noun} saved.`)
      if (isNew) nav(`${opts.base}/${saved.id}`, { replace: true })
    } catch (e) {
      toast((e as Error).message, 'err')
    } finally { setSaving(false) }
  }

  const remove = async () => {
    if (!prev) return
    const ok = await confirm({ title: `Delete this ${opts.noun.toLowerCase()}?`, body: 'This removes it from the website and cannot be undone.', confirm: 'Delete', danger: true })
    if (!ok) return
    try { await store.remove(opts.kind, prev.id); setDirty(false); toast(`${opts.noun} deleted.`); nav(opts.base) } catch (e) { toast((e as Error).message, 'err') }
  }

  return { form, patch, errors, saving, dirty, save, remove, isNew, prev, missing }
}
