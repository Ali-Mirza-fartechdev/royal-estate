import { createClient } from '@supabase/supabase-js'
import type { Inquiry, InquiryInput, Kind, KindMap, Store } from './types'
import { defaultSettings, seedContent } from './seed'
import { processImage } from './imageProcess'
import { uid } from './format'

/**
 * Production store backed by Supabase (Postgres + Storage + Auth).
 * Tables hold a few indexed columns plus the full record in a `data` jsonb
 * column, so adding a field never needs a migration. Row Level Security
 * (see supabase/schema.sql) lets the public read only published rows while
 * signed-in admins can do everything.
 */
export function createSupabaseStore(url: string, anonKey: string): Store {
  const sb = createClient(url, anonKey)
  const BUCKET = 'media'

  const fail = (e: { message: string } | null) => {
    if (e) throw new Error(e.message)
  }

  const rowToItem = <K extends Kind>(r: Record<string, unknown>): KindMap[K] =>
    ({ ...(r.data as object), id: r.id, slug: r.slug, published: r.published, sort: r.sort, updatedAt: r.updated_at }) as KindMap[K]

  return {
    mode: 'supabase',
    async list(kind, opts) {
      let q = sb.from(kind).select('*').order('sort', { ascending: true })
      if (!opts?.all) q = q.eq('published', true)
      const { data, error } = await q
      fail(error)
      return (data ?? []).map((r) => rowToItem(r))
    },
    async save(kind, item) {
      const { id, slug, published, sort, updatedAt: _u, ...rest } = item as KindMap[Kind]
      void _u
      const { data: existing, error: e0 } = await sb.from(kind).select('id,sort').eq('id', id).maybeSingle()
      fail(e0)
      let nextSort = sort
      if (!existing) {
        const { data: last } = await sb.from(kind).select('sort').order('sort', { ascending: false }).limit(1)
        nextSort = last && last.length ? (last[0].sort as number) + 1 : 0
      }
      const { data, error } = await sb
        .from(kind)
        .upsert({ id, slug, published, sort: nextSort, data: rest, updated_at: new Date().toISOString() })
        .select('*')
        .single()
      if (error) throw new Error(error.code === '23505' ? `The web address "${slug}" is already used by another entry.` : error.message)
      return rowToItem(data)
    },
    async remove(kind, id) {
      const { error } = await sb.from(kind).delete().eq('id', id)
      fail(error)
    },
    async getSettings() {
      const { data, error } = await sb.from('settings').select('data').eq('key', 'site').maybeSingle()
      fail(error)
      return { ...defaultSettings, ...((data?.data as object) ?? {}) }
    },
    async saveSettings(s) {
      const { error } = await sb.from('settings').upsert({ key: 'site', data: s })
      fail(error)
    },
    async addInquiry(i: InquiryInput) {
      // anon users may insert but not read; no .select() so nothing is returned
      const { error } = await sb.from('inquiries').insert({ subject: i.subject, name: i.name, email: i.email, data: i.data })
      fail(error)
    },
    async listInquiries() {
      const { data, error } = await sb.from('inquiries').select('*').order('created_at', { ascending: false })
      fail(error)
      return (data ?? []).map((r): Inquiry => ({ id: r.id, createdAt: r.created_at, read: r.read, subject: r.subject, name: r.name ?? '', email: r.email ?? '', data: r.data ?? {} }))
    },
    async setInquiryRead(id, read) {
      const { error } = await sb.from('inquiries').update({ read }).eq('id', id)
      fail(error)
    },
    async removeInquiry(id) {
      const { error } = await sb.from('inquiries').delete().eq('id', id)
      fail(error)
    },
    async uploadImage(file) {
      const p = await processImage(file, { full: 2000, sm: 720, qFull: 0.82, qSm: 0.78 })
      const base = `${new Date().getFullYear()}/${uid()}`
      const up = async (path: string, blob: Blob) => {
        const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: '31536000' })
        fail(error)
        return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
      }
      const ext = p.full.type === 'image/webp' ? 'webp' : 'jpg'
      const [src, sm] = await Promise.all([up(`${base}.${ext}`, p.full), up(`${base}-sm.${ext}`, p.sm)])
      return { src, sm, w: p.w, h: p.h }
    },
    async seed() {
      const s = seedContent()
      for (const kind of ['properties', 'neighborhoods', 'articles', 'team'] as const) {
        const { count } = await sb.from(kind).select('id', { count: 'exact', head: true })
        if (count) continue
        for (const item of s[kind] as KindMap[Kind][]) await this.save(kind, item as never)
      }
      const { data } = await sb.from('settings').select('key').eq('key', 'site').maybeSingle()
      if (!data) await this.saveSettings(s.settings)
    },
    auth: {
      async session() {
        const { data } = await sb.auth.getSession()
        return data.session?.user.email ? { email: data.session.user.email } : null
      },
      async signIn(email, password) {
        const { error } = await sb.auth.signInWithPassword({ email, password })
        fail(error)
      },
      async signOut() {
        await sb.auth.signOut()
      },
    },
  }
}
