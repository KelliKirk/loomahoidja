import React from 'react'
import AuthForm from '../components/AuthForm.jsx'

function SignupPage({ onRegister }) {
  return (
    <section className="auth-panel">
      <div className="auth-form-card">
        <div>
          <span className="eyebrow">Create account</span>
          <h2>Get started as owner or sitter</h2>
          <p>Join our community and begin booking or offering pet care.</p>
        </div>
        <AuthForm mode="signup" onSubmit={onRegister} />
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

export default SignupPage
