/**
 * Content model.
 *
 * PLACEHOLDER CONVENTION
 * Any text wrapped in [square brackets] is placeholder copy. It is rendered
 * with a visible dashed highlight on the site so nothing unconfirmed can pass
 * as fact. Search the /src/content folder for "[" to find everything that
 * still needs real information.
 */

export type Availability =
  | 'available' //  shown on the wall and in "Available works", with an enquiry link
  | 'reserved'
  | 'sold'
  | 'gifted' //     the caption says the work was made for / given to someone
  | 'private' //    artist's own collection, not for sale
  | 'unknown' //    not yet confirmed — nothing is shown on the wall

export type ImageKind =
  | 'work' //         the finished work, straight on (always the first image)
  | 'detail' //       close-up or alternate view of the work
  | 'studio' //       the work in the studio / on the easel
  | 'installation' // the work in a room, on a wall
  | 'reference' //    source photograph the work was painted from
  | 'related' //      sketchbook pages, zines, studies

export interface ArtworkImage {
  /** Path relative to /artwork, e.g. "the-creature/01-work.jpg" */
  file: string
  kind: ImageKind
  alt: string
  caption?: string
}

/** The artist's own words about a work — quoted verbatim from Instagram. */
export interface ArtistWords {
  text: string
  lang: 'cs' | 'en'
  /** English translation for Czech captions (editorial, can be refined). */
  translation?: string
  /** ISO date of the post the words come from */
  date: string
  source: string
}

export interface Artwork {
  slug: string
  title: string
  /** English translation of a Czech title */
  titleTranslation?: string
  /** true = descriptive title chosen for the website; confirm with the artist */
  workingTitle?: boolean
  /** Year first shared on Instagram unless the artist confirms otherwise */
  year: number | null
  medium: string
  dimensions: string
  availability: Availability
  /** Optional. Leave undefined to show "Price on request". */
  price?: string
  /**
   * How much room the work gets on the wall:
   *  lead     — its own row, large, with the label beside it
   *  standard — paired with the next work
   *  quiet    — smaller, paired or on its own
   */
  presence: 'lead' | 'standard' | 'quiet'
  images: ArtworkImage[]
  words?: ArtistWords
  description: string
  instagram?: string
}

export interface Project {
  slug: string
  title: string
  titleTranslation?: string
  year: number
  kind: string
  text: string
  images: ArtworkImage[]
  instagram?: string
}
