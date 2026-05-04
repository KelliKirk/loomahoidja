import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SitterCard from '../components/SitterCard.jsx'

const ANIMAL_TYPE_OPTIONS = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Rodent', 'Fish']
const CITY_OPTIONS = ['Tallinn', 'Tartu', 'Pärnu', 'Viljandi']
const BADGES = ['Available', 'Popular', 'New']

const sampleSitters = [
  {
    id: 1,
    name: 'Leelo Lameuss',
    city: 'Tartu',
    rate: '8.50',
    bio: 'Love animals, long experience with dogs and cats',
    types: ['Dog', 'Cat', 'Bird'],
    rawTypes: ['dog', 'cat', 'bird'],
    rating: '4.9',
    badge: 'Available',
    photoUrl: null,
    hasChildren: true,
    hasAnimals: true,
    weekendsOk: false,
  },
  {
    id: 2,
    name: 'Rasmus Sigma',
    city: 'Tallinn',
    rate: '10.00',
    bio: 'Professional pet sitter with 5+ years experience',
    types: ['Dog', 'Cat'],
    rawTypes: ['dog', 'cat'],
    rating: '5.0',
    badge: 'Popular',
    photoUrl:
      'https://images.unsplash.com/photo-1522276492815-26d4f612cfaf?auto=format&fit=crop&w=640&q=80',
    hasChildren: true,
    hasAnimals: true,
    weekendsOk: true,
  },
  {
    id: 3,
    name: 'Sander Skibidi-Saabas',
    city: 'Pärnu',
    rate: '7.00',
    bio: 'I treat every animal with care and love',
    types: ['Cat', 'Rodent'],
    rawTypes: ['cat', 'rodent'],
    rating: '4.7',
    badge: 'New',
    photoUrl: null,
    hasChildren: true,
    hasAnimals: false,
    weekendsOk: false,
  },
]

function formatTypesFromApi(sitter) {
  return (sitter.SitterAnimalTypes || []).map((t) => {
    const x = t.animalType || t
    return String(x).charAt(0).toUpperCase() + String(x).slice(1).toLowerCase()
  })
}

function rawTypesFromApi(sitter) {
  return (sitter.SitterAnimalTypes || []).map((t) => String(t.animalType || t).toLowerCase())
}

function normalizeApiSitter(sitter, apiOrigin, index) {
  const photo = sitter.photo ? `${apiOrigin}/uploads/${sitter.photo}` : null
  const types = formatTypesFromApi(sitter)
  const rawTypes = rawTypesFromApi(sitter)
  const ratingNum = 4.7 + ((Number(sitter.id) || index) % 4) * 0.1
  return {
    id: sitter.id,
    name: sitter.User?.fullName || 'Sitter',
    city: sitter.city || sitter.User?.city || '—',
    rate: sitter.hourlyRate ?? '10',
    bio: sitter.bio || '',
    types,
    rawTypes,
    rating: ratingNum.toFixed(1),
    badge: BADGES[Math.abs(Number(sitter.id) || 0) % 3],
    photoUrl: photo,
    hasChildren: Boolean(sitter.hasChildren),
    hasAnimals: Boolean(sitter.hasAnimals),
    weekendsOk: true,
  }
}

function cardVariantForSitter(sitter) {
  if (sitter.photoUrl) return 'mauve'
  const idNum = Number(sitter.id)
  const v = Number.isFinite(idNum) ? Math.abs(Math.trunc(idNum)) % 3 : 0
  if (v === 0) return 'teal'
  if (v === 1) return 'mauve'
  return 'pink'
}

export default function HomePage({
  apiOrigin,
  search,
  setSearch,
  rawSitters,
  hasFetched,
  loading,
  onApplySearch,
  onSitterClick,
}) {
  const [hourly, setHourly] = useState(15)
  const [conditions, setConditions] = useState({ hasChildren: true, hasPets: false, weekends: false })
  const [selectedCities, setSelectedCities] = useState(() => new Set(['Tallinn', 'Tartu']))
  const [animalTypes, setAnimalTypes] = useState(() => new Set(['dog', 'cat']))
  const [sortBy, setSortBy] = useState('rating-desc')
  const [visibleCount, setVisibleCount] = useState(6)
  const [lazyLoading, setLazyLoading] = useState(false)
  const lazyLockRef = useRef(false)

  const loadMoreSentinelRef = useRef(null)

  const baseList = useMemo(() => {
    if (!hasFetched || rawSitters.length === 0) {
      return sampleSitters
    }
    return rawSitters.map((s, i) => normalizeApiSitter(s, apiOrigin, i))
  }, [hasFetched, rawSitters, apiOrigin])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = baseList.filter((s) => {
      if (q) {
        const hay = `${s.name} ${s.city}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (Number(s.rate) > hourly) return false
      if (animalTypes.size > 0) {
        const raw = s.rawTypes || s.types.map((t) => t.toLowerCase())
        const ok = [...animalTypes].some((t) => raw.includes(t))
        if (!ok) return false
      }
      if (conditions.hasChildren && !s.hasChildren) return false
      if (conditions.hasPets && !s.hasAnimals) return false
      if (conditions.weekends && !s.weekendsOk) return false
      if (selectedCities.size > 0 && !selectedCities.has(s.city)) return false
      return true
    })

    list = [...list]
    if (sortBy === 'rating-desc') {
      list.sort((a, b) => Number(b.rating) - Number(a.rating))
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => Number(a.rate) - Number(b.rate))
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => Number(b.rate) - Number(a.rate))
    }
    return list
  }, [baseList, search, hourly, animalTypes, conditions, selectedCities, sortBy])

  useEffect(() => {
    setVisibleCount(6)
  }, [filtered.length, search, hourly, animalTypes, conditions, selectedCities, sortBy, hasFetched])

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount])
  const hasMore = visibleCount < filtered.length

  useEffect(() => {
    const el = loadMoreSentinelRef.current
    if (!el || loading || !hasMore) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry.isIntersecting || lazyLockRef.current || loading) return
        lazyLockRef.current = true
        setLazyLoading(true)
        window.setTimeout(() => {
          setVisibleCount((c) => Math.min(c + 3, filtered.length))
          setLazyLoading(false)
          lazyLockRef.current = false
        }, 480)
      },
      { root: null, rootMargin: '100px', threshold: 0.05 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loading, hasMore, filtered.length])

  function toggleCondition(key) {
    setConditions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleCity(city) {
    setSelectedCities((prev) => {
      const next = new Set(prev)
      if (next.has(city)) next.delete(city)
      else next.add(city)
      return next
    })
  }

  function toggleAnimalType(t) {
    const key = t.toLowerCase()
    setAnimalTypes((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const runSearch = useCallback(() => {
    onApplySearch()
  }, [onApplySearch])

  const showInitialLoader = loading && !hasFetched

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1 id="home-hero-title">Find a trusted sitter for your pet</h1>
            <p>Connecting pet owners with caring sitters across Estonia</p>
            <div className="hero-search">
              <div className="hero-search-field">
                <span className="hero-search-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="search"
                  placeholder="Search by city or sitter name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search sitters"
                />
              </div>
              <button type="button" className="hero-search-submit" onClick={runSearch}>
                Find a sitter
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="home-body">
        <div className="home-main">
          <aside className="filter-panel" aria-label="Filters">
            <div className="filter-block">
              <div className="filter-title">Animal type</div>
              <div className="chip-row">
                {ANIMAL_TYPE_OPTIONS.map((type) => {
                  const key = type.toLowerCase()
                  return (
                    <button
                      key={type}
                      type="button"
                      className={`chip ${animalTypes.has(key) ? 'active' : ''}`}
                      onClick={() => toggleAnimalType(type)}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="filter-block">
              <div className="filter-title">Hourly rate (€)</div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={hourly}
                onChange={(e) => setHourly(Number(e.target.value))}
                aria-valuetext={`Up to ${hourly} euros per hour`}
              />
              <div className="range-labels">
                <span>0€</span>
                <span>
                  Up to {hourly}€
                </span>
                <span>20€</span>
              </div>
            </div>

            <div className="filter-block filter-block--conditions">
              <div className="filter-title">Conditions</div>
              <label className="checkbox-row">
                <input type="checkbox" checked={conditions.hasChildren} onChange={() => toggleCondition('hasChildren')} />
                Has children
              </label>
              <label className="checkbox-row">
                <input type="checkbox" checked={conditions.hasPets} onChange={() => toggleCondition('hasPets')} />
                Has pets
              </label>
              <label className="checkbox-row">
                <input type="checkbox" checked={conditions.weekends} onChange={() => toggleCondition('weekends')} />
                Available weekends and holidays
              </label>
            </div>

            <div className="filter-block">
              <div className="filter-title">City</div>
              <div className="chip-row">
                {CITY_OPTIONS.map((city) => (
                  <button
                    key={city}
                    type="button"
                    className={`chip ${selectedCities.has(city) ? 'active' : ''}`}
                    onClick={() => toggleCity(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="filter-apply-btn" onClick={runSearch}>
              {hasFetched ? 'Refresh sitters' : 'Apply filters & load sitters'}
            </button>
          </aside>

          <main className="results-panel">
            {showInitialLoader ? (
              <div className="loading-panel loading-panel--initial" aria-live="polite">
                <div className="loading-ring" />
                <span>Loading sitters...</span>
              </div>
            ) : (
              <>
                <div className="results-toolbar">
                  <p className="results-count">
                    <strong>{filtered.length}</strong> sitters found
                  </p>
                  <label className="results-sort">
                    <span className="visually-hidden">Sort</span>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="rating-desc">Highest rated</option>
                      <option value="price-asc">Lowest hourly rate</option>
                      <option value="price-desc">Highest hourly rate</option>
                    </select>
                  </label>
                </div>

                <div className="card-grid">
                  {visible.map((sitter) => (
                    <SitterCard
                      key={sitter.id}
                      sitter={sitter}
                      onSitterClick={onSitterClick}
                      cardVariant={cardVariantForSitter(sitter)}
                    />
                  ))}
                </div>

                {filtered.length === 0 && !loading ? (
                  <p className="results-empty">No sitters match your filters. Try adjusting your search or filters.</p>
                ) : null}

                {((loading && hasFetched) || lazyLoading) && (
                  <div className="loading-panel" aria-live="polite">
                    <div className="loading-ring" />
                    <span>{loading ? 'Refreshing sitters...' : 'Loading more sitters...'}</span>
                  </div>
                )}

                {hasMore && !loading ? <div className="load-sentinel" ref={loadMoreSentinelRef} aria-hidden="true" /> : null}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
