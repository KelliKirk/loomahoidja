import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarCheck,
  faCalendarDays,
  faCat,
  faDog,
  faEnvelope,
  faEnvelopeOpenText,
  faHouse,
  faPaw,
  faUserCheck,
  faUserGear,
} from '@fortawesome/free-solid-svg-icons'

const INBOX_STORAGE_KEY = 'loom_owner_inbox_v1'

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
      text: 'Rex on hea poiss!',
      time: '17 min tagasi',
      read: true,
      color: '#9fb9aa',
    },
    {
      id: 'seed-2',
      initials: 'RS',
      name: 'Rasmus S.',
      text: 'Millal teie reis on?',
      time: '7 min tagasi',
      read: true,
      color: '#e9b8b8',
    },
    {
      id: 'seed-3',
      initials: 'SS',
      name: 'Sander S.',
      text: 'Saadan Semust pildid',
      time: '1 min tagasi',
      read: true,
      color: '#7f9eab',
    },
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

  useEffect(() => {
    try {
      localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(inbox))
    } catch {
      /* ignore */
    }
  }, [inbox])

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
    overview: 'Ülevaade',
    pets: 'Minu lemmikloomad',
    bookings: 'Broneeringud',
    messages: 'Sõnumid',
    profile: 'Profiil ja seaded',
  }

  const profilePhotoUrl = mySitterProfile?.photo
    ? `${String(apiBaseUrl || '').replace(/\/?api\/?$/i, '')}/uploads/profiles/${mySitterProfile.photo}`
    : null

  return (
    <section className="owner-dashboard">
      <aside className="owner-sidebar">
        <div className="owner-brand" aria-label="Loomahoidja">
          <span className="owner-brand-mark">L</span>
        </div>

        <div className="owner-profile">
          <strong>{currentUser.fullName || 'Peeter Pakiraam'}</strong>
          <span>Pet owner</span>
        </div>

        <nav className="owner-side-nav" aria-label="Owner dashboard">
          {navBtn('overview', 'Overview', faHouse)}
          {navBtn('pets', 'My pets', faPaw)}
          {navBtn('bookings', 'Bookings', faCalendarCheck)}
          {navBtn('messages', 'Messages', faEnvelope)}
          {navBtn('profile', 'Profile settings', faUserGear)}
        </nav>
      </aside>

      <div className="owner-workspace">
        <header className="owner-topbar">
          <div className="owner-topbar-brand">
            <span className="owner-logo-cloud">L</span>
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
                <span aria-label={`${unreadCount} lugemata sõnumit`}>{unreadCount}</span>
              ) : null}
            </button>
          </div>
          <button className="owner-avatar-button" type="button" onClick={onLogout}>
            {initials}
          </button>
        </header>

        <div className="owner-content">
          <div className="owner-welcome">
            <h1>
              {section === 'overview' ? `Welcome back, ${firstName}` : sectionTitle[section]}
            </h1>
            <p>
              {section === 'overview'
                ? "Here's what's happening with your pets"
                : section === 'pets'
                  ? 'Siin on kõik sinu registreeritud lemmikloomad.'
                  : section === 'bookings'
                    ? 'Aktiivsed ja tulevased broneeringud (demo).'
                    : section === 'messages'
                      ? 'Vestlused hoidjatega. Täpp üleval näitab ainult lugemata sõnumeid.'
                      : 'Konto andmed ja hoidja profiil (kui oled selle loonud).'}
            </p>
          </div>

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
                      <p className="owner-empty-hint">Lemmikloomi pole veel lisatud. Kasuta „My pets“ või nuppu all.</p>
                    ) : (
                      displayPets.map((pet) => (
                        <article className="owner-pet-row" key={pet.id || pet.name}>
                          <span className="pet-thumb pet-thumb--icon" style={{ backgroundColor: pet.accent }}>
                            <FontAwesomeIcon icon={petTypeIcon(pet.animalType)} />
                          </span>
                          <div>
                            <strong>{pet.name}</strong>
                            <span>
                              {pet.animalType || 'Pet'} • {pet.age != null && pet.age !== '' ? `${pet.age} years` : 'Unknown age'}
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
                      <p className="owner-empty-hint">Sõnumeid pole.</p>
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
                  Andmed tulevad serverist (pead olema sisse logitud omanikuna). Kui nimekiri on tühi, kontrolli, et
                  API ja token töötavad.
                </p>
                <div className="owner-pet-list">
                  {displayPets.length === 0 ? (
                    <p className="owner-empty-hint">Ühtegi lemmiklooma pole. Lisa esimene all oleva nupuga.</p>
                  ) : (
                    displayPets.map((pet) => (
                      <article className="owner-pet-row" key={pet.id || pet.name}>
                        <span className="pet-thumb pet-thumb--icon" style={{ backgroundColor: pet.accent }}>
                          <FontAwesomeIcon icon={petTypeIcon(pet.animalType)} />
                        </span>
                        <div>
                          <strong>{pet.name}</strong>
                          <span>
                            {pet.animalType || 'Pet'} • {pet.age != null && pet.age !== '' ? `${pet.age} years` : 'Unknown age'}
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
            <section className="owner-card owner-messages-panel owner-messages-panel--full">
              <h2>Messages</h2>
              {unreadCount > 0 ? (
                <p className="owner-inbox-hint">{unreadCount} lugemata sõnum — kliki real, et märkida loetuks.</p>
              ) : (
                <p className="owner-inbox-hint">Kõik sõnumid on loetud. Uue sõnumi korral ilmub üleval täpp.</p>
              )}
              <div className="owner-message-list">
                {inbox.length === 0 ? (
                  <p className="owner-empty-hint">Sõnumeid pole.</p>
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
              <p className="owner-mock-note typeBodySmall textMuted">
                Demo: uued sõnumid saab hiljem ühendada API-ga. Praegu saad lugemata olekut testida, muutes brauseri
                localStorage võtit <code className="mono">{INBOX_STORAGE_KEY}</code> (märgi mõni kirje{' '}
                <code className="mono">read: false</code>).
              </p>
            </section>
          )}

          {section === 'profile' && (
            <div className="owner-profile-settings">
              <section className="owner-card">
                <h2>Omaniku konto</h2>
                <dl className="owner-dl">
                  <dt>Nimi</dt>
                  <dd>{currentUser.fullName || '—'}</dd>
                  <dt>E-post</dt>
                  <dd>{currentUser.email || '—'}</dd>
                  <dt>Telefon</dt>
                  <dd>{currentUser.phone || '—'}</dd>
                  <dt>Linn</dt>
                  <dd>{currentUser.city || '—'}</dd>
                  <dt>Roll</dt>
                  <dd>{currentUser.role || '—'}</dd>
                </dl>
                <p className="typeBodySmall textMuted">
                  Andmete muutmine läbi vormi tuleb hiljem; praegu kuvatakse sisselogitud kasutaja andmed.
                </p>
              </section>

              <section className="owner-card">
                <h2>Hoidja profiil</h2>
                {mySitterProfile ? (
                  <>
                    <p className="typeBody">
                      Sul on loodud hoidja profiil (sama konto). Ava avalik leht või muuda profiili DevTools / hoidja
                      töölaua kaudu.
                    </p>
                    <dl className="owner-dl">
                      <dt>Tunnitasu</dt>
                      <dd>{mySitterProfile.hourlyRate != null ? `${mySitterProfile.hourlyRate} €` : '—'}</dd>
                      <dt>Linn</dt>
                      <dd>{mySitterProfile.city || '—'}</dd>
                      <dt>Bio</dt>
                      <dd>{mySitterProfile.bio || '—'}</dd>
                    </dl>
                    {profilePhotoUrl ? (
                      <img className="owner-profile-thumb" src={profilePhotoUrl} alt="" />
                    ) : null}
                    <div className="owner-profile-actions">
                      <Link className="btn btnPrimary" to={`/sitter/${mySitterProfile.id}`}>
                        Vaata avalikku profiili
                      </Link>
                    </div>
                  </>
                ) : (
                  <p className="typeBody">
                    Sellel kontol pole hoidja profiili. Kui oled registreerunud ainult omanikuna, on see oodatud
                    olek. Hoidja profiili saad luua registreerudes hoidjana või DevTools kaudu.
                  </p>
                )}
              </section>
            </div>
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
                <label>Nimi *</label>
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
