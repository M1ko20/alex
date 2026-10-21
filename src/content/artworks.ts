import type { Artwork } from './types'
import { siteData } from './data'

/**
 * THE WORKS
 *
 * Edited in the admin (/admin) on the live site. public/content/artworks.json
 * is only the starting copy the server begins with.
 *
 * The order of the list is the order of the hang: it decides the sequence on
 * the wall, the numbers (01, 02 …) and the order of the list of works.
 * Works marked hidden, and works without a photo yet, stay off the site.
 */
export const artworks: Artwork[] = siteData.artworks
  .map((a) => ({ ...a, images: a.images.filter((img) => img.file in siteData.images) }))
  .filter((a) => !a.hidden && a.images.length > 0)

export const workNumber = (slug: string) => String(artworks.findIndex((a) => a.slug === slug) + 1).padStart(2, '0')

export const findWork = (slug: string | undefined) => artworks.find((a) => a.slug === slug)

export const availableWorks = () => artworks.filter((a) => a.availability === 'available')
