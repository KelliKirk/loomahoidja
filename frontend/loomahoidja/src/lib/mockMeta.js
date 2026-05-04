import { eachDayInRange } from './dateRange'

/** Profile-level unavailable days (sitter vacation) — demo; merge with API later */
export const SITTER_UNAVAILABLE = {
  101: ['2026-05-05', '2026-05-06', '2026-05-07'],
  102: ['2026-05-12', '2026-05-13'],
  103: ['2026-05-20'],
  1: ['2026-05-05', '2026-05-06', '2026-05-07'],
  2: ['2026-05-12', '2026-05-13'],
}

export function unavailableSetForSitter(sitterId) {
  const id = Number(sitterId)
  const raw = SITTER_UNAVAILABLE[id] || []
  return new Set(raw)
}

/** Extra card UI meta when API has no photos/ratings yet */
export const SITTER_UI_META = {
  101: { badge: 'Populaarne', initials: 'LL' },
  102: { badge: 'Uus', initials: 'RS' },
  103: { badge: 'Saadaval', initials: 'SS' },
  1: { badge: 'Populaarne', initials: 'LL' },
  2: { badge: 'Uus', initials: 'RS' },
  3: { badge: 'Saadaval', initials: 'SS' },
}

export function mergeUnavailableIntoSet(sitterId, blockedHoldDays) {
  const u = unavailableSetForSitter(sitterId)
  const out = new Set(u)
  blockedHoldDays.forEach((d) => out.add(d))
  return out
}

export function rangeTouchesUnavailable(startStr, endStr, unavailableSet) {
  for (const d of eachDayInRange(startStr, endStr)) {
    if (unavailableSet.has(d)) return true
  }
  return false
}
