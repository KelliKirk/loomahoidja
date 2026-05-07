import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AuthForm from '../components/AuthForm.jsx'
import logoUrl from '../assets/logo.png?url'

export default function LoginPage() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [err, setErr] = useState('')

  async function handleLogin(payload) {
    setErr('')
    try {
      const u = await login({ email: payload.email, password: payload.password, role: 'owner' })
      if (u?.role === 'sitter') nav('/dashboard/sitter')
      else if (u?.role === 'owner') nav('/dashboard/owner')
      else nav('/')
    } catch (er) {
      setErr(er?.message || 'Login failed')
    }
  }

  return (
    <div className="authHiFi">
      <header className="authHiFiHeader">
        <Link to="/" className="authHiFiBrand">
          <img src={logoUrl} alt="Loomahoidja" className="authHiFiLogo" />
          <span className="authHiFiBrandName">Loomahoidja</span>
        </Link>
      </header>

      <div className="authHiFiSplit">
        <div className="authHiFiCol authHiFiCol--form">
          <div className="authHiFiHeading">
            <h1>Welcome back</h1>
            <p>Log in to your account</p>
          </div>
          {err ? <div className="authHiFiError">{err}</div> : null}
          <AuthForm mode="login" onSubmit={handleLogin} />
          <div className="authHiFiDivider">
            <span>or</span>
          </div>
          <p className="authHiFiMuted">Don&apos;t have an account?</p>
          <button type="button" className="authHiFiSecondaryBtn" onClick={() => nav('/register')}>
            Create account
          </button>
        </div>

        <div className="authHiFiCol authHiFiCol--hero" aria-hidden="true">
          <div className="authHiFiPaws" role="presentation">
            <span>🐾</span>
            <span>🐾</span>
            <span>🐾</span>
            <span>🐾</span>
            <span>🐾</span>
          </div>
          <div className="authHiFiHeroCopy">
            <h2>Your pet deserves the best care</h2>
            <p>Join hundreds of pet owners and sitters who trust Loomahoidja every day.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
