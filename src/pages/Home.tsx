import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { artworks, availableWorks } from '../content/artworks'
import { artist } from '../content/site'
import { useTitle } from '../lib/room'
import { Art } from '../components/Art'
import { ratio } from '../content/images'
import { Piece, Wall } from '../components/Wall'
import { Reveal } from '../components/Reveal'
import { LabelPreview } from '../components/LabelPreview'

const YEARS = artworks.flatMap((a) => (a.year ? [a.year] : []))
const SPAN = `${Math.min(...YEARS)}–${Math.max(...YEARS)}`

export function Home() {
  useTitle()
  const [first, ...rest] = artworks
  const available = availableWorks().length
  const [given, family] = artist.name.split(' ')

  const toWorks = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <section className="hero" id={first.slug}>
        <div className="hero-head">
          <p className="section-label hero-eyebrow">
            <span>Paintings &amp; collages</span>
            <span>{SPAN}</span>
          </p>
          <h1 className="hero-name">
            <span>{given}</span> <span>{family}</span>
          </h1>
        </div>

        <div className="hero-work" style={{ '--r': ratio(first.images[0].file) } as CSSProperties}>
          <Piece work={first} eager sizes="(max-width: 760px) 92vw, 50vw" />
        </div>

        <div className="hero-text">
          <p className="hero-intro">{artist.intro}</p>
          <p className="hero-actions">
            <a href="#works" className="button is-solid" onClick={toWorks}>
              View the works <span aria-hidden="true">↓</span>
            </a>
            {available > 0 && (
              <Link to="/available" className="arrow-link">
                {available} available now →
              </Link>
            )}
          </p>
        </div>
      </section>

      {/* TEMPORARY: label comparison */}
      <LabelPreview />

      <section id="works" className="works" aria-labelledby="works-title">
        <header className="works-head">
          <h2 id="works-title" className="voice works-title">
            Works
          </h2>
          <p className="section-label">
            {artworks.length} works, {SPAN}
          </p>
          {available > 0 && (
            <Link to="/available" className="arrow-link">
              Only the available ones →
            </Link>
          )}
        </header>
        <Wall works={rest} />
      </section>

      <section className="coda">
        <Reveal className="coda-portrait">
          <Link to="/about" tabIndex={-1} aria-hidden="true">
            <Art file={artist.portrait.file} alt="" sizes="(max-width: 760px) 40vw, 18vw" />
          </Link>
        </Reveal>
        <Reveal className="coda-text" delay={0.1}>
          <h2 className="voice coda-aside">About the artist</h2>
          <p className="coda-lede">
            There’s more about me, the way I work and my graduation project on the about page.
            {artist.commissionsOpen && <> If you’d like one of these paintings, or something painted for you, write to me.</>}
          </p>
          <p className="coda-actions">
            <Link to="/about" className="button">
              About me
            </Link>
            <Link to="/contact" className="arrow-link">
              Write to me →
            </Link>
          </p>
        </Reveal>
      </section>
    </>
  )
}
