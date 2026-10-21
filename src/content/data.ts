import type { Artwork } from './types'
import type { ImageData } from './images'

/**
 * The works and the image manifest are not bundled with the code: they arrive
 * with the page, as JSON in <script id="site-data">. At build time Vite fills
 * it from public/content/ (see vite.config.ts); on the PHP server index.php
 * swaps in the live copy that is edited in the admin (/admin).
 */
interface SiteData {
  artworks: Artwork[]
  images: Record<string, ImageData>
}

export const siteData: SiteData = JSON.parse(
  document.getElementById('site-data')?.textContent || '{"artworks":[],"images":{}}',
)
