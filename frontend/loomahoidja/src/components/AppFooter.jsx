import React from 'react'

function AppFooter({ baseUrl, onBaseUrlChange, currentUser, status }) {
  return (
    <footer className="app-footer">
      <div>
        <span>Backend API:</span>
        <input value={baseUrl} onChange={(e) => onBaseUrlChange(e.target.value)} />
      </div>
      <div className="session-summary">
        {currentUser ? `Logged in as ${currentUser.fullName} (${currentUser.role})` : 'Not logged in'}
        {status ? <span className="status-message">{status}</span> : null}
      </div>
    </footer>
  )
}

export default AppFooter
