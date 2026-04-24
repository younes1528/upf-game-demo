import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiUser, FiMail, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { API_URL } from '../config/api.js'

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/api/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Registration successful! Redirecting to login...')
        setTimeout(() => {
          navigate('/login')
        }, 1500)
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Failed to connect to server')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-200 p-4 font-inter">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
            Game Testing Registration
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3 leading-tight">
            Join the Testing Queue
          </h1>
          <p className="text-sm md:text-base text-slate-500">
            Register to participate in game testing sessions
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 mb-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Full Name
            </label>
            <div className="relative flex items-center">
              <FiUser className="absolute left-4 text-slate-400 text-lg" />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your name"
                className="w-full pl-12 pr-4 py-3 text-slate-900 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
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
                className="w-full pl-12 pr-4 py-3 text-slate-900 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>
          
          {error && (
            <div className="flex items-center justify-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg animate-in fade-in zoom-in duration-300">
              <FiAlertCircle /> {error}
            </div>
          )}
          
          {message && (
            <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg animate-in fade-in zoom-in duration-300">
              <FiCheckCircle /> {message}
            </div>
          )}
          
          <button 
            type="submit" 
            className="w-full py-4 px-6 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-900/20 transform hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            Join Queue
          </button>
        </form>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-500">
            Already registered? <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">Check your queue status</Link>
          </p>
          <p className="text-xs">
            <Link to="/admin/login" className="text-slate-400 hover:text-slate-600 transition-colors">Admin Portal</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
