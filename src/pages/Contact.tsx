import { useSearchParams } from 'react-router-dom'
import { artist } from '../content/site'
import { useTitle } from '../lib/room'
import { InquiryForm, type Topic } from '../components/InquiryForm'
import { Ph, isPlaceholder } from '../components/Ph'

const TOPICS: Topic[] = ['work', 'commission', 'collaboration', 'other']

export function Contact() {
  useTitle('Write to me')
  const [params] = useSearchParams()
  const about = params.get('about') as Topic | null
  const work = params.get('work') ?? undefined
  const topic: Topic = about && TOPICS.includes(about) ? about : work ? 'work' : 'other'

  return (
    <div className="page contact">
      <header className="page-head">
        <p className="voice page-aside">say hi —</p>
        <h1 className="page-title">Write to me</h1>
        <div className="page-intro">
          <p>
            About a painting you’ve seen here, something you’d like me to paint for you, working together, or anything
            else.
          </p>
        </div>
      </header>

      <div className="contact-grid">
        <InquiryForm key={`${topic}-${work}`} initialTopic={topic} initialWork={work} />

        <aside className="contact-direct">
          <div>
            <h2 className="section-label">My email</h2>
            <p>
              {isPlaceholder(artist.email) ? (
                <Ph>{artist.email}</Ph>
              ) : (
                <a href={`mailto:${artist.email}`}>{artist.email}</a>
              )}
            </p>
          </div>
          <div>
            <h2 className="section-label">Or on Instagram</h2>
            <p>
              <a href={artist.instagram.url} target="_blank" rel="noreferrer">
                @{artist.instagram.handle} ↗
              </a>
            </p>
          </div>
          {artist.commissionsOpen && (
            <div>
              <h2 className="section-label">Commissions</h2>
              <p>I paint on commission — tell me what you have in mind.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
