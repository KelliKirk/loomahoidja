import { Link, NavLink, useLocation } from 'react-router-dom'
import logoUrl from '../assets/logo.png'
import { useAuth } from '../auth/AuthContext'
import Button from './Button'

export default function AppHeader() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const sitterFinderActive = pathname === '/' || pathname === '/find'

function AppHeader({ currentUser, page, onSetPage, onLogout }) {
  const isAuth = page === 'login' || page === 'signup'
  const isSitterProfile = page === 'sitter'
  const isOwner = currentUser?.role === 'owner'
  const userInitials = currentUser?.fullName?.slice(0, 2).toUpperCase() || 'U'
  const loggedInActions = currentUser ? (
    <div className="app-actions">
      {isOwner ? <button onClick={() => onSetPage('dashboard')}>Owner dashboard</button> : null}
      <button className="secondary" onClick={onLogout}>Log out</button>
      <div className="user-avatar">{userInitials}</div>
    </div>
  ) : null

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
            {currentUser ? loggedInActions : (
              <button onClick={() => onSetPage('login')}>Log in</button>
            )}
          </>
        ) : (
          <>
            <button className={page === 'home' ? 'active' : ''} onClick={() => onSetPage('home')}>Find a sitter</button>
            <button className={page === 'home' ? 'active' : ''} onClick={() => onSetPage('home')}>How it works</button>
            {currentUser ? loggedInActions : (
              <div className="app-actions">
                <button className={page === 'login' ? 'active' : ''} onClick={() => onSetPage('login')}>Log in</button>
                <button className="secondary" onClick={() => onSetPage('signup')}>Sign up</button>
              </div>
            )}
          </>
        )}
      </nav>
  return (
    <header className="siteHeader">
      <div className="siteHeaderInner">
        <div className="siteHeaderLeading">
          <Link to="/" className="siteBrand">
            <img src={logoUrl} className="brandLogo" alt="Loomahoidja" />
            <span className="siteBrandName">Loomahoidja</span>
          </Link>

          <nav className="siteNav" aria-label="Main navigation">
            <Link to="/" className={sitterFinderActive ? 'navLink active' : 'navLink'}>
              Find a sitter
            </Link>
            <NavLink to="/how-it-works" className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}>
              How it works
            </NavLink>
            {user?.role === 'owner' ? (
              <NavLink
                to="/dashboard/owner"
                className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}
              >
                Dashboard
              </NavLink>
            ) : null}
            {user?.role === 'sitter' ? (
              <NavLink
                to="/dashboard/sitter"
                className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}
              >
                Dashboard
              </NavLink>
            ) : null}
          </nav>
        </div>

        <div className="siteHeaderActions">
          {user ? (
            <>
              <div className="headerAvatar" title={user.email || ''}>
                {(user.fullName || user.email || '?').slice(0, 2).toUpperCase()}
              </div>
              <Button variant="outline" className="btnSm" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="btnSm siteHeaderLoginBtn">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" className="btnSm siteHeaderSignupBtn">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
