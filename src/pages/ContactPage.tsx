import Page from '../components/layout/Page'
import PageHero, { SectionHead } from '../components/layout/PageHero'
import FinalCta from '../components/layout/FinalCta'
import Split from '../components/animation/Split'
import ImageReveal from '../components/animation/ImageReveal'
import PropertyCard from '../components/property/PropertyCard'
import InquiryForm from '../components/ui/InquiryForm'
import Button from '../components/ui/Button'
import TLink from '../components/ui/TLink'
import { Arrow } from '../components/ui/Icons'
import { img } from '../data/images'
import { useContent } from '../cms/ContentProvider'
import { telHref } from '../cms/format'

const pathways = [
  { k: 'Acquisition', t: 'Buy a residence', b: 'Explore distinctive residences and find an architectural home that aligns with your lifestyle, light exposure and privacy priorities.', cta: 'Explore properties', to: '/properties', image: img.glass },
  { k: 'Representation', t: 'Disposition & sales', b: 'Discuss your property’s valuation, bespoke off-market presentation and buyer matchmaking with our senior partners.', cta: 'Discuss your property', to: '/#valuation', image: img.blackwood },
  { k: 'Location intelligence', t: 'Explore neighborhoods', b: 'Discover the character, setting and micro-climate of premier enclaves across Austin, Dallas and Scottsdale before deciding.', cta: 'Explore neighborhoods', to: '/neighborhoods', image: img.oak },
]
export default function ContactPage() {
  const { properties, settings: st } = useContent()
  const offices = st.offices
  const showcase = (properties.some((p) => p.featured) ? properties.filter((p) => p.featured) : properties).slice(0, 3)
  const hq = offices[0]
  return (
    <Page title="Contact">
      <PageHero eyebrow="Contact ROYAL" title={'Let’s talk about\nwhat’s next.'} lede="Whether you’re searching for an exceptional home, considering a sale, or simply exploring your options, we’re here to start the conversation."
        image={img.paradiseValley} imagePosition="50% 40%" compact actions={<Button to="/contact#inquiry">Get in touch</Button>} />

      <section className="section wrap intro-split">
        <p className="eyebrow eyebrow--rule" data-reveal><i data-line />Personal guidance</p>
        <Split className="h-lg intro-split__h" text={'Every great move starts\nwith a conversation.'} />
        <div className="intro-split__body" data-reveal>
          <p>Real estate decisions are personal. Understanding your goals, timing and priorities helps us provide guidance that is uniquely relevant to you.</p>
          <p>Tell us a little about what you’re looking for, and our team can help you determine the most appropriate next step — with utmost discretion and architectural precision.</p>
        </div>
      </section>

      <section className="section section--tight wrap" id="inquiry">
        <div className="contact">
          <div className="contact__info">
            <p className="eyebrow" data-reveal>We’re here to help</p>
            <Split className="h-lg" text={'A more personal\nreal estate experience.'} />
            <p className="lede lede--sm" data-reveal>Share your plans with us. Whether your next step is immediate or still taking shape, we’d welcome the opportunity to understand what matters to you.</p>
            <dl className="contact__dl" data-stagger>
              <div data-item><dt className="label dim">Direct correspondence</dt><dd><a className="accent" href={`mailto:${st.email}`}>{st.email}</a><small>Intake for acquisitions and private dispositions.</small></dd></div>
              <div data-item><dt className="label dim">Telephone</dt><dd><a className="accent" href={telHref(st.phone)}>{st.phone}</a><small>For accredited patrons and client advisors.</small></dd></div>
              <div data-item><dt className="label dim">Central atelier &amp; salons</dt><dd>{hq ? `${hq.city}: ${hq.address}` : ''}<small>{offices.length > 1 ? `Regional salons: ${offices.slice(1).map((o) => o.city).join(' · ')}` : ''}</small></dd></div>
            </dl>
            <div data-reveal><Button to={telHref(st.phone)} variant="text" arrow>Prefer a direct conversation?</Button></div>
          </div>
          <div className="card contact__form" data-reveal>
            <h3 className="h-md">Tell us how we can help.</h3>
            <p className="dim">Share a few details and we’ll take it from there.</p>
            <InquiryForm
              subject="Website inquiry — ROYAL contact page"
              submitLabel="Send your inquiry"
              fields={[
                { name: 'name', label: 'Full name', required: true, placeholder: 'Your name', autoComplete: 'name' },
                { name: 'email', label: 'Email address', type: 'email', required: true, placeholder: 'you@example.com', autoComplete: 'email' },
                { name: 'phone', label: 'Phone number (optional)', type: 'tel', placeholder: '+1 (555) 234-5678', autoComplete: 'tel' },
                { name: 'type', label: 'I’m interested in', type: 'select', options: ['Buying a Property', 'Selling a Property', 'Exploring Neighborhoods', 'Private Advisory / Off-Market', 'General Inquiry'] },
                { name: 'location', label: 'Preferred location (optional)', placeholder: 'e.g. West Lake Hills, Highland Park' },
                { name: 'budget', label: 'Budget range (optional)', type: 'select', options: ['Not specified', '$1,000,000 – $2,500,000', '$2,500,000 – $5,000,000', '$5,000,000 – $10,000,000', '$10,000,000+'] },
                { name: 'message', label: 'Message / specific inquiry', type: 'textarea', full: true, required: true, placeholder: 'Tell us a little about your timeline, architectural preferences, or specific inquiries…' },
              ]}
              note={<>Your information will be handled with discretion in accordance with our <TLink to="/privacy">privacy policy</TLink>.</>}
              successTitle="Inquiry received."
              successBody="Thank you — your inquiry has been delivered to our private client desk. An advisor will be in touch."
            />
          </div>
        </div>
      </section>

      <section className="section wrap">
        <SectionHead eyebrow="Curated advisory" title="Your next step, your way." lede="Start with what matters most to you." />
        <div className="grid-3" data-stagger>
          {pathways.map((p) => (
            <article className="card path" key={p.t} data-item>
              <div className="path__media"><ImageReveal image={p.image} alt="" reveal={false} className="path__frame" /></div>
              <div className="path__body">
                <p className="eyebrow">{p.k}</p>
                <h3 className="h-md">{p.t}</h3>
                <p>{p.b}</p>
                <TLink to={p.to} className="textlink stretched">{p.cta} <Arrow /></TLink>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section wrap visit">
        <div className="visit__media">
          <ImageReveal image={img.glass} alt="ROYAL central atelier, Austin" parallax={0.05} />
          <p className="label visit__cap">{hq ? `${hq.name} · Headquarters` : 'ROYAL'}</p>
        </div>
        <div>
          <p className="eyebrow" data-reveal>Visit ROYAL</p>
          <Split className="h-lg" text="Let’s meet in person." />
          <p className="lede lede--sm" data-reveal>Sometimes the best conversations happen face to face. Schedule a private consultation at one of our regional advisory salons.</p>
          <div className="offices" data-stagger>
            {offices.map((o) => (
              <article className="card office" key={o.name + o.address} data-item>
                <h3 className="label">{o.name}</h3>
                <p>{o.address}</p>
                <a href={telHref(o.phone)} className="accent">{o.phone}</a>
                <small className="dim">{o.hours}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      {showcase.length > 0 && <section className="section wrap">
        <SectionHead eyebrow="Curated portfolio" title="Still exploring?" lede="Discover a selection of distinctive homes from our collection." right={<Button to="/properties" variant="text" arrow>View all properties</Button>} />
        <div className="grid-3" data-stagger>{showcase.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
      </section>}

      <FinalCta eyebrow="When you’re ready" title="Your next chapter starts here." body="Tell us what you’re looking for. We’ll help you take the next step with clarity and a personal approach."
        primary={{ label: 'Start a conversation', to: '/contact#inquiry' }} secondary={{ label: 'Schedule a private tour', to: '/properties' }} />
    </Page>
  )
}
