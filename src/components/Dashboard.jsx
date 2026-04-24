import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import Roulette from './Roulette.jsx'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const { admin, logout, loading: authLoading } = useAuth()
  const [participants, setParticipants] = useState([])
  const [matches, setMatches] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(() => {
    const saved = localStorage.getItem('dashboard_currentMatchIndex')
    return saved ? parseInt(saved) : 0
  })
  const [showMatches, setShowMatches] = useState(() => {
    const saved = localStorage.getItem('dashboard_showMatches')
    return saved ? JSON.parse(saved) : false
  })
  const [showRoulette, setShowRoulette] = useState(() => {
    const saved = localStorage.getItem('dashboard_showRoulette')
    return saved ? JSON.parse(saved) : false
  })
  const [loading, setLoading] = useState(false)
  const [useRouletteAnimation, setUseRouletteAnimation] = useState(() => {
    const saved = localStorage.getItem('dashboard_useRouletteAnimation')
    return saved !== null ? JSON.parse(saved) : true
  })
  const [points, setPoints] = useState(1)
  const [testScore, setTestScore] = useState(1)
  const [maxParticipants, setMaxParticipants] = useState(10)

  useEffect(() => {
    if (authLoading) return

    if (!admin) {
      navigate('/admin/login')
      return
    }
    fetchParticipants()
    fetchMatches()
    fetchLeaderboard()
  }, [admin, navigate, authLoading])

  useEffect(() => {
    if (!admin || authLoading) return
    
    const interval = setInterval(() => {
      fetchParticipants()
      fetchLeaderboard()
    }, 5000)

    return () => clearInterval(interval)
  }, [admin, authLoading])

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`${API_URL}/api/participants`)
      const data = await response.json()
      setParticipants(data)
    } catch (err) {
      console.error('Failed to fetch participants:', err)
    }
  }

  const fetchMatches = async () => {
    try {
      const response = await fetch(`${API_URL}/api/matches`)
      const data = await response.json()
      setMatches(data)
    } catch (err) {
      console.error('Failed to fetch matches:', err)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/leaderboard`)
      const data = await response.json()
      setLeaderboard(data)
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
    }
  }

  const confirmParticipant = async (id) => {
    try {
      await fetch(`${API_URL}/api/participants/${id}/confirm`, {
        method: 'PUT',
      })
      fetchParticipants()
    } catch (err) {
      console.error('Failed to confirm participant:', err)
    }
  }

  const deleteParticipant = async (id) => {
    try {
      await fetch(`${API_URL}/api/participants/${id}`, {
        method: 'DELETE',
      })
      fetchParticipants()
    } catch (err) {
      console.error('Failed to delete participant:', err)
    }
  }

  const resetParticipants = async () => {
    if (window.confirm('Are you sure you want to reset all participants?')) {
      try {
        await fetch(`${API_URL}/api/participants`, {
          method: 'DELETE',
        })
        fetchParticipants()
      } catch (err) {
        console.error('Failed to reset participants:', err)
      }
    }
  }

  const generateMatches = async () => {
    const confirmedParticipants = participants.filter(p => p.confirmed)
    if (confirmedParticipants.length < 2) {
      alert('Need at least 2 confirmed participants')
      return
    }
    
    if (maxParticipants < 2) {
      alert('Max participants must be at least 2')
      return
    }
    
    if (useRouletteAnimation) {
      setShowRoulette(true)
    } else {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/matches/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ maxParticipants }),
        })
        if (response.ok) {
          await fetchMatches()
          setShowMatches(true)
          setCurrentMatchIndex(0)
        } else {
          const data = await response.json()
          alert(data.error || 'Failed to generate test pairs')
        }
      } catch (err) {
        console.error('Failed to generate matches:', err)
        alert('Failed to generate test pairs')
      }
      setLoading(false)
    }
  }

  const handleRouletteComplete = async () => {
    setShowRoulette(false)
    try {
      const response = await fetch(`${API_URL}/api/matches/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxParticipants }),
      })
      if (response.ok) {
        await fetchMatches()
        setShowMatches(true)
        setCurrentMatchIndex(0)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to generate test pairs')
      }
    } catch (err) {
      console.error('Failed to generate matches:', err)
      alert('Failed to generate test pairs')
    }
    setLoading(false)
  }

  const clearMatches = async () => {
    try {
      await fetch(`${API_URL}/api/matches`, {
        method: 'DELETE',
      })
      setMatches([])
      setShowMatches(false)
      setCurrentMatchIndex(0)
    } catch (err) {
      console.error('Failed to clear matches:', err)
    }
  }

  const resetLeaderboard = async () => {
    if (window.confirm('Are you sure you want to reset the leaderboard? This will clear all match results.')) {
      try {
        await fetch(`${API_URL}/api/matches`, {
          method: 'DELETE',
        })
        fetchLeaderboard()
        fetchMatches()
        setShowMatches(false)
        setCurrentMatchIndex(0)
      } catch (err) {
        console.error('Failed to reset leaderboard:', err)
      }
    }
  }

  const startMatch = async (matchId) => {
    try {
      await fetch(`${API_URL}/api/matches/${matchId}/start`, {
        method: 'PUT',
      })
      await fetchMatches()
    } catch (err) {
      console.error('Failed to start match:', err)
    }
  }

  const setWinner = async (matchId, winnerId, points) => {
    try {
      await fetch(`${API_URL}/api/matches/${matchId}/winner`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ winner_id: winnerId, points: parseInt(points) }),
      })
      await fetchMatches()
      await fetchLeaderboard()
    } catch (err) {
      console.error('Failed to set winner:', err)
    }
  }

  const nextMatch = async () => {
    // Find the next scheduled match
    const nextScheduledIndex = matches.findIndex((m, idx) => 
      idx > currentMatchIndex && m.status === 'scheduled'
    )

    if (nextScheduledIndex !== -1) {
      // Start the next scheduled match
      await startMatch(matches[nextScheduledIndex].id)
      setCurrentMatchIndex(nextScheduledIndex)
    } else if (currentMatchIndex < matches.length - 1) {
      // If no more scheduled matches, just move to next index
      setCurrentMatchIndex(currentMatchIndex + 1)
    }
  }

  const prevMatch = () => {
    if (currentMatchIndex > 0) {
      setCurrentMatchIndex(currentMatchIndex - 1)
    }
  }

  const confirmedParticipants = participants.filter(p => p.confirmed)
  const unconfirmedParticipants = participants.filter(p => !p.confirmed)

  if (authLoading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Competition Dashboard</h1>
        <div className="header-actions">
          <span className="admin-info">Admin: {admin?.username}</span>
          <button onClick={clearMatches} disabled={matches.length === 0} className="clear-matches-btn">Clear All Matches</button>
          <button onClick={() => navigate('/')} className="back-btn">Back to Registration</button>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Participants Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Participants ({confirmedParticipants.length} confirmed)</h2>
            <button onClick={resetParticipants} className="reset-btn">Reset All</button>
          </div>
          <div className="participants-list">
            <h3>Unconfirmed</h3>
            {unconfirmedParticipants.length === 0 ? (
              <p className="no-data">No unconfirmed participants</p>
            ) : (
              unconfirmedParticipants.map(p => (
                <div key={p.id} className="participant-item">
                  <span>{p.name} ({p.email})</span>
                  <div className="participant-actions">
                    <button onClick={() => confirmParticipant(p.id)} className="confirm-btn">Confirm</button>
                    <button onClick={() => deleteParticipant(p.id)} className="delete-btn">Delete</button>
                  </div>
                </div>
              ))
            )}
            <h3>Confirmed</h3>
            {confirmedParticipants.length === 0 ? (
              <p className="no-data">No confirmed participants</p>
            ) : (
              confirmedParticipants.map(p => (
                <div key={p.id} className="participant-item confirmed">
                  <span>{p.name} ({p.email})</span>
                  <button onClick={() => deleteParticipant(p.id)} className="delete-btn">Delete</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Match Controls Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Match Controls</h2>
            <button onClick={clearMatches} disabled={matches.length === 0} className="reset-btn">Reset Matches</button>
          </div>
          <div className="match-controls">
            <label className="roulette-toggle">
              <input
                type="checkbox"
                checked={useRouletteAnimation}
                onChange={(e) => setUseRouletteAnimation(e.target.checked)}
              />
              <span>Show Roulette Animation</span>
            </label>
            <div className="max-participants-input">
              <label htmlFor="maxParticipants">Max Participants:</label>
              <input
                type="number"
                id="maxParticipants"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 10)}
                min="2"
                max={confirmedParticipants.length}
                className="max-participants-field"
              />
            </div>
            <button 
              onClick={generateMatches} 
              disabled={loading || confirmedParticipants.length < 2}
              className="generate-btn"
            >
              {loading ? 'Generating...' : 'Generate Test Pairs'}
            </button>
          </div>
          <p className="info-text">Need at least 2 confirmed participants to generate test pairs</p>
        </div>

        {/* Leaderboard Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Leaderboard</h2>
            <button onClick={resetLeaderboard} disabled={matches.length === 0} className="reset-btn">Reset</button>
          </div>
          {leaderboard.length === 0 ? (
            <p className="no-data">No data yet</p>
          ) : (
            <div className="leaderboard">
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className="leaderboard-item">
                  <span className="rank">{index + 1}.</span>
                  <span className="name">{entry.name}</span>
                  <span className="points">{entry.total_points} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Test Pair Display */}
      {showMatches && matches.length > 0 && (
        <div className="match-display-section">
          <h2>Test Pair {currentMatchIndex + 1} of {matches.length}</h2>
          <div className="match-card">
            <div className="participant-side">
              <h3>{matches[currentMatchIndex].participant1_name}</h3>
              {matches[currentMatchIndex].winner_id === matches[currentMatchIndex].participant1_id && (
                <span className="winner-badge">WINNER</span>
              )}
            </div>
            <div className="vs">VS</div>
            <div className="participant-side">
              <h3>{matches[currentMatchIndex].participant2_name}</h3>
              {matches[currentMatchIndex].winner_id === matches[currentMatchIndex].participant2_id && (
                <span className="winner-badge">WINNER</span>
              )}
            </div>
          </div>

          {matches[currentMatchIndex].status === 'scheduled' && (
            <div className="match-actions">
              <button 
                onClick={() => startMatch(matches[currentMatchIndex].id)}
                className="start-match-btn"
              >
                Start Test
              </button>
            </div>
          )}

          {matches[currentMatchIndex].status === 'in_progress' && (
            <div className="winner-selection">
              <h3>Test Completion</h3>
              <div className="points-input">
                <label htmlFor="points">Test Score:</label>
                <input
                  type="number"
                  id="points"
                  value={testScore}
                  onChange={(e) => setTestScore(parseInt(e.target.value) || 1)}
                  min="1"
                  className="points-field"
                />
              </div>
              <div className="winner-buttons">
                <button 
                  onClick={() => {
                    setWinner(matches[currentMatchIndex].id, matches[currentMatchIndex].participant1_id, testScore)
                    nextMatch()
                  }}
                  className="winner-btn"
                >
                  Finish Test
                </button>
              </div>
            </div>
          )}

          <div className="match-navigation">
            <button onClick={prevMatch} disabled={currentMatchIndex === 0} className="nav-btn">Previous</button>
            <span>{currentMatchIndex + 1} / {matches.length}</span>
            <button onClick={nextMatch} disabled={currentMatchIndex === matches.length - 1} className="nav-btn">Next</button>
          </div>
        </div>
      )}
      
      {showRoulette && (
        <Roulette 
          participants={participants.filter(p => p.confirmed)} 
          onComplete={handleRouletteComplete} 
        />
      )}
    </div>
  )
}

export default Dashboard
