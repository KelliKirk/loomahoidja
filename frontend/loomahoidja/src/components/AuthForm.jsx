import React from 'react'

function AuthForm({ mode, onSubmit }) {
  const [role, setRole] = React.useState('owner')
  const [email, setEmail] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [city, setCity] = React.useState('')
  const [phone, setPhone] = React.useState('')

  const isSignup = mode === 'signup'

  function submitForm(event) {
    event.preventDefault()
    const payload = { email, password }
    if (isSignup) {
      payload.fullName = fullName
      payload.role = role
      if (city) payload.city = city
      if (phone) payload.phone = phone
    }
    onSubmit(payload)
  }

  return (
    <form className="auth-form" onSubmit={submitForm}>
      {isSignup ? (
        <div className="form-row">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="owner">Owner</option>
            <option value="sitter">Sitter</option>
          </select>
        </div>
      ) : null}
      {isSignup ? (
        <div className="form-row">
          <label>Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
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
      {isSignup ? (
        <>
          <div className="form-row">
            <label>City</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </>
      ) : null}
      <div className="form-row form-actions">
        <button type="submit">{isSignup ? 'Create account' : 'Log in'}</button>
      </div>
    </form>
  )
}

export default AuthForm
