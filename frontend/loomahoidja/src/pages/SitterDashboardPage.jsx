import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import Button from '../components/Button'

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
  const { user } = useAuth()
  const firstName = user?.fullName?.split(' ')[0] || 'Sitter'
  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'

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
    <div className="owner-dashboard">
      <aside className="owner-sidebar">
        <div className="owner-profile">
          <strong>{user?.fullName || 'Sitter'}</strong>
          <span>Sitter</span>
        </div>
        <nav className="owner-side-nav">
          <button className="active" type="button"><span>▥</span>Overview</button>
          <button type="button"><span>▣</span>Bookings</button>
          <button type="button"><span>🗓</span>Calendar</button>
          <button type="button"><span>💬</span>Messages</button>
          <button type="button"><span>⚙</span>Profile settings</button>
          <button type="button"><span>💰</span>Earnings</button>
        </nav>
      </aside>

      <div className="owner-workspace">
        <main className="owner-content">
          <div className="owner-welcome">
            <h1>Welcome back, {firstName}</h1>
            <p>You have {bookingRequests.length} new booking {bookingRequests.length === 1 ? 'request' : 'requests'}</p>
          </div>

          <div className="owner-stats-grid">
            <div className="owner-stat-card highlighted">
              <span className="owner-stat-icon">📋</span>
              <span className="owner-stat-label">New requests</span>
              <strong>{bookingRequests.length}</strong>
              <small>awaiting response</small>
            </div>
            <div className="owner-stat-card">
              <span className="owner-stat-icon">📅</span>
              <span className="owner-stat-label">Active bookings</span>
              <strong>2</strong>
              <small>this week</small>
            </div>
            <div className="owner-stat-card">
              <span className="owner-stat-icon">💰</span>
              <span className="owner-stat-label">This month</span>
              <strong>127 €</strong>
              <small>earned</small>
            </div>
            <div className="owner-stat-card">
              <span className="owner-stat-icon">⭐</span>
              <span className="owner-stat-label">Your rating</span>
              <strong>4.9</strong>
              <small>28 reviews</small>
            </div>
          </div>

          <section className="owner-bookings-section">
            <h2>Booking requests</h2>
            <div className="owner-bookings-table">
              <div className="owner-table-row owner-table-head">
                <span>Owner</span>
                <span>Pet</span>
                <span>Dates</span>
                <span>Price</span>
                <span></span>
              </div>
              {bookingRequests.length === 0 && (
                <div>
                  No pending requests 🎉
                </div>
              )}
              {bookingRequests.map((r, index) => (
                <div key={index} className="owner-table-row">
                  <span>{r.owner}</span>
                  <span>{r.pet}</span>
                  <span>{r.dates}</span>
                  <span>{r.price}</span>
                  <div className="tableActions">
                    <button className="btn-action accept" onClick={() => handleAccept(index)}>Accept</button>
                    <button className="btn-action decline" onClick={() => handleDecline(index)}>Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="owner-bottom-grid">

            <section className="owner-card">
              <h2>Availability calendar</h2>
              <div>
                <button className="cal-nav-btn" onClick={handlePrevMonth}>‹</button>
                <span>{MONTH_NAMES[calMonth]} {calYear}</span>
                <button className="cal-nav-btn" onClick={handleNextMonth}>›</button>
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
                    <div key={day} className={`day${isToday ? ' today' : ''}`}>
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

            <section className="owner-card">
              <h2>Earnings</h2>
              <div>
                <div className="owner-stat-card">
                  <span className="owner-stat-label">This month</span>
                  <strong>127 €</strong>
                </div>
                <div className="owner-stat-card">
                  <span className="owner-stat-label">Total earned</span>
                  <strong>843 €</strong>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  )
}