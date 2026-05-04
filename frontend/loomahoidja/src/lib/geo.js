const CITY = {
  tallinn: { lat: 59.437, lng: 24.7535 },
  tartu: { lat: 58.378, lng: 26.729 },
  pärnu: { lat: 58.3859, lng: 24.5037 },
  parnu: { lat: 58.3859, lng: 24.5037 },
  viljandi: { lat: 58.3639, lng: 25.59 },
}

export function coordsForCity(cityName) {
  if (!cityName) return { lat: 58.5, lng: 25.5 }
  const key = String(cityName).trim().toLowerCase()
  return CITY[key] || { lat: 58.5, lng: 25.5 }
}

export function osmEmbedUrl(lat, lng, zoom = 12) {
  const delta = 0.12 / zoom
  const minLon = lng - delta * 1.4
  const minLat = lat - delta
  const maxLon = lng + delta * 1.4
  const maxLat = lat + delta
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lng}`
}
