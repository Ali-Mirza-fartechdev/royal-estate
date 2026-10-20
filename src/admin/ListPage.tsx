import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { store } from '../cms'
import type { Kind, KindMap } from '../cms/types'
import { formatPrice, listingLabel } from '../cms/format'
import { useConfirm, useToast } from './kit'

type Row = KindMap[Kind]
interface Cfg {
  kind: Kind
  title: string
  noun: string
  base: string
  publicPath: (r: never) => string | null
  meta: (r: never) => string
  name: (r: never) => string
  image: (r: never) => string | undefined
  badges?: (r: never) => string[]
  blurb: string
}

const CONFIGS: Record<Kind, Cfg> = {
  properties: {
    kind: 'properties', title: 'Properties', noun: 'property', base: '/admin/properties',
    blurb: 'Homes for sale and for rent. Published properties appear on the website immediately.',
    publicPath: ((r: KindMap['properties']) => `/properties/${r.slug}`) as never,
    name: ((r: KindMap['properties']) => r.name) as never,
    image: ((r: KindMap['properties']) => r.hero?.sm) as never,
    meta: ((r: KindMap['properties']) => `${formatPrice(r)} · ${r.city}${r.stateCode ? ', ' + r.stateCode : ''} · ${r.beds} bd / ${r.baths} ba`) as never,
    badges: ((r: KindMap['properties']) => [listingLabel(r), ...(r.featured ? ['Featured'] : [])]) as never,
  },
  neighborhoods: {
    kind: 'neighborhoods', title: 'Neighborhoods', noun: 'neighborhood', base: '/admin/neighborhoods',
    blurb: 'Areas shown on the Neighborhoods page and home page.',
    publicPath: (() => '/neighborhoods') as never,
    name: ((r: KindMap['neighborhoods']) => r.name) as never,
    image: ((r: KindMap['neighborhoods']) => r.image?.sm) as never,
    meta: ((r: KindMap['neighborhoods']) => `${r.city}, ${r.state} · ${r.category}`) as never,
    badges: ((r: KindMap['neighborhoods']) => (r.featured ? ['Featured'] : [])) as never,
  },
  articles: {
    kind: 'articles', title: 'Journal', noun: 'article', base: '/admin/journal',
    blurb: 'Articles for the Journal page.',
    publicPath: ((r: KindMap['articles']) => `/journal/${r.slug}`) as never,
    name: ((r: KindMap['articles']) => r.title) as never,
    image: ((r: KindMap['articles']) => r.image?.sm) as never,
    meta: ((r: KindMap['articles']) => `${r.category} · ${r.date}`) as never,
  },
  team: {
    kind: 'team', title: 'Team', noun: 'team member', base: '/admin/team',
    blurb: 'People shown on the About page. They can also be assigned as a property’s advisor.',
    publicPath: (() => '/about') as never,
    name: ((r: KindMap['team']) => r.name) as never,
    image: ((r: KindMap['team']) => r.image?.sm) as never,
    meta: ((r: KindMap['team']) => r.role) as never,
  },
}

export default function ListPage({ kind }: { kind: Kind }) {
  const cfg = CONFIGS[kind]
  const toast = useToast()
  const confirm = useConfirm()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [q, setQ] = useState('')

  const load = useCallback(() => {
    store.list(kind, { all: true }).then((r) => setRows(r as Row[])).catch((e) => { toast((e as Error).message, 'err'); setRows([]) })
  }, [kind, toast])
  useEffect(() => { setRows(null); load() }, [load])

  const togglePublished = async (r: Row) => {
    try { await store.save(kind, { ...r, published: !r.published } as never); toast(r.published ? 'Moved to drafts.' : 'Published.'); load() } catch (e) { toast((e as Error).message, 'err') }
  }
  const del = async (r: Row) => {
    const ok = await confirm({ title: `Delete “${cfg.name(r as never)}”?`, body: 'This removes it from the website and cannot be undone.', confirm: 'Delete', danger: true })
    if (!ok) return
    try { await store.remove(kind, r.id); toast('Deleted.'); load() } catch (e) { toast((e as Error).message, 'err') }
  }
  const move = async (i: number, d: number) => {
    if (!rows) return
    const j = i + d
    if (j < 0 || j >= rows.length) return
    const a = rows[i], b = rows[j]
    try {
      await store.save(kind, { ...a, sort: b.sort } as never)
      await store.save(kind, { ...b, sort: a.sort } as never)
      load()
    } catch (e) { toast((e as Error).message, 'err') }
  }

  const shown = rows?.filter((r) => !q || cfg.name(r as never).toLowerCase().includes(q.toLowerCase()))

  return (
    <div>
      <div className="ad-head">
        <div><h1 className="h-lg">{cfg.title}</h1><p className="dim">{cfg.blurb}</p></div>
        <Link to={`${cfg.base}/new`} className="btn btn--solid btn--sm"><span>Add {cfg.noun}</span></Link>
      </div>
      {rows && rows.length > 5 && <input className="ad-search" type="search" placeholder={`Search ${cfg.title.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />}
      {!rows ? <p className="dim">Loading…</p> : rows.length === 0 ? (
        <div className="ad-empty card"><h3 className="h-md">Nothing here yet.</h3><p className="dim">Add your first {cfg.noun} to get started.</p>
          <Link to={`${cfg.base}/new`} className="btn btn--solid btn--sm"><span>Add {cfg.noun}</span></Link></div>
      ) : (
        <ul className="ad-list">
          {shown!.map((r, i) => (
            <li key={r.id} className="ad-list__row card">
              <div className="ad-list__img">{cfg.image(r as never) ? <img src={cfg.image(r as never)} alt="" loading="lazy" /> : null}</div>
              <div className="ad-list__main">
                <Link to={`${cfg.base}/${r.id}`} className="h-sm">{cfg.name(r as never)}</Link>
                <p className="dim">{cfg.meta(r as never)}</p>
                <div className="ad-row">
                  <span className={`ad-chip ${r.published ? 'ad-chip--on' : ''}`}>{r.published ? 'Published' : 'Draft'}</span>
                  {cfg.badges?.(r as never).map((b) => <span className="ad-chip" key={b}>{b}</span>)}
                </div>
              </div>
              <div className="ad-list__actions">
                {!q && <><button className="ad-link" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${cfg.name(r as never)} up`}>↑</button>
                <button className="ad-link" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label={`Move ${cfg.name(r as never)} down`}>↓</button></>}
                <button className="ad-link" onClick={() => togglePublished(r)}>{r.published ? 'Unpublish' : 'Publish'}</button>
                <Link className="ad-link" to={`${cfg.base}/${r.id}`}>Edit</Link>
                {r.published && cfg.publicPath(r as never) && <a className="ad-link" href={cfg.publicPath(r as never)!} target="_blank" rel="noopener noreferrer">View</a>}
                <button className="ad-link ad-link--danger" onClick={() => del(r)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
