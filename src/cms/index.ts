import type { Store } from './types'
import { localStore } from './local'
import { createSupabaseStore } from './supabase'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Supabase when configured, otherwise the browser-only demo store. */
export const store: Store = url && key ? createSupabaseStore(url, key) : localStore
export const isDemo = store.mode === 'local'
