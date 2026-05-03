import React from 'react'

function PetCard({ animal }) {
  return (
    <article className="animal-card">
      <div className="animal-avatar">{animal.name?.slice(0, 2).toUpperCase()}</div>
      <div>
        <h4>{animal.name}</h4>
        <p>{animal.animalType || 'Pet'}</p>
      </div>
      <span>{animal.age ? `${animal.age}y` : 'Unknown age'}</span>
    </article>
  )
}

export default PetCard
