import { useState } from 'react'
import { apiForm, apiJson } from '../api'

export default function SittersCard({ baseUrl, token, currentUser, run }) {
  const [sitters, setSitters] = useState([])
  const [busy, setBusy] = useState(false)

  const [userId, setUserId] = useState(() => String(currentUser?.id || ''))
  const [hourlyRate, setHourlyRate] = useState('10')
  const [bio, setBio] = useState('')
  const [hasAnimals, setHasAnimals] = useState(false)
  const [hasChildren, setHasChildren] = useState(false)
  const [city, setCity] = useState('')
  const [photo, setPhoto] = useState(null)
  const [animalTypes, setAnimalTypes] = useState(['dog'])

  const options = ['dog', 'cat', 'bird', 'fish', 'rodents', 'other']

  function toggle(type) {
    setAnimalTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  return (
    <section className="card">
      <h2>Hoidjad</h2>
      <p>Sitter profiili upsert + sitterite nimekiri.</p>

      <div className="actions">
        <button
          className="btn"
          onClick={() => {
            setBusy(true)
            run(async () => {
              const data = await apiJson({ baseUrl, path: '/sitters' })
              setSitters(data || [])
              return data
            }).finally(() => setBusy(false))
          }}
          disabled={busy}
        >
          Lae hoidjad
        </button>
      </div>

      {currentUser?.role === 'sitter' ? (
        <form
          key={String(currentUser?.id ?? 'guest')}
          onSubmit={(e) => {
            e.preventDefault()
            setBusy(true)
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

              const data = await apiForm({ baseUrl, path: '/sitters/profile', token, formData: fd })
              return data
            }).finally(() => setBusy(false))
          }}
        >
          <div className="field">
            <label>User id</label>
            <input className="input mono" value={userId} onChange={(e) => setUserId(e.target.value)} required />
          </div>

          <div className="split">
            <div className="field">
              <label>Hourly rate</label>
              <input className="input" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} required />
            </div>
            <div className="field">
              <label>City</label>
              <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Bio</label>
            <textarea className="textarea" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </div>

          <div className="split">
            <div className="field">
              <label>Photo</label>
              <input className="input" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
            </div>
            <div className="field">
              <label>Animal types</label>
              <div className="actions">
                {options.map((t) => (
                  <label key={t} className="pill">
                    <input type="checkbox" checked={animalTypes.includes(t)} onChange={() => toggle(t)} />
                    {t}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="actions">
            <label className="pill">
              <input type="checkbox" checked={hasAnimals} onChange={(e) => setHasAnimals(e.target.checked)} />
              hasAnimals
            </label>
            <label className="pill">
              <input type="checkbox" checked={hasChildren} onChange={(e) => setHasChildren(e.target.checked)} />
              hasChildren
            </label>
            <button className="btn btnPrimary" type="submit" disabled={busy || !token?.trim()}>
              Salvesta profiil
            </button>
          </div>
        </form>
      ) : (
        <div className="pre">Registreeri kasutaja rolliga <span className="mono">sitter</span>, et siin profiili muuta.</div>
      )}

      <div className="pre">
        {busy ? 'Laen…' : sitters?.length ? JSON.stringify(sitters.slice(0, 10), null, 2) : '—'}
      </div>
    </section>
  )
}

