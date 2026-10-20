import { useCallback, useEffect, useState } from 'react'

const KEY = 'royal:dossier'
const read = (): string[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

/** Per-visitor "dossier" of saved residences (browser storage only). */
export function useSaved() {
  const [saved, setSaved] = useState<string[]>(read)
  useEffect(() => {
    const on = () => setSaved(read())
    window.addEventListener('storage', on)
    return () => window.removeEventListener('storage', on)
  }, [])
  const toggle = useCallback((slug: string) => {
    setSaved((cur) => {
      const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])
  return { saved, isSaved: (s: string) => saved.includes(s), toggle }
}
