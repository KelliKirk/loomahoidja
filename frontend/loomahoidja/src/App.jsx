import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import Loader from './components/Loader'
import AppHeader from './components/AppHeader'
import { apiJson } from './api'
import './App.css'

const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const SignupPage = lazy(() => import('./pages/SignupPage.jsx'))
const FindSitterPage = lazy(() => import('./pages/FindSitterPage.jsx'))
const SitterProfilePage = lazy(() => import('./pages/SitterProfilePage.jsx'))
const OwnerDashboardPage = lazy(() => import('./pages/OwnerDashboardPage.jsx'))
const SitterDashboardPage = lazy(() => import('./pages/SitterDashboardPage.jsx'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage.jsx'))
const DevToolsPage = lazy(() => import('./pages/DevToolsPage.jsx'))

function ShellSuspense({ children }) {
  return <Suspense fallback={<Loader label="Laadin…" />}>{children}</Suspense>
}

function MainLayout() {
  return (
    <>
      <AppHeader />
      <main className="app-main">
        <Outlet />
      </main>
    </>
  )
}

function AuthLayout() {
  return (
    <>
      <AppHeader />
      <Outlet />
    </>
  )
}

function HomeRoute() {
  const { apiBaseUrl } = useAuth()
  const [sitters, setSitters] = useState([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await apiJson({ baseUrl: apiBaseUrl, path: '/sitters' })
        const list = Array.isArray(data) ? data : data?.sitters || []
        if (!cancelled) setSitters(list)
      } catch {
        if (!cancelled) setSitters([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [apiBaseUrl])

  return (
    <HomePage
      search={search}
      setSearch={setSearch}
      filterType={filterType}
      setFilterType={setFilterType}
      sitters={sitters}
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
              <Route path="/find" element={<FindSitterPage />} />
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
