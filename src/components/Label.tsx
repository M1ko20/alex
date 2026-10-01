import type { Artwork } from '../content/types'
import { workNumber } from '../content/artworks'
import { isPlaceholder } from './Ph'

/** A wall label: the title, its number, then year and medium in small print — and, quietly, whether the work is available. */
export function Label({ work, className }: { work: Artwork; className?: string }) {
  const facts = [work.year, isPlaceholder(work.medium) ? null : work.medium].filter(Boolean)
  const available = work.availability === 'available'
  return (
    <span className={`label${className ? ` ${className}` : ''}`}>
      <span className="label-title">{work.title}</span>
      <span className="label-no">{workNumber(work.slug)}</span>
      {(facts.length > 0 || available) && (
        <span className="label-meta">
          {facts.map((f) => (
            <span key={f}>{f}</span>
          ))}
          {available && <span className="label-status">Available</span>}
        </span>
      )}
    </span>
  )
}
