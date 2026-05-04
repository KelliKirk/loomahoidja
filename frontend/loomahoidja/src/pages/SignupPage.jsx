import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AuthForm from '../components/AuthForm.jsx'

export default function SignupPage() {
  const nav = useNavigate()
  const { register } = useAuth()
  const [err, setErr] = useState('')

  async function handleRegister(payload) {
    setErr('')
    try {
      await register({
        email: payload.email,
        password: payload.password,
        fullName: payload.fullName,
        role: payload.role || 'owner',
        phone: payload.phone,
        city: payload.city,
      })
      nav('/')
    } catch (er) {
      setErr(er?.message || 'Registration failed')
    }
  }

  return (
    <section className="auth-panel">
      <div className="auth-form-card">
        <div>
          <span className="eyebrow">Create account</span>
          <h2>Get started as owner or sitter</h2>
          <p>Join our community and begin booking or offering pet care.</p>
        </div>
        {err ? <div className="formError">{err}</div> : null}
        <AuthForm mode="signup" onSubmit={handleRegister} />
        <p className="typeBodySmall textMuted" style={{ marginTop: '12px' }}>
          Already have an account?{' '}
          <Link to="/login" className="textLink">
            Log in
          </Link>
        </p>
      </div>
      <div className="auth-side-card">
        <h3>Join our growing community</h3>
        <p>Owners and sitters can both create a profile to connect with local pet families.</p>
        <div className="metric-row">
          <div>
            <strong>Trusted profiles</strong>
            <span>See sitter details at a glance.</span>
          </div>
          <div>
            <strong>Easy onboarding</strong>
            <span>Create your account in under a minute.</span>
          </div>
        </div>
      </div>
    </section>
  )
}
