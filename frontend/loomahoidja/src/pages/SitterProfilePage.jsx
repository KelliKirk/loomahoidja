import React from 'react'

function SitterProfilePage({ sitter, onBack }) {
  if (!sitter) return null

  const name = sitter.User?.fullName || 'Sitter'
  const city = sitter.User?.city || sitter.city || 'Local area'
  const types = sitter.SitterAnimalTypes?.map((item) => item.animalType) || []

  return (
    <section className="profile-panel">
      <div className="profile-header">
        <button className="back-button" onClick={onBack}>← Back to search</button>
        <div className="profile-info">
          <div className="profile-avatar-large">{name.slice(0, 2).toUpperCase()}</div>
          <div>
            <span className="eyebrow">Sitter profile</span>
            <h2>{name}</h2>
            <p>{city}</p>
          </div>
        </div>
      </div>
      <div className="profile-grid">
        <div className="profile-card">
          <div className="tag-row">
            <span className="pill">€{sitter.hourlyRate || '15'}/h</span>
            {types.map((type) => (
              <span className="pill" key={type}>{type}</span>
            ))}
          </div>
          <p>{sitter.bio || 'Reliable sitter with experience in home visits, overnight stays, and daily dog walks.'}</p>
          <div className="feature-list">
            <div>
              <strong>{sitter.hasAnimals ? 'Has pets' : 'No pets'}</strong>
              <span>{sitter.hasAnimals ? 'Comfortable around pets' : 'Focus on your pet'}</span>
            </div>
            <div>
              <strong>{sitter.hasChildren ? 'Child friendly' : 'No children'}</strong>
              <span>{sitter.hasChildren ? 'Safe home environment' : 'Quiet and focused'}</span>
            </div>
            <div>
              <strong>Rating</strong>
              <span>4.8 / 5.0</span>
            </div>
          </div>
        </div>
        <aside className="profile-booking-card">
          <div className="booking-header">
            <h3>Request booking</h3>
            <span className="badge">Popular</span>
          </div>
          <div className="booking-row">
            <strong>Available dates</strong>
            <span>Apr 12 – Apr 17</span>
          </div>
          <div className="booking-row">
            <strong>Service</strong>
            <span>Home visit or overnight stay</span>
          </div>
          <button>Request booking</button>
        </aside>
      </div>
    </section>
  )
}

export default SitterProfilePage
