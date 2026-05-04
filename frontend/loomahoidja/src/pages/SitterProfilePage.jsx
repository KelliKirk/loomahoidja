import React, { useState } from 'react'

function SitterProfilePage({ sitter, onBack }) {
  if (!sitter) return null

  const name = sitter.User?.fullName || 'Sitter'
  const city = sitter.User?.city || sitter.city || 'Local area'
  const types = sitter.SitterAnimalTypes?.map((item) => item.animalType) || []
  const rate = sitter.hourlyRate || '15'
  const rating = '4.9'
  const reviewCount = 28
  const memberSince = 2026

  const [fromDate, setFromDate] = useState('April 14, 2026')
  const [toDate, setToDate] = useState('April 17, 2026')
  const [selectedPet, setSelectedPet] = useState('Rex (Dog)')

  const totalDays = 3
  const totalPrice = (totalDays * parseFloat(rate)).toFixed(2)

  // Sample reviews
  const reviews = [
    {
      id: 1,
      author: 'Mati K.',
      rating: 5.0,
      text: 'Leelo took amazing care of our dog. Very communicative and responsible. Highly recommend!',
    },
    {
      id: 2,
      author: 'Kati M.',
      rating: 4.7,
      text: 'Our cats were happy and well-fed. Will definitely book again next time.',
    },
  ]

  return (
    <section className="sitter-profile-page">
      <div className="profile-main">
        <div className="profile-left">
          {/* Avatar and Basic Info */}
          <div className="profile-intro">
            <div className="profile-avatar-xl">{name.slice(0, 2).toUpperCase()}</div>
            <div className="profile-intro-content">
              <h1 className="profile-name">{name}</h1>
              <p className="profile-location">{city} • Member since {memberSince}</p>
              <div className="profile-types">
                {types.map((type) => (
                  <span className="type-pill" key={type}>
                    {type}
                  </span>
                ))}
              </div>
              <div className="profile-rating">
                <span className="star">⭐ {rating}</span>
                <span className="review-count">• {reviewCount} reviews</span>
              </div>
            </div>
            <div className="profile-rate">
              <span className="rate-amount">{rate}€</span>
              <span className="rate-label">/hour</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            <button className="btn-book">Book now</button>
            <button className="btn-message">Send message</button>
          </div>

          {/* About Section */}
          <div className="profile-section">
            <h3 className="section-title">About</h3>
            <p className="section-text">
              {sitter.bio || 'Fifteen years of experience for dogs and cats of all sizes. I grew up on a farm and have always loved animals. I will treat your pet like family.'}
            </p>
          </div>

          {/* Animals I Care For */}
          <div className="profile-section">
            <h3 className="section-title">Animals I Care For</h3>
            <div className="animals-list">
              {types.length > 0 ? types.map((type) => (
                <span className="animal-item" key={type}>
                  {type}
                </span>
              )) : (
                <span className="animal-item">Dogs, Cats, Birds</span>
              )}
            </div>
          </div>

          {/* Home Details */}
          <div className="profile-section">
            <h3 className="section-title">Home Details</h3>
            <ul className="home-details">
              <li className="detail-item checked">
                <span className="check">✓</span>
                <span>Has children at home</span>
              </li>
              <li className="detail-item checked">
                <span className="check">✓</span>
                <span>Has other pets at home</span>
              </li>
              <li className="detail-item checked">
                <span className="check">✓</span>
                <span>Available on weekends and holidays</span>
              </li>
            </ul>
          </div>

          {/* Reviews Section */}
          <div className="profile-section">
            <h3 className="section-title">Reviews</h3>
            <div className="reviews-list">
              {reviews.map((review) => (
                <div className="review-card" key={review.id}>
                  <div className="review-header">
                    <strong className="review-author">{review.author}</strong>
                    <span className="review-rating">★ {review.rating}</span>
                  </div>
                  <p className="review-text">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <aside className="profile-right">
          <div className="booking-card">
            <h2 className="booking-title">Book {name.split(' ')[0]}</h2>

            {/* Date Range */}
            <div className="booking-section">
              <label className="booking-label">FROM</label>
              <input type="text" className="date-input" value={fromDate} />
              <label className="booking-label">TO</label>
              <input type="text" className="date-input" value={toDate} />
            </div>

            {/* Pet Selector */}
            <div className="booking-section">
              <label className="booking-label">Your Pet</label>
              <select className="pet-select" value={selectedPet} onChange={(e) => setSelectedPet(e.target.value)}>
                <option>Rex (Dog)</option>
                <option>Luna (Cat)</option>
                <option>Birdie (Bird)</option>
              </select>
            </div>

            {/* Price Calculation */}
            <div className="price-calculation">
              <div className="price-row">
                <span>{totalDays} days x {rate}€</span>
                <span className="price-amount">{totalPrice}€</span>
              </div>
            </div>

            {/* Request Booking Button */}
            <button className="btn-request-booking">Request booking</button>

            {/* Availability Calendar */}
            <div className="booking-section">
              <h3 className="booking-subtitle">Availability</h3>
              <div className="calendar">
                <div className="calendar-header">
                  <span>&lt;</span>
                  <span className="calendar-month">May 2026</span>
                  <span>&gt;</span>
                </div>
                <div className="calendar-weekdays">
                  <span>M</span>
                  <span>T</span>
                  <span>W</span>
                  <span>T</span>
                  <span>F</span>
                  <span>S</span>
                  <span>S</span>
                </div>
                <div className="calendar-grid">
                  <span className="day empty"></span>
                  <span className="day available">1</span>
                  <span className="day available">2</span>
                  <span className="day available">3</span>
                  <span className="day available">4</span>
                  <span className="day available">5</span>
                  <span className="day available">6</span>
                  <span className="day available">7</span>
                  <span className="day available">8</span>
                  <span className="day available">9</span>
                  <span className="day available">10</span>
                  <span className="day available">11</span>
                  <span className="day available">12</span>
                  <span className="day available">13</span>
                  <span className="day available">14</span>
                  <span className="day available">15</span>
                  <span className="day available">16</span>
                  <span className="day available">17</span>
                  <span className="day available">18</span>
                  <span className="day available">19</span>
                  <span className="day booked">20</span>
                  <span className="day available">21</span>
                  <span className="day available">22</span>
                  <span className="day available">23</span>
                  <span className="day available">24</span>
                  <span className="day available">25</span>
                  <span className="day available">26</span>
                  <span className="day available">27</span>
                  <span className="day today">28</span>
                  <span className="day available">29</span>
                  <span className="day available">30</span>
                  <span className="day available">31</span>
                </div>
                <div className="calendar-legend">
                  <span className="legend-item"><span className="legend-box available"></span> Available</span>
                  <span className="legend-item"><span className="legend-box booked"></span> Busy</span>
                  <span className="legend-item"><span className="legend-box today"></span> Today</span>
                </div>
              </div>
            </div>

            {/* Location Map */}
            <div className="booking-section">
              <h3 className="booking-subtitle">Location</h3>
              <div className="location-map">
                <p>📍 Approximate location - exact address shared after booking</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default SitterProfilePage
