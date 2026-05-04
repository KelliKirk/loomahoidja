import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AuthForm from '../components/AuthForm.jsx'
import logoUrl from '../assets/logo.png'

export default function SignupPage() {
  const nav = useNavigate()
  const { register } = useAuth()
  const [err, setErr] = useState('')
  const [role, setRole] = useState('owner')

  async function handleRegister(payload) {
    setErr('')
    try {
      await register({
        email: payload.email,
        password: payload.password,
        fullName: payload.fullName,
        role: payload.role || role,
      })
      nav('/')
    } catch (er) {
      setErr(er?.message || 'Registration failed')
    }
  }

  return (
    <div className="authHiFi">
      <header className="authHiFiHeader">
        <Link to="/" className="authHiFiBrand">
          <img src={logoUrl} alt="Loomahoidja" className="authHiFiLogo" />
        </Link>
        <Link to="/login" className="authHiFiHeaderLink">
          Log in
        </Link>
      </header>

      <div className="authHiFiSplit">
        <div className="authHiFiCol authHiFiCol--form">
          <div className="authHiFiHeading">
            <h1>Create account</h1>
            <p>Choose how you want to use Loomahoidja</p>
          </div>

          <div className="authRoleCards" role="group" aria-label="Account type">
            <button
              type="button"
              className={`authRoleCard ${role === 'owner' ? 'authRoleCard--active' : ''}`}
              onClick={() => setRole('owner')}
            >
              <strong>I&apos;m a pet owner</strong>
              <span>I&apos;m looking for a trusted sitter for my pet</span>
            </button>
            <button
              type="button"
              className={`authRoleCard ${role === 'sitter' ? 'authRoleCard--active' : ''}`}
              onClick={() => setRole('sitter')}
            >
              <strong>I&apos;m a sitter</strong>
              <span>I want to offer pet sitting services</span>
            </button>
          </div>

          {err ? <div className="authHiFiError">{err}</div> : null}
          <AuthForm mode="signup" role={role} onSubmit={handleRegister} submitLabel="Continue →" />

          <p className="authHiFiFootnote authHiFiFootnote--inline">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>

        <div className="authHiFiCol authHiFiCol--hero" aria-hidden="true">
          <div className="authHiFiHeroCopy authHiFiHeroCopy--signup">
            <h2>Join our growing community</h2>
            <p>Create an account under 2 minutes and get started right away</p>
          </div>
        </div>
      </div>
    </div>
  )
}
