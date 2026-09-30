import { Link } from 'react-router-dom'
import { useTitle } from '../lib/room'

export function NotFound() {
  useTitle('Not found')
  return (
    <div className="page notfound">
      <p className="hand page-hand">oops —</p>
      <h1 className="page-title">Nothing hangs here.</h1>
      <p>
        <Link to="/" className="arrow-link">
          Back to my works →
        </Link>
      </p>
    </div>
  )
}
