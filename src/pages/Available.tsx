import { Link } from 'react-router-dom'
import { artworks, availableWorks, workNumber } from '../content/artworks'
import type { Availability } from '../content/types'
import { artist } from '../content/site'
import { useTitle } from '../lib/room'
import { Art } from '../components/Art'
import { Wall } from '../components/Wall'
import { Ph } from '../components/Ph'

const STATUS: Record<Availability, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Lives with someone else',
  gifted: 'Made as a gift',
  private: 'Stays with me',
  unknown: '—',
}

export function Available() {
  useTitle('Available')
  const works = availableWorks()

  return (
    <div className="page available">
      <header className="page-head">
        <p className="hand page-hand">still looking for a wall —</p>
        <h1 className="page-title">Available</h1>
        <div className="page-intro">
          <p>
            {works.length === 0
              ? 'Nothing is available right now.'
              : `${works.length === 1 ? 'This one is' : `These ${works.length} are`} still with me.`}{' '}
            Open a painting and write to me from there — your message will already say which one you mean. I’ll tell you
            the price, the size and how it can get to you.
          </p>
          {artist.commissionsOpen && (
            <p className="dim">
              Or I can paint something just for you —{' '}
              <Link to="/contact?about=commission">ask me about a commission</Link>.
            </p>
          )}
        </div>
      </header>

      <Wall works={works} notes={false} />

      <section className="checklist" aria-labelledby="checklist-title">
        <h2 id="checklist-title" className="hand checklist-title">
          everything, in one list
        </h2>
        <div className="checklist-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">No.</th>
                <th scope="col">
                  <span className="sr-only">Image</span>
                </th>
                <th scope="col">Title</th>
                <th scope="col">Year</th>
                <th scope="col">Medium</th>
                <th scope="col">Size</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {artworks.map((w) => (
                <tr key={w.slug} className={w.availability === 'available' ? 'is-available' : undefined}>
                  <td className="num">{workNumber(w.slug)}</td>
                  <td className="thumb">
                    <Link to={`/work/${w.slug}`} tabIndex={-1} aria-hidden="true">
                      <Art file={w.images[0].file} alt="" sizes="64px" />
                    </Link>
                  </td>
                  <td>
                    <Link to={`/work/${w.slug}`}>{w.title}</Link>
                    {w.titleTranslation && <span className="dim block">{w.titleTranslation}</span>}
                  </td>
                  <td>{w.year}</td>
                  <td>
                    <Ph>{w.medium}</Ph>
                  </td>
                  <td>
                    <Ph>{w.dimensions}</Ph>
                  </td>
                  <td className="status">
                    <span>{STATUS[w.availability]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
