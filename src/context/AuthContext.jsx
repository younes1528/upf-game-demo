import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const adminId = localStorage.getItem('adminId')
    const adminUsername = localStorage.getItem('adminUsername')
    if (adminId && adminUsername) {
      setAdmin({ id: adminId, username: adminUsername })
    }
    setLoading(false)
  }, [])

  const login = (adminData) => {
    setAdmin(adminData)
    localStorage.setItem('adminId', adminData.id)
    localStorage.setItem('adminUsername', adminData.username)
  }

  const logout = () => {
    setAdmin(null)
    localStorage.removeItem('adminId')
    localStorage.removeItem('adminUsername')
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
