import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_URL } from '../config/api.js'
import './ParticipantLogin.css'

function ParticipantLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/participants/email/${encodeURIComponent(email)}`)
      const data = await response.json()

      if (response.ok) {
        // Save participant data to localStorage
        localStorage.setItem('participant', JSON.stringify(data))
        // Redirect to waiting page
        navigate('/waiting')
      } else {
        setError(data.error || 'Email not found. Please register first.')
      }
    } catch (err) {
      setError('Failed to connect to server')
    }
  }

  return (
    <div className="participant-login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <span className="login-badge">Tournament Portal</span>
          <h1>Check Your Match</h1>
          <p>Enter your email to see your tournament status</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="form-input"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-btn">Check Queue Status</button>
        </form>
        
        <p className="register-link">
          Not registered? <Link to="/">Register here</Link>
        </p>
      </div>
    </div>
  )
}

export default ParticipantLogin
