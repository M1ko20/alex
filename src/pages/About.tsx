import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { artworks, findWork } from '../content/artworks'
import { artist, projects } from '../content/site'
import { ratio } from '../content/images'
import { useTitle } from '../lib/room'
import { Art } from '../components/Art'
import { Ph } from '../components/Ph'
import { Reveal } from '../components/Reveal'
import { Note, tiltFor } from '../components/Note'

/** Photos from the works' own posts that show the studio side of things. */
const STUDIO = [
  { work: 'a-place-in-my-head', file: 'a-place-in-my-head/03-studio.jpg' },
  { work: 'water-lilies', file: 'water-lilies/02-studio.jpg' },
  { work: 'the-creature', file: 'the-creature/02-related-unik-z-reality.jpg' },
]

export function About() {
  useTitle('About me')
  const quoted = artworks.filter((a) => a.words?.lang === 'en')

  // Photos and notes pinned up together, alternating, like a studio wall.
  const pinned = STUDIO.flatMap((s, i) => {
    const work = findWork(s.work)!
    const img = work.images.find((im) => im.file === s.file)!
    const photo = (
      <Reveal key={s.file} className="pin pin-photo" style={{ '--r': ratio(s.file) } as CSSProperties} delay={0.05}>
        <Art file={s.file} alt={img.alt} sizes="(max-width: 760px) 80vw, 30vw" />
        <p className="caption">
          {img.caption} — <Link to={`/work/${work.slug}`}>{work.title}</Link>
        </p>
      </Reveal>
    )
    const q = quoted[i]
    const note = q && (
      <Reveal key={q.slug} className="pin pin-note" delay={0.15}>
        <Note
          words={q.words!}
          tilt={tiltFor(q.slug)}
          source={
            <>
              on <Link to={`/work/${q.slug}`}>{q.title}</Link>
            </>
          }
        />
      </Reveal>
    )
    return note ? [photo, note] : [photo]
  })

  return (
    <div className="page about">
      <section className="about-intro">
        <Reveal className="about-portrait">
          <Art file={artist.portrait.file} alt={artist.portrait.alt} eager sizes="(max-width: 760px) 92vw, 34vw" />
        </Reveal>
        <div className="about-bio">
          <p className="hand page-hand">
            {artist.hello} {artist.firstName} —
          </p>
          <h1 className="page-title">About me</h1>
          {artist.bio.map((p, i) => (
            <p key={i} className={i === 0 ? 'lede' : undefined}>
              <Ph>{p}</Ph>
            </p>
          ))}
          <p className="about-links">
            <a href={artist.instagram.url} target="_blank" rel="noreferrer" className="arrow-link">
              @{artist.instagram.handle} on Instagram ↗
            </a>
            {artist.commissionsOpen && (
              <Link to="/contact?about=commission" className="arrow-link">
                I take commissions →
              </Link>
            )}
          </p>

          <div className="about-statement">
            <h2 className="section-label">How I work</h2>
            <p className="ph-note">
              <mark className="ph">
                [DRAFT — written in my voice by the web designer, from looking at the paintings. Not my words until I
                replace or approve it.]
              </mark>
            </p>
            {artist.statementPlaceholder.map((p, i) => (
              <p key={i} className="is-draft">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="pinboard" aria-labelledby="pinboard-title">
        <h2 id="pinboard-title" className="hand pinboard-title">
          around the work
        </h2>
        <div className="pinboard-grid">{pinned}</div>
      </section>

      {projects.map((p) => (
        <section key={p.slug} className="project" aria-labelledby={`${p.slug}-title`}>
          <div className="project-head">
            <div>
              <p className="section-label">{p.year}</p>
              <h2 id={`${p.slug}-title`} className="project-title">
                {p.title}
              </h2>
              {p.titleTranslation && <p className="hand project-translation">{p.titleTranslation}</p>}
            </div>
            <div>
              <p className="project-kind">{p.kind}</p>
              <p>
                <Ph>{p.text}</Ph>
              </p>
              {p.instagram && (
                <p>
                  <a href={p.instagram} target="_blank" rel="noreferrer" className="arrow-link">
                    The post on my Instagram ↗
                  </a>
                </p>
              )}
            </div>
          </div>
          <div className="project-strip">
            {p.images.map((img, i) => (
              <Reveal
                key={img.file}
                className="project-image"
                style={{ '--r': ratio(img.file) } as CSSProperties}
                delay={(i % 3) * 0.06}
              >
                <Art file={img.file} alt={img.alt} sizes="(max-width: 760px) 46vw, 24vw" />
                {img.caption && <p className="caption">{img.caption}</p>}
              </Reveal>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
