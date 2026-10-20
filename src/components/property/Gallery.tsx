import { useCallback, useEffect, useRef, useState } from 'react'
import type { GalleryItem } from '../../cms/types'
import { gsap, prefersReducedMotion } from '../../motion/gsap'
import { Chevron, Close } from '../ui/Icons'

const pad = (n: number) => String(n).padStart(2, '0')

function Lightbox({ items, index, onIndex, onClose }: { items: GalleryItem[]; index: number; onIndex: (n: number) => void; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const n = items.length
  const step = useCallback((d: number) => onIndex((index + d + n) % n), [index, n, onIndex])

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    document.documentElement.classList.add('menu-open')
    closeBtn.current?.focus()
    if (root.current && !prefersReducedMotion()) gsap.from(root.current, { autoAlpha: 0, duration: 0.35 })
    return () => {
      document.documentElement.classList.remove('menu-open')
      opener?.focus?.({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'Tab' && root.current) {
        const f = Array.from(root.current.querySelectorAll<HTMLElement>('button'))
        const a = f[0], z = f[f.length - 1]
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
      }
    }
    document.addEventListener('keydown', key, true)
    return () => document.removeEventListener('keydown', key, true)
  }, [onClose, step])

  const it = items[index]
  return (
    <div ref={root} className="lightbox" role="dialog" aria-modal="true" aria-label="Photograph gallery" onKeyDown={(e) => e.stopPropagation()}>
      <button ref={closeBtn} className="lightbox__close" onClick={onClose}><span className="sr-only">Close gallery</span><Close /></button>
      <button className="gbtn gbtn--prev" onClick={() => step(-1)}><span className="sr-only">Previous photograph</span><Chevron dir="left" /></button>
      <figure className="lightbox__fig">
        <img src={it.image.src} alt={it.caption} style={it.position ? { objectPosition: it.position } : undefined} />
        <figcaption className="label">{pad(index + 1)} / {pad(n)} · {it.caption}</figcaption>
      </figure>
      <button className="gbtn gbtn--next" onClick={() => step(1)}><span className="sr-only">Next photograph</span><Chevron /></button>
    </div>
  )
}

export default function Gallery({ items, name }: { items: GalleryItem[]; name: string }) {
  const [i, setI] = useState(0)
  const [open, setOpen] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const cur = useRef(0)
  const n = items.length

  const go = useCallback((next: number) => {
    const to = (next + n) % n
    if (to === cur.current || !stage.current) return
    const els = stage.current.querySelectorAll<HTMLElement>('.gal__img')
    const from = els[cur.current], target = els[to]
    cur.current = to
    setI(to)
    if (prefersReducedMotion()) { gsap.set(from, { autoAlpha: 0 }); gsap.set(target, { autoAlpha: 1 }); return }
    gsap.killTweensOf([from, target])
    gsap.set(target, { zIndex: 2 })
    gsap.set(from, { zIndex: 1 })
    gsap.fromTo(target, { autoAlpha: 0, scale: 1.05 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'power2.out' })
    gsap.to(from, { autoAlpha: 0, duration: 0.9, ease: 'power2.out' })
  }, [n])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(cur.current + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur.current - 1) }
  }

  return (
    <div className="gal" onKeyDown={onKey}>
      <div className="gal__stage" ref={stage} role="group" aria-roledescription="carousel" aria-label={`${name} photographs`}>
        {items.map((it, k) => (
          <img key={k} className="gal__img" src={it.image.src} srcSet={`${it.image.sm} 720w, ${it.image.src} ${it.image.w}w`} sizes="(max-width: 900px) 100vw, 1200px"
            alt={it.caption} width={it.image.w} height={it.image.h} aria-hidden={k !== i}
            style={{ opacity: k === 0 ? 1 : 0, visibility: k === 0 ? 'visible' : 'hidden', objectPosition: it.position }}
            {...(k === 0 ? { fetchPriority: 'high' as const, 'data-priority': '' } : { loading: 'lazy' as const })} />
        ))}
        <button className="gbtn gbtn--prev" onClick={() => go(i - 1)}><span className="sr-only">Previous photograph</span><Chevron dir="left" /></button>
        <button className="gbtn gbtn--next" onClick={() => go(i + 1)}><span className="sr-only">Next photograph</span><Chevron /></button>
        <p className="gal__cap label" aria-live="polite">{pad(i + 1)} / {pad(n)} · {items[i].caption}</p>
        <button className="gal__all btn btn--wire btn--sm" onClick={() => setOpen(true)}><span>View all {n} photographs</span></button>
      </div>
      <ul className="gal__thumbs">
        {items.map((it, k) => (
          <li key={k}>
            <button className={`gthumb ${k === i ? 'is-active' : ''}`} onClick={() => go(k)} aria-label={`Show photograph ${k + 1}: ${it.caption}`} aria-current={k === i}>
              <img src={it.image.sm} alt="" width={240} height={150} loading="lazy" style={{ objectPosition: it.position }} />
              <span className="label">{pad(k + 1)} {it.caption}</span>
            </button>
          </li>
        ))}
      </ul>
      {open && <Lightbox items={items} index={i} onIndex={(k) => go(k)} onClose={() => setOpen(false)} />}
    </div>
  )
}
