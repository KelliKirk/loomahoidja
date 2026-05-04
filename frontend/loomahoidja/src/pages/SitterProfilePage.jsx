import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import Field from '../components/Field'
import CalendarRangePicker from '../components/CalendarRangePicker'
import Loader from '../components/Loader'
import { useAuth } from '../auth/AuthContext'
import { fetchSitter } from '../lib/sittersApi'
import { fallbackSitterById } from '../lib/fallbackSitters'
import { coordsForCity, osmEmbedUrl } from '../lib/geo'
import {
  acquireHold,
  addConfirmedBlock,
  getBlockedDateSet,
  releaseHold,
  subscribeBooking,
  tabSessionId,
} from '../lib/bookingHold'
import { mergeUnavailableIntoSet } from '../lib/mockMeta'
import { eachDayInRange } from '../lib/dateRange'
import { SITTER_UI_META } from '../lib/mockMeta'

const DEMO_PETS_KEY = 'loom_demo_pets_v1'

function loadDemoPets() {
  try {
    const raw = localStorage.getItem(DEMO_PETS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return [
    { id: 1, name: 'Rex', type: 'dog' },
    { id: 2, name: 'Miisu', type: 'cat' },
  ]
}

export default function SitterProfilePage() {
  const { id } = useParams()
  const { apiBaseUrl } = useAuth()
  const [sitter, setSitter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [yearMonth, setYearMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [range, setRange] = useState({ start: null, end: null })
  const [toast, setToast] = useState('')
  const [pets] = useState(() => loadDemoPets())
  const [petId, setPetId] = useState(1)
  const [holdTick, setHoldTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const fallback = fallbackSitterById(id)
      try {
        const s = await fetchSitter(apiBaseUrl, id)
        if (!cancelled) setSitter(s)
      } catch {
        if (!cancelled) setSitter(fallback)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [apiBaseUrl, id])

  const disabledSet = useMemo(() => {
    if (!sitter) return new Set()
    const blocked = getBlockedDateSet(sitter.id, tabSessionId)
    return mergeUnavailableIntoSet(sitter.id, blocked)
  }, [sitter, holdTick])

  useEffect(() => {
    return subscribeBooking(() => setHoldTick((t) => t + 1))
  }, [])

  useEffect(() => {
    if (!sitter?.id) return
    if (!range.start || !range.end) {
      releaseHold(sitter.id, tabSessionId)
      return
    }
    const res = acquireHold(sitter.id, range.start, range.end, tabSessionId)
    if (!res.ok) {
      setToast('Need kuupäevad on hetkel teise broneeringu poolt reserveeritud. Palun vali teised ajad.')
      setRange({ start: null, end: null })
    } else {
      setToast('')
    }
  }, [sitter?.id, range.start, range.end])

  const coords = sitter ? coordsForCity(sitter.city) : { lat: 58.5, lng: 25.5 }
  const mapUrl = osmEmbedUrl(coords.lat, coords.lng)

  const days =
    range.start && range.end ? eachDayInRange(range.start, range.end).length : 0
  const total = sitter && days ? days * Number(sitter.hourlyRate) : 0

  const meta = sitter ? SITTER_UI_META[sitter.id] || { badge: 'Saadaval' } : { badge: '' }

  if (loading) {
    return (
      <div className="centerPad">
        <Loader label="Laadin profiili…" />
      </div>
    )
  }

  if (!sitter) {
    return (
      <main className="pageMain narrow">
        <p className="typeBody">Hoidjat ei leitud.</p>
        <Link to="/">Tagasi avalehele</Link>
      </main>
    )
  }

  return (
    <main className="pageMain">
        <section className="profileHero cardSurface">
          <span className="sitterBadge profileBadge">{meta.badge}</span>
          <div className="profileHeroInner">
            <Avatar src={sitter.photo} name={sitter.name} size={96} />
            <div className="profileHeroText">
              <h1 className="typeH1 profileName">{sitter.name}</h1>
              <p className="typeBodySmall textMuted">
                {sitter.city || '—'} • liige alates 2026
              </p>
              <div className="tagRow">
                {(sitter.animalTypes || []).map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              <p className="typeBody">
                ★ {Number(sitter.rating).toFixed(1)} • {sitter.reviewCount} arvustust
              </p>
            </div>
            <div className="profileHeroAside">
              <p className="typeH2">{Number(sitter.hourlyRate).toFixed(2)} € / tund</p>
              <Button variant="primary" className="btnWide" type="button">
                Broneeri kohe
              </Button>
              <Button variant="outline" className="btnWide" type="button">
                Saada sõnum
              </Button>
            </div>
          </div>
        </section>

        <div className="profileColumns">
          <div className="profileMain">
            <section className="cardSurface blockPad">
              <h2 className="typeH2">Minust</h2>
              <p className="typeBody">{sitter.bio || '—'}</p>
            </section>
            <section className="cardSurface blockPad">
              <h2 className="typeH2">Loomad, keda hooldan</h2>
              <div className="tagRow">
                {(sitter.animalTypes || []).map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </section>
            <section className="cardSurface blockPad">
              <h2 className="typeH2">Kodu</h2>
              <ul className="typeBody listPlain">
                <li>{sitter.hasChildren ? '✓' : '✗'} Lapsed kodus</li>
                <li>{sitter.hasAnimals ? '✓' : '✗'} Teised lemmikloomad kodus</li>
                <li>✓ Saadaval nädalavahetustel (demo)</li>
              </ul>
            </section>
          </div>

          <aside className="profileAside">
            <section className="cardSurface blockPad">
              <h2 className="typeH3">Broneeri: {sitter.name.split(' ')[0]}</h2>
              {toast ? <div className="formError">{toast}</div> : null}
              <Field label="Kuu">
                <input
                  className="input"
                  type="month"
                  value={yearMonth}
                  onChange={(e) => setYearMonth(e.target.value)}
                />
              </Field>
              <CalendarRangePicker
                yearMonth={yearMonth}
                selectedStart={range.start}
                selectedEnd={range.end}
                disabledSet={disabledSet}
                onRangeChange={setRange}
                onBlockedAttempt={() =>
                  setToast('See päev pole saadaval või on ajutiselt lukus.')
                }
              />
              <Field label="Sinu lemmik">
                <select className="input" value={petId} onChange={(e) => setPetId(Number(e.target.value))}>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type})
                    </option>
                  ))}
                </select>
              </Field>
              <p className="typeBody">
                {days ? `${days} päeva × ${Number(sitter.hourlyRate).toFixed(2)} € = ${total.toFixed(2)} €` : '—'}
              </p>
              <Button
                variant="primary"
                className="btnWide"
                disabled={!range.start || !range.end}
                type="button"
                onClick={() => {
                  if (!range.start || !range.end) return
                  addConfirmedBlock(sitter.id, range.start, range.end)
                  releaseHold(sitter.id, tabSessionId)
                  setRange({ start: null, end: null })
                  setToast('Broneeringu päring saadetud (demo). Kuupäevad on nüüd teistele lukus.')
                  setHoldTick((x) => x + 1)
                }}
              >
                Esita broneering
              </Button>
            </section>

            <section className="cardSurface blockPad">
              <h2 className="typeH3">Saadavus</h2>
              <p className="typeCaption legendRow">
                <span className="swatch swatchFree" /> Saadaval{' '}
                <span className="swatch swatchBusy" /> Hõivatud / pole valitav
              </p>
            </section>

            <section className="cardSurface blockPad">
              <h2 className="typeH3">Asukoht</h2>
              <p className="typeBodySmall textMuted">
                Ligikaudne asukoht — täpne aadress jagatakse pärast broneeringut.
              </p>
              <div className="mapFrame">
                <iframe title="Kaart" src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </section>
          </aside>
        </div>
      </main>
  )
}
