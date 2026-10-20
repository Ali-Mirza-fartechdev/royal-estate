import { useState } from 'react'
import Page from '../components/layout/Page'
import PageHero from '../components/layout/PageHero'
import FinalCta from '../components/layout/FinalCta'
import ImageReveal from '../components/animation/ImageReveal'
import TLink from '../components/ui/TLink'
import { Arrow } from '../components/ui/Icons'
import { fmtDate } from '../cms/format'
import { useContent } from '../cms/ContentProvider'
import { img } from '../data/images'
import { useRefreshOnChange } from '../hooks/usePageMotion'

const CATS = ['All', 'Architecture', 'Neighborhoods', 'Advisory'] as const

export default function JournalPage() {
  const { articles } = useContent()
  const [cat, setCat] = useState<(typeof CATS)[number]>('All')
  const sorted = [...articles].sort((a, b) => b.date.localeCompare(a.date))
  const [lead, ...rest] = sorted
  const list = (cat === 'All' ? rest : sorted.filter((a) => a.category === cat))
  useRefreshOnChange(cat)
  return (
    <Page title="Journal">
      <PageHero eyebrow="The Royal journal" title={'Notes on architecture,\nplace and living well.'} lede="Considered writing on residences, neighborhoods and the decisions behind a great move." image={img.pine} imagePosition="50% 55%" compact />

      <section className="section wrap">
        {cat === 'All' && lead && (
          <article className="lead card" data-reveal>
            <ImageReveal image={lead.image} alt="" reveal={false} className="lead__img" />
            <div className="lead__body">
              <p className="eyebrow">Featured · {lead.category}</p>
              <h2 className="h-lg"><TLink to={`/journal/${lead.slug}`} className="stretched">{lead.title}</TLink></h2>
              <p>{lead.excerpt}</p>
              <p className="label dim">{fmtDate(lead.date)} · {lead.read} read</p>
            </div>
          </article>
        )}
        <div className="chips" role="group" aria-label="Filter articles">
          {CATS.map((c) => <button key={c} className={`chip ${c === cat ? 'is-active' : ''}`} aria-pressed={c === cat} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div className="grid-3" data-stagger key={cat}>
          {list.map((a) => (
            <article className="card acard" key={a.id} data-item>
              <ImageReveal image={a.image} alt="" reveal={false} className="acard__img" small />
              <div className="acard__body">
                <p className="label dim">{a.category} · {a.read}</p>
                <h3 className="h-md"><TLink to={`/journal/${a.slug}`} className="stretched">{a.title}</TLink></h3>
                <p>{a.excerpt}</p>
                <span className="textlink">Read <Arrow /></span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <FinalCta eyebrow="Private advisory" title="Have a question we haven’t answered?" body="Our advisors are happy to talk through any part of the process."
        primary={{ label: 'Start a conversation', to: '/contact#inquiry' }} secondary={{ label: 'View properties', to: '/properties' }} />
    </Page>
  )
}
