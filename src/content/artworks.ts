import type { Artwork } from './types'

/**
 * THE WORKS
 *
 * The order of this list is the order of the hang: it decides the sequence on
 * the wall, the numbers (01, 02 …) and the order of the list of works.
 *
 * To add a work:
 *   1. put the photos in /artwork/<slug>/ (01-work.jpg first, then details)
 *   2. run `npm run images`
 *   3. add an entry below
 *
 * Sources: everything here comes from @al.3xqndra on Instagram (captions,
 * hashtags, post dates). `year` is the year the work was posted. Anything in
 * [square brackets] is a placeholder — see types.ts.
 *
 * AVAILABILITY IS A PLACEHOLDER: the four works marked 'available' were chosen
 * to demonstrate the enquiry flow. Confirm every status with the artist.
 */
const TBC_DESCRIPTION = '[A few lines from me about this work]'

export const artworks: Artwork[] = [
  {
    slug: 'the-creature',
    title: 'Untitled (creature)',
    workingTitle: true,
    year: 2023,
    medium: 'Acrylic',
    dimensions: '50 × 70 cm',
    availability: 'available',
    presence: 'lead',
    images: [
      {
        file: 'the-creature/01-work.jpg',
        kind: 'work',
        alt: 'A pale horned creature with many eyes at the centre of sweeping red, white and violet brushstrokes, human faces emerging from the flow on either side and below.',
      },
      {
        file: 'the-creature/02-related-unik-z-reality.jpg',
        kind: 'related',
        caption: 'Pages from “Únik z reality”',
        alt: 'Printed zine spreads titled “Únik z reality” with red, black and white painted faces and figures.',
      },
    ],
    words: {
      text: 'This creature showed me that it wasn’t only me or only you, I was everything. We share a collective consciousness and our experiences are being shared across the whole universe.',
      lang: 'en',
      date: '2023-12-20',
      source: 'https://www.instagram.com/p/C1E6YujsQJf/',
    },
    description: TBC_DESCRIPTION,
    instagram: 'https://www.instagram.com/p/C1E6YujsQJf/',
  },
  {
    slug: 'angel-for-my-angels',
    title: 'Angel for my angels',
    year: 2025,
    medium: '[Medium]',
    dimensions: '[Dimensions]',
    availability: 'gifted',
    presence: 'standard',
    images: [
      {
        file: 'angel-for-my-angels/01-work.jpg',
        kind: 'work',
        alt: 'A pale-haired figure glancing back over her shoulder, a large white wing built from thick dabs of cream, blue and yellow paint against a dark ground.',
      },
    ],
    description: TBC_DESCRIPTION,
    instagram: 'https://www.instagram.com/p/DK1g7ejM5w5/',
  },
  {
    slug: 'souls',
    title: 'Untitled (dove)',
    workingTitle: true,
    year: 2025,
    medium: '[Medium]',
    dimensions: '[Dimensions]',
    availability: 'available',
    presence: 'standard',
    images: [
      {
        file: 'souls/01-work.jpg',
        kind: 'work',
        alt: 'A white dove with outstretched wings rising out of a soft pink and lilac bloom, painted in hazy, blended strokes.',
      },
    ],
    words: {
      text: 'Souls of those who did not win the battle\nand\nPure souls of people',
      lang: 'en',
      date: '2025-11-12',
      source: 'https://www.instagram.com/p/DQ9MUTLDHo2/',
    },
    description: TBC_DESCRIPTION,
    instagram: 'https://www.instagram.com/p/DQ9MUTLDHo2/',
  },
  {
    slug: 'i-kdyz-jsme-plesaty',
    title: 'I když jsme plešatý',
    titleTranslation: 'Even though we are bald',
    year: 2025,
    medium: 'Collage and paint',
    dimensions: '[Dimensions]',
    availability: 'unknown',
    presence: 'lead',
    images: [
      {
        file: 'i-kdyz-jsme-plesaty/01-work.jpg',
        kind: 'work',
        alt: 'A wide collage on a pale pink painted ground: painted faces, a mother holding a child, an anatomical diagram, tickets, stickers, blister packs and handwritten notes.',
      },
      {
        file: 'i-kdyz-jsme-plesaty/02-detail.jpg',
        kind: 'detail',
        caption: 'Detail',
        alt: 'Detail: two large painted faces above a woman in yellow holding a small child.',
      },
      {
        file: 'i-kdyz-jsme-plesaty/03-detail.jpg',
        kind: 'detail',
        caption: 'Detail',
        alt: 'Detail: a painted bald head in grey and white next to an anatomical diagram and album covers.',
      },
      {
        file: 'i-kdyz-jsme-plesaty/04-detail.jpg',
        kind: 'detail',
        caption: 'Detail',
        alt: 'Detail: a hotel wristband, a crayon drawing of a seated figure and the handwritten words “even though we are bald”.',
      },
      {
        file: 'i-kdyz-jsme-plesaty/05-detail.jpg',
        kind: 'detail',
        caption: 'Detail',
        alt: 'Detail: “THANK YOU” and “Venózní porty” labels, pressed flowers, photographs and handwritten notes.',
      },
      {
        file: 'i-kdyz-jsme-plesaty/06-detail.jpg',
        kind: 'detail',
        caption: 'Detail',
        alt: 'Detail: a festival sticker, a playing card, a black-and-white photograph and a deep red painted field.',
      },
    ],
    words: {
      text: 'Sometimes we should be grateful that we don’t know what’s ahead of us.',
      lang: 'en',
      date: '2025-11-09',
      source: 'https://www.instagram.com/p/DQ1dBe6DHql/',
    },
    description: TBC_DESCRIPTION,
    instagram: 'https://www.instagram.com/p/DQ1dBe6DHql/',
  },
  {
    slug: 'knight',
    title: 'Untitled (knight with candle)',
    workingTitle: true,
    year: 2026,
    medium: '[Medium]',
    dimensions: '[Dimensions]',
    availability: 'unknown',
    presence: 'standard',
    images: [
      {
        file: 'knight/01-work.jpg',
        kind: 'work',
        alt: 'A figure in a riveted great helm against a blue and brick-red wall, one ringed hand raised to the visor, the other holding a lit candle that throws warm light, in an ornate dark frame.',
      },
    ],
    description: TBC_DESCRIPTION,
    instagram: 'https://www.instagram.com/p/DVTOlI8jBiy/',
  },
  {
    slug: 'mirage',
    title: 'Untitled (Mirage)',
    workingTitle: true,
    year: null,
    medium: '[Medium]',
    dimensions: '[Dimensions]',
    availability: 'unknown',
    presence: 'standard',
    images: [
      {
        file: 'mirage/01-work.jpg',
        kind: 'work',
        alt: 'A sunlit sandstone courtyard with stacked crates, palm trees and two pale towers against a blue sky, a red sprayed mark on the ground, in an ornate dark gold frame.',
      },
    ],
    description: TBC_DESCRIPTION,
  },
  {
    slug: 'water-lilies',
    title: 'Untitled (water lilies)',
    workingTitle: true,
    year: 2025,
    medium: 'Acrylic',
    dimensions: '[Dimensions]',
    availability: 'gifted',
    presence: 'standard',
    images: [
      {
        file: 'water-lilies/01-work.jpg',
        kind: 'work',
        alt: 'Pink water lilies carried on a curling wave of blue, violet and white brushstrokes.',
      },
      {
        file: 'water-lilies/02-studio.jpg',
        kind: 'studio',
        caption: 'In the studio, with a visitor',
        alt: 'A tortoiseshell cat sitting in front of the water lily painting, looking up at it.',
      },
    ],
    words: {
      text: 'pro uzasnou sestricku 🩷',
      lang: 'cs',
      date: '2025-05-15',
      source: 'https://www.instagram.com/p/DJrotHbMp5H/',
    },
    description: TBC_DESCRIPTION,
    instagram: 'https://www.instagram.com/p/DJrotHbMp5H/',
  },
  {
    slug: 'a-place-in-my-head',
    title: 'A place in my head',
    year: 2026,
    medium: 'Paint and pearls',
    dimensions: '[Dimensions]',
    availability: 'available',
    presence: 'lead',
    images: [
      {
        file: 'a-place-in-my-head/01-work.jpg',
        kind: 'work',
        alt: 'A crowded, dreamlike composition: a small bald child on a tricycle in a red and black coat, a woman in yellow holding a baby, figures, cats and a dog, a stitched line running down the canvas, pearls set into the paint.',
      },
      {
        file: 'a-place-in-my-head/02-detail.jpg',
        kind: 'detail',
        caption: 'Detail',
        alt: 'Detail: the child on the tricycle, pearls and red sequins pressed into the paint.',
      },
      {
        file: 'a-place-in-my-head/03-studio.jpg',
        kind: 'studio',
        caption: 'On the easel',
        alt: 'The painting on an easel, seen at an angle.',
      },
      {
        file: 'a-place-in-my-head/04-studio.jpg',
        kind: 'studio',
        caption: 'On the easel',
        alt: 'The painting on an easel, raking light across the surface.',
      },
    ],
    description: TBC_DESCRIPTION,
    instagram: 'https://www.instagram.com/p/DXPZegKDE4B/',
  },
  {
    slug: 'kazdodenni-myslenkove-pochody',
    title: 'Každodenní myšlenkové pochody',
    titleTranslation: 'Everyday trains of thought',
    year: 2023,
    medium: 'Acrylic and collage',
    dimensions: '[Dimensions]',
    availability: 'available',
    presence: 'standard',
    images: [
      {
        file: 'kazdodenni-myslenkove-pochody/01-work.jpg',
        kind: 'work',
        alt: 'A gnarled olive-green tree painted over a dense dark collage of torn magazine pages, foil, packaging and a red “KENDAMA” label.',
      },
      {
        file: 'kazdodenni-myslenkove-pochody/02-detail.jpg',
        kind: 'detail',
        caption: 'Detail',
        alt: 'Detail: the tree’s branches over foil and printed scraps.',
      },
      {
        file: 'kazdodenni-myslenkove-pochody/03-detail.jpg',
        kind: 'detail',
        caption: 'Detail',
        alt: 'Detail: the trunk against torn paper, a ruler and the red label.',
      },
    ],
    description: TBC_DESCRIPTION,
    instagram: 'https://www.instagram.com/p/CsdxoglMxvu/',
  },
  {
    slug: 'flowers',
    title: 'Untitled (flowers)',
    workingTitle: true,
    year: 2025,
    medium: 'Acrylic',
    dimensions: '[Dimensions]',
    availability: 'gifted',
    presence: 'standard',
    images: [
      {
        file: 'flowers/01-work.jpg',
        kind: 'work',
        alt: 'Lilies, stars and small blossoms in magenta, yellow and pale blue drifting across a milky pink ground.',
      },
    ],
    words: {
      text: 'Pro nejmilejsi pani doktorku 🩷',
      lang: 'cs',
      translation: 'For the dearest doctor',
      date: '2025-01-24',
      source: 'https://www.instagram.com/p/DFNs9RBsjr9/',
    },
    description: TBC_DESCRIPTION,
    instagram: 'https://www.instagram.com/p/DFNs9RBsjr9/',
  },
  {
    slug: '2010',
    title: '2010',
    year: 2026,
    medium: '[Medium]',
    dimensions: '[Dimensions]',
    availability: 'unknown',
    presence: 'lead',
    images: [
      {
        file: '2010/01-work.jpg',
        kind: 'work',
        alt: 'A small girl in pink holding an orange cat toy beside a woman in black, surrounded by big-eyed cartoon cats, a pony and a doll on a hot pink ground.',
      },
      {
        file: '2010/02-reference.jpg',
        kind: 'reference',
        caption: 'The photograph',
        alt: 'A snapshot of a small girl in pink pyjamas on a red sofa with a white and ginger toy cat.',
      },
    ],
    description: TBC_DESCRIPTION,
    instagram: 'https://www.instagram.com/p/DZkR3ORDLi-/',
  },
  {
    slug: 'positive-abstraction',
    title: 'Untitled (positive abstraction)',
    workingTitle: true,
    year: 2024,
    medium: 'Acrylic, diptych',
    dimensions: '[Dimensions]',
    availability: 'gifted',
    presence: 'quiet',
    images: [
      {
        file: 'positive-abstraction/01-work.jpg',
        kind: 'work',
        alt: 'Two canvases side by side: a burst of petal-like strokes in orange, magenta, violet, yellow and green unfurling from the centre.',
      },
      {
        file: 'positive-abstraction/02-installation.jpg',
        kind: 'installation',
        caption: 'The two canvases together',
        alt: 'The diptych leaning against warm pine boards.',
      },
    ],
    words: {
      text: 'sestricka si prala pozitivni abstrakci, takto to dopadlo 🩷',
      lang: 'cs',
      translation: 'She wished for a positive abstraction — this is how it turned out.',
      date: '2024-09-20',
      source: 'https://www.instagram.com/p/DAIYBOHAU7m/',
    },
    description: TBC_DESCRIPTION,
    instagram: 'https://www.instagram.com/p/DAIYBOHAU7m/',
  },
]

export const workNumber = (slug: string) => String(artworks.findIndex((a) => a.slug === slug) + 1).padStart(2, '0')

export const findWork = (slug: string | undefined) => artworks.find((a) => a.slug === slug)

export const availableWorks = () => artworks.filter((a) => a.availability === 'available')
