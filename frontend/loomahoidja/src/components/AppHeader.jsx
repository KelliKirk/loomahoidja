import React from 'react'

function AppHeader({ currentUser, page, onSetPage, onLogout }) {
  const isAuth = page === 'login' || page === 'signup'
  const isSitterProfile = page === 'sitter'

  return (
    <header className={`app-header ${isAuth ? 'auth-header' : ''}`}>
      <div className="brand">
        <span className="brand-mark">🐾</span>
        <span className="brand-title">Loomahoidja</span>
      </div>
      <nav className="app-nav">
        {isAuth ? (
          <>
            {page === 'signup' ? (
              <button onClick={() => onSetPage('login')}>Log in</button>
            ) : (
              <button className="secondary" onClick={() => onSetPage('signup')}>Create account</button>
            )}
          </>
        ) : isSitterProfile ? (
          <>
            <button onClick={() => onSetPage('home')}>Find a sitter</button>
            <button>How it works</button>
            <button className="active">Sitter profile</button>
            <button>My bookings</button>
            <button>Messages</button>
            {currentUser ? (
              <div className="user-avatar">{currentUser.fullName?.slice(0, 2).toUpperCase() || 'U'}</div>
            ) : (
              <button onClick={() => onSetPage('login')}>Log in</button>
            )}
          </>
        ) : (
          <>
            <button className={page === 'home' ? 'active' : ''} onClick={() => onSetPage('home')}>Find a sitter</button>
            <button className={page === 'home' ? 'active' : ''} onClick={() => onSetPage('home')}>How it works</button>
            <div className="app-actions">
              <button className={page === 'login' ? 'active' : ''} onClick={() => onSetPage('login')}>Log in</button>
              <button className="secondary" onClick={() => onSetPage('signup')}>Sign up</button>
            </div>
          </>
        )}
      </nav>
    </header>
  )
}

export default AppHeader
