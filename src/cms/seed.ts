import { seedProperties } from '../data/properties'
import { seedNeighborhoods } from '../data/neighborhoods'
import { seedArticles } from '../data/journal'
import { seedTeam } from '../data/team'
import type { Article, Neighborhood, Property, Settings, TeamMember } from './types'

const now = () => new Date().toISOString()

export const defaultSettings: Settings = {
  email: 'concierge@royal-estates.com',
  phone: '+1 (512) 840-2900',
  tollFree: '+1 (800) 412-8809',
  instagram: '',
  linkedin: '',
  footerBlurb: 'Curating private residential monoliths and architectural sanctuaries across premier continental landscapes for the discerning collector.',
  offices: [
    { city: 'Austin', name: 'Austin Atelier', address: '804 Congress Ave, Suite 600', phone: '+1 (512) 840-2900', hours: 'Mon–Fri 9am–6pm · Sat by appt' },
    { city: 'Dallas', name: 'Dallas Salon', address: '2100 Ross Ave, Floor 24', phone: '+1 (214) 790-4100', hours: 'Mon–Fri 9am–6pm' },
    { city: 'Scottsdale', name: 'Scottsdale Gallery', address: '7135 E Camelback Rd', phone: '+1 (480) 650-8800', hours: 'Mon–Sat 10am–6pm' },
    { city: 'New York', name: 'New York Penthouse', address: '520 Madison Ave, Penthouse', phone: '+1 (212) 990-1200', hours: 'By private appointment only' },
  ],
}

export function seedContent() {
  const properties: Property[] = seedProperties.map((p, i) => ({ ...p, id: p.slug, published: true, sort: i, updatedAt: now() }))
  const neighborhoods: Neighborhood[] = seedNeighborhoods.map((n, i) => ({ ...n, id: n.slug, published: true, sort: i, updatedAt: now() }))
  const articles: Article[] = seedArticles.map((a, i) => ({ ...a, id: a.slug, published: true, sort: i, updatedAt: now() }))
  const team: TeamMember[] = seedTeam.map((t, i) => ({ ...t, published: true, sort: i, updatedAt: now() }))
  return { properties, neighborhoods, articles, team, settings: structuredClone(defaultSettings) }
}
