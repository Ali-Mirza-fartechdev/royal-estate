import { useRef, type ReactNode } from 'react'
import { usePageMotion } from '../../hooks/usePageMotion'

/** Wraps a route's content, scoping all GSAP work to this element. */
export default function Page({ children, className = '', title }: { children: ReactNode; className?: string; title?: string }) {
  const ref = useRef<HTMLElement>(null)
  usePageMotion(ref)
  if (title) document.title = `${title} — ROYAL`
  return (
    <main id="main" ref={ref} className={`page ${className}`} tabIndex={-1}>
      {children}
    </main>
  )
}
