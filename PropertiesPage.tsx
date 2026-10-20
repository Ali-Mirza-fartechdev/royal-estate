import { useEffect, useMemo, useRef, useState } from 'react'
import Page from '../components/layout/Page'
import PageHero from '../components/layout/PageHero'
import FinalCta from '../components/layout/FinalCta'
import PropertyCard from '../components/property/PropertyCard'
import Button from '../components/ui/Button'
import Split from '../components/animation/Split'
import { useContent } from '../cms/ContentProvider'
import type { Property } from '../cms/types'
import { img } from '../data/images'
import { useSaved } from '../hooks/useSaved'
import { useRefreshOnChange } from '../hooks/usePageMotion'
import { gsap, prefersReducedMotion } from '../motion/gsap'

interface Filters { location: string; listing: string; typology: string; min: string; max: string; beds: string }
const ALL_LOC = 'All Locations'
const ALL_TYPE = 'All Typologies'
const ALL_LISTINGS = 'All Listings'
const EMPTY: Filters = { location: ALL_LOC, listing: ALL_LISTINGS, typology: ALL_TYPE, min: 'No Minimum', max: 'No Cap', beds: 'Any' }

const LISTINGS = [ALL_LISTINGS, 'For Sale', 'For Rent']
const PRICES = {
  sale: { mins: ['No Minimum', '$1,000,000', '$2,000,000', '$3,000,000'], maxs: ['No Cap', '$2,000,000', '$3,500,000', '$5,000,000'] },
  rent: { mins: ['No Minimum', '$5,000', '$10,000', '$15,000'], maxs: ['No Cap', '$10,000', '$15,000', '$25,000'] },
}
const BEDS = ['Any', '3+', '4+', '5+']
const num = (s: string) => Number(s.replace(/[^\d]/g, ''))

type Cmp = (a: Property, b: Property) => number
const SORTS: Record<string, Cmp> = {
  Featured: (a, b) => Number(b.featured) - Number(a.featured) || a.sort - b.sort,
  'Price: low to high': (a, b) => a.price - b.price,
  'Price: high to low': (a, b) => b.price - a.price,
  'Largest first': (a, b) => b.sqft - a.sqft,
}

function Sel({ label, value, options, onChange, disabled }: { label: string; value: string; options: string[]; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      <span className="select"><select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select></span>
    </label>
  )
}

export default function PropertiesPage() {
  const { properties } = useContent()
  const LOCATIONS = useMemo(() => [ALL_LOC, ...Array.from(new Set(properties.map((p) => `${p.city}, ${p.stateCode}`)))], [properties])
  const TYPOLOGIES = useMemo(() => [ALL_TYPE, ...Array.from(new Set(properties.map((p) => p.typology).filter(Boolean)))], [properties])
  const [draft, setDraft] = useState<Filters>(EMPTY)
  const [applied, setApplied] = useState<Filters>(EMPTY)
  const [sort, setSort] = useState('Featured')
  const { saved, isSaved, toggle } = useSaved()
  const [savedOnly, setSavedOnly] = useState(false)
  const grid = useRef<HTMLDivElement>(null)
  const first = useRef(true)

  const results = useMemo(() => {
    const f = applied
    return properties
      .filter((p) => (f.location === ALL_LOC ? true : `${p.city}, ${p.stateCode}` === f.location))
      .filter((p) => (f.listing === ALL_LISTINGS ? true : p.listingType === (f.listing === 'For Rent' ? 'rent' : 'sale')))
      .filter((p) => (f.typology === ALL_TYPE ? true : p.typology === f.typology))
      .filter((p) => (f.min === EMPTY.min ? true : p.price >= num(f.min)))
      .filter((p) => (f.max === EMPTY.max ? true : p.price <= num(f.max)))
      .filter((p) => (f.beds === 'Any' ? true : p.beds >= num(f.beds)))
      .filter((p) => (savedOnly ? saved.includes(p.slug) : true))
      .sort(SORTS[sort])
  }, [applied, sort, properties, savedOnly, saved])

  // Smooth grid refresh when results change (skipped on first paint)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (prefersReducedMotion() || !grid.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.pcard', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, clearProps: 'transform' })
    }, grid)
    return () => ctx.revert()
  }, [results])
  useRefreshOnChange(results.length)

  const dirty = JSON.stringify(draft) !== JSON.stringify(applied)
  const set = (k: keyof Filters) => (v: string) => setDraft((d) => ({ ...d, [k]: v }))
  const priceSet = draft.listing === 'For Rent' ? PRICES.rent : PRICES.sale
  const priceOff = draft.listing === ALL_LISTINGS
  const setListing = (v: string) => setDraft((d) => ({ ...d, listing: v, min: 'No Minimum', max: 'No Cap' }))

  return (
    <Page title="Properties" className="upper-h">
      <PageHero eyebrow="The Royal Collection" title={'Exceptional homes.\nDistinctive addresses.'} lede="Explore a considered collection of remarkable residences, distinctive architecture and exceptional places to call home." image={img.oak} imagePosition="50% 60%" compact />

      <section className="wrap filters-wrap" aria-label="Filter properties">
        <form className="filters" onSubmit={(e) => { e.preventDefault(); setApplied(draft) }} onReset={(e) => { e.preventDefault(); setDraft(EMPTY); setApplied(EMPTY) }}>
          <Sel label="Location" value={draft.location} options={LOCATIONS} onChange={set('location')} />
          <Sel label="Listing" value={draft.listing} options={LISTINGS} onChange={setListing} />
          <Sel label="Typology" value={draft.typology} options={TYPOLOGIES} onChange={set('typology')} />
          <Sel label={draft.listing === 'For Rent' ? 'Min rent / mo' : 'Min price'} value={draft.min} options={priceSet.mins} onChange={set('min')} disabled={priceOff} />
          <Sel label={draft.listing === 'For Rent' ? 'Max rent / mo' : 'Max price'} value={draft.max} options={priceSet.maxs} onChange={set('max')} disabled={priceOff} />
          <Sel label="Bedrooms" value={draft.beds} options={BEDS} onChange={set('beds')} />
          <div className="filters__actions">
            <button className="btn btn--solid" type="submit" disabled={!dirty}><span>Apply</span></button>
            <button className="btn btn--wire" type="reset"><span>Reset</span></button>
          </div>
        </form>
      </section>

      <section className="wrap section section--tight">
        <div className="results-bar">
          <p className="label" role="status" aria-live="polite">Showing {results.length} residential {results.length === 1 ? 'property' : 'properties'}</p>
          <button type="button" className="btn btn--wire btn--sm" aria-pressed={savedOnly} onClick={() => setSavedOnly((v) => !v)}><span>{savedOnly ? 'Showing saved' : 'My saved'} ({saved.filter((s) => properties.some((p) => p.slug === s)).length})</span></button>
          <label className="results-bar__sort">
            <span className="label dim">Sort by</span>
            <span className="select select--inline"><select value={sort} onChange={(e) => setSort(e.target.value)}>{Object.keys(SORTS).map((s) => <option key={s}>{s}</option>)}</select></span>
          </label>
        </div>

        {properties.length === 0 ? (
          <div className="empty card" role="status">
            <h3 className="h-md">New residences are being prepared.</h3>
            <p>Our collection is updated regularly. Speak with our private client team about current and off-market opportunities.</p>
            <div className="row"><Button to="/contact#inquiry">Speak with ROYAL</Button></div>
          </div>
        ) : results.length ? (
          <div className="grid-3" ref={grid} data-stagger>
            {results.map((p, i) => (
              <PropertyCard key={p.id} p={p} badge={`${p.city}, ${p.stateCode}`} saved={isSaved(p.slug)} onToggleSave={() => toggle(p.slug)} eager={i < 3} />
            ))}
          </div>
        ) : (
          <div className="empty card" role="status">
            <h3 className="h-md">{savedOnly ? 'No saved residences yet.' : 'No residences match these filters.'}</h3>
            <p>{savedOnly ? 'Tap the bookmark on any residence to keep it here. Saved homes are kept in this browser only.' : 'Loosen a filter, or ask our private client team about off-market opportunities.'}</p>
            <div className="row">
              <Button variant="wire" onClick={() => { setDraft(EMPTY); setApplied(EMPTY); setSavedOnly(false) }}>{savedOnly ? 'Show all' : 'Reset filters'}</Button>
              <Button to="/contact#inquiry">Speak with ROYAL</Button>
            </div>
          </div>
        )}
      </section>

      <section className="section wrap philosophy-strip">
        <p className="eyebrow" data-reveal>Royal Philosophy</p>
        <Split className="h-xl" text="Find the extraordinary." />
        <p className="lede lede--c" data-reveal>Every residence has a character of its own. We represent architecture that refuses compromise and defines its landscape.</p>
        <div data-reveal><Button to="/about" variant="text" arrow>View our approach</Button></div>
      </section>

      <FinalCta eyebrow="Private advisory" title="Your next property starts with a conversation." body="Tell us what matters to you, and let our private client team help you discover the right opportunity across our off-market architectural network."
        primary={{ label: 'Speak with Royal', to: '/contact#inquiry' }} secondary={{ label: 'Book private viewing', to: '/contact#inquiry' }} />
    </Page>
  )
}
