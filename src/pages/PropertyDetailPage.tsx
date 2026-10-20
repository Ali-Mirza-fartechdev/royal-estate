import { Navigate, useParams } from 'react-router-dom'
import Page from '../components/layout/Page'
import Gallery from '../components/property/Gallery'
import PropertyCard from '../components/property/PropertyCard'
import FinalCta from '../components/layout/FinalCta'
import { SectionHead } from '../components/layout/PageHero'
import Split from '../components/animation/Split'
import ImageReveal from '../components/animation/ImageReveal'
import InquiryForm from '../components/ui/InquiryForm'
import Button from '../components/ui/Button'
import TLink from '../components/ui/TLink'
import { Bookmark } from '../components/ui/Icons'
import { formatPrice, formatSqft, listingLabel, telHref } from '../cms/format'
import { useContent } from '../cms/ContentProvider'
import { useSaved } from '../hooks/useSaved'

export default function PropertyDetailPage() {
  const { slug } = useParams()
  const { properties, team, settings } = useContent()
  const p = properties.find((x) => x.slug === slug)
  const { isSaved, toggle } = useSaved()
  if (!p) return <Navigate to="/404" replace />
  const member = team.find((t) => t.id === p.advisorId) ?? team[0]
  const adv = member ?? { name: 'ROYAL Concierge', role: 'Private client desk', image: undefined, phone: settings.phone, email: settings.email }
  const others = properties.filter((x) => x.id !== p.id).slice(0, 3)
  const specs: [string, string][] = p.specs?.length ? p.specs : [
    ['Type', p.typology || '—'],
    ['Bedrooms', `${p.beds}`],
    ['Bathrooms', `${p.baths}`],
    ['Interior Area', `${formatSqft(p.sqft)} Sq Ft`],
    ['Location', [p.area, p.city, p.stateCode].filter(Boolean).join(', ')],
    ['Listing', listingLabel(p)],
  ]
  const loc = p.location && (p.location.title || p.location.body) ? p.location : null

  return (
    // key forces a clean remount (and clean GSAP context) when moving between properties
    <Page key={p.id} title={p.name} className="detail upper-h">
      <section className="wrap dhead">
        <nav className="crumbs label" aria-label="Breadcrumb" data-hero>
          <TLink to="/">Home</TLink><span>/</span><TLink to="/properties">Properties</TLink><span>/</span><span aria-current="page">{p.name}</span>
        </nav>
        <div className="dhead__grid">
          <div>
            <p className="eyebrow" data-hero>{p.city}, {p.state} · {p.area}</p>
            <h1 className="h-display h-display--md" data-hero>{p.name}</h1>
            <p className="lede" data-hero>{p.summary}</p>
          </div>
          <div className="dhead__aside" data-hero>
            <p className="price">{formatPrice(p)} <span className="label dim price__type">{listingLabel(p)}</span></p>
            <ul className="specs specs--lg">
              <li>{p.beds} Bedrooms</li><li>{p.baths} Bathrooms</li><li>{formatSqft(p.sqft)} sq ft</li>
            </ul>
            <div className="row">
              <Button to={`/properties/${p.slug}#inquiry`}>Inquire privately</Button>
              <button type="button" className="btn btn--wire" aria-pressed={isSaved(p.slug)} onClick={() => toggle(p.slug)}>
                <Bookmark filled={isSaved(p.slug)} /><span>{isSaved(p.slug) ? 'Saved to dossier' : 'Save to dossier'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {p.gallery?.length > 0 && <section className="wrap dgallery" data-hero><Gallery items={p.gallery} name={p.name} /></section>}

      <section className="section wrap dresidence">
        <div>
          <p className="eyebrow" data-reveal>The residence</p>
          <Split className="h-xl" text={'Architecture that\nfeels different.'} />
          <div className="prose" data-reveal>{p.description.map((t, k) => <p key={k}>{t}</p>)}</div>
        </div>
        <aside className="card specsheet" data-reveal>
          <h3 className="label">Residence specifications</h3>
          <dl>{specs.map(([k, v]) => (<div key={k}><dt className="label dim">{k}</dt><dd>{v}</dd></div>))}</dl>
          <p className="specsheet__note">Sample listing data — replace with verified inventory before launch.</p>
        </aside>
      </section>

      {p.rooms?.length > 0 && <section className="section wrap">
        <SectionHead eyebrow="Spatial choreography" title="Space, considered in every detail." lede="A schematic of the principal rooms." />
        <ul className="plan" data-stagger aria-label="Principal rooms">
          {p.rooms.map((r) => (
            <li key={r.name} className="plan__room" style={{ ['--span' as string]: r.span }} data-item>
              <span className="h-sm">{r.name}</span><span className="label dim">{r.size}</span>
            </li>
          ))}
        </ul>
      </section>}

      {p.attributes?.length > 0 && <section className="section wrap">
        <SectionHead eyebrow="Architectural attributes" title="The details that define the experience." />
        <div className="attrs" data-stagger>
          {p.attributes.map((a, k) => (
            <article key={a.title} className="attr" data-item>
              <span className="attr__n">0{k + 1}</span>
              <h3 className="h-md">{a.title}</h3>
              <p>{a.body}</p>
              <p className="label dim">{a.note}</p>
            </article>
          ))}
        </div>
      </section>}

      <section className="section wrap" id="inquiry">
        <div className="viewing card">
          <div className="viewing__side">
            <p className="eyebrow" data-reveal>Private viewing</p>
            <Split className="h-lg" text={'Experience it\nin person.'} />
            <p className="lede lede--sm" data-reveal>Discover the materiality, acoustic calm and scale of this residence through a private appointment.</p>
            <div className="advisor" data-reveal>
              {adv.image && <img src={adv.image.sm} alt={`${adv.name}, ${adv.role}`} width={96} height={96} loading="lazy" />}
              <div>
                <h3 className="h-sm">{adv.name}</h3>
                <p className="label dim">{adv.role}</p>
                {adv.phone && <><a href={telHref(adv.phone)}>{adv.phone}</a><br /></>}
                {adv.email && <a href={`mailto:${adv.email}`}>{adv.email}</a>}
              </div>
            </div>
          </div>
          <div data-reveal>
            <h3 className="h-md">Request a private tour</h3>
            <InquiryForm
              subject={`Private tour request — ${p.name}`}
              extra={{ Property: p.name }}
              submitLabel="Request private viewing"
              fields={[
                { name: 'name', label: 'Full name', required: true, placeholder: 'Your name', autoComplete: 'name' },
                { name: 'email', label: 'Email address', type: 'email', required: true, placeholder: 'you@example.com', autoComplete: 'email' },
                { name: 'phone', label: 'Phone number (optional)', type: 'tel', placeholder: '+1 (512) 000-0000', autoComplete: 'tel' },
                { name: 'window', label: 'Preferred viewing window', type: 'select', options: ['Morning (08:30 – 10:30)', 'Midday (11:30 – 14:00)', 'Golden hour & dusk (17:30 – 19:30)', 'Saturday, by request'] },
                { name: 'notes', label: 'Private notes / specific inquiries', type: 'textarea', full: true, placeholder: 'Anything we should prepare for your visit…' },
              ]}
              note="Communications are handled with discretion."
              successBody={`Your tour request for ${p.name} has been received by our private client desk.`}
            />
          </div>
        </div>
      </section>

      {loc && <section className="section wrap dlocation">
        <div>
          <p className="eyebrow" data-reveal>The location</p>
          <Split className="h-xl" text={loc.title || 'A distinctive address.'} />
          <p className="lede lede--sm" data-reveal>{loc.body}</p>
          <dl className="dist" data-stagger>
            {(loc.distances ?? []).map(([k, v]) => (<div key={k} data-item><dt>{k}</dt><dd className="label">{v}</dd></div>))}
          </dl>
          <div data-reveal><Button to="/neighborhoods" variant="text" arrow>Explore neighborhoods</Button></div>
        </div>
        {loc.image && <div className="dlocation__media">
          <ImageReveal image={loc.image} alt={`${p.area} and surrounding landscape`} parallax={0.06} />
          <p className="label dlocation__cap">{p.name}{loc.coords ? ` · ${loc.coords}` : ''}</p>
        </div>}
      </section>}

      {others.length > 0 && <section className="section wrap">
        <SectionHead eyebrow="Architectural portfolio" title="Explore more exceptional residences." right={<Button to="/properties" variant="text" arrow>View full collection</Button>} />
        <div className="grid-3" data-stagger>{others.map((o) => <PropertyCard key={o.id} p={o} />)}</div>
      </section>}

      <FinalCta image={p.hero} eyebrow="Royal private advisory" title="The right property changes everything." body="Allow our private client practice to introduce you to off-market architectural landmarks across the country."
        primary={{ label: 'Schedule a private tour', to: `/properties/${p.slug}#inquiry` }} secondary={{ label: 'Explore all properties', to: '/properties' }} />
    </Page>
  )
}
