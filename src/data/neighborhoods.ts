// SAMPLE CONTENT from the Stitch designs; seeds the demo / "Import sample content".
import { img } from './images'
import type { Neighborhood } from '../cms/types'

export type SeedNeighborhood = Omit<Neighborhood, 'id' | 'published' | 'sort' | 'updatedAt'>

export const seedNeighborhoods: SeedNeighborhood[] = [
  { slug: 'west-lake-hills', name: 'West Lake Hills', city: 'Austin', state: 'Texas', tag: 'Hill Country Vista', category: 'Private Retreats', blurb: 'Private hillside residences, expansive greenery, and a quiet sense of retreat just beyond the city.', image: img.westLakeHills, featured: true },
  { slug: 'tarrytown', name: 'Tarrytown', city: 'Austin', state: 'Texas', tag: 'Lakefront Historic', category: 'Established Estates', blurb: 'Leafy, historic streets close to the lake and the heart of Austin.', image: img.oak, featured: false },
  { slug: 'highland-park', name: 'Highland Park', city: 'Dallas', state: 'Texas', tag: 'Classic Monoliths', category: 'Established Estates', blurb: 'Established elegance, distinguished architecture, and a residential atmosphere defined by enduring character.', image: img.highlandPark, featured: true },
  { slug: 'preston-hollow', name: 'Preston Hollow', city: 'Dallas', state: 'Texas', tag: 'Acreage Enclaves', category: 'Private Retreats', blurb: 'Generous lots and mature canopy a short drive from the city.', image: img.blackwood, featured: false },
  { slug: 'old-town-scottsdale', name: 'Old Town Scottsdale', city: 'Scottsdale', state: 'Arizona', tag: 'Design District', category: 'Contemporary Living', blurb: 'A distinctive blend of modern desert living, curated design, and access to an energetic cultural scene.', image: img.desert, featured: true },
  { slug: 'paradise-valley', name: 'Paradise Valley', city: 'Scottsdale', state: 'Arizona', tag: 'Desert Sanctuary', category: 'Contemporary Living', blurb: 'Saguaro topography, organic architecture and mountain foothill sanctuaries bathed in desert dusk.', image: img.paradiseValley, featured: false },
]
