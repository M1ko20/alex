// TEMPORARY: a side-by-side comparison of label styles, to pick one. Delete with label-preview.css.
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-ext-400.css'
import './label-preview.css'
import { artworks } from '../content/artworks'
import { Piece } from './Wall'

const VARIANTS = [
  { id: 'old', name: '0 — Původní', note: 'Jak to bylo před úpravou.' },
  { id: 'faux', name: '1 — Teď: uměle tučně', note: 'Název 23 px, ztučněný prohlížečem.' },
  { id: 'big', name: '2 — Větší, bez ztučnění', note: 'Název 27 px v normální tloušťce, plně černý.' },
  { id: 'upright', name: '3 — Stojatě místo kurzívy', note: 'Stejné písmo, stojatý řez, 25 px.' },
  { id: 'sans', name: '4 — Bezpatkové, opravdu tučné', note: 'Instrument Sans 600, 18 px.' },
  { id: 'rule', name: '5 — Větší + linka a víc místa', note: 'Varianta 2 s tenkou linkou nad popiskem.' },
]

export function LabelPreview() {
  const works = artworks.slice(1, 4)
  return (
    <section className="label-preview">
      {VARIANTS.map((v) => (
        <div key={v.id} className={`lv lv-${v.id}`}>
          <p className="lv-head">
            <strong>{v.name}</strong> {v.note}
          </p>
          <div className="lv-row">
            {works.map((w) => (
              <Piece key={w.slug} work={w} sizes="(max-width: 760px) 92vw, 30vw" />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
