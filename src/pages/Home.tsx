import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { artworks, availableWorks } from '../content/artworks'
import { artist } from '../content/site'
import { useTitle } from '../lib/room'
import { Art } from '../components/Art'
import { ratio } from '../content/images'
import { Piece, Wall } from '../components/Wall'
import { Note } from '../components/Note'
import { Reveal } from '../components/Reveal'

export function Home() {
  useTitle()
  const [first, ...rest] = artworks
  const available = availableWorks().length
  const [given, family] = artist.name.split(' ')

  return (
    <>
      <section className="hero" id={first.slug}>
        <div className="hero-head">
          <p className="hand hero-hello">{artist.hello}</p>
          <h1 className="hero-name">
            <span>{given}</span> <span>{family}</span>
          </h1>
        </div>

        <div className="hero-work" style={{ '--r': ratio(first.images[0].file) } as CSSProperties}>
          <Piece work={first} eager sizes="(max-width: 760px) 92vw, 50vw" />
          {first.words && <Note words={first.words} tilt={-2.2} className="hero-note" />}
        </div>

        <div className="hero-text">
          <p className="hero-intro">{artist.intro}</p>
          <p className="hero-facts">
            <a href="#wall">{artworks.length} works</a>
            {available > 0 && <Link to="/available">{available} still available</Link>}
            {artist.commissionsOpen && <Link to="/contact?about=commission">I take commissions</Link>}
          </p>
        </div>
      </section>

      <div id="wall">
        <Wall works={rest} />
      </div>

      <section className="coda">
        <Reveal className="coda-portrait">
          <Link to="/about" tabIndex={-1} aria-hidden="true">
            <Art file={artist.portrait.file} alt="" sizes="(max-width: 760px) 40vw, 18vw" />
          </Link>
        </Reveal>
        <Reveal className="coda-text" delay={0.1}>
          <p className="hand coda-hand">that’s all for now —</p>
          <p className="coda-lede">
            There’s more about me, the way I work and my graduation project on the <Link to="/about">about page</Link>.
            {artist.commissionsOpen && (
              <>
                {' '}
                If you’d like something painted for you, <Link to="/contact?about=commission">write to me</Link>.
              </>
            )}
          </p>
        </Reveal>
      </section>
    </>
  )
}
