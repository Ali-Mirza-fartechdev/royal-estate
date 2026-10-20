import { useEffect, useRef, useState } from 'react'
import Page from '../components/layout/Page'
import Split from '../components/animation/Split'
import Button from '../components/ui/Button'
import TLink from '../components/ui/TLink'
import { Arrow } from '../components/ui/Icons'
import PropertyCard from '../components/property/PropertyCard'
import FinalCta from '../components/layout/FinalCta'
import { SectionHead } from '../components/layout/PageHero'
import InquiryForm from '../components/ui/InquiryForm'
import ImageReveal from '../components/animation/ImageReveal'
import { gsap, prefersReducedMotion } from '../motion/gsap'
import { intro } from '../motion/intro'
import { img, type Img } from '../data/images'
import { useContent } from '../cms/ContentProvider'

interface Slide { image: Img; alt: string; label: string }

function HeroSlides({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const idx = useRef(0)
  const timer = useRef<number>(0)
  const count = slides.length

  const show = (n: number) => {
    if (n === idx.current || !root.current) return
    const imgs = root.current.querySelectorAll<HTMLElement>('.hslide')
    const prev = imgs[idx.current], next = imgs[n]
    idx.current = n
    setI(n)
    if (prefersReducedMotion()) {
      gsap.set(prev, { autoAlpha: 0 })
      gsap.set(next, { autoAlpha: 1 })
      return
    }
    gsap.set(next, { zIndex: 2 })
    gsap.set(prev, { zIndex: 1 })
    gsap.fromTo(next, { autoAlpha: 0, scale: 1.05 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'power2.inOut' })
    gsap.to(prev, { autoAlpha: 0, duration: 1.2, ease: 'power2.inOut', delay: 0.1 })
  }

  useEffect(() => {
    if (prefersReducedMotion() || count < 2) return
    const start = () => {
      window.clearInterval(timer.current)
      timer.current = window.setInterval(() => show((idx.current + 1) % count), 7000)
    }
    const off = intro.onDone(start)
    return () => { off(); window.clearInterval(timer.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  return (
    <>
      <div ref={root} className="hslides" data-hero-bg>
        {slides.map((s, n) => (
          <img key={s.label} className="hslide" src={s.image.src} srcSet={`${s.image.sm} 720w, ${s.image.src} ${s.image.w}w`} sizes="100vw" width={s.image.w} height={s.image.h} alt={s.alt}
            style={{ opacity: n === 0 ? 1 : 0, visibility: n === 0 ? 'visible' : 'hidden' }}
            {...(n === 0 ? { 'data-priority': '', fetchPriority: 'high' as const } : { loading: 'lazy' as const })} />
        ))}
        <div className="hero__shade" />
      </div>
      {count > 1 && <div className="hero__thumbs" data-hero role="group" aria-label="Featured residences">
        {slides.map((s, n) => (
          <button key={s.label} type="button" className={`thumb ${n === i ? 'is-active' : ''}`} aria-label={`Show ${s.label}`} aria-pressed={n === i}
            onClick={() => { window.clearInterval(timer.current); show(n) }}>
            <img src={s.image.sm} alt="" width={64} height={40} loading="lazy" />
          </button>
        ))}
      </div>}
    </>
  )
}

const metrics = [
  ['$4.2B+', 'Portfolio curated'],
  ['24', 'Exclusive estates'],
  ['0.01%', 'Global architectural standard'],
  ['100%', 'Off-market discretion'],
]

const pillars = [
  ['01 / Pedigree analysis', 'Architectural Appreciation', 'We evaluate estates through the dual lenses of architectural consequence and enduring capital retention, prioritizing unrepeatable spatial compositions over fleeting decorative trends.', 'Structural due diligence'],
  ['02 / Discretion', 'Discreet Acquisition', 'Many transactions occur off-market under strict non-disclosure protocols, protecting client identity and estate privacy at every stage.', 'Confidential escrow'],
  ['03 / Continuum', 'Attentive Advisory', 'Beyond the transfer of title, our advisory team coordinates architectural preservationists, lighting directors and private asset managers to steward the residence.', 'Post-closing stewardship'],
]

export default function HomePage() {
  const { properties, neighborhoods } = useContent()
  const featured = properties.some((p) => p.featured) ? properties.filter((p) => p.featured) : properties
  const shown = featured.slice(0, 3)
  const markets = (neighborhoods.some((n) => n.featured) ? neighborhoods.filter((n) => n.featured) : neighborhoods).slice(0, 3)
  const defaults: Slide[] = [
    { image: img.blackwood, alt: 'Modern residence at dusk', label: 'Dusk Residence' },
    { image: img.glass, alt: 'Glass residence at twilight', label: 'Glass Residence' },
    { image: img.oak, alt: 'Residence among oak trees', label: 'Oak Enclave' },
  ]
  // Property photos first; pad with atmospheric defaults so the hero always has three frames.
  const slides: Slide[] = [
    ...shown.map((p) => ({ image: p.hero, alt: `${p.name}, ${p.city}`, label: p.name })),
    ...defaults,
  ].slice(0, 3)
  return (
    <Page title="Elite Luxury Architectural Real Estate" className="home upper-h">
      {/* ---------------- Hero ---------------- */}
      <section className="hero">
        <div className="hero__frame">
          <HeroSlides key={slides.map((s) => s.label).join('|')} slides={slides} />
          <div className="hero__content">
            <div className="hero__copy">
              <p className="eyebrow" data-hero>Elite luxury</p>
              <h1 className="h-display" aria-label="Live where luxury resides" data-hero>
                <span aria-hidden="true">Live where luxury<br />resides</span>
              </h1>
              <div data-hero><Button to="/contact#inquiry">Schedule a tour</Button></div>
            </div>
            <a className="scroll-cue" href="#philosophy" aria-label="Scroll to content" data-hero
              onClick={(e) => { e.preventDefault(); document.getElementById('philosophy')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' }) }}>
              <i />
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- 01 Philosophy ---------------- */}
      <section className="section wrap" id="philosophy">
        <p className="eyebrow eyebrow--rule" data-reveal><i data-line />01 / Philosophy</p>
        <div className="split">
          <div className="split__main">
            <Split as="h2" className="h-xl" text={'Beyond the ordinary.\nSculpted for eternity.'} />
            <p className="lede" data-reveal>Exceptional properties. Distinctive architecture. A more considered approach to luxury living. We partner with visionary clients to secure spaces engineered with uncompromising permanence, monolithic materials, and organic tranquility.</p>
            <div className="row" data-reveal>
              <Button to="/properties" variant="text" arrow>Explore curated works</Button>
              <Button to="/about" variant="text">Private client practice</Button>
            </div>
          </div>
          <aside className="quote card" data-reveal>
            <div>
              <p className="label dim">Curatorial note</p>
              <blockquote>“Architecture is not merely walls and shelter; it is the deliberate framing of space, shadow, and quiet power.”</blockquote>
            </div>
            <footer className="quote__foot">
              <div><strong>Arthur V. Sterling</strong><span>Founder &amp; Managing Principal</span></div>
              <span className="label dim">ROYAL Private Brokerage</span>
            </footer>
          </aside>
        </div>
        <dl className="metrics" data-stagger>
          {metrics.map(([n, l]) => (
            <div key={l} data-item><dd>{n}</dd><dt className="label dim">{l}</dt></div>
          ))}
        </dl>
      </section>

      {/* ---------------- 02 Curated estates ---------------- */}
      {shown.length > 0 && <section className="section wrap" id="properties">
        <SectionHead eyebrow="02 / Curated Estates" title={'Exceptional Homes.\nExtraordinary Settings.'}
          right={<Button to="/properties" variant="text" arrow>{`View all active offerings (${properties.length})`}</Button>} />
        <div className="grid-3" data-stagger>
          {shown.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </section>}

      {/* ---------------- Statement banner ---------------- */}
      <section className="banner">
        <div className="banner__bg" aria-hidden="true"><img data-parallax="0.1" src={img.pine.src} alt="" loading="lazy" width={img.pine.w} height={img.pine.h} /></div>
        <div className="banner__shade" />
        <div className="wrap banner__in">
          <p className="eyebrow" data-reveal>Architectural distinction</p>
          <Split className="h-display h-display--md" text={'Architecture. Atmosphere.\nExceptional living.'} />
          <p className="lede lede--c" data-reveal>Every residence in our private registry is curated according to strict structural principles: tectonic integrity, light choreography, and an indelible connection to natural surroundings.</p>
          <div data-reveal><Button to="/contact#inquiry" variant="wire">Inquire for acquisition</Button></div>
        </div>
      </section>

      {/* ---------------- 03 Practice ---------------- */}
      <section className="section wrap">
        <SectionHead eyebrow="03 / Private Client Practice" title="A different perspective on property." />
        <div className="grid-3 pillars" data-stagger>
          {pillars.map(([k, t, b, f]) => (
            <article className="card pillar" key={t} data-item>
              <p className="label dim">{k}</p>
              <h3 className="h-md">{t}</h3>
              <p>{b}</p>
              <p className="label pillar__foot">{f}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------- 04 Markets ---------------- */}
      {markets.length > 0 && <section className="section wrap">
        <SectionHead eyebrow="04 / Prime Markets" title="Regional sanctuaries." lede="Focused curatorial presence across select enclaves where landscape, culture and modernist architecture converge." />
        <div className="grid-3" data-stagger>
          {markets.map((n, i) => (
            <article className="card ncard" key={n.id} data-item>
              <div className="ncard__media">
                <ImageReveal image={n.image} alt={`${n.name}, ${n.city}`} reveal={false} className="ncard__frame" />
                <span className="tag ncard__tag">{`0${i + 1} / ${n.state}`}</span>
              </div>
              <div className="ncard__body">
                <h3 className="h-md">{n.name}</h3>
                <p>{n.blurb}</p>
                <TLink to="/neighborhoods" className="textlink stretched">Explore area <Arrow /></TLink>
              </div>
            </article>
          ))}
        </div>
      </section>}

      {/* ---------------- Valuation ---------------- */}
      <section className="section wrap" id="valuation">
        <div className="valuation card">
          <div className="valuation__intro">
            <p className="eyebrow" data-reveal>Confidential disposition</p>
            <Split className="h-xl" text={'Your property.\nPresented differently.'} />
            <p className="lede lede--sm" data-reveal>We represent sellers who recognise that rare architecture demands bespoke, cinematic storytelling rather than conventional listing techniques. Connect for a private evaluation.</p>
          </div>
          <div data-reveal>
            <InquiryForm
              subject="Private valuation request — ROYAL website"
              submitLabel="Discuss selling your property"
              fields={[
                { name: 'address', label: 'Estate location or address', required: true, placeholder: 'e.g. 4800 West Lake Dr, Austin TX', autoComplete: 'street-address' },
                { name: 'contact', label: 'Confidential contact (email or direct line)', required: true, placeholder: 'e.g. client@familyoffice.com' },
              ]}
              note="Communications are handled with discretion."
              successBody="Your request has been received by our private client desk."
            />
          </div>
        </div>
      </section>

      <FinalCta eyebrow="When you’re ready" title="Your next chapter starts here." body="Schedule a private consultation with our principal broker or request access to the confidential off-market register."
        primary={{ label: 'Explore properties', to: '/properties' }} secondary={{ label: 'Schedule a tour', to: '/contact#inquiry' }} />
    </Page>
  )
}
