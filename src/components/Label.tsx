import type { Artwork } from '../content/types'
import { workNumber } from '../content/artworks'
import { isPlaceholder } from './Ph'

/** A wall label: number, title, year and medium — and, quietly, whether the work is available. */
export function Label({ work, className }: { work: Artwork; className?: string }) {
  const meta = [work.year, isPlaceholder(work.medium) ? null : work.medium].filter(Boolean).join(' · ')
  return (
    <span className={`label${className ? ` ${className}` : ''}`}>
      <span className="label-no">{workNumber(work.slug)}</span>
      <span className="label-text">
        <span className="label-title">{work.title}</span>
        {meta && <span className="label-meta">{meta}</span>}
        {work.availability === 'available' && <span className="label-status">Available</span>}
      </span>
    </span>
  )
}
