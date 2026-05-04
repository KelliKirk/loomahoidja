import React, { useMemo, useState } from 'react'
import SitterCard from '../components/SitterCard.jsx'

const ANIMAL_TYPE_OPTIONS = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Rodent', 'Fish']
const CITY_OPTIONS = ['Tallinn', 'Tartu', 'Pärnu', 'Viljandi']

const sampleSitters = [
  {
    id: 1,
    name: 'Leelo Lameuss',
    city: 'Tartu',
    rate: '8.50',
    bio: 'Love animals, long experience with dogs and cats',
    types: ['Dog', 'Cat', 'Bird'],
    rating: '4.9',
    badge: 'Available',
  },
  {
    id: 2,
    name: 'Rasmus Sigma',
    city: 'Tallinn',
    rate: '10.00',
    bio: 'Professional pet sitter with 5+ years experience',
    types: ['Dog', 'Cat'],
    rating: '5.0',
    badge: 'Popular',
  },
  {
    id: 3,
    name: 'Sander Skibidi-Saabas',
    city: 'Pärnu',
    rate: '7.00',
    bio: 'I treat every animal with care and love',
    types: ['Cat', 'Rodent'],
    rating: '4.7',
    badge: 'New',
  },
]

function HomePage({ search, setSearch, filterType, setFilterType, sitters, onSitterClick }) {
  const [hourly, setHourly] = useState(15)
  const [conditions, setConditions] = useState({ hasChildren: false, hasPets: false, weekends: false })
  const [selectedCities, setSelectedCities] = useState(['Tallinn', 'Tartu', 'Pärnu'])

  const displaySitters = useMemo(() => {
    if (sitters?.length) {
      return sitters.map((sitter) => ({
        id: sitter.id,
        name: sitter.User?.fullName || sitter.name || 'Sitter',
        city: sitter.User?.city || sitter.city || 'Unknown',
        rate: sitter.hourlyRate || '10.00',
        bio: sitter.bio || 'Caring sitter available for pets.',
        types: sitter.SitterAnimalTypes?.map((item) => item.animalType) || [],
        rating: '4.8',
        badge: 'Available',
      }))
    }
    return sampleSitters
  }, [sitters])

  function toggleCondition(key) {
    setConditions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleCity(city) {
    setSelectedCities((prev) => prev.includes(city) ? prev.filter((item) => item !== city) : [...prev, city])
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <h1>Find a trusted sitter for your pet</h1>
          <p>Connecting pet owners with caring sitters across Estonia</p>
          <div className="hero-search">
            <input
              type="search"
              placeholder="Search by city or sitter name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="button">Find a sitter</button>
          </div>
        </div>
      </section>

      <div className="home-main">
        <aside className="filter-panel">
          <div className="filter-block">
            <div className="filter-title">Animal type</div>
            <div className="chip-row">
              {ANIMAL_TYPE_OPTIONS.map((type) => (
                <button key={type} className={`chip ${filterType === type.toLowerCase() ? 'active' : ''}`} onClick={() => setFilterType(type.toLowerCase())}>
                  {type}
                </button>
              ))}
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
            />
            <div className="range-labels"><span>0€</span><span>Up to 15€</span><span>20€</span></div>
          </div>

          <div className="filter-block">
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
                <button key={city} className={`chip ${selectedCities.includes(city) ? 'active' : ''}`} onClick={() => toggleCity(city)}>
                  {city}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="results-panel">
          <div className="card-grid">
            {displaySitters.map((sitter) => (
              <SitterCard
                key={sitter.id}
                sitter={sitter}
                onClick={onSitterClick}
              />
            ))}
          </div>
          <div className="loading-panel">
            <div className="loading-ring" />
            <span>Loading more sitters...</span>
          </div>
        </main>
      </div>
    </div>
  )
}

export default HomePage
