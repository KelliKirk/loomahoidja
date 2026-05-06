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
  const [mySitterProfile, setMySitterProfile] = useState(null)

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
        if (!cancelled && user?.id) {
          const mine = list.find((s) => Number(s.userId) === Number(user.id))
          setMySitterProfile(mine || null)
        }
      } catch {
        if (!cancelled) {
          setSitterCount(0)
          setMySitterProfile(null)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [apiBaseUrl, user?.id])

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
        <p className="typeBody">The owner dashboard is only available when signed in with an owner account.</p>
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
      mySitterProfile={mySitterProfile}
    />
  )
}
