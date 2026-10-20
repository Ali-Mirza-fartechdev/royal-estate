import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import TLink from '../ui/TLink'
import { gsap, prefersReducedMotion } from '../../motion/gsap'
import { Close } from '../ui/Icons'

export const NAV = [
  { to: '/properties', label: 'Properties' },
  { to: '/neighborhoods', label: 'Neighborhoods' },
  { to: '/about', label: 'About' },
  { to: '/journal', label: 'Journal' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menu = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  // close on route change
  useEffect(() => setOpen(false), [pathname])

  // mobile menu: scroll lock, stagger-in, focus handling, Escape, Tab trap
  useEffect(() => {
    if (!open) return
    const el = menu.current
    document.documentElement.classList.add('menu-open')
    const links = el?.querySelectorAll<HTMLElement>('a, button') ?? []
    links[0]?.focus()
    let ctx: gsap.Context | undefined
    if (el && !prefersReducedMotion()) {
      ctx = gsap.context(() => {
        gsap.from('.mobile-menu__link', { yPercent: 100, duration: 0.8, ease: 'power3.out', stagger: 0.07, delay: 0.1 })
        gsap.from('.mobile-menu__foot', { autoAlpha: 0, duration: 0.6, delay: 0.5 })
      }, el)
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'Tab' && el) {
        const f = Array.from(el.querySelectorAll<HTMLElement>('a, button'))
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', key)
    return () => {
      document.documentElement.classList.remove('menu-open')
      document.removeEventListener('keydown', key)
      ctx?.revert()
      toggle.current?.focus({ preventScroll: true })
    }
  }, [open])

  const active = (to: string) => pathname === to || pathname.startsWith(to + '/')

  return (
    <>
      <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="header__inner">
          <TLink to="/" className="wordmark" aria-label="ROYAL — home">ROYAL</TLink>
          <nav className="header__nav" aria-label="Primary">
            {NAV.map((n) => (
              <TLink key={n.to} to={n.to} className={`navlink ${active(n.to) ? 'is-active' : ''}`} aria-current={active(n.to) ? 'page' : undefined}>
                {n.label}
              </TLink>
            ))}
          </nav>
          <div className="header__cta">
            <TLink to="/contact#inquiry" className="btn btn--solid btn--sm"><span>Schedule a tour</span></TLink>
          </div>
          <button ref={toggle} className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
            <span className="sr-only">Open menu</span>
            <span className="menu-btn__bars" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </header>

      <div id="mobile-menu" ref={menu} className={`mobile-menu ${open ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
        <div className="mobile-menu__top">
          <span className="wordmark">ROYAL</span>
          <button className="menu-btn" onClick={() => setOpen(false)}>
            <span className="sr-only">Close menu</span>
            <Close />
          </button>
        </div>
        <nav className="mobile-menu__nav" aria-label="Mobile">
          {NAV.map((n) => (
            <span className="mobile-menu__mask" key={n.to}>
              <TLink to={n.to} className="mobile-menu__link" aria-current={active(n.to) ? 'page' : undefined}>{n.label}</TLink>
            </span>
          ))}
        </nav>
        <div className="mobile-menu__foot">
          <TLink to="/contact#inquiry" className="btn btn--solid"><span>Schedule a tour</span></TLink>
          <a href="mailto:concierge@royal-estates.com" className="label">concierge@royal-estates.com</a>
        </div>
      </div>
    </>
  )
}
