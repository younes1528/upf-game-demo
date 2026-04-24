import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiPieChart, 
  FiUsers, 
  FiActivity, 
  FiAward, 
  FiLogOut, 
  FiExternalLink,
  FiUser,
  FiMail,
  FiTrash2,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiPlay,
  FiSettings,
  FiAlertCircle
} from 'react-icons/fi'
import { API_URL } from '../config/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import Roulette from './Roulette.jsx'

function Dashboard() {
  const navigate = useNavigate()
  const { admin, logout, loading: authLoading } = useAuth()
  const [participants, setParticipants] = useState([])
  const [matches, setMatches] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
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
          setActiveTab('matches')
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
        setActiveTab('matches')
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
    const nextScheduledIndex = matches.findIndex((m, idx) => 
      idx > currentMatchIndex && m.status === 'scheduled'
    )

    if (nextScheduledIndex !== -1) {
      await startMatch(matches[nextScheduledIndex].id)
      setCurrentMatchIndex(nextScheduledIndex)
    } else if (currentMatchIndex < matches.length - 1) {
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
    return <div className="loading-screen">
      <div className="loader"></div>
      <p>Loading Competition Data...</p>
    </div>
  }

  return (
    <div className="flex h-screen bg-slate-50 font-inter overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-50">
        <div className="p-8 pb-6 flex items-center gap-4">
          <div className="w-11 h-11 bg-blue-900 rounded-xl flex items-center justify-center font-extrabold text-lg text-white shadow-lg shadow-blue-900/20">
            UPF
          </div>
          <h3 className="text-xl font-bold text-blue-900 tracking-tight">Game Panel</h3>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: FiPieChart },
            { id: 'participants', label: 'Participants', icon: FiUsers },
            { id: 'matches', label: 'Matches', icon: FiActivity },
            { id: 'leaderboard', label: 'Leaderboard', icon: FiAward },
          ].map((item) => (
            <button 
              key={item.id}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-900 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-blue-900'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="text-xl" /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-3.5 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
            <span className="text-xs font-bold text-blue-900 truncate">{admin?.username}</span>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-100 bg-white text-red-500 text-sm font-bold hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 px-8 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-40">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Dashboard / <span className="text-blue-900">{activeTab}</span>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-100 transition-colors"
          >
            <FiExternalLink /> Public Page
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto space-y-10">
            {activeTab === 'overview' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Total Participants', value: participants.length, footer: `${confirmedParticipants.length} Confirmed`, icon: FiUsers },
                    { label: 'Active Matches', value: matches.filter(m => m.status === 'in_progress').length, footer: `${matches.length} Total Pairs`, icon: FiActivity },
                    { label: 'Matches Completed', value: matches.filter(m => m.winner_id).length, footer: `${matches.length > 0 ? Math.round((matches.filter(m => m.winner_id).length / matches.length) * 100) : 0}% Complete`, icon: FiAward },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-blue-50 text-blue-900 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          <stat.icon />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                          <div className="text-3xl font-bold text-blue-900">{stat.value}</div>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        {stat.footer}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <FiSettings className="text-blue-900 text-xl" />
                      <h3 className="text-xl font-bold text-blue-900">Match Generation</h3>
                    </div>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">Prepare the next round of competition by generating test pairs for confirmed participants.</p>
                    
                    <div className="grid grid-cols-2 gap-8 mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Max Capacity</label>
                        <input 
                          type="number" 
                          value={maxParticipants}
                          onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 2)}
                          className="w-full p-3 bg-white border-2 border-slate-100 rounded-xl font-bold text-blue-900 focus:outline-none focus:border-blue-900 transition-all"
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Options</span>
                        <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-blue-900">
                          <input 
                            type="checkbox" 
                            checked={useRouletteAnimation}
                            onChange={(e) => setUseRouletteAnimation(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-200 text-blue-900 focus:ring-blue-900"
                          />
                          Roulette Animation
                        </label>
                      </div>
                    </div>
                    
                    <button 
                      className="w-full py-4 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                      onClick={generateMatches}
                      disabled={confirmedParticipants.length < 2}
                    >
                      Generate Test Pairs
                    </button>
                  </div>

                  <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <FiAlertCircle className="text-red-500 text-xl" />
                      <h3 className="text-xl font-bold text-blue-900">System Controls</h3>
                    </div>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">Emergency controls to clear session data. These actions are permanent.</p>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={clearMatches} className="py-3.5 px-4 bg-white border border-red-100 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors">Clear Matches</button>
                        <button onClick={resetLeaderboard} className="py-3.5 px-4 bg-white border border-red-100 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-colors">Reset Standings</button>
                      </div>
                      <button onClick={resetParticipants} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all">Reset All Participants</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'participants' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-blue-900 tracking-tight">Participant Management</h2>
                  <span className="px-4 py-1 bg-blue-50 text-blue-900 text-xs font-bold rounded-full">{participants.length} Total</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Name</th>
                        <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Email</th>
                        <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {participants.length === 0 ? (
                        <tr><td colSpan="4" className="px-8 py-12 text-center text-slate-400 font-medium">No participants found</td></tr>
                      ) : (
                        participants.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center font-bold text-blue-900">
                                  <FiUser />
                                </div>
                                <span className="font-bold text-blue-900">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                              <div className="flex items-center gap-2">
                                <FiMail className="text-slate-400" /> {p.email}
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                                p.confirmed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {p.confirmed ? 'Confirmed' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {!p.confirmed && (
                                  <button onClick={() => confirmParticipant(p.id)} className="w-9 h-9 flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm">
                                    <FiCheck />
                                  </button>
                                )}
                                <button onClick={() => deleteParticipant(p.id)} className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'matches' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                {!showMatches || matches.length === 0 ? (
                  <div className="bg-white p-20 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8">
                      <FiActivity />
                    </div>
                    <h2 className="text-2xl font-bold text-blue-900 mb-4 tracking-tight">No Matches Generated</h2>
                    <p className="text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed text-sm">Go to Overview to generate test pairs for confirmed participants.</p>
                    <button onClick={() => setActiveTab('overview')} className="px-10 py-4 bg-blue-900 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all">Go to Overview</button>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto space-y-10">
                    <div className="bg-white px-10 py-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <button onClick={prevMatch} disabled={currentMatchIndex === 0} className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-100 bg-white hover:bg-blue-900 hover:text-white hover:border-blue-900 disabled:opacity-20 transition-all text-xl">
                        <FiChevronLeft />
                      </button>
                      <div className="text-center">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-1 block">Active Pair {currentMatchIndex + 1} of {matches.length}</span>
                        <div className={`inline-block px-3 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md ${
                          matches[currentMatchIndex].status === 'in_progress' ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {matches[currentMatchIndex].status}
                        </div>
                      </div>
                      <button onClick={nextMatch} disabled={currentMatchIndex === matches.length - 1} className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-100 bg-white hover:bg-blue-900 hover:text-white hover:border-blue-900 disabled:opacity-20 transition-all text-xl">
                        <FiChevronRight />
                      </button>
                    </div>

                    <div className="flex items-center gap-12 py-10 relative">
                      {[
                        { id: matches[currentMatchIndex].participant1_id, name: matches[currentMatchIndex].participant1_name },
                        { id: matches[currentMatchIndex].participant2_id, name: matches[currentMatchIndex].participant2_name }
                      ].map((p, idx) => (
                        <div key={idx} className={`flex-1 bg-white p-12 rounded-3xl border border-slate-200 shadow-xl transition-all duration-500 ${
                          matches[currentMatchIndex].winner_id === p.id ? 'ring-4 ring-blue-400 shadow-blue-900/10 scale-105' : ''
                        }`}>
                          <div className="w-24 h-24 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center text-4xl font-black mb-8 mx-auto border-4 border-white shadow-lg">
                            <FiUser />
                          </div>
                          <h4 className="text-2xl font-black text-blue-900 text-center tracking-tight truncate">{p.name}</h4>
                          {matches[currentMatchIndex].winner_id === p.id && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg">SELECTED</div>
                          )}
                        </div>
                      ))}
                      
                      <div className="absolute left-1/2 -translate-x-1/2 w-20 h-20 bg-blue-900 text-white rounded-full flex items-center justify-center text-2xl font-black border-[8px] border-slate-50 shadow-2xl z-10">&</div>
                    </div>

                    <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center">
                      {matches[currentMatchIndex].status === 'scheduled' && (
                        <button 
                          onClick={() => startMatch(matches[currentMatchIndex].id)}
                          className="px-16 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-blue-600/20 transform hover:-translate-y-1 transition-all flex items-center gap-4 mx-auto"
                        >
                          <FiPlay className="fill-current" /> Start Session
                        </button>
                      )}

                      {matches[currentMatchIndex].status === 'in_progress' && (
                        <div className="space-y-10">
                          <div className="max-w-xs mx-auto space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points to Award</label>
                            <input
                              type="number"
                              value={testScore}
                              onChange={(e) => setTestScore(parseInt(e.target.value) || 1)}
                              className="w-full py-4 text-center text-4xl font-black text-blue-900 border-4 border-slate-50 rounded-2xl focus:outline-none focus:border-blue-900 transition-all"
                            />
                          </div>
                          <div className="flex gap-4 max-w-md mx-auto">
                            {[
                              { id: matches[currentMatchIndex].participant1_id, name: matches[currentMatchIndex].participant1_name },
                              { id: matches[currentMatchIndex].participant2_id, name: matches[currentMatchIndex].participant2_name }
                            ].map((p, idx) => (
                              <button 
                                key={idx}
                                onClick={() => {
                                  setWinner(matches[currentMatchIndex].id, p.id, testScore)
                                  nextMatch()
                                }}
                                className="flex-1 py-4 bg-slate-50 hover:bg-blue-600 hover:text-white border-2 border-slate-100 rounded-xl font-bold text-blue-900 transition-all text-sm truncate px-4"
                              >
                                Score for {p.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-blue-900 tracking-tight">Live Standings</h2>
                  <button onClick={resetLeaderboard} className="px-4 py-2 bg-red-50 text-red-500 text-[10px] font-extrabold uppercase tracking-widest rounded-lg hover:bg-red-500 hover:text-white transition-all">Reset Standings</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest w-24">Rank</th>
                        <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Participant</th>
                        <th className="px-8 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Total Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {leaderboard.length === 0 ? (
                        <tr><td colSpan="3" className="px-8 py-12 text-center text-slate-400 font-medium">No scores recorded yet</td></tr>
                      ) : (
                        leaderboard.map((entry, index) => (
                          <tr key={entry.id} className={`hover:bg-slate-50/30 transition-colors ${index < 3 ? 'bg-blue-50/20' : ''}`}>
                            <td className="px-8 py-5">
                              <div className={`w-10 h-10 flex items-center justify-center rounded-xl text-lg font-black ${
                                index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-slate-100 text-slate-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'
                              }`}>
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center font-bold text-blue-900 shadow-sm">
                                  {index === 0 ? <FiAward className="text-amber-500" /> : <FiUser />}
                                </div>
                                <span className="font-bold text-blue-900">{entry.name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-right font-black text-2xl text-blue-900 tabular-nums">
                              {entry.total_points}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showRoulette && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <Roulette 
              participants={participants.filter(p => p.confirmed)} 
              onComplete={handleRouletteComplete} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
