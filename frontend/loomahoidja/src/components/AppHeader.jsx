import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import logoUrl from '../assets/logo.png?url'
import { useAuth } from '../auth/AuthContext'
import Button from './Button'

function initialsFromFullName(fullName) {
  const name = String(fullName || '').trim()
  if (!name) return '?'
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase() || '?'
  }
  return (parts[0].slice(0, 2) || '?').toUpperCase()
}

export default function AppHeader() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const sitterFinderActive = pathname === '/' || pathname === '/find'
  const dashboardPath = user?.role === 'owner' ? '/dashboard/owner' : '/dashboard/sitter'

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="siteHeader">
      <div className="siteHeaderInner">
        <div className="siteHeaderLeading">
          <Link to="/" className="siteBrand">
            <img
              src={logoUrl}
              className="brandLogo"
              alt="Loomahoidja"
              width={160}
              height={40}
              decoding="async"
              fetchPriority="high"
            />
            <span className="siteBrandName">Loomahoidja</span>
          </Link>

          <nav className="siteNav" aria-label="Main navigation">
            <Link to="/" className={sitterFinderActive ? 'navLink active' : 'navLink'}>
              Find a sitter
            </Link>
            <NavLink to="/how-it-works" className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}>
              How it works
            </NavLink>
            {user ? (
              <NavLink to={dashboardPath} className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}>
                {user.role === 'owner' ? 'Owner dashboard' : 'Sitter dashboard'}
              </NavLink>
            ) : null}
          </nav>
        </div>

        <div className="siteHeaderActions">
          {user ? (
            <>
              <div
                className="headerAvatar"
                title={user.fullName ? `${user.fullName}${user.email ? ` · ${user.email}` : ''}` : user.email || ''}
              >
                {initialsFromFullName(user.fullName)}
              </div>
              <Button variant="outline" className="btnSm" onClick={handleLogout}>
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
