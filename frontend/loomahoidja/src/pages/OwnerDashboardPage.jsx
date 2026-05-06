import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { apiJson } from '../api'
import DashboardPage from './DashboardPage.jsx'

export default function OwnerDashboardPage() {
  const { user, token, apiBaseUrl, logout } = useAuth()
  const navigate = useNavigate()
  const [animals, setAnimals] = useState([])
  const [sitterCount, setSitterCount] = useState(0)

  const handleNavigate = useCallback(
    (target) => {
      if (target === 'home') {
        navigate('/')
      } else {
        navigate(target)
      }
    },
    [navigate],
  )

  const handleLogout = useCallback(() => {
    logout()
    navigate('/')
  }, [logout, navigate])

  const refreshAnimals = useCallback(async () => {
    if (!token?.trim()) return
    try {
      const data = await apiJson({ baseUrl: apiBaseUrl, path: '/animals', token })
      setAnimals(data?.animals || [])
    } catch {
      setAnimals([])
    }
  }, [apiBaseUrl, token])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await apiJson({ baseUrl: apiBaseUrl, path: '/sitters' })
        const list = Array.isArray(data) ? data : data?.sitters || []
        if (!cancelled) setSitterCount(list.length)
      } catch {
        if (!cancelled) setSitterCount(0)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [apiBaseUrl])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!token?.trim()) return
      try {
        const data = await apiJson({ baseUrl: apiBaseUrl, path: '/animals', token })
        if (!cancelled) setAnimals(data?.animals || [])
      } catch {
        if (!cancelled) setAnimals([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [apiBaseUrl, token])

  if (!user || user.role !== 'owner') {
    return (
      <main className="pageMain narrow">
        <p className="typeBody">Omaniku töölaud on saadaval ainult omaniku rolliga kontole.</p>
      </main>
    )
  }

  return (
    <DashboardPage
      currentUser={user}
      animals={animals}
      onRefresh={refreshAnimals}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      apiBaseUrl={apiBaseUrl}
      token={token}
      availableSitterCount={sitterCount}
    />
  )
}
