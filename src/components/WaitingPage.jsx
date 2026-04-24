import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiClock, 
  FiUser, 
  FiUserX, 
  FiLogOut, 
  FiAlertCircle, 
  FiCheckCircle,
  FiZap
} from 'react-icons/fi'
import { API_URL } from '../config/api.js'

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
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-inter">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-900 rounded-full animate-spin mb-6"></div>
        <p className="text-blue-900 font-bold animate-pulse uppercase tracking-widest text-xs">Updating queue status...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-200 p-4 md:p-8 font-inter flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-500 text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100"
          >
            <FiLogOut /> Logout
          </button>
        </div>
        
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
            Queue Status
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-blue-900 mb-4 leading-tight">
            Welcome, {participant?.name}
          </h1>
          {participant?.queue_position && (
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-900 text-white rounded-2xl shadow-lg shadow-blue-900/20">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Your Position:</span>
              <span className="text-xl font-black tabular-nums">#{participant.queue_position}</span>
            </div>
          )}
        </div>
        
        {!match ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {participant?.selection_status === 'not_selected' ? (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-sm">
                  <FiUserX />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-blue-900">Not Selected This Round</h2>
                  <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">Sorry, you were not selected for this testing session. Don't worry - you'll be considered for future rounds!</p>
                </div>
                <div className="inline-block px-4 py-2 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-red-100">
                  Status: Not Selected
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-blue-500/10 rounded-3xl animate-ping duration-[3000ms]"></div>
                  <div className="relative w-24 h-24 bg-blue-50 text-blue-900 rounded-3xl flex items-center justify-center text-4xl shadow-sm border border-blue-100">
                    <FiClock className="animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-blue-900 tracking-tight">Waiting for Assignment</h2>
                  <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">We're selecting participants from the queue. You'll receive a notification when your test is ready.</p>
                </div>
                {participant?.queue_position ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-xs mx-auto">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Queue Status</p>
                    <p className="text-sm font-bold text-blue-900">Position <span className="text-blue-600">#{participant.queue_position}</span> active</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest">
                    <FiAlertCircle /> No active position
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-amber-400/20 animate-bounce">
                <FiZap className="fill-current" /> Test Assigned
              </div>
            </div>
            
            <div className="flex items-center gap-6 md:gap-10 relative">
              <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center text-2xl mx-auto border-2 border-white shadow-md">
                  <FiUser />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">You</p>
                  <h4 className="text-lg font-black text-blue-900 truncate">{participant?.name}</h4>
                </div>
              </div>
              
              <div className="w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center font-black text-sm border-4 border-slate-50 shadow-lg z-10 shrink-0">&</div>
              
              <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center text-2xl mx-auto border-2 border-white shadow-md">
                  <FiUser />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Partner</p>
                  <h4 className="text-lg font-black text-blue-900 truncate">{getOpponentName()}</h4>
                </div>
              </div>
            </div>
            
            <div className="text-center pt-6">
              {match.winner_id ? (
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-green-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-green-500/20">
                  <FiCheckCircle className="text-xl" /> Test Completed
                </div>
              ) : (
                <div className={`inline-flex items-center gap-3 px-8 py-4 bg-white border-2 rounded-2xl font-black uppercase tracking-widest text-sm shadow-md transition-all ${
                  match.status === 'in_progress' 
                    ? 'border-amber-400 text-amber-500 animate-pulse' 
                    : 'border-blue-900 text-blue-900'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${match.status === 'in_progress' ? 'bg-amber-400' : 'bg-blue-900'} animate-pulse`}></span>
                  {match.status === 'in_progress' ? 'Test in progress' : 'Scheduled - Waiting to start'}
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
