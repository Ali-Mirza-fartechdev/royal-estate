import { useState } from 'react'
import Page from '../components/layout/Page'
import PageHero, { SectionHead } from '../components/layout/PageHero'
import FinalCta from '../components/layout/FinalCta'
import Split from '../components/animation/Split'
import ImageReveal from '../components/animation/ImageReveal'
import PropertyCard from '../components/property/PropertyCard'
import Button from '../components/ui/Button'
import TLink from '../components/ui/TLink'
import { Arrow } from '../components/ui/Icons'
import type { NeighborhoodCategory as Category } from '../cms/types'
import { img } from '../data/images'
import { useContent } from '../cms/ContentProvider'
import { useRefreshOnChange } from '../hooks/usePageMotion'

const CATS: ('All Neighborhoods' | Category)[] = ['All Neighborhoods', 'Established Estates', 'Contemporary Living', 'Private Retreats']

export default function NeighborhoodsPage() {
  const { neighborhoods, properties } = useContent()
  const [cat, setCat] = useState<(typeof CATS)[number]>('All Neighborhoods')
  const [hover, setHover] = useState('')
  const list = neighborhoods.filter((n) => cat === 'All Neighborhoods' || n.category === cat)
  useRefreshOnChange(list.length)
  const featured = (neighborhoods.some((n) => n.featured) ? neighborhoods.filter((n) => n.featured) : neighborhoods).slice(0, 4)
  const preview = neighborhoods.find((n) => n.slug === hover) ?? neighborhoods[0]
  const showcase = (properties.some((p) => p.featured) ? properties.filter((p) => p.featured) : properties).slice(0, 3)

  return (
    <Page title="Neighborhoods">
      <PageHero eyebrow="The art of living well" title="A sense of place." lede="Discover the neighborhoods that define exceptional living, from established estates to contemporary architectural enclaves."
        image={img.oak} imagePosition="50% 55%"
        actions={<><Button to="/neighborhoods#featured">Explore neighborhoods</Button><Button to="/about" variant="text" arrow>Discover our approach</Button></>} />

      <section className="section wrap intro-split" id="approach">
        <p className="eyebrow eyebrow--rule" data-reveal><i data-line />Beyond the property</p>
        <Split className="h-xl intro-split__h" text="Where you live shapes how you live." />
        <div className="intro-split__body" data-reveal>
          <p className="lede">The right address is more than a location. It is the rhythm of the streets, the architecture around you, the privacy you value, and the community you become part of. Our local expertise helps you find a place that feels unmistakably yours.</p>
          <Button to="/neighborhoods#directory" variant="text" arrow>How we guide you</Button>
        </div>
      </section>

      {featured.length > 0 && <section className="section wrap" id="featured">
        <SectionHead eyebrow="The curated enclaves" title="Distinctive places." lede="Explore the character of each neighborhood." />
        <div className="enclaves">
          {featured.map((n, i) => (
            <article key={n.id} className={`enclave ${i % 2 ? 'enclave--flip' : ''}`}>
              <ImageReveal image={n.image} alt={`${n.name}, ${n.city}`} parallax={0.05} className="enclave__img" />
              <div className="enclave__body" data-reveal>
                <p className="label dim">{n.city}, {n.state}</p>
                <h3 className="h-lg">{n.name}</h3>
                <p>{n.blurb}</p>
                <TLink to="/properties" className="textlink">Explore neighborhood <Arrow /></TLink>
              </div>
            </article>
          ))}
        </div>
      </section>}

      {neighborhoods.length > 0 && <section className="section wrap" id="directory">
        <SectionHead eyebrow="Index" title="Find your place." lede="Explore the areas we know best." />
        <div className="chips" role="group" aria-label="Filter neighborhoods" data-reveal>
          {CATS.map((c) => (
            <button key={c} className={`chip ${c === cat ? 'is-active' : ''}`} aria-pressed={c === cat} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="directory">
          <ul className="directory__list" data-stagger>
            {list.map((n) => (
              <li key={n.id} data-item>
                <TLink to="/properties" className="drow" onMouseEnter={() => setHover(n.slug)} onFocus={() => setHover(n.slug)}>
                  <span className="h-md">{n.name}</span>
                  <span className="label dim">{n.city}, {n.state}{n.tag ? ` · ${n.tag}` : ''}</span>
                  <Arrow />
                </TLink>
              </li>
            ))}
          </ul>
          <div className="directory__preview" aria-hidden="true">
            {neighborhoods.map((n) => (
              <img key={n.id} className={n.slug === preview?.slug ? 'is-on' : ''} src={n.image.sm} alt="" width={n.image.w} height={n.image.h} loading="lazy" />
            ))}
          </div>
        </div>
      </section>}

      <section className="section wrap study">
        <ImageReveal image={img.blackwood} alt="Contemporary timber and glass estate at dusk" parallax={0.05} className="study__img" />
        <div className="study__body">
          <p className="label dim" data-reveal>Enclave study · N° 84</p>
          <Split className="h-xl" text={'Not just where you live.\nHow you live.'} />
          <p className="lede lede--sm" data-reveal>From architectural character and everyday conveniences to privacy, outdoor space and a neighborhood’s natural rhythm, the details matter. We help you evaluate the qualities that make a location right for you.</p>
          <ol className="study__list" data-stagger>
            {[['Architecture & character', 'Provenance, material integrity and a design vernacular rooted in its site.'],
              ['Privacy & setting', 'Discreet topography, sightline protection and natural acoustic buffers.'],
              ['Everyday living', 'Curated dining, access to travel and an enduring community culture.']].map(([t, b], i) => (
              <li key={t} data-item><span className="label">0{i + 1} / {t}</span><p>{b}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {showcase.length > 0 && <section className="section wrap">
        <SectionHead eyebrow="Curated listings" title="Exceptional homes, distinctive addresses." lede="Residences selected for their architecture, setting and sense of place." right={<Button to="/properties" variant="text" arrow>View all residences</Button>} />
        <div className="grid-3" data-stagger>{showcase.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
      </section>}

      <section className="section wrap philosophy-strip">
        <p className="eyebrow" data-reveal>Local knowledge, personal guidance</p>
        <Split className="h-xl" text="Every neighborhood has a story. We help you understand it before you make it home." />
        <div data-reveal><Button to="/contact#inquiry" variant="text" arrow>Let’s find your place</Button></div>
      </section>

      <FinalCta image={img.oak} eyebrow="Your next chapter" title="Find the place that feels right." body="Tell us what matters most. We’ll help you explore the neighborhoods and homes that fit your vision."
        primary={{ label: 'Start a conversation', to: '/contact#inquiry' }} secondary={{ label: 'View properties', to: '/properties' }} />
    </Page>
  )
}
