import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { apiJson } from '../api'

const AuthContext = createContext(null)

const LS_TOKEN = 'loom_token'
const LS_USER = 'loom_user'
const LS_PROFILE = 'loom_profile'
const LS_API = 'apiBaseUrl'

function defaultApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_URL
  if (fromEnv != null && String(fromEnv).trim() !== '') {
    return String(fromEnv).replace(/\/$/, '')
  }
  return 'http://localhost:3001/api'
}

export function AuthProvider({ children }) {
  const [apiBaseUrl, setApiBaseUrlState] = useState(
    () => localStorage.getItem(LS_API) || defaultApiBaseUrl(),
  )
  const [token, setTokenState] = useState(() => localStorage.getItem(LS_TOKEN) || '')
  const [user, setUserState] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_USER)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const setApiBaseUrl = useCallback((url) => {
    setApiBaseUrlState(url)
    localStorage.setItem(LS_API, url)
  }, [])

  const setSession = useCallback((nextToken, nextUser) => {
    setTokenState(nextToken || '')
    setUserState(nextUser || null)
    if (nextToken) localStorage.setItem(LS_TOKEN, nextToken)
    else localStorage.removeItem(LS_TOKEN)
    if (nextUser) localStorage.setItem(LS_USER, JSON.stringify(nextUser))
    else localStorage.removeItem(LS_USER)
  }, [])

  const logout = useCallback(() => {
    setSession('', null)
    localStorage.removeItem(LS_PROFILE)
  }, [setSession])

  /**
   * Kelli backend: login/register puuduvad → kasutame test-tokenit arenduses.
   * Kui /auth/login lisandub, proovitakse seda esmalt.
   */
  const login = useCallback(
    async ({ email, password, role }) => {
      try {
        const data = await apiJson({
          baseUrl: apiBaseUrl,
          path: '/auth/login',
          method: 'POST',
          body: { email, password },
        })
        setSession(data.token, data.user)
        return
      } catch {
        const demoId = role === 'sitter' ? 2 : 1
        const data = await apiJson({
          baseUrl: apiBaseUrl,
          path: '/auth/test-token',
          method: 'POST',
          body: { email, role, userId: demoId },
        })
        setSession(data.token, data.user)
      }
    },
    [apiBaseUrl, setSession],
  )

  const register = useCallback(
    async ({ email, password, fullName, role, phone, city }) => {
      try {
        const data = await apiJson({
          baseUrl: apiBaseUrl,
          path: '/auth/register',
          method: 'POST',
          body: { email, password, fullName, role, phone: phone || null, city: city || null },
        })
        setSession(data.token, data.user)
        localStorage.setItem(LS_PROFILE, JSON.stringify({ fullName, email, role }))
        return
      } catch {
        const data = await apiJson({
          baseUrl: apiBaseUrl,
          path: '/auth/test-token',
          method: 'POST',
          body: { email, role, userId: role === 'sitter' ? 2 : 1 },
        })
        setSession(data.token, { ...data.user, fullName })
        localStorage.setItem(LS_PROFILE, JSON.stringify({ fullName, email, role }))
      }
    },
    [apiBaseUrl, setSession],
  )

  const value = useMemo(
    () => ({
      apiBaseUrl,
      setApiBaseUrl,
      token,
      user,
      setSession,
      login,
      register,
      logout,
      isLoggedIn: Boolean(token && token.trim()),
    }),
    [apiBaseUrl, setApiBaseUrl, token, user, setSession, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
