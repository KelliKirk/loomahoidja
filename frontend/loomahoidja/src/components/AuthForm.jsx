import { useState } from 'react'

export default function AuthForm({ mode, onSubmit, role, submitLabel }) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [forgotHintOpen, setForgotHintOpen] = useState(false)

  const isSignup = mode === 'signup'

  function submitForm(event) {
    event.preventDefault()
    const payload = { email, password }
    if (isSignup) {
      payload.fullName = fullName
      payload.role = role || 'owner'
    }
    onSubmit(payload)
  }

  const primaryLabel = submitLabel || (isSignup ? 'Continue →' : 'Log in')

  return (
    <form className="authHiFiForm" onSubmit={submitForm}>
      {isSignup ? (
        <div className="authHiFiField">
          <label htmlFor="auth-fullname">Full name</label>
          <input
            id="auth-fullname"
            name="fullName"
            autoComplete="name"
            placeholder="First Last"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
      ) : null}

      <div className="authHiFiField">
        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="authHiFiField">
        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          name="password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          placeholder={isSignup ? '••••••••' : '••••••••'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {!isSignup ? (
        <div className="authHiFiForgot">
          <button
            type="button"
            className="authHiFiForgotBtn"
            onClick={() => setForgotHintOpen(true)}
          >
            Forgot password?
          </button>
          {forgotHintOpen ? (
            <p className="authHiFiForgotHint" role="status">
              Parooli taastamise voog lisandub peagi. Seniks võta vajadusel ühendust toega.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="authHiFiField authHiFiField--submit">
        <button type="submit" className="authHiFiPrimaryBtn">
          {primaryLabel}
        </button>
      </div>
    </form>
  )
}
