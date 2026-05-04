import { Suspense, lazy, useCallback, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import Loader from './components/Loader'
import AppHeader from './components/AppHeader'
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
import './App.css'

const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const SignupPage = lazy(() => import('./pages/SignupPage.jsx'))
const SitterProfilePage = lazy(() => import('./pages/SitterProfilePage.jsx'))
const OwnerDashboardPage = lazy(() => import('./pages/OwnerDashboardPage.jsx'))
const SitterDashboardPage = lazy(() => import('./pages/SitterDashboardPage.jsx'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage.jsx'))
const DevToolsPage = lazy(() => import('./pages/DevToolsPage.jsx'))

function ShellSuspense({ children }) {
  return <Suspense fallback={<Loader label="Laadin…" />}>{children}</Suspense>
}

function MainLayout() {
  const { pathname } = useLocation()
  const isSitterFinder = pathname === '/' || pathname === '/find'
  const mainClass = isSitterFinder ? 'app-main app-main--home' : 'app-main'
  return (
    <>
      <AppHeader />
      <main className={mainClass}>
        <Outlet />
      </main>
    </>
  )
}

function AuthLayout() {
  return <Outlet />
}

function apiOriginFromBase(apiBaseUrl) {
  return apiBaseUrl.replace(/\/?api\/?$/, '') || 'http://localhost:3001'
}

function HomeRoute() {
  const { apiBaseUrl } = useAuth()
  const [search, setSearch] = useState('')
  const [rawSitters, setRawSitters] = useState([])
  const [hasFetched, setHasFetched] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const apiOrigin = apiOriginFromBase(apiBaseUrl)

  const applySearch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiJson({ baseUrl: apiBaseUrl, path: '/sitters' })
      const list = Array.isArray(data) ? data : data?.sitters || []
      setRawSitters(list)
      setHasFetched(true)
    } catch {
      setRawSitters([])
      setHasFetched(true)
    } finally {
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
    }
  }, [apiBaseUrl])

  return (
    <HomePage
      apiOrigin={apiOrigin}
      search={search}
      setSearch={setSearch}
      rawSitters={rawSitters}
      hasFetched={hasFetched}
      loading={loading}
      onApplySearch={applySearch}
      onSitterClick={(s) => navigate(`/sitter/${s.id}`)}
    />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ShellSuspense>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/find" element={<HomeRoute />} />
              <Route path="/sitter/:id" element={<SitterProfilePage />} />
              <Route path="/dashboard/owner" element={<OwnerDashboardPage />} />
              <Route path="/dashboard/sitter" element={<SitterDashboardPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/dev" element={<DevToolsPage />} />
            </Route>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<SignupPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ShellSuspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
