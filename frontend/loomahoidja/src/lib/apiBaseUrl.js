/**
 * Central place for API base URL so production demos work when SPA and API share one domain.
 * - If VITE_API_URL is set at build time, it always wins.
 * - In production without VITE_API_URL, use the current browser origin + /api.
 * - Otherwise fall back to local dev default.
 */
export function resolveApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL
  if (fromEnv != null && String(fromEnv).trim() !== '') {
    return String(fromEnv).replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    return `${window.location.origin.replace(/\/$/, '')}/api`
  }
  return 'http://localhost:3001/api'
}

/**
 * Ignore a saved API URL that points at localhost when the app is opened on a real deployed host
 * (avoids "everything works locally but the demo site still calls localhost").
 */
export function pickInitialApiBaseUrlFromStorage(lsKey, readItem) {
  const stored = readItem(lsKey)
  if (stored == null || String(stored).trim() === '') return null
  const s = String(stored).trim().replace(/\/$/, '')
  if (typeof window === 'undefined') return s
  const host = window.location.hostname
  const isLocalPage =
    host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
  if (!isLocalPage && /localhost|127\.0\.0\.1/i.test(s)) {
    return null
  }
  return s
}
