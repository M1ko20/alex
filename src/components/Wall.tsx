import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Artwork } from '../content/types'
import { image, ratio } from '../content/images'
import { setRoom } from '../lib/room'
import { Art } from './Art'
import { Label } from './Label'
import { Reveal } from './Reveal'

const MAX_PER_ROW = 4

type Unit = { work: Artwork; r: number }
type Row = { units: Unit[]; h: number; capped: boolean }

/**
 * A salon hang: works sit edge to edge in rows of equal height that fill the
 * width, so nothing floats in empty wall. Rows are chosen together (not one
 * at a time) so that each comes out close to a comfortable height; rows with
 * a lead work aim a little taller, quiet works a little shorter.
 */
function hang(units: Unit[], width: number, vh: number, gap: number): Row[] {
  const targetH = Math.min(width * 0.46, vh * 0.7, 660)
  const maxH = Math.max(240, vh - 120)

  const measure = (i: number, j: number) => {
    const us = units.slice(i, j)
    const sum = us.reduce((a, u) => a + u.r, 0)
    const natural = (width - gap * (us.length - 1)) / sum
    const h = Math.min(natural, maxH)
    const aim =
      targetH *
      (us.some((u) => u.work.presence === 'lead') ? 1.3 : 1) *
      (us.some((u) => u.work.presence === 'quiet') ? 0.85 : 1)
    let cost = Math.log(h / aim) ** 2 * us.length
    if (natural > maxH) cost += (3 * (natural - maxH)) / maxH
    return { h, capped: natural > maxH, cost }
  }

  const best = Array<number>(units.length + 1).fill(Infinity)
  const from = Array<number>(units.length + 1).fill(0)
  best[0] = 0
  for (let j = 1; j <= units.length; j++)
    for (let i = Math.max(0, j - MAX_PER_ROW); i < j; i++) {
      const c = best[i] + measure(i, j).cost
      if (c < best[j]) {
        best[j] = c
        from[j] = i
      }
    }

  const rows: Row[] = []
  for (let j = units.length; j > 0; j = from[j]) {
    const { h, capped } = measure(from[j], j)
    rows.unshift({ units: units.slice(from[j], j), h: Math.floor(h), capped })
  }
  return rows
}

export function Piece({ work, sizes, eager }: { work: Artwork; sizes: string; eager?: boolean }) {
  const cover = work.images[0]
  const tint = () => setRoom(image(cover.file).wall, 0.07)
  const untint = () => setRoom(null)
  return (
    <Link
      to={`/work/${work.slug}`}
      className="piece"
      onMouseEnter={tint}
      onMouseLeave={untint}
      onFocus={tint}
      onBlur={untint}
      onClick={untint}
      data-slug={work.slug}
    >
      <Art file={cover.file} alt={cover.alt} sizes={sizes} eager={eager} />
      <Label work={work} />
    </Link>
  )
}

const initialWidth = () => (typeof window === 'undefined' ? 1200 : Math.min(window.innerWidth, 1680) - 32)

export function Wall({ works }: { works: Artwork[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(() => ({ w: initialWidth(), vh: typeof window === 'undefined' ? 900 : innerHeight }))

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width)
      // Heights snap to 40px steps so a phone's collapsing address bar doesn't re-hang the wall.
      const vh = Math.round(window.innerHeight / 40) * 40
      setSize((s) => (s.w === w && s.vh === vh ? s : { w, vh }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const stack = size.w < 640
  const gap = size.w >= 1000 ? 18 : 12

  const units = useMemo<Unit[]>(() => works.map((work) => ({ work, r: ratio(work.images[0].file) })), [works])
  const rows = useMemo(() => (stack ? [] : hang(units, size.w, size.vh, gap)), [units, size, stack, gap])

  if (stack) {
    return (
      <div className="wall is-stack" ref={ref}>
        {units.map((u) => (
          <Reveal key={u.work.slug} id={u.work.slug} className={`stack-item is-${u.work.presence}`}>
            <Piece work={u.work} sizes="92vw" />
          </Reveal>
        ))}
      </div>
    )
  }

  return (
    <div className="wall" ref={ref} style={{ '--gap': `${gap}px` } as CSSProperties}>
      {rows.map((row) => (
        <div
          key={row.units[0].work.slug}
          className={`wall-row${row.capped ? ' is-capped' : ''}`}
          style={{ '--h': `${row.h}px` } as CSSProperties}
        >
          {row.units.map((u, k) => (
            <Reveal
              key={u.work.slug}
              id={u.work.slug}
              className="wall-item"
              style={{ width: `calc(var(--h) * ${u.r})` }}
              delay={Math.min(k, 3) * 0.08}
            >
              <Piece work={u.work} sizes={`${Math.ceil(row.h * u.r)}px`} />
            </Reveal>
          ))}
        </div>
      ))}
    </div>
  )
}
