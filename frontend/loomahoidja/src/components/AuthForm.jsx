import React from 'react'

function AuthForm({ mode, onSubmit }) {
  const [role, setRole] = React.useState('owner')
  const [email, setEmail] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [password, setPassword] = React.useState('')

  const isSignup = mode === 'signup'

  function submitForm(event) {
    event.preventDefault()
    const payload = { email, password }
    if (isSignup) {
      payload.fullName = fullName
      payload.role = role
    }
    onSubmit(payload)
  }

  return (
    <form className="auth-form" onSubmit={submitForm}>
      {isSignup ? (
        <div className="role-options">
          <button
            type="button"
            className={`role-option ${role === 'owner' ? 'active' : ''}`}
            onClick={() => setRole('owner')}
          >
            <strong>I'm a pet owner</strong>
            <span>I'm looking for a trusted sitter for my pet</span>
          </button>
          <button
            type="button"
            className={`role-option ${role === 'sitter' ? 'active' : ''}`}
            onClick={() => setRole('sitter')}
          >
            <strong>I'm a sitter</strong>
            <span>I want to offer pet sitting services</span>
          </button>
        </div>
      ) : null}

      {isSignup ? (
        <div className="form-row">
          <label>Full name</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
      ) : null}

      <div className="form-row">
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div className="form-row">
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>

      {!isSignup ? (
        <div className="login-forgot">Forgot password?</div>
      ) : null}

      <div className="form-row form-actions">
        <button type="submit">{isSignup ? 'Continue →' : 'Log in'}</button>
      </div>
    </form>
  )
}

export default AuthForm
