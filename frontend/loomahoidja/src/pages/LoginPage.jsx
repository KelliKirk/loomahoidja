import React from 'react'
import AuthForm from '../components/AuthForm.jsx'

function LoginPage({ onLogin, onSignup }) {
  return (
    <section className="login-page">
      <div className="login-card">
        <div className="login-left">
          <div className="login-heading">
            <h1>Welcome back</h1>
            <p>Log in to your account</p>
          </div>
          <AuthForm mode="login" onSubmit={onLogin} />
          <div className="login-footer">
            <span>or</span>
            <p>Don't have an account?</p>
            <button type="button" className="secondary-button" onClick={onSignup}>Create account</button>
          </div>
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

export default LoginPage
