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
  }, [sitter, holdTick]) // eslint-disable-line react-hooks/exhaustive-deps -- holdTick invalidates when booking-hold bus updates

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
    <main className="pageMain sitter-profile-page">
      <div className="public-profile-hero-strip">
        <div className="public-profile-hero-inner">
          <div className="public-profile-hero-layout">
            <Avatar src={sitter.photo} name={sitter.name} size={96} />
            <div className="public-profile-hero-text">
              <h1 className="typeH1 public-profile-hero-title">{sitter.name}</h1>
              <p className="typeBodySmall textMuted">
                {sitter.city || '—'} • member since 2026
              </p>
              <div className="tagRow">
                {(sitter.animalTypes || []).map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              <p className="typeBody">
                ★ {Number(sitter.rating).toFixed(1)} • {sitter.reviewCount} reviews
              </p>
            </div>
            <div className="public-profile-hero-aside">
              <p className="typeH2">{Number(sitter.hourlyRate).toFixed(2)} € / hour</p>
              <Button variant="primary" className="btnWide" type="button">
                Book now
              </Button>
              <Button variant="outline" className="btnWide" type="button">
                Send message
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="public-profile-page-grid">
        <div className="public-profile-page-primary">
          <section className="public-profile-section">
            <h2 className="public-profile-section-title">About</h2>
            <p className="typeBody">{sitter.bio || '—'}</p>
          </section>

          <section className="public-profile-section">
            <h2 className="public-profile-section-title">Animals I care for</h2>
            <div className="tagRow">
              {(sitter.animalTypes || []).map((t) => (
                <span key={`care-${t}`} className="tag">
                  {t}
                </span>
              ))}
            </div>
          </section>

          <section className="public-profile-section">
            <h2 className="public-profile-section-title">Home details</h2>
            <ul className="typeBody listPlain">
              <li>{sitter.hasChildren ? '✓' : '✗'} Has children at home</li>
              <li>{sitter.hasAnimals ? '✓' : '✗'} Has other pets at home</li>
              <li>✓ Available weekends and holidays (demo)</li>
            </ul>
          </section>
        </div>

        <aside className="public-profile-rail" aria-label="Booking sidebar">
          <div className="public-profile-rail-inner">
            <section className="public-profile-rail-card">
              <h2 className="typeH3 public-profile-rail-title">Book {sitter.name.split(' ')[0]}</h2>
              {toast ? <div className="formError">{toast}</div> : null}
              <Field label="Month">
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
                  setToast('This day is busy or temporarily locked. Please pick another date.')
                }
              />
              <Field label="Your pet">
                <select className="input" value={petId} onChange={(e) => setPetId(Number(e.target.value))}>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type})
                    </option>
                  ))}
                </select>
              </Field>
              <p className="typeBody">
                {days ? `${days} days × ${Number(sitter.hourlyRate).toFixed(2)} € = ${total.toFixed(2)} €` : '—'}
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
                  setToast('Booking request sent (demo). These dates are now locked for others.')
                  setHoldTick((x) => x + 1)
                }}
              >
                Request booking
              </Button>
            </section>

            <section className="public-profile-rail-card">
              <h2 className="typeH3 public-profile-rail-title">Availability</h2>
              <p className="typeCaption legendRow">
                <span className="swatch swatchFree" /> Available{' '}
                <span className="swatch swatchBusy" /> Busy / not selectable
              </p>
            </section>

            <section className="public-profile-rail-card">
              <h2 className="typeH3 public-profile-rail-title">Location</h2>
              <p className="typeBodySmall textMuted">
                Approximate location — exact address is shared after booking.
              </p>
              <div className="mapFrame">
                <iframe title="Map" src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </section>
          </div>
        </aside>
      </div>
    </main>
  )
}
