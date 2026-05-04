import React from 'react'

function SitterCard({ sitter, onClick }) {
  const name = sitter.name || sitter.User?.fullName || 'Sitter'
  const city = sitter.city || sitter.User?.city || 'Unknown location'
  const rate = sitter.rate || sitter.hourlyRate || '10.00'
  const types = sitter.types || sitter.SitterAnimalTypes?.map((item) => item.animalType) || []
  const rating = sitter.rating || '4.8'
  const badge = sitter.badge

  return (
    <article className="sitter-card" onClick={() => onClick(sitter)}>
      <div className="sitter-card-header">
        <div className="sitter-card-avatar">{name.slice(0, 2).toUpperCase()}</div>
        {badge ? <span className={`sitter-card-badge ${badge.toLowerCase()}`}>{badge}</span> : null}
      </div>
      <div className="sitter-card-body">
        <div className="sitter-card-title">
          <h3>{name}</h3>
          <span className="sitter-rate">{rate}€/h</span>
        </div>
        <p className="muted">{city}</p>
        <p className="sitter-bio">{sitter.bio || 'Caring pet sitter available for daily walks, home visits, and overnight stays.'}</p>
        <div className="tag-row">
          {types.map((type) => (
            <span className="pill" key={type}>{type}</span>
          ))}
        </div>
      </div>
      <div className="card-foot">
        <span>⭐ {rating}</span>
        <button type="button">View profile</button>
      </div>
    </article>
  )
}

export default SitterCard
