import { useEffect } from 'react'

/**
 * The "room": the page background is a warm wall colour that can take on a
 * little of the colour of the painting being looked at — the way a saturated
 * canvas throws light onto the wall around it.
 */
const root = () => document.documentElement

export function setRoom(color: string | null, amount = 0.08) {
  if (!color) {
    root().style.setProperty('--room-amount', '0%')
    return
  }
  root().style.setProperty('--room-tint', color)
  root().style.setProperty('--room-amount', `${Math.round(amount * 100)}%`)
}

/** Tint the room for as long as the calling page is mounted. */
export function useRoom(color: string | null, amount?: number) {
  useEffect(() => {
    setRoom(color, amount)
    return () => setRoom(null)
  }, [color, amount])
}

export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Alexandra Tomanová` : 'Alexandra Tomanová'
  }, [title])
}
