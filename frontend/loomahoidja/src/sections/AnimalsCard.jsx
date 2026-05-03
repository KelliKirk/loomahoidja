import { useState } from 'react'
import { apiForm, apiJson } from '../api'

export default function AnimalsCard({ baseUrl, token, currentUser, run }) {
  const [animals, setAnimals] = useState([])
  const [busy, setBusy] = useState(false)

  const [name, setName] = useState('')
  const [animalType, setAnimalType] = useState('dog')
  const [age, setAge] = useState('')
  const [goodWithAnimals, setGoodWithAnimals] = useState(false)
  const [goodWithChildren, setGoodWithChildren] = useState(false)
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState(null)

  const canUse = Boolean(token && currentUser?.role === 'owner')

  return (
    <section className="card">
      <h2>Loomad</h2>
      <p>
        Loomade endpointid nõuavad tokenit (owner).
        {!canUse ? ' (praegu puudub)' : ''}
      </p>

      <div className="actions">
        <button
          className="btn"
          onClick={() => {
            setBusy(true)
            run(async () => {
              const data = await apiJson({ baseUrl, path: '/animals', token })
              setAnimals(data?.animals || [])
              return data
            }).finally(() => setBusy(false))
          }}
          disabled={!canUse || busy}
        >
          Lae minu loomad
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!canUse) return
          setBusy(true)
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
            if (data?.animal) setAnimals((prev) => [data.animal, ...prev])
            setName('')
            setAge('')
            setGoodWithAnimals(false)
            setGoodWithChildren(false)
            setNotes('')
            setPhoto(null)
            return data
          }).finally(() => setBusy(false))
        }}
      >
        <div className="field">
          <label>Nimi</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required disabled={!canUse} />
        </div>

        <div className="split">
          <div className="field">
            <label>Liik</label>
            <select className="select" value={animalType} onChange={(e) => setAnimalType(e.target.value)} disabled={!canUse}>
              <option value="dog">dog</option>
              <option value="cat">cat</option>
              <option value="bird">bird</option>
              <option value="rodent">rodent</option>
              <option value="other">other</option>
            </select>
          </div>
          <div className="field">
            <label>Vanus</label>
            <input className="input" value={age} onChange={(e) => setAge(e.target.value)} type="number" min="0" disabled={!canUse} />
          </div>
        </div>

        <div className="split">
          <div className="field">
            <label>Foto</label>
            <input className="input" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} disabled={!canUse} />
          </div>
          <div className="field">
            <label>Märkmed</label>
            <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={!canUse} />
          </div>
        </div>

        <div className="actions">
          <label className="pill">
            <input type="checkbox" checked={goodWithAnimals} onChange={(e) => setGoodWithAnimals(e.target.checked)} disabled={!canUse} />
            goodWithAnimals
          </label>
          <label className="pill">
            <input type="checkbox" checked={goodWithChildren} onChange={(e) => setGoodWithChildren(e.target.checked)} disabled={!canUse} />
            goodWithChildren
          </label>
          <button className="btn btnPrimary" type="submit" disabled={!canUse || busy}>
            Lisa loom
          </button>
        </div>
      </form>

      <div className="pre">
        {busy ? 'Laen…' : animals?.length ? JSON.stringify(animals.slice(0, 10), null, 2) : '—'}
      </div>
    </section>
  )
}

