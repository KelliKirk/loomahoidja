import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarCheck,
  faCalendarDays,
  faCat,
  faChartLine,
  faDog,
  faEnvelope,
  faEnvelopeOpenText,
  faPaperPlane,
  faPaw,
  faUserCheck,
  faUserGear,
} from '@fortawesome/free-solid-svg-icons'
import logoMarkUrl from '../assets/logo.png?url'
import Button from '../components/Button'

const INBOX_STORAGE_KEY = 'loom_owner_inbox_v1'
const CHAT_STORAGE_KEY = 'loom_owner_chat_v1'

const bookings = [
  { pet: 'Rex', sitter: 'Leelo Lameuss', dates: 'Apr 14-Apr 17', price: '25.50 EUR', status: 'Confirmed' },
  { pet: 'Miisu', sitter: 'Rasmus Sigma', dates: 'May 15-May 22', price: '70.00 EUR', status: 'Pending' },
  { pet: 'Semu', sitter: 'Sander Skibidi-Saabas', dates: 'Feb 14-Feb 15', price: '14.00 EUR', status: 'Completed' },
]

function loadInboxFromStorage() {
  try {
    const raw = localStorage.getItem(INBOX_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map((m) => ({
          ...m,
          read: m.read !== false,
        }))
      }
    }
  } catch {
    /* ignore */
  }
  return [
    {
      id: 'seed-1',
      initials: 'LL',
      name: 'Leelo L.',
      text: 'Rex is doing great today!',
      time: '17 min ago',
      read: true,
      color: '#9fb9aa',
    },
    {
      id: 'seed-2',
      initials: 'RS',
      name: 'Rasmus S.',
      text: 'When does your trip start?',
      time: '7 min ago',
      read: true,
      color: '#e9b8b8',
    },
    {
      id: 'seed-3',
      initials: 'SS',
      name: 'Sander S.',
      text: 'Sending photos of Semu shortly.',
      time: '1 min ago',
      read: true,
      color: '#7f9eab',
    },
  ]
}

function loadChatFromStorage() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    /* ignore */
  }
  return [
    { id: 'c1', role: 'them', text: 'Hi! Rex had a great walk this morning.', ts: '09:12' },
    { id: 'c2', role: 'me', text: 'Wonderful—thanks for the update!', ts: '09:15' },
  ]
}

function petTypeIcon(type) {
  const t = String(type || '').toLowerCase()
  if (t === 'cat') return faCat
  if (t === 'dog') return faDog
  return faPaw
}

function DashboardPage({
  currentUser,
  animals,
  onRefresh,
  onNavigate,
  onLogout,
  apiBaseUrl,
  token,
  availableSitterCount = 0,
  mySitterProfile = null,
}) {
  const [section, setSection] = useState('overview')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [animalType, setAnimalType] = useState('dog')
  const [age, setAge] = useState('')
  const [notes, setNotes] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [goodWithAnimals, setGoodWithAnimals] = useState(false)
  const [goodWithChildren, setGoodWithChildren] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [inbox, setInbox] = useState(loadInboxFromStorage)
  const [chatThread, setChatThread] = useState(loadChatFromStorage)
  const [chatInput, setChatInput] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(inbox))
    } catch {
      /* ignore */
    }
  }, [inbox])

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatThread))
    } catch {
      /* ignore */
    }
  }, [chatThread])

  const unreadCount = useMemo(() => inbox.filter((m) => !m.read).length, [inbox])

  const markMessageRead = useCallback((id) => {
    setInbox((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)))
  }, [])

  useEffect(() => {
    if (section === 'pets' && onRefresh) onRefresh()
  }, [section, onRefresh])

  const displayPets = animals.map((animal, index) => ({
    ...animal,
    accent: ['#f2b3b0', '#c6b6cf', '#97b1a6'][index % 3],
    icon: animal.animalType?.toLowerCase() || 'pet',
  }))

  const assetOrigin = useMemo(
    () => String(apiBaseUrl || '').replace(/\/?api\/?$/i, ''),
    [apiBaseUrl],
  )

  const heroPetPhoto =
    displayPets[0]?.photo != null && String(displayPets[0].photo).trim() !== ''
      ? `${assetOrigin}/uploads/${displayPets[0].photo}`
      : null

  const firstName = currentUser.fullName?.split(' ')[0] || 'there'
  const initials = currentUser.fullName
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'PP'

  const resetForm = () => {
    setName('')
    setAnimalType('dog')
    setAge('')
    setNotes('')
    setPhotoFile(null)
    setGoodWithAnimals(false)
    setGoodWithChildren(false)
    setErrorMessage('')
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setErrorMessage('Please enter a name for your pet.')
      return
    }
    setIsSubmitting(true)
    setErrorMessage('')
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('animalType', animalType)
      if (age) formData.append('age', age)
      formData.append('notes', notes)
      formData.append('goodWithAnimals', goodWithAnimals ? '1' : '0')
      formData.append('goodWithChildren', goodWithChildren ? '1' : '0')
      if (photoFile) {
        formData.append('photo', photoFile)
      }

      const response = await fetch(`${apiBaseUrl}/animals`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || errData.message || 'Failed to add pet')
      }
      resetForm()
      setIsModalOpen(false)
      if (onRefresh) onRefresh()
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred while adding your pet. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChatSend = (e) => {
    e.preventDefault()
    const text = chatInput.trim()
    if (!text) return
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setChatThread((prev) => [...prev, { id: `c-${Date.now()}`, role: 'me', text, ts }])
    setChatInput('')
  }

  const navBtn = (key, label, icon) => (
    <button
      key={key}
      type="button"
      className={section === key ? 'active' : ''}
      onClick={() => setSection(key)}
    >
      <FontAwesomeIcon icon={icon} className="owner-nav-icon" fixedWidth />
      {label}
    </button>
  )

  const sectionTitle = {
    overview: 'Overview',
    pets: 'My pets',
    bookings: 'Bookings',
    messages: 'Messages',
    profile: 'Profile & settings',
  }

  const profilePhotoUrl = mySitterProfile?.photo
    ? `${assetOrigin}/uploads/profiles/${mySitterProfile.photo}`
    : null

  const mockOwnerReviews = 12
  const mockOwnerRating = 4.9

  return (
    <section className="owner-dashboard">
      <aside className="owner-sidebar">
        <div className="owner-brand" aria-label="Loomahoidja">
          <img src={logoMarkUrl} className="owner-brand-logo" alt="" width={44} height={36} decoding="async" />
        </div>

        <div className="owner-profile">
          <strong>{currentUser.fullName || 'Pet owner'}</strong>
          <span>Pet owner</span>
        </div>

        <nav className="owner-side-nav" aria-label="Owner dashboard">
          {navBtn('overview', 'Overview', faChartLine)}
          {navBtn('pets', 'My pets', faPaw)}
          {navBtn('bookings', 'Bookings', faCalendarCheck)}
          {navBtn('messages', 'Messages', faEnvelope)}
          {navBtn('profile', 'Profile settings', faUserGear)}
        </nav>
      </aside>

      <div className="owner-workspace">
        <header className="owner-topbar">
          <div className="owner-topbar-brand">
            <img
              src={logoMarkUrl}
              className="owner-topbar-logo"
              alt=""
              width={36}
              height={30}
              decoding="async"
            />
            <button type="button" onClick={() => onNavigate('home')}>
              Find a sitter
            </button>
            <button type="button" className="active">
              Dashboard
            </button>
            <button
              type="button"
              className="message-tab"
              onClick={() => setSection('messages')}
            >
              Messages
              {unreadCount > 0 ? (
                <span aria-label={`${unreadCount} unread messages`}>{unreadCount}</span>
              ) : null}
            </button>
          </div>
          <button className="owner-avatar-button" type="button" onClick={onLogout}>
            {initials}
          </button>
        </header>

        <div className="owner-content">
          {section !== 'profile' && (
            <div className="owner-welcome">
              <h1>
                {section === 'overview' ? `Welcome back, ${firstName}` : sectionTitle[section]}
              </h1>
              <p>
                {section === 'overview'
                  ? "Here's what's happening with your pets"
                  : section === 'pets'
                    ? 'All pets registered on your account.'
                    : section === 'bookings'
                      ? 'Active and upcoming bookings (demo data).'
                      : section === 'messages'
                        ? 'Chat preview with your sitters. Live updates will replace this in a future release.'
                        : ''}
              </p>
            </div>
          )}

          {section === 'overview' && (
            <>
              <div className="owner-stats-grid">
                <article className="owner-stat-card">
                  <span className="owner-stat-icon calendar-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faCalendarDays} />
                  </span>
                  <span className="owner-stat-label">Active bookings</span>
                  <strong>2</strong>
                  <small>1 upcoming</small>
                </article>
                <article className="owner-stat-card highlighted">
                  <span className="owner-stat-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faPaw} />
                  </span>
                  <span className="owner-stat-label">My pets</span>
                  <strong>{displayPets.length}</strong>
                  <small>all registered</small>
                </article>
                <article className="owner-stat-card">
                  <span className="owner-stat-icon success" aria-hidden="true">
                    <FontAwesomeIcon icon={faUserCheck} />
                  </span>
                  <span className="owner-stat-label">Sitters listed</span>
                  <strong>{availableSitterCount}</strong>
                  <small>on the platform</small>
                </article>
                <article className="owner-stat-card">
                  <span className="owner-stat-icon outline" aria-hidden="true">
                    <FontAwesomeIcon icon={faEnvelopeOpenText} />
                  </span>
                  <span className="owner-stat-label">Unread messages</span>
                  <strong>{unreadCount}</strong>
                  <small>from sitters</small>
                </article>
              </div>

              <section className="owner-bookings-section">
                <h2>Current and upcoming bookings</h2>
                <div className="owner-bookings-table">
                  <div className="owner-table-row owner-table-head">
                    <span>Pet</span>
                    <span>Sitter</span>
                    <span>Dates</span>
                    <span>Price</span>
                    <span>Status</span>
                    <span></span>
                  </div>
                  {bookings.map((booking) => (
                    <div className="owner-table-row" key={`${booking.pet}-${booking.dates}`}>
                      <span>{booking.pet}</span>
                      <span>{booking.sitter}</span>
                      <span>{booking.dates}</span>
                      <span>{booking.price}</span>
                      <span>
                        <mark className={`status-pill ${booking.status.toLowerCase()}`}>{booking.status}</mark>
                      </span>
                      <button type="button">{booking.status === 'Completed' ? 'Review' : 'View'}</button>
                    </div>
                  ))}
                </div>
              </section>

              <div className="owner-bottom-grid">
                <section className="owner-card owner-pets-panel">
                  <h2>My pets</h2>
                  <div className="owner-pet-list">
                    {displayPets.length === 0 ? (
                      <p className="owner-empty-hint">
                        No pets yet. Open <strong>My pets</strong> in the sidebar or use the button below.
                      </p>
                    ) : (
                      displayPets.map((pet) => (
                        <article className="owner-pet-row" key={pet.id || pet.name}>
                          <span className="pet-thumb pet-thumb--icon" style={{ backgroundColor: pet.accent }}>
                            <FontAwesomeIcon icon={petTypeIcon(pet.animalType)} />
                          </span>
                          <div>
                            <strong>{pet.name}</strong>
                            <span>
                              {pet.animalType || 'Pet'} •{' '}
                              {pet.age != null && pet.age !== '' ? `${pet.age} years` : 'Unknown age'}
                            </span>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                  <button className="add-pet-button" type="button" onClick={() => setIsModalOpen(true)}>
                    + Add new pet
                  </button>
                </section>

                <section className="owner-card owner-messages-panel">
                  <h2>Recent messages</h2>
                  <div className="owner-message-list">
                    {inbox.length === 0 ? (
                      <p className="owner-empty-hint">No messages yet.</p>
                    ) : (
                      inbox.map((message) => (
                        <article
                          className={`owner-message-row ${!message.read ? 'owner-message-row--unread' : ''}`}
                          key={message.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => markMessageRead(message.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              markMessageRead(message.id)
                            }
                          }}
                        >
                          <span className="message-avatar" style={{ backgroundColor: message.color }}>
                            {message.initials}
                          </span>
                          <div>
                            <strong>{message.name}</strong>
                            <span>{message.text}</span>
                          </div>
                          <time>{message.time}</time>
                          {!message.read ? <span className="owner-message-dot" aria-hidden="true" /> : null}
                        </article>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </>
          )}

          {section === 'pets' && (
            <div className="owner-section-panel">
              <section className="owner-card owner-pets-panel owner-pets-panel--full">
                <h2>My pets</h2>
                <p className="typeBodySmall textMuted owner-section-lead">
                  Data is loaded from the server while you are signed in as an owner. If the list is empty, check your
                  API URL and token.
                </p>
                <div className="owner-pet-list">
                  {displayPets.length === 0 ? (
                    <p className="owner-empty-hint">No pets yet. Add your first one with the button below.</p>
                  ) : (
                    displayPets.map((pet) => (
                      <article className="owner-pet-row" key={pet.id || pet.name}>
                        <span className="pet-thumb pet-thumb--icon" style={{ backgroundColor: pet.accent }}>
                          <FontAwesomeIcon icon={petTypeIcon(pet.animalType)} />
                        </span>
                        <div>
                          <strong>{pet.name}</strong>
                          <span>
                            {pet.animalType || 'Pet'} •{' '}
                            {pet.age != null && pet.age !== '' ? `${pet.age} years` : 'Unknown age'}
                          </span>
                          {pet.notes ? <span className="owner-pet-notes">{pet.notes}</span> : null}
                        </div>
                      </article>
                    ))
                  )}
                </div>
                <button className="add-pet-button" type="button" onClick={() => setIsModalOpen(true)}>
                  + Add new pet
                </button>
              </section>
            </div>
          )}

          {section === 'bookings' && (
            <section className="owner-bookings-section owner-bookings-section--solo">
              <h2>Current and upcoming bookings</h2>
              <div className="owner-bookings-table">
                <div className="owner-table-row owner-table-head">
                  <span>Pet</span>
                  <span>Sitter</span>
                  <span>Dates</span>
                  <span>Price</span>
                  <span>Status</span>
                  <span></span>
                </div>
                {bookings.map((booking) => (
                  <div className="owner-table-row" key={`${booking.pet}-${booking.dates}`}>
                    <span>{booking.pet}</span>
                    <span>{booking.sitter}</span>
                    <span>{booking.dates}</span>
                    <span>{booking.price}</span>
                    <span>
                      <mark className={`status-pill ${booking.status.toLowerCase()}`}>{booking.status}</mark>
                    </span>
                    <button type="button">{booking.status === 'Completed' ? 'Review' : 'View'}</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {section === 'messages' && (
            <section className="owner-card owner-chat-card">
              <div className="owner-chat-header">
                <h2>Messages</h2>
                <p className="owner-chat-subtitle typeBodySmall textMuted">
                  Mock chat with Leelo L. — real-time messaging will use websockets later.
                </p>
              </div>
              {unreadCount > 0 ? (
                <p className="owner-inbox-hint">
                  {unreadCount} unread notification{unreadCount === 1 ? '' : 's'} in the overview list — open a row
                  there to mark as read.
                </p>
              ) : null}
              <div className="owner-chat-thread" role="log" aria-live="polite">
                {chatThread.map((m) => (
                  <div
                    key={m.id}
                    className={`owner-chat-bubble owner-chat-bubble--${m.role === 'me' ? 'me' : 'them'}`}
                  >
                    <p className="owner-chat-text">{m.text}</p>
                    <time className="owner-chat-ts">{m.ts}</time>
                  </div>
                ))}
              </div>
              <form className="owner-chat-form" onSubmit={handleChatSend}>
                <input
                  className="input owner-chat-input"
                  type="text"
                  placeholder="Type a message…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  autoComplete="off"
                />
                <button type="submit" className="btn btnPrimary owner-chat-send" aria-label="Send">
                  <FontAwesomeIcon icon={faPaperPlane} />
                </button>
              </form>
            </section>
          )}

          {section === 'profile' && (
            <>
              <section className="owner-public-profile-hero cardSurface">
                <div className="owner-public-profile-heroInner">
                  {heroPetPhoto ? (
                    <img className="owner-public-profile-photo" src={heroPetPhoto} alt="" />
                  ) : (
                    <div className="owner-public-profile-fallback" aria-hidden="true">
                      {initials}
                    </div>
                  )}
                  <div className="owner-public-profile-text">
                    <h1 className="typeH1 owner-public-profile-name">{currentUser.fullName || 'Pet owner'}</h1>
                    <p className="typeBodySmall textMuted">
                      {currentUser.city || '—'} • Member since 2026
                    </p>
                    <div className="tagRow">
                      {displayPets.length === 0 ? (
                        <span className="tag">No pets yet</span>
                      ) : (
                        displayPets.map((p) => (
                          <span key={p.id || p.name} className="tag">
                            {p.name} ({p.animalType || 'pet'})
                          </span>
                        ))
                      )}
                    </div>
                    <p className="typeBody">
                      ★ {mockOwnerRating.toFixed(1)} • {mockOwnerReviews} reviews
                    </p>
                  </div>
                  <div className="owner-public-profile-aside">
                    <Button variant="primary" className="btnWide" type="button" onClick={() => onNavigate('home')}>
                      Find a sitter
                    </Button>
                    <Button variant="outline" className="btnWide" type="button" onClick={() => setSection('messages')}>
                      Send message
                    </Button>
                  </div>
                </div>
              </section>

              <div className="owner-profile-columns">
                <div className="owner-profile-main-col">
                  <section className="cardSurface blockPad">
                    <h2 className="typeH2">About</h2>
                    <p className="typeBody">
                      Pet owner on Loomahoidja. Keep your pet profiles up to date so sitters know how to give the best
                      care.
                    </p>
                  </section>
                  <section className="cardSurface blockPad">
                    <h2 className="typeH2">My pets</h2>
                    {displayPets.length === 0 ? (
                      <p className="typeBody textMuted">No pets registered yet.</p>
                    ) : (
                      <ul className="typeBody listPlain">
                        {displayPets.map((p) => (
                          <li key={p.id || p.name}>
                            <strong>{p.name}</strong> — {p.animalType || 'Pet'}
                            {p.age != null && p.age !== '' ? `, age ${p.age}` : ''}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
                <aside className="owner-profile-aside-col">
                  <section className="owner-card">
                    <h2>Account</h2>
                    <dl className="owner-dl">
                      <dt>Name</dt>
                      <dd>{currentUser.fullName || '—'}</dd>
                      <dt>Email</dt>
                      <dd>{currentUser.email || '—'}</dd>
                      <dt>Phone</dt>
                      <dd>{currentUser.phone || '—'}</dd>
                      <dt>City</dt>
                      <dd>{currentUser.city || '—'}</dd>
                      <dt>Role</dt>
                      <dd>{currentUser.role || '—'}</dd>
                    </dl>
                    <p className="typeBodySmall textMuted">Profile editing will be added in a future update.</p>
                  </section>

                  <section className="owner-card">
                    <h2>Sitter profile</h2>
                    {mySitterProfile ? (
                      <>
                        <p className="typeBody">
                          You also have a sitter profile on this account. Open the public page or manage it from the
                          sitter dashboard / Dev tools.
                        </p>
                        <dl className="owner-dl">
                          <dt>Hourly rate</dt>
                          <dd>{mySitterProfile.hourlyRate != null ? `${mySitterProfile.hourlyRate} €` : '—'}</dd>
                          <dt>City</dt>
                          <dd>{mySitterProfile.city || '—'}</dd>
                          <dt>Bio</dt>
                          <dd>{mySitterProfile.bio || '—'}</dd>
                        </dl>
                        {profilePhotoUrl ? (
                          <img className="owner-profile-thumb" src={profilePhotoUrl} alt="" />
                        ) : null}
                        <div className="owner-profile-actions">
                          <Link className="btn btnPrimary" to={`/sitter/${mySitterProfile.id}`}>
                            View public profile
                          </Link>
                        </div>
                      </>
                    ) : (
                      <p className="typeBody">
                        No sitter profile on this account. That is expected if you registered only as an owner. Create a
                        sitter profile by signing up as a sitter or using Dev tools.
                      </p>
                    )}
                  </section>
                </aside>
              </div>
            </>
          )}
        </div>
      </div>
      {isModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-container">
            <header className="custom-modal-header">
              <h3>Add new pet</h3>
              <button
                type="button"
                className="close-x"
                onClick={() => {
                  setIsModalOpen(false)
                  resetForm()
                }}
              >
                &times;
              </button>
            </header>

            <form onSubmit={handleFormSubmit} className="custom-modal-form">
              {errorMessage && <div className="form-error-banner">{errorMessage}</div>}

              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Pet name"
                  required
                />
              </div>

              <div className="form-grid-two">
                <div className="form-group">
                  <label>Type</label>
                  <select value={animalType} onChange={(e) => setAnimalType(e.target.value)}>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="rodent">Rodent</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" min="0" value={age} onChange={(e) => setAge(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="form-group">
                <label>Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} />
              </div>
              <div className="form-checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={goodWithAnimals}
                    onChange={(e) => setGoodWithAnimals(e.target.checked)}
                  />
                  Gets along with other animals
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={goodWithChildren}
                    onChange={(e) => setGoodWithChildren(e.target.checked)}
                  />
                  Gets along with children
                </label>
              </div>
              <div className="form-group">
                <label>Additional notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special care instructions or preferences?"
                  rows="5"
                />
              </div>
              <footer className="custom-modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={isSubmitting}
                  onClick={() => {
                    setIsModalOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  Add pet
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default DashboardPage
