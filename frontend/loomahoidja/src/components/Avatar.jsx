import { initialsFromFullName } from '../lib/userDisplay'

export default function Avatar({ src, name, size = 48 }) {
  const initials = initialsFromFullName(name)

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
