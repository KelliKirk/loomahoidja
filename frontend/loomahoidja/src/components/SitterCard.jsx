import { Link } from 'react-router-dom'

const BADGES = ['Available', 'Popular', 'New']

function initialsFromName(name) {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/[\s-]+/).filter(Boolean)
  if (parts.length >= 3) {
    return parts
      .slice(0, 3)
      .map((p) => p[0])
      .join('')
      .toUpperCase()
  }
  if (parts.length === 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export default function SitterCard({ sitter, onSitterClick, cardVariant = 'teal' }) {
  const id = sitter.id
  const name = sitter.name || sitter.User?.fullName || 'Sitter'
  const city = sitter.city || sitter.User?.city || 'Unknown location'
  const rate = sitter.rate ?? sitter.hourlyRate ?? '10.00'
  const types = (() => {
    if (sitter.types?.length) return sitter.types
    if (sitter.animalTypes?.length) {
      return sitter.animalTypes.map((t) =>
        String(t).charAt(0).toUpperCase() + String(t).slice(1).toLowerCase(),
      )
    }
    return (
      sitter.SitterAnimalTypes?.map((item) =>
        String(item.animalType || item).replace(/^\w/, (c) => c.toUpperCase()),
      ) || []
    )
  })()
  const rating = sitter.rating ?? '4.8'
  const badge = sitter.badge || BADGES[Number(id) % 3]
  const photo = sitter.photoUrl || null

  const topClass = photo ? 'sitter-card-top sitter-card-top--photo' : `sitter-card-top sitter-card-top--${cardVariant}`

  function goProfile(e) {
    e.stopPropagation()
    if (onSitterClick) onSitterClick(sitter)
  }

  return (
    <article className="sitter-card sitter-card--hifi">
      <div className={topClass}>
        {photo ? <img className="sitter-card-top-photo" src={photo} alt="" loading="lazy" /> : null}
        {badge ? (
          <span className={`sitter-card-badge sitter-card-badge--float ${String(badge).toLowerCase()}`}>
            {badge}
          </span>
        ) : null}
        {!photo ? (
          <div className="sitter-card-initials-ring">
            <span>{initialsFromName(name)}</span>
          </div>
        ) : null}
      </div>

      <div className="sitter-card-body sitter-card-body--hifi">
        <div className="sitter-card-title">
          <h3>{name}</h3>
          <span className="sitter-rate">{Number(rate).toFixed(2)}€/h</span>
        </div>
        <p className="sitter-card-location">
          <span className="sitter-pin" aria-hidden="true">
            📍
          </span>
          {city}
        </p>
        <p className="sitter-bio">
          {sitter.bio || 'Caring pet sitter available for daily walks, home visits, and overnight stays.'}
        </p>
        <div className="tag-row">
          {types.map((type) => (
            <span className="pill pill--hifi" key={`${id}-${type}`}>
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="card-foot card-foot--hifi">
        <span className="sitter-card-rating">⭐ {rating}</span>
        {onSitterClick ? (
          <button type="button" className="sitter-card-cta" onClick={goProfile}>
            View profile
          </button>
        ) : (
          <Link to={`/sitter/${id}`} className="sitter-card-cta linkAsButton">
            View profile
          </Link>
        )}
      </div>
    </article>
  )
}
