import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function HeaderBar({ right }) {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <header className="border-b border-white/30 backdrop-blur-md bg-white/30 shadow-lg">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>{right}</div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{user.full_name || user.username}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
            {user.role === 'admin' && (
              <button
                onClick={() => navigate('/admin/users')}
                className="px-3 py-1.5 text-xs border border-white/40 backdrop-blur-sm bg-white/30 text-gray-700 rounded-md hover:bg-white/50 transition-all"
              >
                Manage Users
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}


