import React from 'react'
import AuthForm from '../components/AuthForm.jsx'

function LoginPage({ onLogin }) {
  return (
    <section className="auth-panel">
      <div className="auth-form-card">
        <div>
          <span className="eyebrow">Welcome back</span>
          <h2>Login to your account</h2>
          <p>Access your booking dashboard, manage pets, and message sitters.</p>
        </div>
        <AuthForm mode="login" onSubmit={onLogin} />
      </div>
      <div className="auth-side-card">
        <h3>Your pet deserves the best care</h3>
        <p>Sign in to see local sitters, manage your profile, and start a booking conversation.</p>
        <div className="metric-row">
          <div>
            <strong>Fast booking</strong>
            <span>Reach sitters with one tap.</span>
          </div>
          <div>
            <strong>Secure profile</strong>
            <span>Save your favorite caregivers safely.</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
