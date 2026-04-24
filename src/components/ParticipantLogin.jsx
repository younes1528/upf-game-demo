import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiMail, FiArrowRight, FiAlertCircle } from 'react-icons/fi'

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
        localStorage.setItem('participant', JSON.stringify(data))
        navigate('/waiting')
      } else {
        setError(data.error || 'Email not found. Please register first.')
      }
    } catch (err) {
      setError('Failed to connect to server')
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-200 flex items-center justify-center p-4 font-inter">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-slate-200 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 text-[10px] font-extrabold uppercase tracking-widest rounded-full mb-4">
            Tournament Portal
          </span>
          <h1 className="text-3xl font-black text-blue-900 mb-2 leading-tight">
            Check Status
          </h1>
          <p className="text-sm text-slate-500">
            Enter your email to see your tournament status
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <FiMail className="absolute left-4 text-slate-400 text-lg" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full pl-12 pr-4 py-4 text-slate-900 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-2">
              <FiAlertCircle className="shrink-0" /> {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full py-5 bg-blue-900 hover:bg-blue-800 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-900/20 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            Check Queue Status <FiArrowRight />
          </button>
        </form>
        
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-400">
            Not registered? <Link to="/" className="text-blue-600 font-bold hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ParticipantLogin
