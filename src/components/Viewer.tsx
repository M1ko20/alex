import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { ArtworkImage } from '../content/types'
import { image, largest } from '../content/images'

const ZOOM = 2.6
const TOUCH = typeof matchMedia === 'function' && matchMedia('(hover: none)').matches

/**
 * Full-screen viewing: the image on a dark ground, nothing else.
 * Click / tap to look closer, then move (or drag) to travel across the surface.
 */
export function Viewer({
  images,
  index,
  title,
  onClose,
  onIndex,
}: {
  images: ArtworkImage[]
  index: number | null
  title: string
  onClose: () => void
  onIndex: (i: number) => void
}) {
  const reduce = useReducedMotion()
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<Element | null>(null)
  const open = index !== null

  const go = useCallback(
    (d: number) => {
      if (index === null) return
      setZoomed(false)
      onIndex((index + d + images.length) % images.length)
    },
    [index, images.length, onIndex],
  )

  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      ;(returnFocus.current as HTMLElement | null)?.focus?.()
    }
  }, [open, onClose, go])

  const pan = (e: React.PointerEvent<HTMLImageElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100))
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100))
    setOrigin(`${x}% ${y}%`)
  }

  const current = index !== null ? images[index] : null

  return createPortal(
    <AnimatePresence>
      {current && (
        <motion.div
          className="viewer"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — image ${index! + 1} of ${images.length}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.35 }}
        >
          <div className="viewer-bar">
            <span className="viewer-title">
              {title}
              {current.caption && <span className="dim"> — {current.caption}</span>}
            </span>
            <span className="viewer-hint dim">
              {TOUCH
                ? zoomed
                  ? 'Drag to look around · tap to step back'
                  : 'Tap to look closer'
                : zoomed
                  ? 'Move to look around · click to step back'
                  : 'Click to look closer'}
            </span>
            <button ref={closeRef} className="viewer-close" onClick={onClose}>
              Close
            </button>
          </div>

          <div
            className={`viewer-stage${zoomed ? ' is-zoomed' : ''}`}
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <img
              key={current.file}
              src={largest(current.file)}
              width={image(current.file).width}
              height={image(current.file).height}
              alt={current.alt}
              style={{
                transform: zoomed ? `scale(${ZOOM})` : 'none',
                transformOrigin: origin,
                backgroundImage: `url(${image(current.file).placeholder})`,
              }}
              onClick={(e) => {
                pan(e as unknown as React.PointerEvent<HTMLImageElement>)
                setZoomed((z) => !z)
              }}
              onPointerMove={(e) => zoomed && (e.pointerType === 'mouse' || e.buttons) && pan(e)}
              draggable={false}
            />
          </div>

          {images.length > 1 && (
            <div className="viewer-nav">
              <button onClick={() => go(-1)} aria-label="Previous image">
                ←
              </button>
              <span className="dim">
                {index! + 1} / {images.length}
              </span>
              <button onClick={() => go(1)} aria-label="Next image">
                →
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
