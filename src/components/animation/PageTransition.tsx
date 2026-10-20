import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { gsap, prefersReducedMotion, EASE, DUR } from '../../motion/gsap'

type Go = (to: string) => void
const Ctx = createContext<Go>(() => {})
export const useGo = () => useContext(Ctx)

/**
 * Route transition: a dark panel wipes up over the outgoing page, the router
 * swaps, then the panel lifts away. The panel only intercepts clicks while it
 * is covering the page, and a timed failsafe always releases it.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const loc = useLocation()
  const panel = useRef<HTMLDivElement>(null)
  const busy = useRef(false)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const current = useRef(loc.pathname + loc.search)
  useEffect(() => {
    current.current = loc.pathname + loc.search
  }, [loc.pathname, loc.search])

  const release = useCallback(() => {
    busy.current = false
    if (panel.current) gsap.set(panel.current, { yPercent: 100, pointerEvents: 'none', visibility: 'hidden' })
  }, [])

  const go = useCallback<Go>(
    (to) => {
      const target = to.split('#')[0]
      if (busy.current) return
      if (target === current.current) {
        // same page: just scroll (to the hash if there is one)
        if (to.includes('#')) navigate(to)
        else window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      if (prefersReducedMotion() || !panel.current) {
        navigate(to)
        return
      }
      busy.current = true
      const el = panel.current
      const failsafe = window.setTimeout(() => {
        tl.current?.kill()
        release()
      }, 2600)
      tl.current?.kill()
      tl.current = gsap
        .timeline({ onComplete: () => { window.clearTimeout(failsafe); release() } })
        .set(el, { visibility: 'visible', pointerEvents: 'auto', yPercent: 100 })
        .to(el, { yPercent: 0, duration: DUR.page, ease: EASE.inOut })
        .add(() => navigate(to))
        .to({}, { duration: 0.12 })
        .to(el, { yPercent: -100, duration: DUR.page + 0.1, ease: EASE.inOut })
    },
    [navigate, release],
  )

  useEffect(() => () => { tl.current?.kill() }, [])
  const value = useMemo(() => go, [go])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div ref={panel} className="route-panel" aria-hidden="true" style={{ visibility: 'hidden', transform: 'translateY(100%)' }}>
        <span className="route-panel__mark">ROYAL</span>
      </div>
    </Ctx.Provider>
  )
}
