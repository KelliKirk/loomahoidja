import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { apiJson } from '../api'
import DashboardPage from './DashboardPage.jsx'

export default function OwnerDashboardPage() {
  const { user, token, apiBaseUrl } = useAuth()
  const [animals, setAnimals] = useState([])
  const [sitterCount, setSitterCount] = useState(0)

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
    refreshAnimals()
  }, [refreshAnimals])

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
      availableSitterCount={sitterCount}
    />
  )
}
