import { Link } from 'react-router-dom'
import { artist } from '../content/site'
import { Ph, isPlaceholder } from './Ph'

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <p className="footer-name voice">Thank you for looking</p>
        <ul className="footer-links footer-nav">
          <li>
            <Link to="/">Works</Link>
          </li>
          <li>
            <Link to="/available">Available</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
        <ul className="footer-links">
          <li>
            <a href={artist.instagram.url} target="_blank" rel="noreferrer">
              Instagram <span className="dim">@{artist.instagram.handle}</span> ↗
            </a>
          </li>
          <li>
            {isPlaceholder(artist.email) ? (
              <Ph>{artist.email}</Ph>
            ) : (
              <a href={`mailto:${artist.email}`}>{artist.email}</a>
            )}
          </li>
        </ul>
        <p className="footer-small">
          © {YEAR} {artist.name}. All the works here are mine — please ask me before using any of the images.
        </p>
      </div>
    </footer>
  )
}
