import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import PageLoader, { shouldShowLoader } from '../components/animation/PageLoader'
import { TransitionProvider } from '../components/animation/PageTransition'
import { intro } from '../motion/intro'
import { ScrollTrigger } from '../motion/gsap'
import HomePage from '../pages/HomePage'
import { ContentProvider, useContent } from '../cms/ContentProvider'

const PropertiesPage = lazy(() => import('../pages/PropertiesPage'))
const PropertyDetailPage = lazy(() => import('../pages/PropertyDetailPage'))
const NeighborhoodsPage = lazy(() => import('../pages/NeighborhoodsPage'))
const AboutPage = lazy(() => import('../pages/AboutPage'))
const ContactPage = lazy(() => import('../pages/ContactPage'))
const JournalPage = lazy(() => import('../pages/JournalPage'))
const ArticlePage = lazy(() => import('../pages/ArticlePage'))
const LegalPage = lazy(() => import('../pages/LegalPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))
const AdminApp = lazy(() => import('../admin/AdminApp'))

function ScrollManager() {
  const { pathname, hash } = useLocation()
  const prev = useRef(pathname)
  useEffect(() => {
    const samePage = prev.current === pathname
    prev.current = pathname
    if (hash) {
      // wait for the route transition when changing page, scroll straight away otherwise
      const t = window.setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), samePage ? 30 : 900)
      return () => window.clearTimeout(t)
    }
    window.scrollTo(0, 0)
    ScrollTrigger.refresh()
  }, [pathname, hash])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  // The admin area is a separate app shell: no loader, header, footer or public content fetch.
  if (pathname.startsWith('/admin'))
    return (
      <Suspense fallback={<div className="page-fallback" aria-busy="true" />}>
        <AdminApp />
      </Suspense>
    )
  return (
    <ContentProvider>
      <PublicSite />
    </ContentProvider>
  )
}

function PublicSite() {
  const { ready } = useContent()
  const [loading, setLoading] = useState(shouldShowLoader)
  const done = useCallback(() => setLoading(false), [])
  useEffect(() => {
    if (!loading) intro.finish()
  }, [loading])

  return (
    <TransitionProvider>
      <a className="skip-link" href="#main">Skip to content</a>
      {loading && <PageLoader onDone={done} contentReady={ready} />}
      <div className="app" inert={loading}>
        <ScrollManager />
        <Header />
        {ready ? (
        <Suspense fallback={<div className="page-fallback" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:slug" element={<PropertyDetailPage />} />
            <Route path="/neighborhoods" element={<NeighborhoodsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/journal/:slug" element={<ArticlePage />} />
            <Route path="/privacy" element={<LegalPage kind="privacy" />} />
            <Route path="/terms" element={<LegalPage kind="terms" />} />
            <Route path="/legal" element={<LegalPage kind="legal" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        ) : (
          <div className="page-fallback" aria-busy="true" />
        )}
        <Footer />
      </div>
    </TransitionProvider>
  )
}
