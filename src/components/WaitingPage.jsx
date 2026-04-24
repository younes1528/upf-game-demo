import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api.js'
import './WaitingPage.css'

function WaitingPage() {
  const navigate = useNavigate()
  const [participant, setParticipant] = useState(null)
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notificationPlayed, setNotificationPlayed] = useState(false)

  useEffect(() => {
    // Get participant from localStorage
    const savedParticipant = localStorage.getItem('participant')
    if (!savedParticipant) {
      navigate('/')
      return
    }

    const participantData = JSON.parse(savedParticipant)
    setParticipant(participantData)

    // Function to check for match
    const checkMatch = async () => {
      try {
        const response = await fetch(`${API_URL}/api/matches`)
        const matches = await response.json()

        const myMatch = matches.find(m =>
          m.participant1_id === participantData.id ||
          m.participant2_id === participantData.id
        )

        // Always update match state (not just when first found)
        setMatch(myMatch)

        // Play notification sound only once when match is first assigned
        if (myMatch && !match && !notificationPlayed) {
          playNotificationSound()
        }
      } catch (err) {
        console.error('Error checking match:', err)
      }
    }

    // Check immediately
    checkMatch().then(() => setLoading(false))

    // Poll every 5 seconds
    const interval = setInterval(checkMatch, 5000)

    return () => clearInterval(interval)
  }, [navigate, match])

  const playNotificationSound = () => {
    if (!notificationPlayed) {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)

      setNotificationPlayed(true)
    }
  }

  const getOpponentName = () => {
    if (!match || !participant) return 'Unknown'
    
    if (match.participant1_id === participant.id) {
      return match.participant2_name || 'Opponent'
    } else {
      return match.participant1_name || 'Opponent'
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('participant')
    navigate('/')
  }

  if (loading) {
    return <div className="waiting-loading">Loading...</div>
  }

  return (
    <div className="waiting-container">
      <div className="waiting-wrapper">
        <button onClick={handleLogout} className="logout-btn">Logout</button>
        
        <div className="waiting-header">
          <span className="status-badge">Queue Status</span>
          <h1>Welcome, {participant?.name}</h1>
          {participant?.queue_position && (
            <div className="queue-position-badge">
              <span className="queue-label">Your Queue Position:</span>
              <span className="queue-number">#{participant.queue_position}</span>
            </div>
          )}
        </div>
        
        {!match ? (
          <div className="waiting-content">
            {participant?.selection_status === 'not_selected' ? (
              <>
                <div className="waiting-icon-wrapper">
                  <div className="waiting-icon">😔</div>
                </div>
                <h2>Not Selected This Round</h2>
                <p>Sorry, you were not selected for this testing session. Don't worry - you'll be considered for future rounds!</p>
                <div className="queue-info not-selected">
                  <p className="queue-info-text">
                    Your status: <strong>Not Selected</strong>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="waiting-icon-wrapper">
                  <div className="waiting-icon">⏳</div>
                </div>
                <h2>Waiting for your test assignment</h2>
                <p>We're currently selecting participants from the queue. You'll receive a notification when your test is ready.</p>
                {participant?.queue_position ? (
                  <div className="queue-info">
                    <p className="queue-info-text">
                      You are position <strong>#{participant.queue_position}</strong> in the queue
                    </p>
                  </div>
                ) : (
                  <div className="queue-info">
                    <p className="queue-info-text">
                      You are not currently in the active queue
                    </p>
                  </div>
                )}
                <div className="pulse-indicator"></div>
              </>
            )}
          </div>
        ) : (
          <div className="match-content">
            <div className="match-header">
              <span className="match-badge">Test Pair Assigned</span>
            </div>
            
            <div className="match-details">
              <div className="participant-card">
                <div className="participant-label">You</div>
                <div className="participant-name">{participant?.name}</div>
              </div>
              
              <div className="vs-divider">VS</div>
              
              <div className="participant-card">
                <div className="participant-label">Testing Partner</div>
                <div className="participant-name">{getOpponentName()}</div>
              </div>
            </div>
            
            <div className="match-status-section">
              {match.winner_id ? (
                <div className="winner-announcement">
                  <div className="winner-badge">
                    Test Completed
                  </div>
                </div>
              ) : match.status === 'in_progress' ? (
                <div className="status-indicator in-progress">
                  <span className="status-dot"></span>
                  Test in progress
                </div>
              ) : match.status === 'scheduled' ? (
                <div className="status-indicator scheduled">
                  <span className="status-dot"></span>
                  Test scheduled - waiting to start
                </div>
              ) : (
                <div className="status-indicator pending">
                  <span className="status-dot"></span>
                  Test status: {match.status || 'pending'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WaitingPage
