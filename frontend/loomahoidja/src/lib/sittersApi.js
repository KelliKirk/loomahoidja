import { apiJson } from '../api'

export function assetOriginFromApiBase(apiBaseUrl) {
  return String(apiBaseUrl || '').replace(/\/?api\/?$/i, '')
}

export function normalizeSitter(row, assetOrigin) {
  const user = row.User || row.user || {}
  const typesRaw = row.SitterAnimalTypes || row.sitterAnimalTypes || []
  const types = typesRaw.map((t) => t.animalType || t.animal_type).filter(Boolean)
  const photo = row.photo ? `${assetOrigin}/uploads/profiles/${row.photo}` : null
  return {
    id: row.id,
    userId: row.userId,
    name: user.fullName || 'Hoidja',
    city: row.city || user.city || '',
    hourlyRate: Number(row.hourlyRate),
    bio: row.bio || '',
    animalTypes: types,
    photo,
    hasChildren: Boolean(row.hasChildren),
    hasAnimals: Boolean(row.hasAnimals),
    weekendsOk: row.weekendsOk !== false,
    rating: row.rating ?? 4.8,
    reviewCount: row.reviewCount ?? 12,
  }
}

export async function fetchSitters(apiBaseUrl) {
  const rows = await apiJson({ baseUrl: apiBaseUrl, path: '/sitters' })
  const origin = assetOriginFromApiBase(apiBaseUrl)
  if (!Array.isArray(rows)) return []
  return rows.map((r) => normalizeSitter(r, origin))
}

export async function fetchSitter(apiBaseUrl, id) {
  const row = await apiJson({ baseUrl: apiBaseUrl, path: `/sitters/${id}` })
  const origin = assetOriginFromApiBase(apiBaseUrl)
  return normalizeSitter(row, origin)
}
