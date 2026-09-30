import { useEffect, useLayoutEffect, type ReactNode } from 'react'
import { Route, Routes, useLocation, useNavigationType } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { Work } from './pages/Work'
import { Available } from './pages/Available'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { NotFound } from './pages/NotFound'

const scrollPositions = new Map<string, number>()

/**
 * Remembers where you were on each page, so going back from a painting
 * returns you to the same spot on the wall.
 */
function PageShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navType = useNavigationType()

  useLayoutEffect(() => {
    const saved = scrollPositions.get(location.key)
    if (navType === 'POP' && saved !== undefined) {
      window.scrollTo(0, saved)
    } else if (location.hash) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      if (el) {
        const r = el.getBoundingClientRect()
        window.scrollTo(
          0,
          Math.max(0, window.scrollY + r.top - (window.innerHeight - Math.min(r.height, window.innerHeight)) / 2),
        )
      } else window.scrollTo(0, 0)
    } else {
      window.scrollTo(0, 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const save = () => scrollPositions.set(location.key, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => window.removeEventListener('scroll', save)
  }, [location.key])

  return <>{children}</>
}

export default function App() {
  const location = useLocation()
  const reduce = useReducedMotion()

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main"
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.35, ease: 'easeOut' }}
        >
          <PageShell>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/work/:slug" element={<Work />} />
              <Route path="/available" element={<Available />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageShell>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  )
}
