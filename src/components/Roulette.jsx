import { useState, useEffect } from 'react'
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
    <div className="relative w-full h-full bg-white p-8 md:p-12 flex flex-col items-center animate-in fade-in zoom-in duration-500">
      <button 
        onClick={handleComplete} 
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all text-2xl font-light"
      >
        ×
      </button>

      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-blue-900 mb-2 tracking-tight">Random Draw</h2>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <p className="text-xs font-bold text-blue-900 uppercase tracking-widest">
            Selected: <span className="text-blue-600">{selectedParticipants.length}</span> / {participants.length}
          </p>
        </div>
      </div>

      <div className="w-full max-w-2xl flex flex-wrap justify-center gap-3 mb-12 overflow-y-auto max-h-32 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        {matches.length === 0 ? (
          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">No pairs generated yet</p>
        ) : (
          matches.map((match, index) => (
            <div key={index} className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-[10px] font-bold text-blue-900 flex items-center gap-3">
              <span className="w-5 h-5 bg-blue-900 text-white rounded-md flex items-center justify-center text-[8px]">{index + 1}</span>
              {match.player1.name} <span className="text-slate-300">and</span> {match.player2.name}
            </div>
          ))
        )}
      </div>

      <div className="relative mb-12 select-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-8 h-10 bg-blue-900 z-20 shadow-xl" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>
        
        <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full border-[12px] border-white shadow-2xl overflow-hidden bg-slate-100">
          {remainingParticipants.length > 0 ? (
            <div 
              className="w-full h-full rounded-full transition-all"
              style={{ 
                background: `conic-gradient(${gradientColors})`,
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
              }}
            >
              {remainingParticipants.map((p, index) => (
                <div 
                  key={p.id} 
                  className="absolute inset-0 origin-center"
                  style={{ 
                    transform: `rotate(${segmentAngle * index}deg)`
                  }}
                >
                  <span 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 text-[10px] font-black text-white uppercase tracking-tighter text-center w-full drop-shadow-md"
                    style={{ 
                      transform: `rotate(${segmentAngle / 2}deg) translateY(-140px)`
                    }}
                  >
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <FiCheckCircle className="text-6xl opacity-20" />
            </div>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center z-10 p-2">
              <div className="w-full h-full bg-blue-900 rounded-full border-4 border-slate-50 flex items-center justify-center text-white text-xs font-black">
                UPF
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-sm:max-w-[280px] max-w-sm">
        {showResult && selectedParticipant ? (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="bg-blue-900 text-white p-6 rounded-3xl shadow-xl shadow-blue-900/20 text-center scale-110 border-4 border-white">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Participant Selected</p>
              <h3 className="text-2xl font-black truncate">{selectedParticipant.name}</h3>
            </div>
            {!allComplete && (
              <button 
                onClick={nextSpin} 
                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-blue-900 font-bold rounded-2xl transition-all"
              >
                Next Spin
              </button>
            )}
          </div>
        ) : !allComplete && remainingParticipants.length > 0 ? (
          <div className="flex flex-col gap-4">
            <button 
              onClick={rollWheel} 
              disabled={spinning}
              className="w-full py-5 bg-blue-900 hover:bg-blue-800 text-white font-black text-xl rounded-2xl shadow-xl shadow-blue-900/20 transition-all disabled:opacity-50 disabled:translate-y-0 transform hover:-translate-y-1"
            >
              {spinning ? 'ROLLING...' : '🎲 SPIN WHEEL'}
            </button>
            <button 
              onClick={autoComplete} 
              disabled={spinning}
              className="w-full py-4 text-slate-400 hover:text-blue-900 text-xs font-bold uppercase tracking-widest transition-all"
            >
              Auto Complete All
            </button>
          </div>
        ) : allComplete && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-green-500 text-white p-6 rounded-3xl shadow-xl shadow-green-500/20 text-center border-4 border-white">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1">Success</p>
              <h3 className="text-xl font-black">All matches generated!</h3>
            </div>
            <button 
              onClick={handleComplete} 
              className="w-full py-5 bg-blue-900 hover:bg-blue-800 text-white font-black text-xl rounded-2xl shadow-xl shadow-blue-900/20 transition-all transform hover:-translate-y-1"
            >
              CONTINUE
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Roulette
