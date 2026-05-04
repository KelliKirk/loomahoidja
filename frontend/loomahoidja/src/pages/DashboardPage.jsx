import React from 'react'
import PetCard from '../components/PetCard.jsx'

function DashboardPage({ currentUser, animals, onRefresh, availableSitterCount }) {
  return (
    <section className="dashboard-panel">
      <div className="dashboard-header">
        <span className="eyebrow">Owner dashboard</span>
        <h2>Welcome back, {currentUser.fullName}</h2>
        <p>Manage pets, bookings, and messages from one place.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{animals.length}</span>
          <span className="stat-label">My pets</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{availableSitterCount}</span>
          <span className="stat-label">Available sitters</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{currentUser.city || '—'}</span>
          <span className="stat-label">Location</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-title">
            <h3>Pets</h3>
            <button onClick={onRefresh}>Refresh</button>
          </div>
          {animals.length === 0 ? (
            <p className="muted">No pets added yet. You can add them through the owner tools in the backend for now.</p>
          ) : (
            <div className="animal-grid">
              {animals.map((animal) => (
                <PetCard key={animal.id} animal={animal} />
              ))}
            </div>
          )}
        </div>
        <div className="dashboard-card">
          <h3>Upcoming bookings</h3>
          <ul className="booking-list">
            <li>Sample booking widget placeholder for future booking flow.</li>
            <li>Messages will appear here once chat integration is added.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
