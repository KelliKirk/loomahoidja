import { Link, NavLink, useLocation } from 'react-router-dom'
import logoUrl from '../assets/logo.png'
import { useAuth } from '../auth/AuthContext'
import Button from './Button'

export default function AppHeader() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const sitterFinderActive = pathname === '/' || pathname === '/find'

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
