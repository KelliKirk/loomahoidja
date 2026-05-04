import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AuthForm from '../components/AuthForm.jsx'

export default function LoginPage() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [err, setErr] = useState('')

  async function handleLogin(payload) {
    setErr('')
    try {
      await login({ email: payload.email, password: payload.password, role: 'owner' })
      nav('/')
    } catch (er) {
      setErr(er?.message || 'Login failed')
    }
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <div className="login-left">
          <div className="login-heading">
            <h1>Welcome back</h1>
            <p>Log in to your account</p>
          </div>
          {err ? <div className="formError">{err}</div> : null}
          <AuthForm mode="login" onSubmit={handleLogin} />
          <div className="login-footer">
            <span>or</span>
            <p>Don&apos;t have an account?</p>
            <button type="button" className="secondary-button" onClick={() => nav('/register')}>
              Create account
            </button>
          </div>
          <p className="typeBodySmall textMuted" style={{ marginTop: '12px' }}>
            <Link to="/find" className="textLink">
              Eesti keeles (vana otsing)
            </Link>
          </p>
        </div>

        <div className="login-right">
          <div className="login-paws">🐾🐾🐾🐾</div>
          <div className="login-copy">
            <h2>Your pet deserves the best care</h2>
            <p>Join hundreds of pet owners and sitters who trust Loomahoidja every day.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
