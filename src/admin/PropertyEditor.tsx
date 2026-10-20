import EditorShell from './EditorShell'
import { useEntity } from './useEntity'
import { GalleryField, ImageField, RowsField, Section, SelectField, TextArea, TextField, Toggle } from './kit'
import { useEffect, useState } from 'react'
import { store } from '../cms'
import { slugify, uid } from '../cms/format'
import type { Attribute, GalleryItem, Img, ListingType, PropStatus, Property, TeamMember } from '../cms/types'

interface Form {
  name: string; slug: string; slugTouched: boolean
  published: boolean; featured: boolean
  listingType: ListingType; status: PropStatus
  price: string; beds: string; baths: string; sqft: string
  city: string; state: string; stateCode: string; area: string; typology: string
  tagline: string; summary: string; description: string
  gallery: GalleryItem[]
  advisorId: string
  specs: { k: string; v: string }[]
  attributes: Attribute[]
  rooms: { name: string; size: string; span: string }[]
  locTitle: string; locBody: string; locCoords: string; locImage?: Img
  distances: { k: string; v: string }[]
}

const blank = (): Form => ({
  name: '', slug: '', slugTouched: false, published: false, featured: false, listingType: 'sale', status: 'available',
  price: '', beds: '', baths: '', sqft: '', city: '', state: '', stateCode: '', area: '', typology: '',
  tagline: '', summary: '', description: '', gallery: [], advisorId: '', specs: [], attributes: [], rooms: [],
  locTitle: '', locBody: '', locCoords: '', distances: [],
})

const toForm = (p: Property): Form => ({
  name: p.name, slug: p.slug, slugTouched: true, published: p.published, featured: p.featured,
  listingType: p.listingType, status: p.status, price: String(p.price), beds: String(p.beds), baths: String(p.baths), sqft: String(p.sqft),
  city: p.city, state: p.state, stateCode: p.stateCode, area: p.area, typology: p.typology,
  tagline: p.tagline, summary: p.summary, description: (p.description ?? []).join('\n\n'),
  gallery: p.gallery ?? [], advisorId: p.advisorId ?? '',
  specs: (p.specs ?? []).map(([k, v]) => ({ k, v })),
  attributes: p.attributes ?? [],
  rooms: (p.rooms ?? []).map((r) => ({ name: r.name, size: r.size, span: String(r.span) })),
  locTitle: p.location?.title ?? '', locBody: p.location?.body ?? '', locCoords: p.location?.coords ?? '', locImage: p.location?.image,
  distances: (p.location?.distances ?? []).map(([k, v]) => ({ k, v })),
})

const num = (s: string) => Number(String(s).replace(/[^\d.]/g, '')) || 0

const fromForm = (f: Form, prev?: Property): Property => {
  const hasLoc = f.locTitle || f.locBody || f.locCoords || f.locImage || f.distances.some((d) => d.k)
  return {
    id: prev?.id ?? uid(), slug: f.slug, sort: prev?.sort ?? 0, updatedAt: prev?.updatedAt ?? '',
    published: f.published, featured: f.featured, listingType: f.listingType, status: f.status,
    name: f.name.trim(), city: f.city.trim(), state: f.state.trim(), stateCode: f.stateCode.trim().toUpperCase(), area: f.area.trim(), typology: f.typology.trim(),
    price: num(f.price), beds: num(f.beds), baths: num(f.baths), sqft: num(f.sqft),
    tagline: f.tagline.trim(), summary: f.summary.trim(),
    description: f.description.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean),
    hero: f.gallery[0].image, heroPosition: f.gallery[0].position, gallery: f.gallery,
    specs: f.specs.filter((s) => s.k.trim() && s.v.trim()).map((s) => [s.k.trim(), s.v.trim()] as [string, string]),
    attributes: f.attributes.filter((a) => a.title.trim()),
    rooms: f.rooms.filter((r) => r.name.trim()).map((r) => ({ name: r.name.trim(), size: r.size.trim(), span: Math.min(12, Math.max(1, num(r.span) || 6)) })),
    location: hasLoc ? { title: f.locTitle, body: f.locBody, coords: f.locCoords, image: f.locImage, distances: f.distances.filter((d) => d.k.trim()).map((d) => [d.k.trim(), d.v.trim()] as [string, string]) } : undefined,
    advisorId: f.advisorId || undefined,
  }
}

const validate = (f: Form) => {
  const e: Record<string, string> = {}
  if (!f.name.trim()) e.name = 'Enter the property name.'
  if (!f.slug.trim()) e.slug = 'The web address cannot be empty.'
  if (!f.city.trim()) e.city = 'Enter the city.'
  if (num(f.price) <= 0) e.price = f.listingType === 'rent' ? 'Enter the monthly rent.' : 'Enter the asking price.'
  if (!f.gallery.length) e.gallery = 'Add at least one photo — the first one is the cover.'
  return e
}

export default function PropertyEditor() {
  const { form, patch, errors, saving, dirty, save, remove, isNew, prev, missing } = useEntity<'properties', Form>({
    kind: 'properties', base: '/admin/properties', blank, toForm, fromForm, validate, noun: 'Property',
  })
  const [team, setTeam] = useState<TeamMember[]>([])
  useEffect(() => { store.list('team', { all: true }).then(setTeam).catch(() => {}) }, [])
  if (missing) return <p className="dim">This property no longer exists.</p>
  if (!form) return <p className="dim">Loading…</p>
  const rent = form.listingType === 'rent'

  return (
    <EditorShell title={isNew ? 'New property' : form.name || 'Property'} back={{ to: '/admin/properties', label: 'All properties' }}
      saving={saving} dirty={dirty} onSave={save} onDelete={isNew ? undefined : remove}
      viewHref={prev?.published ? `/properties/${prev.slug}` : undefined}>
      <Section title="Basics" open>
        <div className="ad-grid">
          <TextField label="Property name" required value={form.name} error={errors.name} full
            onChange={(v) => patch({ name: v, ...(form.slugTouched ? {} : { slug: slugify(v) }) })} placeholder="e.g. The Glass Residence" />
          <SelectField label="Listing type" value={form.listingType} onChange={(v) => patch({ listingType: v as ListingType })} options={[['sale', 'For sale'], ['rent', 'For rent']]} />
          <TextField label={rent ? 'Monthly rent (USD)' : 'Asking price (USD)'} required inputMode="numeric" value={form.price} error={errors.price} onChange={(v) => patch({ price: v })} placeholder={rent ? '9500' : '2450000'} hint="Numbers only." />
          <SelectField label="Availability" value={form.status} onChange={(v) => patch({ status: v as PropStatus })} options={[['available', 'Available'], ['under-offer', 'Under offer'], ['closed', rent ? 'Leased' : 'Sold']]} />
          <TextField label="Bedrooms" inputMode="numeric" value={form.beds} onChange={(v) => patch({ beds: v })} />
          <TextField label="Bathrooms" inputMode="decimal" value={form.baths} onChange={(v) => patch({ baths: v })} />
          <TextField label="Interior area (sq ft)" inputMode="numeric" value={form.sqft} onChange={(v) => patch({ sqft: v })} />
          <TextField label="Style / typology" value={form.typology} onChange={(v) => patch({ typology: v })} placeholder="e.g. Modernist Pavilion" hint="Used by the Typology filter." />
          <TextField label="City" required value={form.city} error={errors.city} onChange={(v) => patch({ city: v })} />
          <TextField label="State" value={form.state} onChange={(v) => patch({ state: v })} placeholder="Texas" />
          <TextField label="State code" value={form.stateCode} onChange={(v) => patch({ stateCode: v })} placeholder="TX" />
          <TextField label="Neighborhood / area" value={form.area} onChange={(v) => patch({ area: v })} placeholder="Lake Austin Overlook" />
          <TextField label="Web address" full value={form.slug} error={errors.slug} hint={`Shown as /properties/${form.slug || '…'}`}
            onChange={(v) => patch({ slug: slugify(v), slugTouched: true })} />
        </div>
        <div className="ad-toggles">
          <Toggle label="Published" checked={form.published} onChange={(v) => patch({ published: v })} hint="Off = draft, hidden from the website." />
          <Toggle label="Featured" checked={form.featured} onChange={(v) => patch({ featured: v })} hint="Shown on the home page and sorted first." />
        </div>
      </Section>

      <Section title="Photos" hint="First photo is the cover" open>
        <GalleryField items={form.gallery} onChange={(g) => patch({ gallery: g })} error={errors.gallery} />
      </Section>

      <Section title="Description" open>
        <div className="ad-grid">
          <TextField label="Short tagline" full value={form.tagline} onChange={(v) => patch({ tagline: v })} />
          <TextArea label="Summary" rows={3} value={form.summary} onChange={(v) => patch({ summary: v })} hint="Shown under the title and on cards." />
          <TextArea label="Full description" rows={9} value={form.description} onChange={(v) => patch({ description: v })} hint="Separate paragraphs with a blank line." />
        </div>
      </Section>

      <Section title="Advisor" hint="Who prospects will contact">
        <SelectField label="Property advisor" value={form.advisorId} onChange={(v) => patch({ advisorId: v })} options={[['', 'First team member'], ...team.map((t) => [t.id, t.name] as [string, string])]} />
      </Section>

      <Section title="Specifications" hint="Optional — auto-generated if empty">
        <RowsField label="specification" rows={form.specs} onChange={(r) => patch({ specs: r })} cols={[{ key: 'k', label: 'Label', width: '1fr' }, { key: 'v', label: 'Value', width: '1.4fr' }]} blank={{ k: '', v: '' }} addLabel="Add specification" />
      </Section>

      <Section title="Key attributes" hint="Optional — the three “details that define the experience” blocks">
        <RowsField label="attribute" rows={form.attributes} onChange={(r) => patch({ attributes: r })} cols={[{ key: 'title', label: 'Title' }, { key: 'body', label: 'Description', type: 'textarea', width: '2fr' }, { key: 'note', label: 'Small note' }]} blank={{ title: '', body: '', note: '' }} addLabel="Add attribute" />
      </Section>

      <Section title="Rooms" hint="Optional — shown as a schematic. Width = columns out of 12">
        <RowsField label="room" rows={form.rooms} onChange={(r) => patch({ rooms: r })} cols={[{ key: 'name', label: 'Room' }, { key: 'size', label: 'Size / note' }, { key: 'span', label: 'Width (1-12)', type: 'number', width: '8rem' }]} blank={{ name: '', size: '', span: '6' }} addLabel="Add room" />
      </Section>

      <Section title="Location story" hint="Optional">
        <div className="ad-grid">
          <TextField label="Heading" value={form.locTitle} onChange={(v) => patch({ locTitle: v })} placeholder="A distinctive address." />
          <TextField label="Coordinates / caption" value={form.locCoords} onChange={(v) => patch({ locCoords: v })} />
          <TextArea label="Text" rows={4} value={form.locBody} onChange={(v) => patch({ locBody: v })} />
          <ImageField label="Location photo" value={form.locImage} onChange={(v) => patch({ locImage: v })} optional />
        </div>
        <RowsField label="distance" rows={form.distances} onChange={(r) => patch({ distances: r })} cols={[{ key: 'k', label: 'Place' }, { key: 'v', label: 'Distance (e.g. 18 minutes)', width: '14rem' }]} blank={{ k: '', v: '' }} addLabel="Add distance" />
      </Section>
    </EditorShell>
  )
}
