/** @param {string} startStr YYYY-MM-DD */
/** @param {string} endStr YYYY-MM-DD */
export function eachDayInRange(startStr, endStr) {
  const out = []
  const d = new Date(`${startStr}T12:00:00`)
  const end = new Date(`${endStr}T12:00:00`)
  if (Number.isNaN(d.getTime()) || Number.isNaN(end.getTime()) || d > end) return out
  const cur = new Date(d)
  while (cur <= end) {
    out.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

/** ISO date strings YYYY-MM-DD */
export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && bStart <= aEnd
}
