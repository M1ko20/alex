import type { Project } from './types'

/**
 * THE ARTIST
 *
 * Only the name, the Instagram handle and the commissions line are known facts
 * (from the public profile). Everything in [square brackets] must be replaced.
 */
export const artist = {
  name: 'Alexandra Tomanová',
  firstName: 'Alexandra',

  instagram: {
    handle: 'al.3xqndra',
    url: 'https://www.instagram.com/al.3xqndra/',
  },

  /** Replace with a real address. While it is a placeholder, no mailto links are shown. */
  email: '[ARTIST EMAIL]',

  /** From the Instagram bio: “DM me for commissions!” */
  commissionsOpen: true,

  /**
   * First-person copy. The site speaks in Alexandra's voice; these lines were
   * drafted from what is visible in the works and her captions — she should
   * read them through and change anything that doesn't sound like her.
   */
  hello: 'hi, I’m',
  intro:
    'I paint in acrylic and build collages from the things that stay with me — tickets, wristbands, pressed flowers, pearls, handwriting. A lot of what I make is made for someone.',

  /** Portrait used on the home and About pages. */
  portrait: {
    file: 'artist/portrait-exhibition.jpg',
    alt: 'Alexandra Tomanová smiling in a red dress, holding an illustrated book with a yellow cover, framed illustrations on the wall behind her.',
  },

  bio: [
    '[ABOUT ME — REPLACE WITH REAL INFORMATION. A few lines in my own words: where I live and paint, how long I’ve been painting, what I’m working on now.]',
    '[Optional — my studies, exhibitions or projects, only if confirmed.]',
  ],

  /**
   * PLACEHOLDER STATEMENT — drafted in the first person by the web designer
   * from looking at the paintings. They are not Alexandra's words until she
   * replaces or approves them.
   */
  statementPlaceholder: [
    'I work in two ways. Sometimes a figure surfaces out of long, wet strokes of colour — a creature with too many eyes, a dove opening out of a flower, an angel whose wing is built from single dabs of paint. Other times the canvas becomes a place to keep things: tickets, wristbands, blister packs, pressed flowers, handwriting, pearls, with painted faces looking out from between them.',
    'Many of the paintings are made for someone — for my angels, for the dearest doctor, for the person who wished for a positive abstraction. I keep coming back to childhood, to cats, and to the people who stay close.',
  ],
}

/**
 * Projects outside the wall of paintings.
 * “Radosti v nás” — the poster in the photos reads
 * “Alexandra Tomanová, Maturitní práce 2026, Grafický design”.
 */
export const projects: Project[] = [
  {
    slug: 'radosti-v-nas',
    title: 'Radosti v nás',
    titleTranslation: 'The joys in us',
    year: 2026,
    kind: 'My graduation project in graphic design: an illustrated series, a poster and a leporello.',
    text: '[A few lines from me about the series — what it’s about, how many pieces there are, the technique.]',
    images: [
      {
        file: 'artist/exhibition-room.jpg',
        kind: 'installation',
        caption: 'Me, with the series on the wall',
        alt: 'Alexandra in a red dress and black waistcoat standing in the corner of a white room, framed watercolour illustrations on the walls and shelves around her, a leporello open on a table.',
      },
      {
        file: 'radosti-v-nas/01-poster.jpg',
        kind: 'installation',
        caption: 'Poster',
        alt: 'A poster titled “Radosti v nás” on an easel, with small watercolour scenes of people, a Christmas tree, a forest and a pool arranged around the title.',
      },
      {
        file: 'radosti-v-nas/02-series-and-leporello.jpg',
        kind: 'installation',
        caption: 'The series and the leporello',
        alt: 'Six framed illustrations on a white wall with a folded accordion book standing on a shelf below.',
      },
      {
        file: 'radosti-v-nas/03-series.jpg',
        kind: 'installation',
        caption: 'From the series',
        alt: 'Four framed illustrations: an older couple, two figures in a forest, children in a pool, a family around a Christmas tree.',
      },
      {
        file: 'radosti-v-nas/05-series.jpg',
        kind: 'installation',
        caption: 'From the series',
        alt: 'Four framed illustrations including the yellow title page and a woman holding a cat.',
      },
    ],
    instagram: 'https://www.instagram.com/p/DY_tGf6DLCf/',
  },
]
