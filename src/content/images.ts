import manifest from './images.generated.json'

export interface ImageData {
  width: number
  height: number
  srcset: { w: number; src: string }[]
  placeholder: string
  wall: string
  accent: string
}

// The manifest stores root-relative paths; prefix them when the site lives under a sub-path.
const base = import.meta.env.BASE_URL.replace(/\/$/, '')
const images: Record<string, ImageData> = Object.fromEntries(
  Object.entries(manifest as Record<string, ImageData>).map(([file, data]) => [
    file,
    { ...data, srcset: data.srcset.map((s) => ({ ...s, src: base + s.src })) },
  ]),
)

export function image(file: string): ImageData {
  const data = images[file]
  if (!data) throw new Error(`Image "${file}" is missing — add it to /artwork and run \`npm run images\`.`)
  return data
}

export const ratio = (file: string) => {
  const { width, height } = image(file)
  return width / height
}

export const largest = (file: string) => image(file).srcset.at(-1)!.src
