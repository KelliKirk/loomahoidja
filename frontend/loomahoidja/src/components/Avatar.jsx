export default function Avatar({ src, name, size = 48 }) {
  const initials = String(name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  const style = { width: size, height: size, fontSize: Math.round(size * 0.36) }

  if (src) {
    return <img className="avatarImg" src={src} alt="" style={style} />
  }
  return (
    <div className="avatarFallback" style={style} aria-hidden="true">
      {initials || '?'}
    </div>
  )
}
