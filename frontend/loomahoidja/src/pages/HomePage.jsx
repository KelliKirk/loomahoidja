import React from 'react'
import SitterCard from '../components/SitterCard.jsx'

const ANIMAL_TYPE_OPTIONS = ['all', 'dog', 'cat', 'bird', 'rodents', 'other']

function HomePage({ search, setSearch, filterType, setFilterType, sitters, onSitterClick, goToLogin, goToSignup }) {
  return (
    <>
      <section className="hero-panel">
        <div className="hero-info">
          <span className="eyebrow">Find a trusted sitter for your pet</span>
          <h1>Connect with local pet sitters who care like family.</h1>
          <p>Browse detailed sitter profiles, check their availability, and book visits for dogs, cats, birds, and more.</p>
          <div className="hero-actions">
            <button onClick={goToLogin}>Login</button>
            <button className="secondary" onClick={goToSignup}>Create account</button>
          </div>
          <div className="hero-stat-grid">
            <div>
              <strong>42+</strong>
              <span>Active sitters</span>
            </div>
            <div>
              <strong>4.9</strong>
              <span>Average rating</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Verified pet owners</span>
            </div>
          </div>
        </div>
        <div className="hero-preview">
          <div className="hero-box">
            <div className="hero-card-top">
              <div>
                <strong>Search sitters</strong>
                <p>Find local caregivers by city, pet type or rating.</p>
              </div>
              <span className="badge">Best match</span>
            </div>
            <div className="hero-card-row">
              <div className="profile-pill">Luna</div>
              <div className="profile-pill">Kelli</div>
              <div className="profile-pill">Milo</div>
            </div>
            <div className="hero-card-cta">
              <button>Browse sitters</button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-panel">
        <div className="section-header">
          <div>
            <span className="eyebrow">Browse sitters</span>
            <h2>Care that feels personal.</h2>
          </div>
          <div className="filter-row">
            <input
              type="search"
              placeholder="Search by sitter name, city or bio"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              {ANIMAL_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option === 'all' ? 'All pets' : option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="sitter-grid">
          {sitters.length === 0 ? (
            <div className="empty-state">No sitters match your search yet.</div>
          ) : (
            sitters.map((sitter) => (
              <SitterCard key={sitter.id} sitter={sitter} onClick={onSitterClick} />
            ))
          )}
        </div>
      </section>
    </>
  )
}

export default HomePage
