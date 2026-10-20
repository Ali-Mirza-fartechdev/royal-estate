import type { Inquiry, InquiryInput, Kind, KindMap, Store } from './types'
import { defaultSettings, seedContent } from './seed'
import { blobToDataURL, processImage } from './imageProcess'
import { uid } from './format'

/**
 * Demo store: everything lives in this browser's localStorage. It exists so
 * the admin can be tried (and tested) without a backend. It is NOT shared
 * between visitors — connect Supabase for the real thing.
 */
const KEY = 'royal:cms:v1'
const SESSION = 'royal:admin-session'
export const DEMO_PASSWORD = 'royal-demo'

interface DB {
  properties: KindMap['properties'][]
  neighborhoods: KindMap['neighborhoods'][]
  articles: KindMap['articles'][]
  team: KindMap['team'][]
  settings: typeof defaultSettings
  inquiries: Inquiry[]
}

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* fall through */ }
  const db: DB = { ...seedContent(), inquiries: [] }
  persist(db)
  return db
}
function persist(db: DB) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    throw new Error('Browser storage is full. Remove some photos, or connect Supabase to store content online.')
  }
}

export const localStore: Store = {
  mode: 'local',
  async list(kind, opts) {
    const rows = [...load()[kind]] as KindMap[typeof kind][]
    rows.sort((a, b) => a.sort - b.sort)
    return opts?.all ? rows : rows.filter((r) => r.published)
  },
  async save(kind, item) {
    const db = load()
    const rows = db[kind] as KindMap[Kind][]
    const clash = rows.find((r) => r.slug === item.slug && r.id !== item.id)
    if (clash) throw new Error(`The web address "${item.slug}" is already used by another entry.`)
    const next = { ...item, updatedAt: new Date().toISOString() }
    const i = rows.findIndex((r) => r.id === item.id)
    if (i >= 0) rows[i] = next
    else rows.push({ ...next, sort: rows.length ? Math.max(...rows.map((r) => r.sort)) + 1 : 0 })
    persist(db)
    return next as KindMap[typeof kind]
  },
  async remove(kind, id) {
    const db = load()
    ;(db[kind] as KindMap[Kind][]) = (db[kind] as KindMap[Kind][]).filter((r) => r.id !== id)
    persist(db)
  },
  async getSettings() {
    return load().settings
  },
  async saveSettings(s) {
    const db = load(); db.settings = s; persist(db)
  },
  async addInquiry(i: InquiryInput) {
    const db = load()
    db.inquiries.unshift({ ...i, id: uid(), createdAt: new Date().toISOString(), read: false })
    persist(db)
  },
  async listInquiries() {
    return load().inquiries
  },
  async setInquiryRead(id, read) {
    const db = load(); const q = db.inquiries.find((x) => x.id === id); if (q) q.read = read; persist(db)
  },
  async removeInquiry(id) {
    const db = load(); db.inquiries = db.inquiries.filter((x) => x.id !== id); persist(db)
  },
  async uploadImage(file) {
    const p = await processImage(file, { full: 1400, sm: 520, qFull: 0.72, qSm: 0.65 })
    return { src: await blobToDataURL(p.full), sm: await blobToDataURL(p.sm), w: p.w, h: p.h }
  },
  async seed() {
    const db = load(); const s = seedContent()
    const merge = <T extends { id: string }>(a: T[], b: T[]) => [...a, ...b.filter((x) => !a.some((y) => y.id === x.id))]
    db.properties = merge(db.properties, s.properties)
    db.neighborhoods = merge(db.neighborhoods, s.neighborhoods)
    db.articles = merge(db.articles, s.articles)
    db.team = merge(db.team, s.team)
    persist(db)
  },
  auth: {
    async session() {
      const e = sessionStorage.getItem(SESSION)
      return e ? { email: e } : null
    },
    async signIn(email, password) {
      if (password !== DEMO_PASSWORD) throw new Error('Incorrect password.')
      sessionStorage.setItem(SESSION, email || 'demo@royal.local')
    },
    async signOut() {
      sessionStorage.removeItem(SESSION)
    },
  },
}

export const resetDemo = () => { localStorage.removeItem(KEY) }
