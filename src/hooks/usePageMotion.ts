import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { gsap, ScrollTrigger, EASE, DUR } from '../motion/gsap'
import { intro } from '../motion/intro'

/**
 * Declarative scroll + hero choreography driven by data attributes, scoped to
 * one page element and fully reverted on unmount (Strict Mode safe).
 *
 *  [data-hero-bg]            hero image: scale 1.04 -> 1 + clip reveal
 *  [data-hero]               staggered entrance (order = DOM order)
 *  [data-reveal]             fade/translate in on scroll
 *  [data-stagger]            children [data-item] reveal in sequence
 *  [data-split]              words rise from a mask (see <Split/>)
 *  [data-img-reveal]         clip-path image reveal (+ inner scale)
 *  [data-parallax="0.08"]    gentle parallax on inner element (desktop only)
 *  [data-line]               hairline grows from the left
 */
export function usePageMotion(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  const heroTl = useRef<gsap.core.Timeline | null>(null)

  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    const mm = gsap.matchMedia()
    let offIntro = () => {}

    mm.add(
      { reduce: '(prefers-reduced-motion: reduce)', ok: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 900px)' },
      (ctx) => {
        const c = ctx.conditions as { reduce: boolean; ok: boolean; desktop: boolean }
        if (c.reduce) return

        const q = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel, root)

        /* ---------- hero ---------- */
        const heroEls = q('[data-hero]')
        const heroBg = q('[data-hero-bg]')
        if (heroEls.length || heroBg.length) {
          if (heroEls.length) gsap.set(heroEls, { autoAlpha: 0, y: 28 })
          if (heroBg.length) gsap.set(heroBg, { clipPath: 'inset(6% 6% 6% 6%)', scale: 1.04, autoAlpha: 0.001 })
          const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.out } })
          if (heroBg.length)
            tl.to(heroBg, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, autoAlpha: 1, duration: DUR.hero, ease: EASE.inOut }, 0)
          if (heroEls.length) tl.to(heroEls, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.11 }, 0.35)
          heroTl.current = tl
          const wasDone = intro.isDone() // true on in-app navigation, false on first load
          offIntro = intro.onDone(() => {
            if (wasDone) ctx.add(() => { gsap.delayedCall(0.3, () => tl.play()) })
            else tl.play()
          })
          // failsafe: never leave hero content hidden
          const safety = window.setTimeout(() => tl.play(), 6000)
          ctx.add(() => window.clearTimeout(safety))
        }

        /* ---------- scroll reveals ---------- */
        const st = { start: 'top 88%', once: true }

        q('[data-reveal]').forEach((el) => {
          gsap.from(el, { autoAlpha: 0, y: 34, duration: DUR.section, ease: EASE.out, scrollTrigger: { trigger: el, ...st } })
        })

        q('[data-stagger]').forEach((el) => {
          const items = gsap.utils.toArray<HTMLElement>('[data-item]', el)
          if (!items.length) return
          gsap.from(items, {
            autoAlpha: 0,
            y: 40,
            duration: 0.85,
            ease: EASE.out,
            stagger: 0.1,
            scrollTrigger: { trigger: el, ...st },
          })
        })

        q('[data-split]').forEach((el) => {
          const words = el.querySelectorAll('.w > span')
          if (!words.length) return
          gsap.from(words, {
            yPercent: 110,
            duration: 0.95,
            ease: EASE.out,
            stagger: 0.045,
            scrollTrigger: { trigger: el, ...st, start: 'top 90%' },
          })
        })

        q('[data-img-reveal]').forEach((el) => {
          const inner = el.querySelector('img')
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, ...st, start: 'top 90%' } })
          tl.from(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: EASE.inOut })
          if (inner) tl.from(inner, { scale: 1.14, duration: 1.4, ease: EASE.out }, 0)
        })

        q('[data-line]').forEach((el) => {
          gsap.from(el, { scaleX: 0, transformOrigin: 'left center', duration: 1.2, ease: EASE.inOut, scrollTrigger: { trigger: el, ...st } })
        })

        if (c.desktop) {
          q('[data-parallax]').forEach((el) => {
            const amt = parseFloat(el.dataset.parallax || '0.08')
            gsap.fromTo(
              el,
              { yPercent: -amt * 100 },
              { yPercent: amt * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
            )
          })
        }
      },
      root,
    )

    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    // layout can shift once webfonts arrive
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {})

    return () => {
      offIntro()
      window.removeEventListener('load', onLoad)
      mm.revert()
      heroTl.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Refresh triggers after content-height changes (filters, accordions). */
export function useRefreshOnChange(dep: unknown) {
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [dep])
}
