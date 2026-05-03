import { useEffect, useMemo, useState } from 'react'
import AppHeader from '../components/AppHeader'
import SitterCard from '../components/SitterCard'
import Loader from '../components/Loader'
import Field from '../components/Field'
import Button from '../components/Button'
import { useAuth } from '../auth/AuthContext'
import { fetchSitters } from '../lib/sittersApi'
import { FALLBACK_SITTERS } from '../lib/fallbackSitters'

const ANIMALS = ['dog', 'cat', 'bird', 'rabbit', 'rodent', 'fish']
const CITIES = ['Tallinn', 'Tartu', 'Pärnu', 'Viljandi']

export default function FindSitterPage() {
  const { apiBaseUrl } = useAuth()
  const [sitters, setSitters] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const [maxRate, setMaxRate] = useState(20)
  const [types, setTypes] = useState(() => new Set(['dog', 'cat']))
  const [cities, setCities] = useState(() => new Set(['Tallinn', 'Tartu']))
  const [hasChildren, setHasChildren] = useState(true)
  const [hasPets, setHasPets] = useState(false)
  const [weekends, setWeekends] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const rows = await fetchSitters(apiBaseUrl)
        if (!cancelled) setSitters(rows.length ? rows : FALLBACK_SITTERS)
      } catch {
        if (!cancelled) setSitters(FALLBACK_SITTERS)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [apiBaseUrl])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return sitters.filter((s) => {
      if (q && !`${s.name} ${s.city}`.toLowerCase().includes(q)) return false
      if (Number(s.hourlyRate) > maxRate) return false
      const t = s.animalTypes || []
      for (const x of types) {
        if (!t.includes(x)) return false
      }
      if (cities.size && !cities.has(s.city)) return false
      if (hasChildren && s.hasChildren !== true) return false
      if (hasPets && s.hasAnimals !== true) return false
      if (weekends && !s.weekendsOk) return false
      return true
    })
  }, [sitters, search, maxRate, types, cities, hasChildren, hasPets, weekends])

  function toggleSet(setter, key) {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function loadMore() {
    setLoadingMore(true)
    await new Promise((r) => setTimeout(r, 900))
    setLoadingMore(false)
  }

  return (
    <div className="pageShell">
      <AppHeader />
      <main className="pageMain">
        <section className="heroSearch">
          <h1 className="typeDisplay heroTitle">Leia usaldusväärne hoidja oma lemmikule</h1>
          <p className="typeBody heroSub">Ühendame omanikud ja hoidjad üle Eesti.</p>
          <div className="searchBar">
            <input
              className="input searchInput"
              placeholder="Otsi linna või hoidja nime järgi…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="primary" className="btnSm" type="button">
              Otsi
            </Button>
          </div>
        </section>

        <div className="findLayout">
          <aside className="filters">
            <h2 className="typeH3">Filtrid</h2>
            <Field label="Looma tüüp">
              <div className="pillGrid">
                {ANIMALS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`filterPill ${types.has(a) ? 'on' : ''}`}
                    onClick={() => toggleSet(setTypes, a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </Field>
            <Field label={`Tunnitasu kuni ${maxRate} €`}>
              <input
                className="range"
                type="range"
                min="5"
                max="30"
                value={maxRate}
                onChange={(e) => setMaxRate(Number(e.target.value))}
              />
            </Field>
            <Field label="Tingimused">
              <label className="checkRow">
                <input type="checkbox" checked={hasChildren} onChange={(e) => setHasChildren(e.target.checked)} />
                Lapsed kodus
              </label>
              <label className="checkRow">
                <input type="checkbox" checked={hasPets} onChange={(e) => setHasPets(e.target.checked)} />
                Teised lemmikloomad
              </label>
              <label className="checkRow">
                <input type="checkbox" checked={weekends} onChange={(e) => setWeekends(e.target.checked)} />
                Nädalavahetustel ja pühadel (demo)
              </label>
            </Field>
            <Field label="Linn">
              <div className="pillGrid">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`filterPill ${cities.has(c) ? 'on' : ''}`}
                    onClick={() => toggleSet(setCities, c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>
          </aside>

          <section className="sitterGridWrap">
            {loading ? (
              <div className="centerPad">
                <Loader label="Laadin hoidjaid…" />
              </div>
            ) : (
              <>
                <div className="sitterGrid">
                  {filtered.map((s) => (
                    <SitterCard key={s.id} sitter={s} />
                  ))}
                </div>
                {!filtered.length ? <p className="typeBody textMuted">Ühtegi hoidjat ei leitud.</p> : null}
                <div className="centerPad">
                  {loadingMore ? (
                    <Loader label="Laadin veel hoidjaid…" size={56} />
                  ) : (
                    <Button variant="outline" type="button" onClick={loadMore}>
                      Laadi juurde
                    </Button>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
