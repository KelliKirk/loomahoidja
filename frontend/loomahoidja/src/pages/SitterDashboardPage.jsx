import { useEffect, useMemo, useRef, useState } from 'react'
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
import Avatar from '../components/Avatar'
import { apiForm, apiJson } from '../api'
import { coordsForCity, osmEmbedUrl } from '../lib/geo'
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
  const { user, token, apiBaseUrl, logout, setSession } = useAuth()
  const navigate = useNavigate()
  const firstName = user?.fullName?.split(' ')[0] || 'Sitter'
  const initials = useMemo(() => initialsFromFullName(user?.fullName), [user?.fullName])
  const [section, setSection] = useState('overview')
  const unreadCount = 0
  const [myProfile, setMyProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [sitterHourlyRate, setSitterHourlyRate] = useState('')
  const [sitterBio, setSitterBio] = useState('')
  const [sitterCity, setSitterCity] = useState('')
  const [sitterHasChildren, setSitterHasChildren] = useState(false)
  const [sitterHasAnimals, setSitterHasAnimals] = useState(false)
  const [sitterTypes, setSitterTypes] = useState(() => new Set(['dog', 'cat']))
  const [profileSaving, setProfileSaving] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const photoInputRef = useRef(null)

  const apiOrigin = useMemo(() => String(apiBaseUrl || '').replace(/\/?api\/?$/i, ''), [apiBaseUrl])
  const profilePhotoUrl = myProfile?.photo ? `${apiOrigin}/uploads/profiles/${myProfile.photo}` : null
  const profileMapUrl = useMemo(() => {
    const { lat, lng } = coordsForCity(sitterCity?.trim() || user?.city)
    return osmEmbedUrl(lat, lng)
  }, [sitterCity, user?.city])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!token?.trim() || !user?.id) return
      setProfileLoading(true)
      setProfileError('')
      try {
        const data = await apiJson({ baseUrl: apiBaseUrl, path: '/sitters' })
        const list = Array.isArray(data) ? data : data?.sitters || []
        const mine = list.find((p) => Number(p.userId) === Number(user.id)) || null
        if (cancelled) return
        setMyProfile(mine)
        setSitterHourlyRate(mine?.hourlyRate != null ? String(mine.hourlyRate) : '')
        setSitterBio(mine?.bio || '')
        setSitterCity(mine?.city || user.city || '')
        setSitterHasChildren(Boolean(mine?.hasChildren))
        setSitterHasAnimals(Boolean(mine?.hasAnimals))
        const raw = (mine?.SitterAnimalTypes || []).map((t) => String(t.animalType || t).toLowerCase())
        if (raw.length) setSitterTypes(new Set(raw))
      } catch (e) {
        if (!cancelled) setProfileError(e.message || 'Could not load sitter profile.')
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [apiBaseUrl, token, user?.id, user?.city])

  async function saveSitterProfile({ withPhotoFile = null } = {}) {
    if (!token?.trim() || !user?.id) return
    setProfileSaving(true)
    setProfileError('')
    try {
      const fd = new FormData()
      fd.append('userId', String(user.id))
      fd.append('hourlyRate', sitterHourlyRate.trim() || '0')
      fd.append('bio', sitterBio.trim())
      fd.append('city', sitterCity.trim() || '')
      fd.append('hasChildren', sitterHasChildren ? '1' : '0')
      fd.append('hasAnimals', sitterHasAnimals ? '1' : '0')
      fd.append('animalTypes', JSON.stringify(Array.from(sitterTypes)))
      if (withPhotoFile) fd.append('photo', withPhotoFile)

      const updated = await apiForm({ baseUrl: apiBaseUrl, path: '/sitters/profile', token, formData: fd })
      setMyProfile(updated)
      // keep Auth user city in sync if sitter edits city here
      if (setSession && user) {
        setSession(token, { ...user, city: sitterCity.trim() || null })
      }
    } catch (e) {
      setProfileError(e.message || 'Could not save sitter profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePhotoSelected = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPhotoUploading(true)
    try {
      await saveSitterProfile({ withPhotoFile: file })
    } finally {
      setPhotoUploading(false)
    }
  }

  function toggleType(t) {
    setSitterTypes((prev) => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })
  }

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
            <button type="button" className={section === 'overview' ? 'active' : ''} onClick={() => setSection('overview')}>
              Dashboard
            </button>
            <button
              type="button"
              className={`message-tab ${section === 'messages' ? 'active' : ''}`.trim()}
              onClick={() => setSection('messages')}
            >
              Messages
              {unreadCount > 0 ? <span aria-label={`${unreadCount} unread messages`}>{unreadCount}</span> : null}
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
          <button className={section === 'overview' ? 'active' : ''} type="button" onClick={() => setSection('overview')}>
            <FontAwesomeIcon icon={faChartLine} className="owner-nav-icon" fixedWidth />
            Overview
          </button>
          <button className={section === 'bookings' ? 'active' : ''} type="button" onClick={() => setSection('bookings')}>
            <FontAwesomeIcon icon={faCalendarCheck} className="owner-nav-icon" fixedWidth />
            Bookings
          </button>
          <button className={section === 'calendar' ? 'active' : ''} type="button" onClick={() => setSection('calendar')}>
            <FontAwesomeIcon icon={faCalendarDays} className="owner-nav-icon" fixedWidth />
            Calendar
          </button>
          <button className={section === 'messages' ? 'active' : ''} type="button" onClick={() => setSection('messages')}>
            <FontAwesomeIcon icon={faEnvelope} className="owner-nav-icon" fixedWidth />
            Messages
          </button>
          <button className={section === 'profile' ? 'active' : ''} type="button" onClick={() => setSection('profile')}>
            <FontAwesomeIcon icon={faUserGear} className="owner-nav-icon" fixedWidth />
            Profile settings
          </button>
          <button className={section === 'earnings' ? 'active' : ''} type="button" onClick={() => setSection('earnings')}>
            <FontAwesomeIcon icon={faCoins} className="owner-nav-icon" fixedWidth />
            Earnings
          </button>
        </nav>
      </aside>

      <div className="owner-workspace">
        {section === 'profile' ? (
          <div className="owner-profile-page-grid">
            <div className="owner-profile-page-primary">
              <div className="owner-profile-hero-strip">
                <div className="owner-profile-hero-strip-inner">
                  <div className="owner-profile-hero-layout">
                    <div className="owner-profile-avatar-block">
                      <button
                        type="button"
                        className="owner-profile-avatar-hit"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={photoUploading}
                        aria-label={profilePhotoUrl ? 'Change profile photo' : 'Upload profile photo'}
                      >
                        <Avatar src={profilePhotoUrl} name={user?.fullName || 'Sitter'} size={96} />
                      </button>
                      <input
                        ref={photoInputRef}
                        type="file"
                        className="owner-photo-file-input"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handlePhotoSelected}
                      />
                      <p className="typeCaption textMuted owner-profile-upload-hint">
                        {photoUploading
                          ? 'Uploading…'
                          : profilePhotoUrl
                            ? 'Click photo to replace'
                            : 'Click to add a photo'}
                      </p>
                    </div>

                    <div className="owner-profile-hero-text">
                      <h1 className="typeH1 owner-profile-hero-title">{user?.fullName || 'Sitter profile'}</h1>
                      <p className="typeBodySmall owner-profile-hero-sub">
                        {sitterCity?.trim() ? `${sitterCity.trim()} · ` : ''}
                        Profile settings
                      </p>
                      <div className="tagRow">
                        {Array.from(sitterTypes).length === 0 ? (
                          <span className="tag">No pet types yet</span>
                        ) : (
                          Array.from(sitterTypes).map((t) => (
                            <span key={t} className="tag">
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </span>
                          ))
                        )}
                      </div>
                      <p className="typeBody owner-profile-hero-meta">
                        {myProfile
                          ? 'Edit your public sitter profile and keep it up to date.'
                          : 'Create your sitter profile to start receiving booking requests.'}
                      </p>
                    </div>

                    <div className="owner-profile-hero-aside">
                      <Button variant="primary" className="btnWide" type="button" onClick={() => setSection('bookings')}>
                        Booking requests
                      </Button>
                      <Button
                        variant="outline"
                        className="btnWide owner-profile-hero-outline-btn"
                        type="button"
                        onClick={() => navigate('/')}
                      >
                        Back to home
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="owner-profile-main-flow">
                <section className="owner-profile-section">
                  <h2 className="owner-profile-section-title">Edit sitter profile</h2>
                  {profileError ? <div className="formError owner-profile-save-error">{profileError}</div> : null}
                  {profileLoading ? <p className="typeBodySmall textMuted">Loading profile…</p> : null}

                  <form
                    className="owner-profile-edit-form"
                    onSubmit={(e) => {
                      e.preventDefault()
                      saveSitterProfile()
                    }}
                  >
                    <div className="form-group">
                      <label>Hourly rate (€)</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.5"
                        value={sitterHourlyRate}
                        onChange={(e) => setSitterHourlyRate(e.target.value)}
                        placeholder="8.5"
                      />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input
                        className="input"
                        value={sitterCity}
                        onChange={(e) => setSitterCity(e.target.value)}
                        placeholder="e.g. Tartu"
                      />
                    </div>
                    <div className="form-group">
                      <label>Bio</label>
                      <textarea
                        value={sitterBio}
                        onChange={(e) => setSitterBio(e.target.value)}
                        placeholder="Tell owners about your experience…"
                        rows="5"
                      />
                    </div>

                    <div className="form-group">
                      <label>Animals you care for</label>
                      <div className="pillGrid">
                        {['dog', 'cat', 'bird', 'rabbit', 'rodent', 'fish'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            className={`filterPill ${sitterTypes.has(t) ? 'on' : ''}`}
                            onClick={() => toggleType(t)}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="checkRow">
                        <input
                          type="checkbox"
                          checked={sitterHasChildren}
                          onChange={(e) => setSitterHasChildren(e.target.checked)}
                        />
                        Has children at home
                      </label>
                      <label className="checkRow">
                        <input
                          type="checkbox"
                          checked={sitterHasAnimals}
                          onChange={(e) => setSitterHasAnimals(e.target.checked)}
                        />
                        Has other pets at home
                      </label>
                    </div>

                    <Button
                      variant="primary"
                      type="submit"
                      className="owner-profile-save-btn"
                      disabled={profileSaving || profileLoading}
                    >
                      {profileSaving ? 'Saving…' : 'Save profile'}
                    </Button>
                  </form>
                </section>
              </div>
            </div>

            <aside className="owner-profile-rail" aria-label="Profile sidebar">
              <div className="owner-profile-rail-inner">
                <section className="owner-profile-rail-card">
                  <h2 className="owner-profile-rail-card-title">Booking requests</h2>
                  <p className="typeBodySmall owner-profile-rail-muted">
                    {bookingRequests.length
                      ? `You have ${bookingRequests.length} pending request${bookingRequests.length === 1 ? '' : 's'}.`
                      : 'No pending requests.'}
                  </p>
                  <Button variant="outline" className="btnWide" type="button" onClick={() => setSection('bookings')}>
                    Open requests
                  </Button>
                </section>

                <section className="owner-profile-rail-card">
                  <h2 className="owner-profile-rail-card-title">Calendar</h2>
                  <div className="calendar-header" style={{ marginBottom: 6 }}>
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
                    {Array.from({ length: daysInMonth(calYear, calMonth) }, (_, i) => i + 1).map((day) => {
                      const isToday =
                        today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day
                      return (
                        <div key={day} className={`day available${isToday ? ' today' : ''}`}>
                          {day}
                        </div>
                      )
                    })}
                  </div>
                  <div className="calendar-legend">
                    <div className="legend-item">
                      <div className="legend-box available" />
                      <span>Available</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-box booked" />
                      <span>Busy</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-box today" />
                      <span>Today</span>
                    </div>
                  </div>
                </section>

                <section className="owner-profile-rail-card">
                  <h2 className="owner-profile-rail-card-title">Location</h2>
                  <p className="typeBodySmall owner-profile-rail-muted">
                    Approximate area — exact address is shared with owners only when you choose.
                  </p>
                  <div className="mapFrame owner-profile-rail-map">
                    <iframe
                      title="Approximate location"
                      src={profileMapUrl}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </section>
              </div>
            </aside>
          </div>
        ) : (
          <div className="owner-content">
          {section !== 'messages' && (
            <div className="owner-welcome">
              <h1>Welcome back, {firstName}</h1>
              <p>
                You have {bookingRequests.length} new booking {bookingRequests.length === 1 ? 'request' : 'requests'}
              </p>
            </div>
          )}

          {section === 'overview' && (
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
          )}

          {section === 'overview' || section === 'bookings' ? (
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
          ) : null}

          {section === 'overview' || section === 'calendar' || section === 'earnings' ? (
            <div className="owner-bottom-grid">

              {section === 'overview' || section === 'calendar' ? (
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
                    {Array.from({ length: daysInMonth(calYear, calMonth) }, (_, i) => i + 1).map((day) => {
                      const isToday =
                        today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day
                      return (
                        <div key={day} className={`day available${isToday ? ' today' : ''}`}>
                          {day}
                        </div>
                      )
                    })}
                  </div>
                  <div className="calendar-legend">
                    <div className="legend-item">
                      <div className="legend-box available" />
                      <span>Available</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-box booked" />
                      <span>Busy</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-box today" />
                      <span>Today</span>
                    </div>
                  </div>
                </section>
              ) : null}

              {section === 'overview' || section === 'earnings' ? (
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
              ) : null}

            </div>
          ) : null}

          {section === 'messages' ? (
            <section className="owner-card owner-chat-card">
              <div className="owner-chat-header">
                <h2>Messages</h2>
                <p className="owner-chat-subtitle typeBodySmall textMuted">No messages yet.</p>
              </div>
            </section>
          ) : null}
          </div>
        )}
      </div>
    </section>
  )
}