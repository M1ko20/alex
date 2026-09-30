import { useId, useMemo, useState } from 'react'
import { artist } from '../content/site'
import { artworks, workNumber } from '../content/artworks'
import type { Artwork } from '../content/types'
import { isPlaceholder } from './Ph'

export type Topic = 'work' | 'commission' | 'collaboration' | 'other'

const TOPICS: { value: Topic; label: string }[] = [
  { value: 'work', label: 'One of my works' },
  { value: 'commission', label: 'A commission' },
  { value: 'collaboration', label: 'Working together' },
  { value: 'other', label: 'Something else' },
]

export function subjectFor(topic: Topic, work?: Artwork) {
  if (topic === 'work' && work) {
    const verb = work.availability === 'available' ? 'Inquiry about' : 'Question about'
    return `${verb} “${work.title}” (No. ${workNumber(work.slug)})`
  }
  if (topic === 'commission') return 'Commission inquiry'
  if (topic === 'collaboration') return 'Collaboration'
  return 'Message from the website'
}

/**
 * Sends through Netlify Forms (see the hidden form in index.html). Nothing is
 * stored on this site; Netlify forwards submissions to the artist by email.
 * If sending fails, the visitor is offered a direct email / Instagram route
 * with the same subject.
 */
export function InquiryForm({
  work: fixedWork,
  initialTopic = 'work',
  initialWork,
  compact,
}: {
  /** When set, the form is about this work only (used on a work's page). */
  work?: Artwork
  initialTopic?: Topic
  initialWork?: string
  compact?: boolean
}) {
  const id = useId()
  const [topic, setTopic] = useState<Topic>(fixedWork ? 'work' : initialTopic)
  const [slug, setSlug] = useState(fixedWork?.slug ?? initialWork ?? '')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')
  const work = fixedWork ?? artworks.find((a) => a.slug === slug)
  const subject = subjectFor(topic, work)
  const emailReady = !isPlaceholder(artist.email)

  const placeholder = useMemo(() => {
    if (topic === 'work' && work?.availability === 'available')
      return 'Ask me anything — the price, the size, shipping, seeing it in person…'
    if (topic === 'commission') return 'What would you like me to paint? Any size, timing or budget in mind?'
    if (topic === 'work') return 'What would you like to know about it?'
    return ''
  }, [topic, work])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    data.set('subject', subject)
    data.set('artwork', work ? `${workNumber(work.slug)} ${work.title}` : '')
    setState('sending')
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
      })
      setState(res.ok ? 'sent' : 'failed')
    } catch {
      setState('failed')
    }
  }

  if (state === 'sent') {
    return (
      <div className="form-done" role="status">
        <p className="form-done-title">Thank you — I’ve got your message.</p>
        <p className="dim">I’ll write back to the email address you gave me.</p>
      </div>
    )
  }

  return (
    <form className={`inquiry${compact ? ' is-compact' : ''}`} name="inquiry" onSubmit={submit}>
      <input type="hidden" name="form-name" value="inquiry" />
      <p hidden>
        <label>
          Leave this empty: <input name="bot-field" />
        </label>
      </p>

      {!fixedWork && (
        <div className="field">
          <label htmlFor={`${id}-topic`}>It’s about</label>
          <select id={`${id}-topic`} name="topic" value={topic} onChange={(e) => setTopic(e.target.value as Topic)}>
            {TOPICS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {fixedWork && <input type="hidden" name="topic" value="work" />}

      {!fixedWork && topic === 'work' && (
        <div className="field">
          <label htmlFor={`${id}-work`}>Which one</label>
          <select id={`${id}-work`} value={slug} onChange={(e) => setSlug(e.target.value)} required>
            <option value="">Choose a work…</option>
            {artworks.map((a) => (
              <option key={a.slug} value={a.slug}>
                {workNumber(a.slug)} — {a.title}
                {a.availability === 'available' ? ' (available)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <p className="form-subject">
        <span className="dim">Subject</span> {subject}
      </p>

      <div className="field-row">
        <div className="field">
          <label htmlFor={`${id}-name`}>Your name</label>
          <input id={`${id}-name`} name="name" autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor={`${id}-email`}>Your email</label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" required />
        </div>
      </div>
      <div className="field">
        <label htmlFor={`${id}-message`}>Your message</label>
        <textarea id={`${id}-message`} name="message" rows={compact ? 4 : 6} placeholder={placeholder} required />
      </div>

      <button className="button" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Send it to me'}
      </button>

      {state === 'failed' && (
        <p className="form-error" role="alert">
          It didn’t send from here, sorry.{' '}
          {emailReady ? (
            <a href={`mailto:${artist.email}?subject=${encodeURIComponent(subject)}`}>Email me instead</a>
          ) : (
            <a href={artist.instagram.url} target="_blank" rel="noreferrer">
              Message me on Instagram instead ↗
            </a>
          )}
          .
        </p>
      )}
    </form>
  )
}
