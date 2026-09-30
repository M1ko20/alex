import type { CSSProperties } from 'react'
import type { ArtistWords } from '../content/types'

const TILTS = [-2.4, 1.8, -1.2, 2.6, -3, 1.1]

/** A stable tilt per note, so a slip doesn't jump around between renders. */
export const tiltFor = (key: string) => TILTS[[...key].reduce((a, c) => a + c.charCodeAt(0), 0) % TILTS.length]

/**
 * One of Alexandra's captions, written out on a scrap of paper and taped to
 * the wall — the way her collages keep notes, tickets and handwriting.
 */
export function Note({
  words,
  tilt = 0,
  className,
  source,
}: {
  words: Pick<ArtistWords, 'text' | 'lang' | 'translation'>
  tilt?: number
  className?: string
  /** A small typed line under the slip, e.g. where and when it was written. */
  source?: React.ReactNode
}) {
  return (
    <figure className={`note${className ? ` ${className}` : ''}`} style={{ '--tilt': `${tilt}deg` } as CSSProperties}>
      <div className="note-slip">
        <blockquote lang={words.lang} className="hand">
          {words.text.split('\n').map((line, k) => (
            <p key={k}>{line}</p>
          ))}
        </blockquote>
      </div>
      {(words.translation || source) && (
        <figcaption>
          {words.translation && <span className="note-translation">{words.translation}</span>}
          {source && <span className="note-source">{source}</span>}
        </figcaption>
      )}
    </figure>
  )
}
