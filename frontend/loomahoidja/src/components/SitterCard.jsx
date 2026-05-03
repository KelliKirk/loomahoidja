import React from 'react'

function SitterCard({ sitter, onClick }) {
  const name = sitter.User?.fullName || 'Sitter'
  const city = sitter.User?.city || sitter.city || 'Unknown location'
  const types = sitter.SitterAnimalTypes?.map((item) => item.animalType) || []

  return (
    <article className="sitter-card" onClick={() => onClick(sitter)}>
      <div className="card-top">
        <div className="sitter-avatar">{name.slice(0, 2).toUpperCase()}</div>
        <div>
          <h3>{name}</h3>
          <p className="muted">{city}</p>
        </div>
      </div>
      <p className="sitter-bio">{sitter.bio || 'Caring pet sitter available for daily walks, home visits, and overnight stays.'}</p>
      <div className="tag-row">
        <span className="pill">€{sitter.hourlyRate || '15'}/h</span>
        {types.map((type) => (
          <span className="pill" key={type}>{type}</span>
        ))}
      </div>
      <div className="card-foot">
        <span>⭐ 4.8</span>
        <button type="button">View profile</button>
      </div>
    </article>
  )
}

export default SitterCard
