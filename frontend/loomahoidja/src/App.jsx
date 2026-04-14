import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { apiForm, apiJson } from './api'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

function App() {
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem('apiBaseUrl') || 'http://localhost:3001/api')
  const [token, setToken] = useState(() => localStorage.getItem('apiToken') || '')
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('apiCurrentUser')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [revealToken, setRevealToken] = useState(false)
  const [users, setUsers] = useState([])
  const [animals, setAnimals] = useState([])
  const [sitters, setSitters] = useState([])
  const [last, setLast] = useState(null)
  const [error, setError] = useState('')

  const authHeadersOk = useMemo(() => Boolean(token && token.trim()), [token])

  useEffect(() => {
    localStorage.setItem('apiBaseUrl', baseUrl)
  }, [baseUrl])

  useEffect(() => {
    localStorage.setItem('apiToken', token)
  }, [token])

  useEffect(() => {
    localStorage.setItem('apiCurrentUser', JSON.stringify(currentUser))
  }, [currentUser])

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
    <>
      <Navbar />
      <div className="wrap">
        <h1>Backend Test UI</h1>

        <section className="card">
          <h2>Connection</h2>
          <div className="row">
            <label>API base URL</label>
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="http://localhost:3001/api" />
          </div>
          <div className="row">
            <label>Session</label>
            <div className="muted">
              {token ? (
                <>
                  Token is set{currentUser?.id ? ` for userId=${currentUser.id}` : ''}{currentUser?.role ? ` (${currentUser.role})` : ''}.
                </>
              ) : (
                <>No token yet. Create a user to generate one automatically.</>
              )}
            </div>
            {token ? (
              <div className="row">
                <label>
                  <input type="checkbox" checked={revealToken} onChange={(e) => setRevealToken(e.target.checked)} /> reveal token
                </label>
                {revealToken ? (
                  <textarea value={token} readOnly rows={3} />
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="row actions">
            <button onClick={() => run(async () => {
              const me = await apiJson({ baseUrl, path: '/auth/me', token })
              if (me?.id) setCurrentUser({ id: me.id, email: me.email, role: me.role })
              return me
            })} disabled={!authHeadersOk}>
              Verify token
            </button>
            <button onClick={() => {
              setToken('')
              setCurrentUser(null)
              setRevealToken(false)
              setAnimals([])
            }}>Clear session</button>
          </div>
        </section>

        <section className="card">
          <h2>Register user (auto token)</h2>
          <UserCreate
            onCreated={(u) => {
              setUsers((prev) => [u, ...prev])
              setCurrentUser(u)
            }}
            run={run}
            baseUrl={baseUrl}
            onToken={(t) => {
              setToken(t)
              setRevealToken(false)
            }}
          />
          <div className="row actions">
            <button onClick={() => run(async () => {
              const data = await apiJson({ baseUrl, path: '/users' })
              setUsers(data.users || [])
              return data
            })}>
              Load users
            </button>
          </div>
          <SimpleList title="Users" items={users} itemKey={(u) => u.id} />
        </section>

        {currentUser?.role === 'owner' ? (
          <section className="card">
            <h2>Owner: animals</h2>
            <div className="row actions">
              <button onClick={() => run(async () => {
                const data = await apiJson({ baseUrl, path: '/animals', token })
                setAnimals(data.animals || [])
                return data
              })} disabled={!authHeadersOk}>
                Load my animals
              </button>
            </div>
            <AnimalCreate baseUrl={baseUrl} token={token} run={run} onCreated={(a) => setAnimals((prev) => [a, ...prev])} />
            <SimpleList title="Animals" items={animals} itemKey={(a) => a.id} />
          </section>
        ) : null}

        <section className="card">
          <h2>Sitters</h2>
          {currentUser?.role === 'sitter' ? (
            <SitterProfileUpsert
              baseUrl={baseUrl}
              run={run}
              initialUserId={String(currentUser?.id || '')}
              onSaved={() => run(async () => {
                const data = await apiJson({ baseUrl, path: '/sitters' })
                setSitters(data || [])
                return data
              })}
            />
          ) : (
            <div className="muted">Register as sitter to create/update a sitter profile.</div>
          )}
          <div className="row actions">
            <button onClick={() => run(async () => {
              const data = await apiJson({ baseUrl, path: '/sitters' })
              setSitters(data || [])
              return data
            })}>
              Load sitters
            </button>
          </div>
          <SimpleList title="Sitters" items={sitters} itemKey={(s) => s.id} />
        </section>

        <section className="card">
          <h2>Last response</h2>
          {error ? <pre className="error">{error}</pre> : null}
          <pre>{JSON.stringify(last, null, 2)}</pre>
        </section>
      </div>
      <Footer />
    </>
  )
}

function SimpleList({ title, items, itemKey }) {
  return (
    <div className="list">
      <h3>{title}</h3>
      {items?.length ? (
        <ul>
          {items.map((it) => (
            <li key={itemKey(it)}>
              <pre>{JSON.stringify(it, null, 2)}</pre>
            </li>
          ))}
        </ul>
      ) : (
        <div className="muted">No items</div>
      )}
    </div>
  )
}

function UserCreate({ baseUrl, run, onCreated, onToken }) {
  const [role, setRole] = useState('owner')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      run(async () => {
        const data = await apiJson({
          baseUrl,
          path: '/users',
          method: 'POST',
          body: { role, email, fullName, phone: phone || null, city: city || null },
        })
        if (data?.user) onCreated(data.user)
        onToken?.(data?.token || '')

        setEmail('')
        setFullName('')
        setPhone('')
        setCity('')
        return { user: data?.user, tokenGenerated: Boolean(data?.token) }
      })
    }}>
      <div className="grid">
        <div className="row">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="owner">owner</option>
            <option value="sitter">sitter</option>
          </select>
        </div>
        <div className="row">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="row">
          <label>Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="row">
          <label>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="row">
          <label>City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="row actions">
          <button type="submit">Create user</button>
        </div>
      </div>
    </form>
  )
}

function AnimalCreate({ baseUrl, token, run, onCreated }) {
  const [name, setName] = useState('')
  const [animalType, setAnimalType] = useState('dog')
  const [age, setAge] = useState('')
  const [goodWithAnimals, setGoodWithAnimals] = useState(false)
  const [goodWithChildren, setGoodWithChildren] = useState(false)
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState(null)

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      run(async () => {
        const fd = new FormData()
        fd.append('name', name)
        fd.append('animalType', animalType)
        if (age) fd.append('age', age)
        fd.append('goodWithAnimals', String(goodWithAnimals))
        fd.append('goodWithChildren', String(goodWithChildren))
        if (notes) fd.append('notes', notes)
        if (photo) fd.append('photo', photo)

        const data = await apiForm({ baseUrl, path: '/animals', token, formData: fd })
        if (data?.animal) onCreated(data.animal)
        setName('')
        setAge('')
        setGoodWithAnimals(false)
        setGoodWithChildren(false)
        setNotes('')
        setPhoto(null)
        return data
      })
    }}>
      <h3>Create animal (needs token)</h3>
      <div className="grid">
        <div className="row">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="row">
          <label>Type</label>
          <select value={animalType} onChange={(e) => setAnimalType(e.target.value)}>
            <option value="dog">dog</option>
            <option value="cat">cat</option>
            <option value="bird">bird</option>
            <option value="rodent">rodent</option>
            <option value="other">other</option>
          </select>
        </div>
        <div className="row">
          <label>Age</label>
          <input value={age} onChange={(e) => setAge(e.target.value)} type="number" min="0" />
        </div>
        <div className="row">
          <label>Photo</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
        </div>
        <div className="row checkbox">
          <label>
            <input type="checkbox" checked={goodWithAnimals} onChange={(e) => setGoodWithAnimals(e.target.checked)} />
            goodWithAnimals
          </label>
        </div>
        <div className="row checkbox">
          <label>
            <input type="checkbox" checked={goodWithChildren} onChange={(e) => setGoodWithChildren(e.target.checked)} />
            goodWithChildren
          </label>
        </div>
        <div className="row">
          <label>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>
        <div className="row actions">
          <button type="submit" disabled={!token}>Create animal</button>
        </div>
      </div>
    </form>
  )
}

function SitterProfileUpsert({ baseUrl, run, onSaved, initialUserId = '' }) {
  const [userId, setUserId] = useState(initialUserId)
  const [hourlyRate, setHourlyRate] = useState('10')
  const [bio, setBio] = useState('')
  const [hasAnimals, setHasAnimals] = useState(false)
  const [hasChildren, setHasChildren] = useState(false)
  const [city, setCity] = useState('')
  const [photo, setPhoto] = useState(null)
  const [animalTypes, setAnimalTypes] = useState(['dog'])

  useEffect(() => {
    setUserId(initialUserId || '')
  }, [initialUserId])

  const options = ['dog', 'cat', 'bird', 'fish', 'rodents', 'other']

  function toggle(type) {
    setAnimalTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      run(async () => {
        const fd = new FormData()
        fd.append('userId', userId)
        fd.append('hourlyRate', hourlyRate)
        fd.append('bio', bio)
        fd.append('hasAnimals', String(hasAnimals ? 1 : 0))
        fd.append('hasChildren', String(hasChildren ? 1 : 0))
        fd.append('city', city)
        animalTypes.forEach((t) => fd.append('animalTypes', t))
        if (photo) fd.append('photo', photo)

        const data = await apiForm({ baseUrl, path: '/sitters/profile', formData: fd })
        onSaved?.(data)
        return data
      })
    }}>
      <h3>Upsert sitter profile</h3>
      <div className="grid">
        <div className="row">
          <label>User id (must be sitter)</label>
          <input value={userId} onChange={(e) => setUserId(e.target.value)} required />
        </div>
        <div className="row">
          <label>Hourly rate</label>
          <input value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} required />
        </div>
        <div className="row">
          <label>City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="row">
          <label>Photo</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
        </div>
        <div className="row checkbox">
          <label>
            <input type="checkbox" checked={hasAnimals} onChange={(e) => setHasAnimals(e.target.checked)} />
            hasAnimals
          </label>
        </div>
        <div className="row checkbox">
          <label>
            <input type="checkbox" checked={hasChildren} onChange={(e) => setHasChildren(e.target.checked)} />
            hasChildren
          </label>
        </div>
        <div className="row">
          <label>Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
        </div>
        <div className="row">
          <label>Animal types</label>
          <div className="inline">
            {options.map((t) => (
              <label key={t} className="pill">
                <input type="checkbox" checked={animalTypes.includes(t)} onChange={() => toggle(t)} />
                {t}
              </label>
            ))}
          </div>
        </div>
        <div className="row actions">
          <button type="submit">Save profile</button>
        </div>
      </div>
    </form>
  )
}

export default App
