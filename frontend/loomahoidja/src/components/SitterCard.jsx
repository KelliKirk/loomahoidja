import { Link } from 'react-router-dom'

export default function SitterCard({ sitter, onClick }) {
  const id = sitter.id
  const name = sitter.name || sitter.User?.fullName || 'Sitter'
  const city = sitter.city || sitter.User?.city || 'Unknown location'
  const rate = sitter.rate ?? sitter.hourlyRate ?? '10.00'
  const types = sitter.types || sitter.animalTypes || sitter.SitterAnimalTypes?.map((item) => item.animalType) || []
  const rating = sitter.rating || '4.8'
  const badge = sitter.badge

  const cardInner = (
    <>
      <div className="sitter-card-header">
        <div className="sitter-card-avatar">{name.slice(0, 2).toUpperCase()}</div>
        {badge ? <span className={`sitter-card-badge ${String(badge).toLowerCase()}`}>{badge}</span> : null}
      </div>
      <div className="sitter-card-body">
        <div className="sitter-card-title">
          <h3>{name}</h3>
          <span className="sitter-rate">{rate}€/h</span>
        </div>
        <p className="muted">{city}</p>
        <p className="sitter-bio">
          {sitter.bio || 'Caring pet sitter available for daily walks, home visits, and overnight stays.'}
        </p>
        <div className="tag-row">
          {types.map((type) => (
            <span className="pill" key={type}>
              {type}
            </span>
          ))}
        </div>
      </div>
      <div className="card-foot">
        <span>⭐ {rating}</span>
        {onClick ? (
          <button type="button">View profile</button>
        ) : (
          <Link to={`/sitter/${id}`}>View profile</Link>
        )}
      </div>
    </>
  )

  if (onClick) {
    return (
      <article
        className="sitter-card"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick(sitter)
          }
        }}
        onClick={() => onClick(sitter)}
      >
        {cardInner}
      </article>
    )
  }

  return <article className="sitter-card">{cardInner}</article>
}
