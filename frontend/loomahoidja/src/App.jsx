import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { apiJson } from './api'
import AppHeader from './components/AppHeader.jsx'
import AppFooter from './components/AppFooter.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import SitterProfilePage from './pages/SitterProfilePage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
const ANIMAL_TYPE_OPTIONS = ['all', 'dog', 'cat', 'bird', 'rodents', 'other']

function App() {
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem('apiBaseUrl') || DEFAULT_BASE_URL)
  const [token, setToken] = useState(() => localStorage.getItem('apiToken') || '')
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('apiCurrentUser')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [page, setPage] = useState('home')
  const [sitters, setSitters] = useState([])
  const [selectedSitter, setSelectedSitter] = useState(null)
  const [animals, setAnimals] = useState([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const authAvailable = Boolean(token && token.trim())

  useEffect(() => {
    localStorage.setItem('apiBaseUrl', baseUrl)
  }, [baseUrl])

  useEffect(() => {
    localStorage.setItem('apiToken', token)
  }, [token])

  useEffect(() => {
    localStorage.setItem('apiCurrentUser', JSON.stringify(currentUser || {}))
    if (currentUser?.id) {
      setPage(currentUser.role === 'owner' ? 'dashboard' : 'home')
    }
  }, [currentUser])

  const filteredSitters = useMemo(() => {
    return sitters
      .filter((sitter) => {
        if (filterType !== 'all') {
          const types = sitter.SitterAnimalTypes?.map((item) => item.animalType.toLowerCase()) || []
          if (!types.includes(filterType)) return false
        }

        if (!search.trim()) return true
        const lower = search.toLowerCase()
        return [sitter.User?.fullName, sitter.city, sitter.bio, sitter.hourlyRate]
          .filter(Boolean)
          .some((value) => value.toString().toLowerCase().includes(lower))
      })
      .sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0))
  }, [sitters, filterType, search])

  async function run(fn) {
    setError('')
    setStatus('')
    setLoading(true)
    try {
      const data = await fn()
      setLoading(false)
      return data
    } catch (e) {
      setError(e?.message || String(e))
      setLoading(false)
      throw e
    }
  }

  async function fetchSitters() {
    return run(async () => {
      const data = await apiJson({ baseUrl, path: '/sitters' })
      setSitters(Array.isArray(data) ? data : data?.sitters || [])
      return data
    })
  }

  async function fetchAnimals() {
    if (!authAvailable) return
    return run(async () => {
      const data = await apiJson({ baseUrl, path: '/animals', token })
      setAnimals(data?.animals || [])
      return data
    })
  }

  async function verifyUser() {
    return run(async () => {
      const me = await apiJson({ baseUrl, path: '/auth/me', token })
      setCurrentUser(me)
      return me
    })
  }

  async function handleLogin(values) {
    return run(async () => {
      const data = await apiJson({ baseUrl, path: '/auth/login', method: 'POST', body: values })
      if (data?.token && data?.user) {
        setToken(data.token)
        setCurrentUser(data.user)
        setPage(data.user.role === 'owner' ? 'dashboard' : 'home')
        setStatus(`Welcome back, ${data.user.fullName}`)
      }
      return data
    })
  }

  async function handleRegister(values) {
    return run(async () => {
      const data = await apiJson({ baseUrl, path: '/auth/register', method: 'POST', body: values })
      if (data?.token && data?.user) {
        setToken(data.token)
        setCurrentUser(data.user)
        setPage(data.user.role === 'owner' ? 'dashboard' : 'home')
        setStatus(`Account created for ${data.user.fullName}`)
      }
      return data
    })
  }

  function handleLogout() {
    setToken('')
    setCurrentUser(null)
    setPage('home')
    setAnimals([])
    setStatus('You have been logged out.')
  }

  function openSitterProfile(sitter) {
    setSelectedSitter(sitter)
    setPage('sitter')
  }

  useEffect(() => {
    if (!sitters.length) {
      fetchSitters()
    }
    // Keep this as a mount-time bootstrap; fetching on every helper identity change would loop loading state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (token && !currentUser?.id) {
      verifyUser()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    if (currentUser?.role === 'owner' && authAvailable) {
      fetchAnimals()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, authAvailable])

  const isDashboardPage = page === 'dashboard' && currentUser?.role === 'owner'

  return (
    <div className="app-shell">
      {!isDashboardPage ? (
        <AppHeader
          currentUser={currentUser}
          page={page}
          onSetPage={setPage}
          onLogout={handleLogout}
        />
      ) : null}

      <main className={`app-main ${isDashboardPage ? 'dashboard-main' : ''}`}>
        {page === 'home' && (
          <HomePage
            search={search}
            setSearch={setSearch}
            filterType={filterType}
            setFilterType={setFilterType}
            sitters={filteredSitters}
            onSitterClick={openSitterProfile}
            goToLogin={() => setPage('login')}
            goToSignup={() => setPage('signup')}
          />
        )}

        {page === 'login' && <LoginPage onLogin={handleLogin} onSignup={() => setPage('signup')} />}

        {page === 'signup' && <SignupPage onRegister={handleRegister} />}

        {page === 'sitter' && selectedSitter && (
          <SitterProfilePage sitter={selectedSitter} onBack={() => setPage('home')} />
        )}

        {page === 'dashboard' && currentUser?.role === 'owner' && (
          <DashboardPage
            currentUser={currentUser}
            animals={animals}
            onRefresh={fetchAnimals}
            onNavigate={setPage}
            onLogout={handleLogout}
          />
        )}
      </main>

      {page !== 'home' && page !== 'login' && page !== 'signup' && !isDashboardPage ? (
        <AppFooter
          baseUrl={baseUrl}
          onBaseUrlChange={setBaseUrl}
          currentUser={currentUser}
          status={status}
        />
      ) : null}

      {error ? <div className="error-banner">{error}</div> : null}
      {loading ? <div className="loading-banner">Loading…</div> : null}
    </div>
  )
}

export default App
