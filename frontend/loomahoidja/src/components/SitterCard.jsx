import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import { SITTER_UI_META } from '../lib/mockMeta'

export default function SitterCard({ sitter }) {
  const meta = SITTER_UI_META[sitter.id] || { badge: 'Saadaval', initials: sitter.name?.slice(0, 2) }
  return (
    <article className="sitterCard">
      <div className="sitterCardTop">
        <span className="sitterBadge">{meta.badge}</span>
        <Avatar src={sitter.photo} name={sitter.name} size={64} />
      </div>
      <div className="sitterCardBody">
        <div className="sitterCardTitleRow">
          <h3 className="sitterCardName">{sitter.name}</h3>
          <strong className="sitterCardRate">{Number(sitter.hourlyRate).toFixed(2)} €/h</strong>
        </div>
        <p className="sitterCardCity">{sitter.city || '—'}</p>
        <p className="sitterCardBio">{sitter.bio || '—'}</p>
        <div className="tagRow">
          {(sitter.animalTypes || []).slice(0, 4).map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
        <div className="sitterCardFooter">
          <span className="rating">★ {Number(sitter.rating).toFixed(1)}</span>
          <Link to={`/sitter/${sitter.id}`} className="btnBase btnOutline btnSm linkAsButton">
            Vaata profiili
          </Link>
        </div>
      </div>
    </article>
  )
}
