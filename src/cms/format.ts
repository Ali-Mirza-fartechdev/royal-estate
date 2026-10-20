import type { Property } from './types'

export const formatPrice = (p: Pick<Property, 'price' | 'listingType'>) =>
  '$' + p.price.toLocaleString('en-US') + (p.listingType === 'rent' ? ' / mo' : '')
export const formatMoney = (n: number) => '$' + n.toLocaleString('en-US')
export const formatSqft = (n: number) => n.toLocaleString('en-US')
export const listingLabel = (p: Pick<Property, 'listingType' | 'status'>) =>
  p.status === 'under-offer' ? 'Under offer' : p.status === 'closed' ? (p.listingType === 'rent' ? 'Leased' : 'Sold') : p.listingType === 'rent' ? 'For rent' : 'For sale'
export const telHref = (phone: string) => 'tel:' + phone.replace(/[^\d+]/g, '')
export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2))
export const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
