import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { apiJson } from '../api'
import Field from '../components/Field'
import Button from '../components/Button'

export default function DevToolsPage() {
  const ConnectionCard = useMemo(() => lazy(() => import('../sections/ConnectionCard.jsx')), [])
  const UsersCard = useMemo(() => lazy(() => import('../sections/UsersCard.jsx')), [])
  const AnimalsCard = useMemo(() => lazy(() => import('../sections/AnimalsCard.jsx')), [])
  const SittersCard = useMemo(() => lazy(() => import('../sections/SittersCard.jsx')), [])
  const LastResponseCard = useMemo(() => lazy(() => import('../sections/LastResponseCard.jsx')), [])

  const { apiBaseUrl, setApiBaseUrl, token, setSession, user } = useAuth()
  const [localBase, setLocalBase] = useState(apiBaseUrl)
  const [last, setLast] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => setLocalBase(apiBaseUrl), [apiBaseUrl])

  const authHeadersOk = useMemo(() => Boolean(token && token.trim()), [token])

  async function run(fn) {
    setError('')
    try {
      const data = await fn()
      setLast(data)
      return data
    } catch (e) {
      setError(e?.message || String(e))
      throw e
    }
  }

  return (
    <div className="pageShell devShell">
      <header className="devTop">
        <h1 className="typeH2">API tööriistad</h1>
        <Link to="/find">
          <Button variant="outline" className="btnSm">
            ← Rakendusse
          </Button>
        </Link>
      </header>
      <main className="pageMain">
        <section className="cardSurface blockPad">
          <Field label="API base URL (salvestatakse auth kontekstis)">
            <div className="rowFlex">
              <input
                className="input"
                value={localBase}
                onChange={(e) => setLocalBase(e.target.value)}
              />
              <Button variant="primary" type="button" onClick={() => setApiBaseUrl(localBase)}>
                Salvesta
              </Button>
            </div>
          </Field>
          <p className="typeBodySmall textMuted">
            Praegune sessioon: {user?.email || '—'} ({user?.role || '—'})
          </p>
          <div className="rowFlex">
            <Button
              variant="outline"
              type="button"
              disabled={!authHeadersOk}
              onClick={() =>
                run(async () => {
                  const me = await apiJson({ baseUrl: apiBaseUrl, path: '/auth/me', token })
                  return me
                })
              }
            >
              /auth/me (kui backend toetab)
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={!authHeadersOk}
              onClick={() =>
                run(async () =>
                  apiJson({ baseUrl: apiBaseUrl, path: '/auth/verify-token', token }),
                )
              }
            >
              verify-token
            </Button>
          </div>
        </section>

        <section className="devGrid">
          <Suspense fallback={<CardSkeleton title="Ühendus" />}>
            <ConnectionCard baseUrl={apiBaseUrl} setBaseUrl={setApiBaseUrl} token={token} />
          </Suspense>
          <Suspense fallback={<CardSkeleton title="Kasutajad" />}>
            <UsersCard
              baseUrl={apiBaseUrl}
              run={run}
              onAuth={(t, u) => setSession(t, u)}
            />
          </Suspense>
          <Suspense fallback={<CardSkeleton title="Loomad" />}>
            <AnimalsCard baseUrl={apiBaseUrl} token={token} currentUser={user} run={run} />
          </Suspense>
          <Suspense fallback={<CardSkeleton title="Hoidjad" />}>
            <SittersCard baseUrl={apiBaseUrl} currentUser={user} run={run} />
          </Suspense>
          <Suspense fallback={<CardSkeleton title="Vastus" wide />}>
            <LastResponseCard last={last} error={error} />
          </Suspense>
        </section>
      </main>
    </div>
  )
}

function CardSkeleton({ title, wide = false }) {
  return (
    <section className={`cardSurface blockPad ${wide ? 'devWide' : ''}`}>
      <h2 className="typeH3">{title}</h2>
      <div className="skeletonLine" />
      <div className="skeletonLine short" />
    </section>
  )
}
