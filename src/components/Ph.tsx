/**
 * Renders a string without any [placeholder] parts, so unconfirmed content
 * stays in the data but never shows on the page. See src/content/types.ts.
 */
export function Ph({ children }: { children: string }) {
  return <>{children.replace(/\[[^\]]*\]/g, '').trim()}</>
}

export const isPlaceholder = (s: string | undefined) => !!s && /^\s*\[[^\]]*\]\s*$/.test(s)

/** Real content: neither empty nor a [placeholder]. */
export const filled = (s: string | undefined): s is string => !!s && !isPlaceholder(s)
