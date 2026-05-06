/** Same rules as the main site header avatar badge */
export function initialsFromFullName(fullName) {
  const name = String(fullName || '').trim()
  if (!name) return '?'
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase() || '?'
  }
  return (parts[0].slice(0, 2) || '?').toUpperCase()
}
