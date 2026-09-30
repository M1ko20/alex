/**
 * Renders a string, highlighting any [placeholder] parts so unconfirmed
 * content is obvious on the page. See src/content/types.ts.
 */
export function Ph({ children }: { children: string }) {
  const parts = children.split(/(\[[^\]]*\])/g).filter(Boolean)
  return (
    <>
      {parts.map((part, i) =>
        isPlaceholder(part) ? (
          <mark key={i} className="ph" title="Placeholder — replace with real information">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}

export const isPlaceholder = (s: string | undefined) => !!s && /^\s*\[[^\]]*\]\s*$/.test(s)
