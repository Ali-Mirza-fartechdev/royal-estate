import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion, EASE } from '../../motion/gsap'
import { intro } from '../../motion/intro'

const KEY = 'royal:intro-seen'
export const shouldShowLoader = () => {
  try {
    return sessionStorage.getItem(KEY) !== '1'
  } catch {
    return true
  }
}

const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  new Promise<void>((res) => {
    const t = window.setTimeout(res, ms)
    p.then(() => res(), () => res()).finally(() => window.clearTimeout(t))
  })

/**
 * First-visit loader. The progress line is driven by REAL readiness
 * (webfonts + the current route's priority images); there is no fake
 * percentage. A hard cap guarantees it can never hang, and any click/key
 * skips it.
 */
export default function PageLoader({ onDone, contentReady }: { onDone: () => void; contentReady: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const resolveContent = useRef<() => void>(() => {})
  useEffect(() => {
    if (contentReady) resolveContent.current()
  }, [contentReady])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduced = prefersReducedMotion()
    document.documentElement.classList.add('is-loading')

    const state = { target: 0, shown: 0 }
    const pct = el.querySelector<HTMLElement>('.loader__pct')
    const bar = el.querySelector<HTMLElement>('.loader__bar span')
    const render = () => {
      if (bar) bar.style.transform = `scaleX(${state.shown})`
      if (pct) pct.textContent = String(Math.round(state.shown * 100)).padStart(3, '0')
    }
    render()

    let finished = false
    let dead = false
    let skip = false
    let exit: gsap.core.Timeline | null = null

    const finish = () => {
      if (finished || dead) return
      finished = true
      document.documentElement.classList.remove('is-loading')
      try { sessionStorage.setItem(KEY, '1') } catch { /* ignore */ }
      if (reduced) {
        intro.finish()
        onDone()
        return
      }
      exit = gsap.timeline({ onComplete: onDone })
      exit
        .to(el.querySelector('.loader__inner'), { autoAlpha: 0, y: -24, duration: 0.4, ease: EASE.out })
        .add(() => intro.finish(), '>-0.05')
        .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.85, ease: EASE.inOut }, '<')
    }

    // ----- real readiness: fonts, site content, then the route's priority images -----
    const contentP = new Promise<void>((res) => { resolveContent.current = res; if (contentReady) res() })
    let settled = 0
    const total = 3
    const mark = () => {
      settled++
      state.target = Math.min(1, settled / total)
    }
    const fontsT = withTimeout(document.fonts?.ready ?? Promise.resolve(), 3000).then(mark)
    const contentT = withTimeout(contentP, 5000).then(mark)
    const imagesT = contentT
      .then(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))))
      .then(() => {
        const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('img[data-priority]'))
        return withTimeout(Promise.all(imgs.map((im) => (im.decode ? im.decode() : Promise.resolve()))), 3500)
      })
      .then(mark)
    const tasks = [fontsT, contentT, imagesT]

    // ----- entrance -----
    const letters = el.querySelectorAll('.loader__mark span span')
    const minMs = reduced ? 0 : 1300
    const startedAt = performance.now()
    let enter: gsap.core.Timeline | null = null
    if (!reduced) {
      enter = gsap
        .timeline({ defaults: { ease: EASE.out } })
        .from(letters, { yPercent: 115, duration: 1, stagger: 0.07 })
        .from(el.querySelector('.loader__line'), { scaleX: 0, transformOrigin: 'left', duration: 1.1, ease: EASE.inOut }, 0.2)
        .from(el.querySelectorAll('.loader__meta > *'), { autoAlpha: 0, y: 10, duration: 0.7, stagger: 0.1 }, 0.5)
    }

    const tick = () => {
      state.shown += (state.target - state.shown) * 0.14
      if (state.target - state.shown < 0.002) state.shown = state.target
      render()
    }
    gsap.ticker.add(tick)

    const readyAll = Promise.all(tasks).then(() => undefined)
    const hardCap = window.setTimeout(() => (skip = true), 6000)

    const run = async () => {
      await Promise.race([readyAll, new Promise<void>((r) => window.setTimeout(r, 5500))])
      if (dead) return
      state.target = 1
      const wait = Math.max(0, minMs - (performance.now() - startedAt))
      await new Promise<void>((r) => {
        const t = window.setInterval(() => {
          if (skip) { window.clearInterval(t); r() }
        }, 60)
        window.setTimeout(() => { window.clearInterval(t); r() }, wait)
      })
      if (dead) return
      gsap.ticker.remove(tick)
      state.shown = 1
      render()
      finish()
    }
    run()

    const skipNow = () => { skip = true }
    window.addEventListener('keydown', skipNow)
    el.addEventListener('pointerdown', skipNow)

    return () => {
      dead = true
      window.clearTimeout(hardCap)
      gsap.ticker.remove(tick)
      window.removeEventListener('keydown', skipNow)
      enter?.kill()
      exit?.kill()
      document.documentElement.classList.remove('is-loading')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDone])

  return (
    <div ref={root} className="loader" role="status" aria-live="polite" aria-label="Loading ROYAL">
      <div className="loader__inner">
        <div className="loader__mark" aria-hidden="true">
          {'ROYAL'.split('').map((c, i) => (
            <span key={i}>
              <span>{c}</span>
            </span>
          ))}
        </div>
        <div className="loader__line">
          <span className="loader__bar"><span /></span>
        </div>
        <div className="loader__meta">
          <span>Exceptional real estate</span>
          <span className="loader__pct" aria-hidden="true">000</span>
        </div>
      </div>
    </div>
  )
}
