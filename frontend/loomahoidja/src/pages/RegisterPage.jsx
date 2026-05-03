import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoUrl from '../assets/logo.png'
import { useAuth } from '../auth/AuthContext'
import Button from '../components/Button'
import Field from '../components/Field'

export default function RegisterPage() {
  const nav = useNavigate()
  const { register } = useAuth()
  const [role, setRole] = useState('owner')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('Test123!')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await register({ email, password, fullName, role })
      nav('/find')
    } catch (er) {
      setErr(er?.message || 'Registreerimine ebaõnnestus')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="splitPage">
      <div className="splitHeader">
        <Link to="/" className="siteBrand">
          <img src={logoUrl} className="brandLogo brandLogo--sm" alt="Loomahoidja" />
          <span className="siteBrandName">Loomahoidja</span>
        </Link>
        <Link to="/login">
          <Button variant="outline" className="btnSm">
            Logi sisse
          </Button>
        </Link>
      </div>

      <div className="splitMain">
        <section className="splitLeft">
          <h1 className="typeDisplay">Loo konto</h1>
          <p className="typeBody textMuted">Vali, kuidas soovid Loomahoidjat kasutada</p>

          <div className="rolePick">
            <button
              type="button"
              className={`roleCard ${role === 'owner' ? 'roleCardOn' : ''}`}
              onClick={() => setRole('owner')}
            >
              <strong>Olen lemmiklooma omanik</strong>
              <span>Otsin usaldusväärset hoidjat</span>
            </button>
            <button
              type="button"
              className={`roleCard ${role === 'sitter' ? 'roleCardOn' : ''}`}
              onClick={() => setRole('sitter')}
            >
              <strong>Olen hoidja</strong>
              <span>Tahun pakkuda hooldusteenust</span>
            </button>
          </div>

          <form className="stackForm" onSubmit={onSubmit}>
            <Field label="Täisnimi">
              <input
                className="input"
                placeholder="Eesnimi Perekonnanimi"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </Field>
            <Field label="E-post">
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Parool">
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            {err ? <div className="formError">{err}</div> : null}
            <Button variant="primary" className="btnWide" disabled={busy} type="submit">
              Jätka
            </Button>
          </form>
        </section>

        <section className="splitRight">
          <h2 className="typeH2">Liitu kogukonnaga</h2>
          <p className="typeBody">Konto loomine võtab alla kaks minutit — alusta kohe.</p>
        </section>
      </div>
    </div>
  )
}
