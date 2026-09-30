import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { artworks, findWork, workNumber } from '../content/artworks'
import type { Artwork } from '../content/types'
import { image, ratio } from '../content/images'
import { artist } from '../content/site'
import { useRoom, useTitle } from '../lib/room'
import { Art } from '../components/Art'
import { Ph, isPlaceholder } from '../components/Ph'
import { Viewer } from '../components/Viewer'
import { InquiryForm } from '../components/InquiryForm'
import { Reveal } from '../components/Reveal'
import { Note, tiltFor } from '../components/Note'
import { NotFound } from './NotFound'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export function Work() {
  const { slug } = useParams()
  const work = findWork(slug)
  if (!work) return <NotFound />
  return <WorkView key={work.slug} work={work} />
}

function WorkView({ work }: { work: Artwork }) {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [viewing, setViewing] = useState<number | null>(null)
  const [asking, setAsking] = useState(false)
  const cover = work.images[0]
  const coverData = image(cover.file)
  const wide = coverData.width / coverData.height > 1.6

  const i = artworks.indexOf(work)
  const prev = artworks[(i - 1 + artworks.length) % artworks.length]
  const next = artworks[(i + 1) % artworks.length]

  useRoom(coverData.wall, 0.13)
  useTitle(work.title)

  const close = useCallback(() => setViewing(null), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (viewing !== null || (e.target as HTMLElement).closest('input, textarea, select')) return
      if (e.key === 'ArrowRight') navigate(`/work/${next.slug}`)
      if (e.key === 'ArrowLeft') navigate(`/work/${prev.slug}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, next.slug, prev.slug, viewing])

  const more = work.images.slice(1)

  return (
    <article className="work">
      <nav className="work-topbar" aria-label="Works">
        <Link to={`/#${work.slug}`} className="arrow-link">
          ← All my works
        </Link>
        <span className="work-count">
          <Link to={`/work/${prev.slug}`} aria-label={`Previous: ${prev.title}`}>
            ←
          </Link>
          <span>
            {workNumber(work.slug)} <span className="dim">/ {String(artworks.length).padStart(2, '0')}</span>
          </span>
          <Link to={`/work/${next.slug}`} aria-label={`Next: ${next.title}`}>
            →
          </Link>
        </span>
      </nav>

      <div className={`work-stage${wide ? ' is-wide' : ''}`}>
        <motion.button
          className="work-image"
          onClick={() => setViewing(0)}
          aria-label={`View “${work.title}” full screen`}
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
          style={{ ['--r' as string]: coverData.width / coverData.height }}
        >
          <Art
            file={cover.file}
            alt={cover.alt}
            eager
            sizes={wide ? '(max-width: 760px) 100vw, 90vw' : '(max-width: 760px) 100vw, 62vw'}
          />
          <span className="work-zoom-hint">Look closer</span>
        </motion.button>

        <motion.aside
          className="work-label"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <p className="work-no">No. {workNumber(work.slug)}</p>
          <h1 className="work-title">{work.title}</h1>
          {work.titleTranslation && <p className="work-translation">{work.titleTranslation}</p>}
          {work.workingTitle && (
            <p className="work-note">
              <Ph>[Working title — I still need to confirm it]</Ph>
            </p>
          )}

          <dl className="work-facts">
            <div>
              <dt>Year</dt>
              <dd>{work.year ?? <Ph>[Year]</Ph>}</dd>
            </div>
            <div>
              <dt>Medium</dt>
              <dd>
                <Ph>{work.medium}</Ph>
              </dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>
                <Ph>{work.dimensions}</Ph>
              </dd>
            </div>
          </dl>

          <Availability work={work} asking={asking} onAsk={() => setAsking((a) => !a)} />

          <AnimatePresence initial={false}>
            {asking && (
              <motion.div
                className="work-inquiry"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.5, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <InquiryForm work={work} compact />
              </motion.div>
            )}
          </AnimatePresence>

          {work.words && (
            <Note
              words={work.words}
              tilt={tiltFor(work.slug)}
              className="work-note-slip"
              source={
                <>
                  me, on{' '}
                  <a href={work.words.source} target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                  , {formatDate(work.words.date)}
                </>
              }
            />
          )}
        </motion.aside>
      </div>

      {(work.description || more.length > 0) && (
        <section className="work-more" aria-label="Closer">
          <div className="work-more-head">
            <h2 className="hand work-more-title">
              {more.length === 0
                ? 'about it'
                : more.every((m) => m.kind === 'detail')
                  ? 'closer'
                  : 'closer, and around it'}
            </h2>
            {work.description && (
              <p className="work-description">
                <Ph>{work.description}</Ph>
              </p>
            )}
            {work.instagram && (
              <p>
                <a href={work.instagram} target="_blank" rel="noreferrer" className="arrow-link">
                  The post on my Instagram ↗
                </a>
              </p>
            )}
          </div>
          {more.length > 0 && (
            <div className="work-more-strip">
              {more.map((img, k) => (
                <Reveal
                  key={img.file}
                  delay={(k % 4) * 0.06}
                  className="work-more-cell"
                  style={{ '--r': ratio(img.file) } as CSSProperties}
                >
                  <button className="work-more-item" onClick={() => setViewing(k + 1)}>
                    <Art file={img.file} alt={img.alt} sizes="(max-width: 760px) 46vw, 30vw" />
                    {img.caption && <span className="caption">{img.caption}</span>}
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      )}

      <nav className="work-pager" aria-label="Next and previous works">
        {[
          { w: prev, dir: 'Previous' },
          { w: next, dir: 'Next' },
        ].map(({ w, dir }) => (
          <Link key={dir} to={`/work/${w.slug}`} className={`pager-link is-${dir.toLowerCase()}`}>
            <span className="pager-thumb">
              <Art file={w.images[0].file} alt="" sizes="160px" />
            </span>
            <span className="pager-text">
              <span className="dim">
                {dir === 'Previous' ? '← ' : ''}
                {workNumber(w.slug)}
                {dir === 'Next' ? ' →' : ''}
              </span>
              <span className="pager-title">{w.title}</span>
            </span>
          </Link>
        ))}
      </nav>

      <Viewer images={work.images} index={viewing} title={work.title} onClose={close} onIndex={setViewing} />
    </article>
  )
}

function Availability({ work, asking, onAsk }: { work: Artwork; asking: boolean; onAsk: () => void }) {
  const ask = (label: string) => (
    <button className={`button${asking ? ' is-active' : ''}`} onClick={onAsk} aria-expanded={asking}>
      {asking ? 'Close' : label}
    </button>
  )

  switch (work.availability) {
    case 'available':
      return (
        <div className="availability is-available">
          <p className="availability-line">
            <span className="availability-mark" aria-hidden="true" />
            Still with me — available
          </p>
          <p className="dim">{work.price && !isPlaceholder(work.price) ? work.price : 'Price on request'}</p>
          {ask('Ask me about this one')}
        </div>
      )
    case 'reserved':
      return (
        <div className="availability">
          <p className="availability-line">Reserved for someone</p>
          {ask('Ask me about it')}
        </div>
      )
    case 'sold':
      return (
        <div className="availability">
          <p className="availability-line">It lives with someone else now</p>
          <CommissionLink />
        </div>
      )
    case 'gifted':
      return (
        <div className="availability">
          <p className="availability-line">I made this one as a gift</p>
          <CommissionLink />
        </div>
      )
    case 'private':
      return (
        <div className="availability">
          <p className="availability-line">This one stays with me</p>
        </div>
      )
    default:
      return <div className="availability">{ask('Ask me about this one')}</div>
  }
}

function CommissionLink() {
  if (!artist.commissionsOpen) return null
  return (
    <p>
      <Link to="/contact?about=commission" className="arrow-link">
        I also paint on commission →
      </Link>
    </p>
  )
}
