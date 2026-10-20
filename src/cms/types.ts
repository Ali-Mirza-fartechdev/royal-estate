export interface Img {
  src: string
  sm: string
  w: number
  h: number
}

export interface Base {
  id: string
  slug: string
  published: boolean
  sort: number
  updatedAt: string
}

export interface GalleryItem {
  image: Img
  caption: string
  position?: string
}
export interface Room { name: string; size: string; span: number }
export interface Attribute { title: string; body: string; note: string }
export interface LocationInfo {
  title: string
  body: string
  distances: [string, string][]
  image?: Img
  coords: string
}

export type ListingType = 'sale' | 'rent'
export type PropStatus = 'available' | 'under-offer' | 'closed'

export interface Property extends Base {
  name: string
  city: string
  state: string
  stateCode: string
  area: string
  /** Sale price, or monthly rent when listingType is "rent". */
  price: number
  listingType: ListingType
  status: PropStatus
  beds: number
  baths: number
  sqft: number
  typology: string
  tagline: string
  summary: string
  description: string[]
  hero: Img
  heroPosition?: string
  gallery: GalleryItem[]
  specs: [string, string][]
  attributes: Attribute[]
  rooms: Room[]
  location?: LocationInfo
  featured: boolean
  advisorId?: string
}

export type NeighborhoodCategory = 'Established Estates' | 'Contemporary Living' | 'Private Retreats'
export interface Neighborhood extends Base {
  name: string
  city: string
  state: string
  tag: string
  category: NeighborhoodCategory
  blurb: string
  image: Img
  featured: boolean
}

export type ArticleCategory = 'Architecture' | 'Neighborhoods' | 'Advisory'
export interface Article extends Base {
  title: string
  category: ArticleCategory
  date: string
  read: string
  excerpt: string
  image: Img
  body: string[]
}

export interface TeamMember extends Base {
  name: string
  role: string
  unit: string
  bio: string
  image: Img
  email: string
  phone: string
}

export interface Office { city: string; name: string; address: string; phone: string; hours: string }
export interface Settings {
  email: string
  phone: string
  tollFree: string
  instagram: string
  linkedin: string
  footerBlurb: string
  offices: Office[]
}

export interface Inquiry {
  id: string
  createdAt: string
  read: boolean
  subject: string
  name: string
  email: string
  data: Record<string, string>
}
export type InquiryInput = Omit<Inquiry, 'id' | 'createdAt' | 'read'>

export type Kind = 'properties' | 'neighborhoods' | 'articles' | 'team'
export interface KindMap {
  properties: Property
  neighborhoods: Neighborhood
  articles: Article
  team: TeamMember
}

export interface Store {
  mode: 'local' | 'supabase'
  list<K extends Kind>(kind: K, opts?: { all?: boolean }): Promise<KindMap[K][]>
  save<K extends Kind>(kind: K, item: KindMap[K]): Promise<KindMap[K]>
  remove(kind: Kind, id: string): Promise<void>
  getSettings(): Promise<Settings>
  saveSettings(s: Settings): Promise<void>
  addInquiry(i: InquiryInput): Promise<void>
  listInquiries(): Promise<Inquiry[]>
  setInquiryRead(id: string, read: boolean): Promise<void>
  removeInquiry(id: string): Promise<void>
  uploadImage(file: File): Promise<Img>
  seed(): Promise<void>
  auth: {
    session(): Promise<{ email: string } | null>
    signIn(email: string, password: string): Promise<void>
    signOut(): Promise<void>
  }
}
