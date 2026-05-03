import React from 'react'

function AppHeader({ currentUser, page, setPage, onLogout, onOpenDashboard }) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark">🐾</span>
        <div>
          <div className="brand-title">Loomahoidja</div>
          <div className="brand-subtitle">Trusted pet care for owners and sitters</div>
        </div>
      </div>
      <nav className="app-nav">
        <button className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}>Home</button>
        {currentUser?.role === 'owner' ? (
          <button className={page === 'dashboard' ? 'active' : ''} onClick={onOpenDashboard}>Dashboard</button>
        ) : null}
        {currentUser ? (
          <button onClick={onLogout}>Log out</button>
        ) : (
          <>
            <button className={page === 'login' ? 'active' : ''} onClick={() => setPage('login')}>Login</button>
            <button className={page === 'signup' ? 'active' : ''} onClick={() => setPage('signup')}>Sign up</button>
          </>
        )}
      </nav>
    </header>
  )
}

export default AppHeader
