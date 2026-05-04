import React from 'react'

function AppHeader({ currentUser, page, setPage, onLogout, onOpenDashboard }) {
  const pageLabel = page === 'login' ? 'Login' : page === 'signup' ? 'Create account' : page === 'dashboard' ? 'Dashboard' : 'Home'
  const isAuthPage = page === 'login' || page === 'signup'

  return (
    <header className={`app-header ${isAuthPage ? 'auth-header' : ''}`}>
      <div className={`brand ${isAuthPage ? 'auth-brand' : ''}`}>
        <span className="brand-mark">🐾</span>
        {!isAuthPage ? <span className="brand-title">Loomahoidja</span> : null}
      </div>
      {isAuthPage ? (
        <div className="page-label">{pageLabel}</div>
      ) : (
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
      )}
    </header>
  )
}

export default AppHeader
