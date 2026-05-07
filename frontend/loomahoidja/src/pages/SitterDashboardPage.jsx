import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarCheck,
  faCalendarDays,
  faChartLine,
  faCoins,
  faEnvelope,
  faUserGear,
} from '@fortawesome/free-solid-svg-icons'
import logoMarkUrl from '../assets/logo.png?url'
import Button from '../components/Button'
import { initialsFromFullName } from '../lib/userDisplay'

const INITIAL_REQUESTS = [
  { owner: 'Peeter P.', pet: 'Rex', dates: '14.04–17.04', price: '25.50 €' },
  { owner: 'Darude S.', pet: 'Küpsis', dates: '20.04–22.04', price: '30.00 €' },
  { owner: 'Paul E.', pet: 'Pitsu', dates: '01.05–03.05', price: '22.50 €' },
]

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

function getMonthStartOffset(year, month) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

export default function SitterDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const firstName = user?.fullName?.split(' ')[0] || 'Sitter'
  const initials = useMemo(() => initialsFromFullName(user?.fullName), [user?.fullName])

  const [bookingRequests, setBookingRequests] = useState(INITIAL_REQUESTS)
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())

  const handlePrevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }
  const handleNextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }
  const handleAccept = (index) => setBookingRequests(r => r.filter((_, i) => i !== index))
  const handleDecline = (index) => setBookingRequests(r => r.filter((_, i) => i !== index))

  return (
    <section className="owner-dashboard owner-dashboard--with-topbar">
      <header className="owner-topbar">
        <div className="owner-topbar-start">
          <button
            type="button"
            className="owner-topbar-home"
            onClick={() => navigate('/')}
            aria-label="Loomahoidja home"
          >
            <img src={logoMarkUrl} className="owner-brand-logo" alt="" width={44} height={36} decoding="async" />
            <span className="owner-topbar-wordmark">Loomahoidja</span>
          </button>
          <div className="owner-topbar-brand">
            <button type="button" onClick={() => navigate('/')}>
              Find a sitter
            </button>
            <button type="button" className="active">
              Dashboard
            </button>
            <button type="button" className="message-tab" onClick={() => { /* placeholder */ }}>
              Messages
              <span aria-label="3 unread messages">3</span>
            </button>
          </div>
        </div>
        <div className="owner-topbar-actions">
          <div className="owner-topbar-avatar" title={user?.fullName || user?.email || ''} aria-hidden="true">
            {initials}
          </div>
          <Button
            variant="outline"
            className="btnSm owner-topbar-logout"
            type="button"
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            Log out
          </Button>
        </div>
      </header>

      <aside className="owner-sidebar">
        <div className="owner-profile">
          <strong>{user?.fullName || 'Sitter'}</strong>
          <span>Sitter</span>
        </div>
        <nav className="owner-side-nav" aria-label="Sitter dashboard">
          <button className="active" type="button">
            <FontAwesomeIcon icon={faChartLine} className="owner-nav-icon" fixedWidth />
            Overview
          </button>
          <button type="button">
            <FontAwesomeIcon icon={faCalendarCheck} className="owner-nav-icon" fixedWidth />
            Bookings
          </button>
          <button type="button">
            <FontAwesomeIcon icon={faCalendarDays} className="owner-nav-icon" fixedWidth />
            Calendar
          </button>
          <button type="button">
            <FontAwesomeIcon icon={faEnvelope} className="owner-nav-icon" fixedWidth />
            Messages
          </button>
          <button type="button">
            <FontAwesomeIcon icon={faUserGear} className="owner-nav-icon" fixedWidth />
            Profile settings
          </button>
          <button type="button">
            <FontAwesomeIcon icon={faCoins} className="owner-nav-icon" fixedWidth />
            Earnings
          </button>
        </nav>
      </aside>

      <div className="owner-workspace">
        <div className="owner-content">
          <div className="owner-welcome">
            <h1>Welcome back, {firstName}</h1>
            <p>You have {bookingRequests.length} new booking {bookingRequests.length === 1 ? 'request' : 'requests'}</p>
          </div>

          <div className="owner-stats-grid">
            <div className="owner-stat-card highlighted">
              <span className="owner-stat-icon calendar-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faCalendarCheck} />
              </span>
              <span className="owner-stat-label">New requests</span>
              <strong>{bookingRequests.length}</strong>
              <small>awaiting response</small>
            </div>
            <div className="owner-stat-card">
              <span className="owner-stat-icon calendar-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faCalendarDays} />
              </span>
              <span className="owner-stat-label">Active bookings</span>
              <strong>2</strong>
              <small>this week</small>
            </div>
            <div className="owner-stat-card">
              <span className="owner-stat-icon outline" aria-hidden="true">
                <FontAwesomeIcon icon={faCoins} />
              </span>
              <span className="owner-stat-label">This month</span>
              <strong>127 €</strong>
              <small>earned</small>
            </div>
            <div className="owner-stat-card">
              <span className="owner-stat-icon success" aria-hidden="true">
                <FontAwesomeIcon icon={faChartLine} />
              </span>
              <span className="owner-stat-label">Your rating</span>
              <strong>4.9</strong>
              <small>28 reviews</small>
            </div>
          </div>

          <section className="owner-bookings-section">
            <h2>Booking requests</h2>
            <div className="owner-bookings-table sitter-requests-table">
              <div className="owner-table-row owner-table-head">
                <span>Owner</span>
                <span>Pet</span>
                <span>Dates</span>
                <span>Price</span>
                <span></span>
              </div>
              {bookingRequests.length === 0 && (
                <div className="owner-table-row">
                  <span style={{ gridColumn: '1 / -1', padding: '10px 0' }}>No pending requests 🎉</span>
                </div>
              )}
              {bookingRequests.map((r, index) => (
                <div key={index} className="owner-table-row">
                  <span>{r.owner}</span>
                  <span>{r.pet}</span>
                  <span>{r.dates}</span>
                  <span>{r.price}</span>
                  <div className="owner-table-actions" aria-label="Request actions">
                    <button type="button" className="btn-accept" onClick={() => handleAccept(index)}>
                      Accept
                    </button>
                    <button type="button" className="btn-decline" onClick={() => handleDecline(index)}>
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="owner-bottom-grid">

            <section className="owner-card">
              <h2>Availability calendar</h2>
              <div className="calendar-header">
                <button type="button" className="cal-nav-btn" onClick={handlePrevMonth} aria-label="Previous month">
                  ‹
                </button>
                <span className="calendar-month">
                  {MONTH_NAMES[calMonth]} {calYear}
                </span>
                <button type="button" className="cal-nav-btn" onClick={handleNextMonth} aria-label="Next month">
                  ›
                </button>
              </div>
              <div className="calendar-weekdays">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="calendar-grid">
                {Array(getMonthStartOffset(calYear, calMonth)).fill(null).map((_, i) => (
                  <div key={`blank-${i}`} className="day empty" />
                ))}
                {Array.from({ length: daysInMonth(calYear, calMonth) }, (_, i) => i + 1).map(day => {
                  const isToday = today.getFullYear() === calYear
                    && today.getMonth() === calMonth
                    && today.getDate() === day
                  return (
                    <div key={day} className={`day available${isToday ? ' today' : ''}`}>
                      {day}
                    </div>
                  )
                })}
              </div>
              <div className="calendar-legend">
                <div className="legend-item">
                  <div className="legend-box available" /><span>Available</span>
                </div>
                <div className="legend-item">
                  <div className="legend-box booked" /><span>Busy</span>
                </div>
                <div className="legend-item">
                  <div className="legend-box today" /><span>Today</span>
                </div>
              </div>
            </section>

            <section className="owner-card owner-earnings-card" aria-label="Earnings">
              <h2>Earnings</h2>
              <div className="owner-earnings-stack">
              <article className="owner-stat-card owner-stat-card--compact">
                <span className="owner-stat-label">This month</span>
                <strong>127 €</strong>
                <small>earned</small>
              </article>
              <article className="owner-stat-card owner-stat-card--compact">
                <span className="owner-stat-label">Total earned</span>
                <strong>843 €</strong>
                <small>all time</small>
              </article>
              </div>
            </section>

          </div>
        </div>
      </div>
    </section>
  )
}