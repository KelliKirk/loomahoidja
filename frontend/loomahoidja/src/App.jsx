import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { apiJson } from './api'
import AppHeader from './components/AppHeader'
import Loader from './components/Loader'
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
  return <Suspense fallback={<Loader label="Loading…" />}>{children}</Suspense>
}

function MainLayout() {
  const { pathname } = useLocation()
  const isSitterFinder = pathname === '/' || pathname === '/find'
  const isPublicProfile = pathname.startsWith('/sitter/')
  const isDashboard = pathname === '/dashboard/owner' || pathname === '/dashboard/sitter'
  const mainClass = isDashboard
    ? 'app-main dashboard-main'
    : isSitterFinder
      ? 'app-main app-main--home'
      : isPublicProfile
        ? 'app-main app-main--profile'
        : 'app-main'
  return (
    <>
      {isDashboard ? null : <AppHeader />}
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem('loom_sitters_cache_v1')
      if (!raw) return
      const cached = JSON.parse(raw)
      if (Array.isArray(cached) && cached.length) {
        setRawSitters(cached)
        setHasFetched(true)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const applySearch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiJson({ baseUrl: apiBaseUrl, path: '/sitters' })
      const list = Array.isArray(data) ? data : data?.sitters || []
      setRawSitters(list)
      setHasFetched(true)
      try {
        localStorage.setItem('loom_sitters_cache_v1', JSON.stringify(list))
      } catch {
        /* ignore */
      }
    } catch {
      setRawSitters([])
      setHasFetched(true)
    } finally {
      setLoading(false)
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