import { Navigate } from 'react-router-dom'

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  try {
    const user = JSON.parse(userStr)
    if (user.role !== 'admin') {
      return <Navigate to="/modules" replace />
    }
  } catch (e) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

