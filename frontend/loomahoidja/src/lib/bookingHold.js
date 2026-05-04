import { eachDayInRange, rangesOverlap } from './dateRange'

const STORAGE_HOLDS = 'loom_booking_holds_v1'
const STORAGE_BLOCKS = 'loom_booking_blocks_v1'
const CHANNEL = 'loom-booking-v1'
const HOLD_TTL_MS = 5 * 60 * 1000

function now() {
  return Date.now()
}

export const tabSessionId = `${now()}-${Math.random().toString(36).slice(2, 10)}`

let bc
try {
  bc = new BroadcastChannel(CHANNEL)
} catch {
  bc = null
}

export function subscribeBooking(cb) {
  if (!bc) return () => {}
  const fn = (e) => cb(e.data)
  bc.addEventListener('message', fn)
  return () => bc.removeEventListener('message', fn)
}

function publish(msg) {
  bc?.postMessage(msg)
}

function readHolds() {
  try {
    const raw = localStorage.getItem(STORAGE_HOLDS)
    const arr = raw ? JSON.parse(raw) : []
    const t = now()
    return Array.isArray(arr) ? arr.filter((h) => h.expiresAt > t) : []
  } catch {
    return []
  }
}

function writeHolds(arr) {
  localStorage.setItem(STORAGE_HOLDS, JSON.stringify(arr))
}

function readBlocks() {
  try {
    const raw = localStorage.getItem(STORAGE_BLOCKS)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function writeBlocks(arr) {
  localStorage.setItem(STORAGE_BLOCKS, JSON.stringify(arr))
}

function holdOverlapsOther(sitterId, start, end, mySessionId) {
  const holds = readHolds()
  return holds.some(
    (h) =>
      h.sitterId === sitterId &&
      h.sessionId !== mySessionId &&
      rangesOverlap(start, end, h.start, h.end),
  )
}

/**
 * Reserve a date range while the user completes the booking form.
 * Other tabs/users see these days as locked until TTL expires.
 */
export function acquireHold(sitterId, startStr, endStr, sessionId) {
  if (!startStr || !endStr || startStr > endStr) {
    return { ok: false, reason: 'invalid' }
  }
  const holds = readHolds().filter((h) => h.expiresAt > now())
  if (holdOverlapsOther(sitterId, startStr, endStr, sessionId)) {
    return { ok: false, reason: 'locked' }
  }
  const next = holds.filter((h) => !(h.sitterId === sitterId && h.sessionId === sessionId))
  next.push({
    sitterId,
    start: startStr,
    end: endStr,
    sessionId,
    expiresAt: now() + HOLD_TTL_MS,
  })
  writeHolds(next)
  publish({ type: 'holds-changed', sitterId })
  return { ok: true }
}

export function releaseHold(sitterId, sessionId) {
  const next = readHolds().filter((h) => !(h.sitterId === sitterId && h.sessionId === sessionId))
  writeHolds(next)
  publish({ type: 'holds-changed', sitterId })
}

/** Demo: confirmed booking blocks dates for everyone */
export function addConfirmedBlock(sitterId, startStr, endStr) {
  const blocks = readBlocks()
  blocks.push({ sitterId, start: startStr, end: endStr, at: now() })
  writeBlocks(blocks)
  publish({ type: 'blocks-changed', sitterId })
}

export function getBlockedDateSet(sitterId, mySessionId) {
  const days = new Set()
  for (const h of readHolds()) {
    if (h.sitterId !== sitterId) continue
    if (h.sessionId === mySessionId) continue
    for (const d of eachDayInRange(h.start, h.end)) days.add(d)
  }
  for (const b of readBlocks()) {
    if (b.sitterId !== sitterId) continue
    for (const d of eachDayInRange(b.start, b.end)) days.add(d)
  }
  return days
}
