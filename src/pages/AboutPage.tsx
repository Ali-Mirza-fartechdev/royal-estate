import Page from '../components/layout/Page'
import PageHero, { SectionHead } from '../components/layout/PageHero'
import FinalCta from '../components/layout/FinalCta'
import Split from '../components/animation/Split'
import ImageReveal from '../components/animation/ImageReveal'
import PropertyCard from '../components/property/PropertyCard'
import Button from '../components/ui/Button'
import { img } from '../data/images'
import { useContent } from '../cms/ContentProvider'

const principles = [
  ['Personal attention', 'Every client brings a different perspective. We take time to understand individual priorities and tailor the property journey accordingly.'],
  ['Thoughtful expertise', 'From neighborhood character to architectural detail, we look beyond the surface to help clients evaluate what truly matters.'],
  ['Lasting relationships', 'We believe the best property experiences are built on trust, clear communication, and a commitment that extends beyond closing.'],
]
const services = [
  ['Property discovery', 'Identify residences that align with your priorities, preferred lifestyle and long-term vision through private networks and off-market intelligence.'],
  ['Neighborhood insight', 'Explore the character, setting and everyday considerations that distinguish one location from another.'],
  ['Personalized guidance', 'Navigate important decisions with attentive communication, careful valuation and a clear understanding of the acquisition process.'],
]
const steps = [
  ['Understand', 'We begin by learning about your priorities, aesthetic preferences, daily rhythm and long-term vision.'],
  ['Discover', 'We identify relevant properties and locations worth exploring, including unlisted residences.'],
  ['Evaluate', 'We help you consider the structural details, material honesty and site implications that inform a decision.'],
  ['Move forward', 'We provide thoughtful, strategic guidance as you negotiate, acquire and progress toward your next chapter.'],
]

export default function AboutPage() {
  const { team, properties } = useContent()
  const showcase = (properties.some((p) => p.featured) ? properties.filter((p) => p.featured) : properties).slice(0, 3)
  return (
    <Page title="About">
      <PageHero eyebrow="About ROYAL" title={'Real estate,\nconsidered differently.'} lede="We believe exceptional property experiences begin with understanding people, places, and the details that make a house feel like home."
        image={img.glass} imagePosition="50% 60%"
        actions={<><Button to="/about#approach">Explore our approach</Button><Button to="/about#team" variant="text" arrow>Meet ROYAL</Button></>} />

      <section className="section wrap intro-split" id="approach">
        <p className="eyebrow eyebrow--rule" data-reveal><i data-line />Our philosophy</p>
        <Split className="h-xl intro-split__h" text={'Exceptional living starts\nwith understanding.'} />
        <div className="intro-split__body" data-reveal>
          <p className="lede">Finding the right property is about far more than square footage, finishes or coordinates on a map. It requires understanding a lifestyle vision, an appreciation for light and spatial proportion, and the long-term context of how your life unfolds.</p>
          <p>At ROYAL, we reject the hurried, transactional nature of conventional brokerage. We operate as confidential custodians of architectural masterworks, matching discerning clients with homes that resonate with their sensibilities through attentive guidance and considered perspective.</p>
        </div>
      </section>

      <section className="section wrap study" id="story">
        <ImageReveal image={img.desert} alt="Modernist desert residence at dusk" parallax={0.05} className="study__img" />
        <div className="study__body">
          <p className="label dim" data-reveal>Architectural preservation</p>
          <p className="eyebrow" data-reveal>The story behind ROYAL</p>
          <Split className="h-xl" text={'Built around what\nmatters.'} />
          <p className="lede lede--sm" data-reveal>Every property has a story. Every client has a different vision of home. Our role is to bring those two perspectives together through attentive service, local insight and a commitment to thoughtful decision-making.</p>
          <p data-reveal>Real estate is not a transaction; it is a foundational relationship. We intentionally limit our active advisory portfolio so each acquisition or disposition receives unhurried, exhaustive scrutiny.</p>
          <div data-reveal><Button to="/contact#inquiry" variant="text" arrow>Our client approach</Button></div>
        </div>
      </section>

      <section className="section wrap">
        <SectionHead eyebrow="What guides us" title="The standard behind every decision." />
        <div className="attrs" data-stagger>
          {principles.map(([t, b], i) => (
            <article className="attr" key={t} data-item><span className="attr__n">0{i + 1}</span><h3 className="h-md">{t}</h3><p>{b}</p></article>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <SectionHead eyebrow="Capabilities" title="Clarity at every stage." lede="From the first conversation to the final decision, our approach is designed to make each step more considered." />
        <div className="grid-3" data-stagger>
          {services.map(([t, b], i) => (
            <article className="card pillar" key={t} data-item><p className="label dim">Service 0{i + 1}</p><h3 className="h-md">{t}</h3><p>{b}</p></article>
          ))}
        </div>
      </section>

      {team.length > 0 && <section className="section wrap" id="team">
        <SectionHead eyebrow="Leadership" title="Personal relationships. Professional perspective." lede="Real estate is ultimately about people. Meet the team dedicated to helping clients find the right place to call home." />
        <div className="grid-3 team" data-stagger>
          {team.map((m) => (
            <article key={m.id} className="member" data-item>
              <ImageReveal image={m.image} alt={`Portrait of ${m.name}`} reveal={false} className="member__img" small />
              <h3 className="h-md">{m.name}</h3>
              <p className="label dim">{m.role}</p>
              <p>{m.bio}</p>
            </article>
          ))}
        </div>
      </section>}

      <section className="section wrap">
        <SectionHead eyebrow="How we work" title="Considered from beginning to end." />
        <ol className="steps" data-stagger>
          {steps.map(([t, b], i) => (<li key={t} data-item><span className="attr__n">0{i + 1}</span><h3 className="h-md">{t}</h3><p>{b}</p></li>))}
        </ol>
      </section>

      <section className="axiom">
        <div className="wrap">
          <p className="eyebrow" data-reveal>ROYAL axiom</p>
          <Split className="h-display h-display--md" text="“Good property decisions begin with the right perspective.”" />
        </div>
      </section>

      {showcase.length > 0 && <section className="section wrap">
        <SectionHead eyebrow="Curated portfolio" title="A closer look at exceptional homes." lede="A selection of distinctive residences." right={<Button to="/properties" variant="text" arrow>Explore all properties</Button>} />
        <div className="grid-3" data-stagger>{showcase.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
      </section>}

      <FinalCta eyebrow="Your next chapter" title="Find a home that feels like you." body="Tell us what you are looking for. We will help you take the next step with a more personal, considered approach to real estate."
        primary={{ label: 'Start a conversation', to: '/contact#inquiry' }} secondary={{ label: 'Explore neighborhoods', to: '/neighborhoods' }} />
    </Page>
  )
}
