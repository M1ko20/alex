import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { artist } from '../content/site'

const NAV = [
  { to: '/', label: 'Works', end: true },
  { to: '/available', label: 'Available' },
  { to: '/about', label: 'About me' },
  { to: '/contact', label: 'Write to me' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  // Step out of the way while scrolling down through the works; come back on the way up.
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (Math.abs(y - last) < 8) return
      setHidden(y > last && y > 160)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header className={`site-header${hidden && !open ? ' is-hidden' : ''}${open ? ' is-open' : ''}`}>
        <div className="site-header-inner">
          <Link to="/" className="wordmark" aria-label={`${artist.name} — home`} onClick={() => setOpen(false)}>
            {artist.name}
          </Link>
          <nav className="nav" aria-label="Main">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <button className="menu-toggle" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)}>
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>
      {/* Outside the header: its backdrop-filter would otherwise contain this fixed layer. */}
      <nav id="menu" className="menu" aria-label="Main" hidden={!open}>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}>
            {n.label}
          </NavLink>
        ))}
        <a href={artist.instagram.url} target="_blank" rel="noreferrer" className="menu-ig">
          @{artist.instagram.handle} ↗
        </a>
      </nav>
    </>
  )
}
