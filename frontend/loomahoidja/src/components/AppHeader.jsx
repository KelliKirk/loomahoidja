import { Link, NavLink } from 'react-router-dom'
import logoUrl from '../assets/logo.png'
import { useAuth } from '../auth/AuthContext'
import Button from './Button'

export default function AppHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="siteHeader">
      <div className="siteHeaderInner">
        <Link to="/" className="siteBrand">
          <img src={logoUrl} className="brandLogo" alt="Loomahoidja" />
          <span className="siteBrandName">Loomahoidja</span>
        </Link>

        <nav className="siteNav" aria-label="Põhinavigatsioon">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}>
            Leia hoidja
          </NavLink>
          <NavLink to="/find" className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}>
            ET otsing
          </NavLink>
          <NavLink to="/how-it-works" className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}>
            Kuidas see töötab
          </NavLink>
          {user?.role === 'owner' ? (
            <NavLink
              to="/dashboard/owner"
              className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}
            >
              Töölaud
            </NavLink>
          ) : null}
          {user?.role === 'sitter' ? (
            <NavLink
              to="/dashboard/sitter"
              className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}
            >
              Töölaud
            </NavLink>
          ) : null}
        </nav>

        <div className="siteHeaderActions">
          <Link to="/dev">
            <Button variant="outline" className="btnSm">
              API
            </Button>
          </Link>
          {user ? (
            <>
              <div className="headerAvatar" title={user.email || ''}>
                {(user.fullName || user.email || '?').slice(0, 2).toUpperCase()}
              </div>
              <Button variant="outline" className="btnSm" onClick={logout}>
                Logi välja
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="btnSm siteHeaderLoginBtn">
                  Logi sisse
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" className="btnSm">
                  Loo konto
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
