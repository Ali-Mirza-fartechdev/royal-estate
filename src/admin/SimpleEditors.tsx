import EditorShell from './EditorShell'
import { useEntity } from './useEntity'
import { ImageField, SelectField, TextArea, TextField, Toggle } from './kit'
import { slugify, uid } from '../cms/format'
import type { Article, ArticleCategory, Img, Neighborhood, NeighborhoodCategory, TeamMember } from '../cms/types'

/* ======================= Neighborhood ======================= */
interface NForm { name: string; slug: string; slugTouched: boolean; city: string; state: string; tag: string; category: NeighborhoodCategory; blurb: string; image?: Img; published: boolean; featured: boolean }
export function NeighborhoodEditor() {
  const { form, patch, errors, saving, dirty, save, remove, isNew, prev, missing } = useEntity<'neighborhoods', NForm>({
    kind: 'neighborhoods', base: '/admin/neighborhoods', noun: 'Neighborhood',
    blank: () => ({ name: '', slug: '', slugTouched: false, city: '', state: '', tag: '', category: 'Established Estates', blurb: '', published: false, featured: false }),
    toForm: (n: Neighborhood) => ({ name: n.name, slug: n.slug, slugTouched: true, city: n.city, state: n.state, tag: n.tag, category: n.category, blurb: n.blurb, image: n.image, published: n.published, featured: n.featured }),
    fromForm: (f, p): Neighborhood => ({ id: p?.id ?? uid(), sort: p?.sort ?? 0, updatedAt: p?.updatedAt ?? '', slug: f.slug, name: f.name.trim(), city: f.city.trim(), state: f.state.trim(), tag: f.tag.trim(), category: f.category, blurb: f.blurb.trim(), image: f.image!, published: f.published, featured: f.featured }),
    validate: (f) => {
      const e: Record<string, string> = {}
      if (!f.name.trim()) e.name = 'Enter the neighborhood name.'
      if (!f.slug) e.slug = 'The web address cannot be empty.'
      if (!f.image) e.image = 'Add a photo.'
      return e
    },
  })
  if (missing) return <p className="dim">This neighborhood no longer exists.</p>
  if (!form) return <p className="dim">Loading…</p>
  return (
    <EditorShell title={isNew ? 'New neighborhood' : form.name} back={{ to: '/admin/neighborhoods', label: 'All neighborhoods' }} saving={saving} dirty={dirty} onSave={save} onDelete={isNew ? undefined : remove} viewHref={prev?.published ? '/neighborhoods' : undefined}>
      <div className="ad-section ad-section--flat"><div className="ad-section__body">
        <div className="ad-grid">
          <TextField label="Name" required value={form.name} error={errors.name} onChange={(v) => patch({ name: v, ...(form.slugTouched ? {} : { slug: slugify(v) }) })} />
          <TextField label="Web address" value={form.slug} error={errors.slug} onChange={(v) => patch({ slug: slugify(v), slugTouched: true })} />
          <TextField label="City" value={form.city} onChange={(v) => patch({ city: v })} />
          <TextField label="State" value={form.state} onChange={(v) => patch({ state: v })} />
          <TextField label="Short descriptor" value={form.tag} onChange={(v) => patch({ tag: v })} placeholder="e.g. Hill Country Vista" />
          <SelectField label="Category" value={form.category} onChange={(v) => patch({ category: v as NeighborhoodCategory })} options={['Established Estates', 'Contemporary Living', 'Private Retreats']} />
          <TextArea label="Description" rows={4} value={form.blurb} onChange={(v) => patch({ blurb: v })} />
          <ImageField label="Photo" value={form.image} error={errors.image} onChange={(v) => patch({ image: v })} />
        </div>
        <div className="ad-toggles">
          <Toggle label="Published" checked={form.published} onChange={(v) => patch({ published: v })} hint="Off = draft." />
          <Toggle label="Featured" checked={form.featured} onChange={(v) => patch({ featured: v })} hint="Shown as a large feature and on the home page." />
        </div>
      </div></div>
    </EditorShell>
  )
}

/* ======================= Article ======================= */
interface AForm { title: string; slug: string; slugTouched: boolean; category: ArticleCategory; date: string; read: string; excerpt: string; body: string; image?: Img; published: boolean }
export function ArticleEditor() {
  const { form, patch, errors, saving, dirty, save, remove, isNew, prev, missing } = useEntity<'articles', AForm>({
    kind: 'articles', base: '/admin/journal', noun: 'Article',
    blank: () => ({ title: '', slug: '', slugTouched: false, category: 'Architecture', date: new Date().toISOString().slice(0, 10), read: '4 min', excerpt: '', body: '', published: false }),
    toForm: (a: Article) => ({ title: a.title, slug: a.slug, slugTouched: true, category: a.category, date: a.date, read: a.read, excerpt: a.excerpt, body: a.body.join('\n\n'), image: a.image, published: a.published }),
    fromForm: (f, p): Article => ({ id: p?.id ?? uid(), sort: p?.sort ?? 0, updatedAt: p?.updatedAt ?? '', slug: f.slug, title: f.title.trim(), category: f.category, date: f.date, read: f.read.trim(), excerpt: f.excerpt.trim(), image: f.image!, body: f.body.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean), published: f.published }),
    validate: (f) => {
      const e: Record<string, string> = {}
      if (!f.title.trim()) e.title = 'Enter a title.'
      if (!f.slug) e.slug = 'The web address cannot be empty.'
      if (!f.image) e.image = 'Add a cover photo.'
      if (!f.date) e.date = 'Choose a date.'
      return e
    },
  })
  if (missing) return <p className="dim">This article no longer exists.</p>
  if (!form) return <p className="dim">Loading…</p>
  return (
    <EditorShell title={isNew ? 'New article' : form.title} back={{ to: '/admin/journal', label: 'All articles' }} saving={saving} dirty={dirty} onSave={save} onDelete={isNew ? undefined : remove} viewHref={prev?.published ? `/journal/${prev.slug}` : undefined}>
      <div className="ad-section ad-section--flat"><div className="ad-section__body">
        <div className="ad-grid">
          <TextField label="Title" required full value={form.title} error={errors.title} onChange={(v) => patch({ title: v, ...(form.slugTouched ? {} : { slug: slugify(v) }) })} />
          <TextField label="Web address" value={form.slug} error={errors.slug} onChange={(v) => patch({ slug: slugify(v), slugTouched: true })} />
          <SelectField label="Category" value={form.category} onChange={(v) => patch({ category: v as ArticleCategory })} options={['Architecture', 'Neighborhoods', 'Advisory']} />
          <TextField label="Date" type="date" value={form.date} error={errors.date} onChange={(v) => patch({ date: v })} />
          <TextField label="Reading time" value={form.read} onChange={(v) => patch({ read: v })} placeholder="4 min" />
          <TextArea label="Excerpt" rows={3} value={form.excerpt} onChange={(v) => patch({ excerpt: v })} hint="Shown on cards and as the article intro." />
          <TextArea label="Article text" rows={14} value={form.body} onChange={(v) => patch({ body: v })} hint="Separate paragraphs with a blank line." />
          <ImageField label="Cover photo" value={form.image} error={errors.image} onChange={(v) => patch({ image: v })} />
        </div>
        <div className="ad-toggles"><Toggle label="Published" checked={form.published} onChange={(v) => patch({ published: v })} hint="Off = draft." /></div>
      </div></div>
    </EditorShell>
  )
}

/* ======================= Team ======================= */
interface TForm { name: string; slug: string; role: string; unit: string; bio: string; email: string; phone: string; image?: Img; published: boolean }
export function TeamEditor() {
  const { form, patch, errors, saving, dirty, save, remove, isNew, missing } = useEntity<'team', TForm>({
    kind: 'team', base: '/admin/team', noun: 'Team member',
    blank: () => ({ name: '', slug: '', role: '', unit: '', bio: '', email: '', phone: '', published: true }),
    toForm: (t: TeamMember) => ({ name: t.name, slug: t.slug, role: t.role, unit: t.unit, bio: t.bio, email: t.email, phone: t.phone, image: t.image, published: t.published }),
    fromForm: (f, p): TeamMember => ({ id: p?.id ?? uid(), sort: p?.sort ?? 0, updatedAt: p?.updatedAt ?? '', slug: slugify(f.name) || p?.slug || uid(), name: f.name.trim(), role: f.role.trim(), unit: f.unit.trim(), bio: f.bio.trim(), email: f.email.trim(), phone: f.phone.trim(), image: f.image!, published: f.published }),
    validate: (f) => {
      const e: Record<string, string> = {}
      if (!f.name.trim()) e.name = 'Enter the name.'
      if (!f.image) e.image = 'Add a portrait photo.'
      if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) e.email = 'Enter a valid email address.'
      return e
    },
  })
  if (missing) return <p className="dim">This team member no longer exists.</p>
  if (!form) return <p className="dim">Loading…</p>
  return (
    <EditorShell title={isNew ? 'New team member' : form.name} back={{ to: '/admin/team', label: 'All team' }} saving={saving} dirty={dirty} onSave={save} onDelete={isNew ? undefined : remove} viewHref="/about">
      <div className="ad-section ad-section--flat"><div className="ad-section__body">
        <div className="ad-grid">
          <TextField label="Full name" required value={form.name} error={errors.name} onChange={(v) => patch({ name: v })} />
          <TextField label="Role" value={form.role} onChange={(v) => patch({ role: v })} placeholder="Senior Property Advisor" />
          <TextField label="Division" value={form.unit} onChange={(v) => patch({ unit: v })} placeholder="Texas Architectural Division" />
          <TextField label="Email" type="email" value={form.email} error={errors.email} onChange={(v) => patch({ email: v })} />
          <TextField label="Phone" type="tel" value={form.phone} onChange={(v) => patch({ phone: v })} />
          <TextArea label="Short bio" rows={4} value={form.bio} onChange={(v) => patch({ bio: v })} />
          <ImageField label="Portrait" value={form.image} error={errors.image} onChange={(v) => patch({ image: v })} hint="Portrait orientation works best." />
        </div>
        <div className="ad-toggles"><Toggle label="Published" checked={form.published} onChange={(v) => patch({ published: v })} hint="Shown on the About page and available as a property advisor." /></div>
      </div></div>
    </EditorShell>
  )
}
