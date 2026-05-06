import React, { useState } from 'react'

const bookings = [
  { pet: 'Rex', sitter: 'Leelo Lameuss', dates: 'Apr 14-Apr 17', price: '25.50 EUR', status: 'Confirmed' },
  { pet: 'Miisu', sitter: 'Rasmus Sigma', dates: 'May 15-May 22', price: '70.00 EUR', status: 'Pending' },
  { pet: 'Semu', sitter: 'Sander Skibidi-Saabas', dates: 'Feb 14-Feb 15', price: '14.00 EUR', status: 'Completed' },
]

const messages = [
  { initials: 'LL', name: 'Leelo L.', text: 'Rex on hea poiss!', time: '17 min ago', color: '#9fb9aa' },
  { initials: 'RS', name: 'Rasmus S.', text: 'Millal teie reis on?', time: '7 min ago', color: '#e9b8b8' },
  { initials: 'SS', name: 'Sander S.', text: 'Saadan Semust pildid', time: '1 m ago', color: '#7f9eab' },
]

function DashboardPage({ currentUser, animals, onRefresh, onNavigate, onLogout, apiBaseUrl, token }) {

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [animalType, setAnimalType] = useState('Dog')
  const [age, setAge] = useState('')
  const [notes, setNotes] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [goodWithAnimals, setGoodWithAnimals] = useState(false)
  const [goodWithChildren, setGoodWithChildren] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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
        throw new Error('Failed to add pet')
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
          <button className="active" type="button"><span>▥</span>Overview</button>
          <button type="button"><span>♣</span>My pets</button>
          <button type="button"><span>▣</span>Bookings</button>
          <button type="button"><span>●</span>Messages</button>
          <button type="button"><span>⚙</span>Profile settings</button>
        </nav>
      </aside>

      <div className="owner-workspace">
        <header className="owner-topbar">
          <div className="owner-topbar-brand">
            <span className="owner-logo-cloud">L</span>
            <button type="button" onClick={() => onNavigate('home')}>Find a sitter</button>
            <button className="active" type="button">Dashboard</button>
            <button type="button" className="message-tab">Messages <span>3</span></button>
          </div>
          <button className="owner-avatar-button" type="button" onClick={onLogout}>{initials}</button>
        </header>

        <div className="owner-content">
          <div className="owner-welcome">
            <h1>Welcome back, {firstName}</h1>
            <p>Here's what's happening with your pets</p>
          </div>

          <div className="owner-stats-grid">
            <article className="owner-stat-card">
              <span className="owner-stat-icon calendar-icon" aria-hidden="true">▣</span>
              <span className="owner-stat-label">Active bookings</span>
              <strong>2</strong>
              <small>1 upcoming</small>
            </article>
            <article className="owner-stat-card highlighted">
              <span className="owner-stat-icon" aria-hidden="true">♣</span>
              <span className="owner-stat-label">My pets</span>
              <strong>{displayPets.length}</strong>
              <small>all registered</small>
            </article>
            <article className="owner-stat-card">
              <span className="owner-stat-icon success" aria-hidden="true">✓</span>
              <span className="owner-stat-label">Total bookings</span>
              <strong>12</strong>
              <small>since joining</small>
            </article>
            <article className="owner-stat-card">
              <span className="owner-stat-icon outline" aria-hidden="true">○</span>
              <span className="owner-stat-label">Unread messages</span>
              <strong>3</strong>
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
                  <span><mark className={`status-pill ${booking.status.toLowerCase()}`}>{booking.status}</mark></span>
                  <button type="button">{booking.status === 'Completed' ? 'Review' : 'View'}</button>
                </div>
              ))}
            </div>
          </section>

          <div className="owner-bottom-grid">
            <section className="owner-card owner-pets-panel">
              <h2>My pets</h2>
              <div className="owner-pet-list">
                {displayPets.map((pet) => (
                  <article className="owner-pet-row" key={pet.id || pet.name}>
                    <span className="pet-thumb" style={{ backgroundColor: pet.accent }}>
                      {pet.icon?.includes('cat') ? 'C' : 'D'}
                    </span>
                    <div>
                      <strong>{pet.name}</strong>
                      <span>{pet.animalType || 'Pet'} • {pet.age ? `${pet.age} years` : 'Unknown age'}</span>
                    </div>
                  </article>
                ))}
              </div>
              <button className="add-pet-button" type="button" onClick={() => setIsModalOpen(true)}>+ Add new pet</button>
            </section>

            <section className="owner-card owner-messages-panel">
              <h2>Recent messages</h2>
              <div className="owner-message-list">
                {messages.map((message) => (
                  <article className="owner-message-row" key={message.name}>
                    <span className="message-avatar" style={{ backgroundColor: message.color }}>{message.initials}</span>
                    <div>
                      <strong>{message.name}</strong>
                      <span>{message.text}</span>
                    </div>
                    <time>{message.time}</time>
                    <i aria-hidden="true"></i>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-container">
            <header className="custom-modal-header">
              <h3>Add new pet</h3>
              <button type="button" className="close-x" onClick={() => { setIsModalOpen(false); resetForm(); }}>&times;</button>
            </header>

            <form onSubmit={handleFormSubmit} className="custom-modal-form">
              {errorMessage && <div className="form-error-banner">{errorMessage}</div>}

              <div className="form-group">
                <label>Nimi *</label>
                <input type='text' value={name} onChange={(e) => setName(e.target.value)} placeholder="Pet name" required />
              </div>

              <div className='form-grid-two'>
                <div className="form-group">
                  <label>Type</label>
                  <select value={animalType} onChange={(e) => setAnimalType(e.target.value)}>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="rodent">Rodent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className='form-group'>
                  <label>Age</label>
                  <input type="number" min="0" value={age} onChange={(e) => setAge(e.target.value)} placeholder='0' />
                </div>
              </div>
              <div className="form-group">
                <label>Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} />
              </div>
              <div className='form-checkbox-group'>
                <label className='checkbox-label'>
                  <input type="checkbox" checked={goodWithAnimals} onChange={(e) => setGoodWithAnimals(e.target.checked)} />
                  Gets along with other animals
                </label>
                <label className='checkbox-label'>
                  <input type="checkbox" checked={goodWithChildren} onChange={(e) => setGoodWithChildren(e.target.checked)} />
                  Gets along with children
                </label>
              </div>
              <div className='form-group'>
                <label>Additional notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special care instructions or preferences?" rows="5" />
              </div>
              <footer className="custom-modal-footer">
                <button type="button" className='btn-secondary' disabled={isSubmitting} onClick={() => { setIsModalOpen(false); resetForm(); }} >Cancel</button>
                <button type="submit" className='btn-primary' disabled={isSubmitting}>Add pet</button>
              </footer>
            </form >
          </div >
        </div >
      )
      }
    </section >
  )
}

export default DashboardPage
