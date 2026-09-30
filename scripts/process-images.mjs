/**
 * Image pipeline.
 *
 * Reads every original in /artwork (any depth, .jpg/.jpeg/.png/.webp),
 * writes responsive WebP files to /public/img and a manifest to
 * src/content/images.generated.json containing size, a tiny blurred
 * placeholder and two colours sampled from the image:
 *   - `wall`   : the average colour — used to tint the "room" around a work
 *   - `accent` : the most saturated recurring colour
 *
 * Run after adding or replacing images:  npm run images
 */
import sharp from 'sharp'
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'artwork')
const OUT = path.join(ROOT, 'public', 'img')
const MANIFEST = path.join(ROOT, 'src', 'content', 'images.generated.json')
const WIDTHS = [640, 1200, 2000, 2800]

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((e) => {
      const p = path.join(dir, e.name)
      return e.isDirectory() ? walk(p) : /\.(jpe?g|png|webp)$/i.test(e.name) ? [p] : []
    }),
  )
  return files.flat()
}

const hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')

function rgbToHsv(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min
  let h = 0
  if (d) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return [h, max ? d / max : 0, max]
}

async function colours(file) {
  const { data } = await sharp(file)
    .resize(48, 48, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  let ar = 0,
    ag = 0,
    ab = 0
  const buckets = new Map()
  const n = data.length / 3
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2]
    ar += r
    ag += g
    ab += b
    const [h, s, v] = rgbToHsv(r, g, b)
    if (s < 0.28 || v < 0.22) continue
    const key = Math.floor(h / 20)
    const bk = buckets.get(key) ?? { w: 0, r: 0, g: 0, b: 0 }
    const w = s * s * v
    bk.w += w
    bk.r += r * w
    bk.g += g * w
    bk.b += b * w
    buckets.set(key, bk)
  }
  const wall = hex(ar / n, ag / n, ab / n)
  const best = [...buckets.values()].sort((a, b) => b.w - a.w)[0]
  const accent = best ? hex(best.r / best.w, best.g / best.w, best.b / best.w) : wall
  return { wall, accent }
}

const manifest = {}
const files = (await walk(SRC)).sort()
for (const file of files) {
  const rel = path.relative(SRC, file).split(path.sep).join('/')
  const base = rel.replace(/\.[^.]+$/, '')
  const meta = await sharp(file).rotate().metadata()
  const width = meta.autoOrient?.width ?? meta.width
  const height = meta.autoOrient?.height ?? meta.height
  const widths = WIDTHS.filter((w) => w < width).concat(width > WIDTHS.at(-1) ? [] : [width])
  const uniq = [...new Set(widths)].sort((a, b) => a - b)

  await fs.mkdir(path.join(OUT, path.dirname(base)), { recursive: true })
  const srcset = []
  for (const w of uniq) {
    const out = `${base}-${w}.webp`
    const dest = path.join(OUT, out)
    try {
      const [s, d] = await Promise.all([fs.stat(file), fs.stat(dest)])
      if (d.mtimeMs > s.mtimeMs) {
        srcset.push({ w, src: `/img/${out}` })
        continue
      }
    } catch {}
    await sharp(file)
      .rotate()
      .resize({ width: w })
      .webp({ quality: w > 1500 ? 78 : 82 })
      .toFile(dest)
    srcset.push({ w, src: `/img/${out}` })
  }

  const lqip = await sharp(file).rotate().resize(20).blur(1.2).webp({ quality: 40 }).toBuffer()
  manifest[rel] = {
    width,
    height,
    srcset,
    placeholder: `data:image/webp;base64,${lqip.toString('base64')}`,
    ...(await colours(file)),
  }
  console.log('✓', rel, `${width}×${height}`, manifest[rel].wall, manifest[rel].accent)
}

await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
console.log(`\n${files.length} images → ${path.relative(ROOT, MANIFEST)}`)
