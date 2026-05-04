import React from 'react'
import AuthForm from '../components/AuthForm.jsx'

function SignupPage({ onRegister }) {
  return (
    <section className="signup-page">
      <div className="auth-panel">
        <div className="auth-form-card">
          <span className="eyebrow">Create account</span>
          <h2>Choose how you want to use Loomahoidja</h2>
          <p>Create an account to start booking or offering pet care.</p>
          <AuthForm mode="signup" onSubmit={onRegister} />
        </div>

        <div className="auth-side-card signup-side-card">
          <div className="auth-side-copy">
            <h3>Join our growing community</h3>
            <p>Create an account under 2 minutes and get started right away.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SignupPage
