import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiUser, FiLock, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import { API_URL } from '../config/api.js'

function AdminRegister() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/api/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Registration successful! Redirecting...')
        setTimeout(() => navigate('/admin/login'), 2000)
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Connection lost. Please check your network.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-200 p-4 font-inter">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-slate-200 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center font-extrabold text-white shadow-lg shadow-blue-900/20 mx-auto mb-4">
            UPF
          </div>
          <h1 className="text-2xl font-bold text-blue-900 mb-2 leading-tight">
            Create Admin
          </h1>
          <p className="text-sm text-slate-500">
            Join the administration team
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              New Username
            </label>
            <div className="relative flex items-center">
              <FiUser className="absolute left-4 text-slate-400 text-lg" />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                className="w-full pl-12 pr-4 py-3 text-slate-900 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Secret Password
            </label>
            <div className="relative flex items-center">
              <FiLock className="absolute left-4 text-slate-400 text-lg" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a strong password"
                required
                className="w-full pl-12 pr-4 py-3 text-slate-900 bg-white border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg animate-in fade-in zoom-in duration-300">
              <FiAlertTriangle /> {error}
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
            Create Admin Account
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-slate-100 text-center space-y-4">
          <p className="text-sm text-slate-500">
            Already an admin? <Link to="/admin/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
          </p>
          <Link to="/" className="block text-sm text-slate-400 hover:text-blue-900 transition-colors">← Back to Participant View</Link>
        </div>
      </div>
    </div>
  )
}

export default AdminRegister
