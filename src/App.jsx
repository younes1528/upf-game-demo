import { Routes, Route } from 'react-router-dom'
import Register from './components/Register'
import ParticipantLogin from './components/ParticipantLogin'
import AdminRegister from './components/AdminRegister'
import AdminLogin from './components/AdminLogin'
import Dashboard from './components/Dashboard'
import WaitingPage from './components/WaitingPage'
import './App.css'

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<ParticipantLogin />} />
        <Route path="/waiting" element={<WaitingPage />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  )
}

export default App
