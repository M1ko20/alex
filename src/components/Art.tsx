import { useEffect, useRef, useState } from 'react'
import { image } from '../content/images'

interface Props {
  file: string
  alt: string
  /** The `sizes` attribute — how wide the image is displayed. */
  sizes: string
  eager?: boolean
  className?: string
}

/** A responsive artwork image that sits on its own blurred placeholder and fades in when ready. */
export function Art({ file, alt, sizes, eager, className }: Props) {
  const data = image(file)
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth) setLoaded(true)
  }, [file])

  const fallback = data.srcset.find((s) => s.w >= 1200) ?? data.srcset.at(-1)!

  return (
    <span
      className={`art${loaded ? ' is-loaded' : ''}${className ? ` ${className}` : ''}`}
      style={{ aspectRatio: `${data.width} / ${data.height}`, backgroundImage: `url(${data.placeholder})` }}
    >
      <img
        ref={ref}
        src={fallback.src}
        srcSet={data.srcset.map((s) => `${s.src} ${s.w}w`).join(', ')}
        sizes={sizes}
        width={data.width}
        height={data.height}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
      />
    </span>
  )
}
