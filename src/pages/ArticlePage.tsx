import { Navigate, useParams } from 'react-router-dom'
import Page from '../components/layout/Page'
import FinalCta from '../components/layout/FinalCta'
import ImageReveal from '../components/animation/ImageReveal'
import TLink from '../components/ui/TLink'
import { Arrow } from '../components/ui/Icons'
import { fmtDate } from '../cms/format'
import { useContent } from '../cms/ContentProvider'

export default function ArticlePage() {
  const { slug } = useParams()
  const { articles } = useContent()
  const a = articles.find((x) => x.slug === slug)
  if (!a) return <Navigate to="/404" replace />
  const related = articles.filter((x) => x.id !== a.id).slice(0, 3)
  return (
    <Page key={a.id} title={a.title} className="article">
      <header className="wrap article__head">
        <nav className="crumbs label" aria-label="Breadcrumb" data-hero><TLink to="/journal">Journal</TLink><span>/</span><span aria-current="page">{a.category}</span></nav>
        <h1 className="h-display h-display--md" data-hero>{a.title}</h1>
        <p className="label dim" data-hero>{fmtDate(a.date)} · {a.read} read</p>
      </header>
      <div className="wrap"><ImageReveal image={a.image} alt="" priority className="article__img" /></div>
      <div className="wrap article__body prose">
        <p className="lede" data-reveal>{a.excerpt}</p>
        {a.body.map((t, i) => <p key={i} data-reveal>{t}</p>)}
      </div>
      <section className="section wrap">
        <p className="eyebrow" data-reveal>Related reading</p>
        <div className="grid-3" data-stagger>
          {related.map((r) => (
            <article className="card acard" key={r.id} data-item>
              <ImageReveal image={r.image} alt="" reveal={false} className="acard__img" small />
              <div className="acard__body">
                <p className="label dim">{r.category} · {r.read}</p>
                <h3 className="h-md"><TLink to={`/journal/${r.slug}`} className="stretched">{r.title}</TLink></h3>
                <span className="textlink">Read <Arrow /></span>
              </div>
            </article>
          ))}
        </div>
      </section>
      <FinalCta eyebrow="Private advisory" title="Let’s talk about your next move." body="Speak with an advisor about homes, neighborhoods or a confidential sale."
        primary={{ label: 'Start a conversation', to: '/contact#inquiry' }} secondary={{ label: 'View properties', to: '/properties' }} />
    </Page>
  )
}
