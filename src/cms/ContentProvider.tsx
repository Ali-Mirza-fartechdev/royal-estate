import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { store } from './index'
import { defaultSettings } from './seed'
import type { Article, Neighborhood, Property, Settings, TeamMember } from './types'

interface Content {
  ready: boolean
  failed: boolean
  properties: Property[]
  neighborhoods: Neighborhood[]
  articles: Article[]
  team: TeamMember[]
  settings: Settings
}

const empty: Content = { ready: false, failed: false, properties: [], neighborhoods: [], articles: [], team: [], settings: defaultSettings }
const Ctx = createContext<Content>(empty)
export const useContent = () => useContext(Ctx)

// Module-level copy so non-React code (e.g. mailto fallbacks) can read the contact email.
export let contactEmail = defaultSettings.email

/** Loads published content once at startup and shares it with the public pages. */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [c, setC] = useState<Content>(empty)
  useEffect(() => {
    let live = true
    Promise.all([store.list('properties'), store.list('neighborhoods'), store.list('articles'), store.list('team'), store.getSettings()])
      .then(([properties, neighborhoods, articles, team, settings]) => {
        contactEmail = settings.email || contactEmail
        if (live) setC({ ready: true, failed: false, properties, neighborhoods, articles, team, settings })
      })
      .catch((e) => {
        console.error('Could not load site content', e)
        if (live) setC({ ...empty, ready: true, failed: true })
      })
    return () => { live = false }
  }, [])
  const v = useMemo(() => c, [c])
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}
