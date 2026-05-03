import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import Loader from './components/Loader'
import './App.css'

const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'))
const FindSitterPage = lazy(() => import('./pages/FindSitterPage.jsx'))
const SitterProfilePage = lazy(() => import('./pages/SitterProfilePage.jsx'))
const OwnerDashboardPage = lazy(() => import('./pages/OwnerDashboardPage.jsx'))
const SitterDashboardPage = lazy(() => import('./pages/SitterDashboardPage.jsx'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage.jsx'))
const DevToolsPage = lazy(() => import('./pages/DevToolsPage.jsx'))

function ShellSuspense({ children }) {
  return <Suspense fallback={<Loader label="Laadin…" />}>{children}</Suspense>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ShellSuspense>
          <Routes>
            <Route path="/" element={<Navigate to="/find" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/find" element={<FindSitterPage />} />
            <Route path="/sitter/:id" element={<SitterProfilePage />} />
            <Route path="/dashboard/owner" element={<OwnerDashboardPage />} />
            <Route path="/dashboard/sitter" element={<SitterDashboardPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/dev" element={<DevToolsPage />} />
            <Route path="*" element={<Navigate to="/find" replace />} />
          </Routes>
        </ShellSuspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
