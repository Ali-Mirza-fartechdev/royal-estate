// Placeholder team from the Stitch designs — replace in /admin → Team.
import { img } from './images'
import type { TeamMember } from '../cms/types'

export type SeedTeam = Omit<TeamMember, 'published' | 'sort' | 'updatedAt'>

export const seedTeam: SeedTeam[] = [
  { id: 'marcus', slug: 'marcus-vance', name: 'Marcus Vance', role: 'Founding Partner & Senior Advisor', unit: 'North American Enclaves', bio: 'Specializing in mid-century and brutalist residential acquisitions across prime North American enclaves for private collections.', image: img.marcus, email: 'concierge@royal-estates.com', phone: '+1 (512) 840-2900' },
  { id: 'elena', slug: 'elena-rostova', name: 'Elena Rostova', role: 'Director of Private Acquisitions', unit: 'Southwest Division', bio: 'Leading confidential off-market transactions and private estate advisory with discreet curatorial precision.', image: img.elena, email: 'concierge@royal-estates.com', phone: '+1 (512) 840-2900' },
  { id: 'alexandra', slug: 'alexandra-bennett', name: 'Alexandra Bennett', role: 'Senior Property Advisor', unit: 'Texas Architectural Division', bio: 'Advising collectors and design visionaries on iconic waterfront and hillside residences across Central Texas and the Southwest.', image: img.alexandra, email: 'a.bennett@royal-estates.com', phone: '+1 (512) 840-2900' },
]
