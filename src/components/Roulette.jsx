import { useState, useEffect } from 'react'
import './Roulette.css'

function Roulette({ participants, onComplete }) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [selectedParticipants, setSelectedParticipants] = useState([])
  const [matches, setMatches] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [allComplete, setAllComplete] = useState(false)

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#FF69B4', '#00CED1', '#FF7F50', '#9370DB'
  ]

  useEffect(() => {
    if (!participants || participants.length === 0) {
      onComplete()
      return
    }
  }, [participants, onComplete])

  const remainingParticipants = participants.filter(p => 
    !selectedParticipants.find(sp => sp.id === p.id)
  )

  const rollWheel = () => {
    if (spinning || remainingParticipants.length === 0) {
      return
    }

    setSpinning(true)
    setSelectedParticipant(null)
    setShowResult(false)

    const spins = 5 + Math.floor(Math.random() * 3)
    const randomOffset = Math.floor(Math.random() * 360)
    const totalRotation = spins * 360 + randomOffset
    setRotation(prev => prev + totalRotation)

    const segmentAngle = 360 / remainingParticipants.length
    setTimeout(() => {
      const finalRotation = rotation + totalRotation
      const normalizedRotation = finalRotation % 360
      const selectedIndex = Math.floor((360 - normalizedRotation) % 360 / segmentAngle)
      const player = remainingParticipants[selectedIndex]
      setSelectedParticipant(player)
      setShowResult(true)
      setSpinning(false)

      setSelectedParticipants(prev => [...prev, player])

      const newSelected = [...selectedParticipants, player]
      if (newSelected.length % 2 === 0) {
        const lastTwo = newSelected.slice(-2)
        setMatches(prev => [...prev, { player1: lastTwo[0], player2: lastTwo[1] }])
      }

      if (newSelected.length === participants.length) {
        setAllComplete(true)
      }
    }, 4000)
  }

  const nextSpin = () => {
    setShowResult(false)
    setSelectedParticipant(null)
  }

  const autoComplete = () => {
    const remaining = remainingParticipants
    const newSelected = [...selectedParticipants]
    const newMatches = [...matches]

    remaining.forEach(p => {
      newSelected.push(p)
    })

    for (let i = 0; i < newSelected.length; i += 2) {
      if (i + 1 < newSelected.length) {
        newMatches.push({ player1: newSelected[i], player2: newSelected[i + 1] })
      }
    }

    setSelectedParticipants(newSelected)
    setMatches(newMatches)
    setAllComplete(true)
    setShowResult(false)
    setSelectedParticipant(null)
  }

  const handleComplete = () => {
    onComplete()
  }

  const segmentAngle = remainingParticipants.length > 0 ? 360 / remainingParticipants.length : 0

  const gradientColors = remainingParticipants.map((_, index) => {
    const startAngle = (index / remainingParticipants.length) * 100
    const endAngle = ((index + 1) / remainingParticipants.length) * 100
    return `${colors[index % colors.length]} ${startAngle}% ${endAngle}%`
  }).join(', ')

  return (
    <div className="roulette-overlay">
      <button onClick={handleComplete} className="close-btn">×</button>
      <div className="roulette-container">
        <h2>Random Draw</h2>
        <p className="subtitle">Selected: {selectedParticipants.length} / {participants.length}</p>

        <div className="matches-list">
          {matches.map((match, index) => (
            <div key={index} className="match-chip">
              Match {index + 1}: {match.player1.name} vs {match.player2.name}
            </div>
          ))}
        </div>

        <div className="roulette-wheel-container">
          <div className="wheel-pointer"></div>
          {remainingParticipants.length > 0 ? (
            <div 
              className="wheel" 
              style={{ 
                background: `conic-gradient(${gradientColors})`,
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
              }}
            >
              {remainingParticipants.map((p, index) => (
                <div 
                  key={p.id} 
                  className="wheel-segment"
                  style={{ 
                    transform: `rotate(${segmentAngle * index}deg)`,
                    transformOrigin: '50% 50%'
                  }}
                >
                  <span 
                    className="segment-text"
                    style={{ 
                      transform: `rotate(${segmentAngle / 2}deg) translateY(-120px)`
                    }}
                  >
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="wheel wheel-empty"></div>
          )}
          <div className="wheel-center-circle">
            <div className="wheel-center-inner"></div>
          </div>
        </div>

        {showResult && selectedParticipant && (
          <div className="match-result">
            <div className="match-card">
              <h3>Selected: {selectedParticipant.name}</h3>
            </div>
            {!allComplete && (
              <button onClick={nextSpin} className="next-match-btn">
                Next Spin
              </button>
            )}
          </div>
        )}

        {!showResult && !allComplete && remainingParticipants.length > 0 && (
          <div className="button-group">
            <button 
              onClick={rollWheel} 
              disabled={spinning}
              className="roll-btn"
            >
              {spinning ? 'Rolling...' : '🎲 SPIN'}
            </button>
            <button 
              onClick={autoComplete} 
              disabled={spinning}
              className="auto-complete-btn"
            >
              Auto Complete All
            </button>
          </div>
        )}

        {allComplete && (
          <div className="complete-section">
            <p className="complete-text">✨ All matches generated!</p>
            <button onClick={handleComplete} className="continue-btn">
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Roulette
