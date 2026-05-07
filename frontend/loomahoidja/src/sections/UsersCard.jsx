import { useState } from 'react'
import { apiJson } from '../api'

export default function UsersCard({ baseUrl, run, onToken, onUser, onAuth }) {
  const [role, setRole] = useState('owner')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [password, setPassword] = useState('Test123!')
  const [testUserId, setTestUserId] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [testRole, setTestRole] = useState('owner')
  const [users, setUsers] = useState([])
  const [busy, setBusy] = useState(false)

  return (
    <section className="card">
      <h2>Kasutajad</h2>
      <p>Registreeri kasutaja (tagastab tokeni) või lae kasutajate nimekiri.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setBusy(true)
          run(async () => {
            const data = await apiJson({
              baseUrl,
              path: '/auth/register',
              method: 'POST',
              body: { role, email, fullName, phone: phone || null, city: city || null, password },
            })
            if (onAuth) onAuth(data?.token || '', data?.user || null)
            else {
              onToken?.(data?.token || '')
              onUser?.(data?.user || null)
            }
            if (data?.user) setUsers((prev) => [data.user, ...prev])
            setEmail('')
            setFullName('')
            setPhone('')
            setCity('')
            return data
          }).finally(() => setBusy(false))
        }}
      >
        <div className="split">
          <div className="field">
            <label>Roll</label>
            <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="owner">owner</option>
              <option value="sitter">sitter</option>
            </select>
          </div>
          <div className="field">
            <label>Parool</label>
            <input className="input mono" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>

        <div className="split">
          <div className="field">
            <label>Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Täisnimi</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
        </div>

        <div className="split">
          <div className="field">
            <label>Telefon</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label>Linn</label>
            <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>

        <div className="actions">
          <button className="btn btnPrimary" type="submit" disabled={busy}>
            Registreeri
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => {
              setBusy(true)
              run(async () => {
                const data = await apiJson({ baseUrl, path: '/users' })
                setUsers(data?.users || [])
                return data
              }).finally(() => setBusy(false))
            }}
            disabled={busy}
          >
            Lae kasutajad
          </button>
        </div>
      </form>

      <div className="pre">
        {users?.length ? JSON.stringify(users.slice(0, 10), null, 2) : '—'}
      </div>

      <div style={{ marginTop: 14 }}>
        <h3 style={{ margin: '0 0 8px' }}>Test-token login (dev)</h3>
        <div className="split">
          <div className="field">
            <label>User ID</label>
            <input className="input mono" value={testUserId} onChange={(e) => setTestUserId(e.target.value)} placeholder="54" />
          </div>
          <div className="field">
            <label>Role</label>
            <select className="select" value={testRole} onChange={(e) => setTestRole(e.target.value)}>
              <option value="owner">owner</option>
              <option value="sitter">sitter</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Email (optional)</label>
          <input className="input" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="darudesandstorm@example.com" />
        </div>
        <div className="actions">
          <button
            className="btn btnPrimary"
            type="button"
            disabled={busy || !String(testUserId).trim()}
            onClick={() => {
              setBusy(true)
              run(async () => {
                const data = await apiJson({
                  baseUrl,
                  path: '/auth/test-token',
                  method: 'POST',
                  body: {
                    userId: Number(testUserId),
                    role: testRole,
                    email: testEmail || undefined,
                  },
                })
                if (onAuth) onAuth(data?.token || '', data?.user || null)
                else {
                  onToken?.(data?.token || '')
                  onUser?.(data?.user || null)
                }
                return data
              }).finally(() => setBusy(false))
            }}
          >
            Use test token
          </button>
        </div>
      </div>
    </section>
  )
}

