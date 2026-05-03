import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoUrl from '../assets/logo.png'
import { useAuth } from '../auth/AuthContext'
import Button from '../components/Button'
import Field from '../components/Field'

export default function LoginPage() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('owner')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await login({ email, password, role })
      nav('/find')
    } catch (er) {
      setErr(er?.message || 'Sisselogimine ebaõnnestus')
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
          <h1 className="typeDisplay">Tere tulemast tagasi</h1>
          <p className="typeBody textMuted">Logi oma kontole sisse</p>

          <form className="stackForm" onSubmit={onSubmit}>
            <Field label="Roll">
              <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="owner">Omanik</option>
                <option value="sitter">Hoidja</option>
              </select>
            </Field>
            <Field label="E-post">
              <input
                className="input"
                type="email"
                autoComplete="email"
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
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {err ? <div className="formError">{err}</div> : null}
            <Button variant="primary" className="btnWide" disabled={busy} type="submit">
              Logi sisse
            </Button>
          </form>

          <p className="typeBodySmall textMuted">
            Pole kontot?{' '}
            <Link to="/register" className="textLink">
              Loo konto
            </Link>
          </p>
        </section>

        <section className="splitRight">
          <h2 className="typeH2">Sinu lemmik väärib parimat hoolt</h2>
          <p className="typeBody">
            Ühine sadade omanike ja hoidjatega, kes usaldavad Loomahoidjat igapäevaselt.
          </p>
        </section>
      </div>
    </div>
  )
}
