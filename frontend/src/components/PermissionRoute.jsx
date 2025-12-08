import { Navigate } from 'react-router-dom'

export default function PermissionRoute({ children, requiredModule, requiredFeature }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  // Admins have all permissions
  if (user.role === 'admin') {
    return children
  }
  
  // Check if user has the required permission
  const permissions = user.permissions || {}
  
  // Default to attendance_dashboard for backward compatibility
  const moduleId = requiredModule || 'attendance_dashboard'
  const modulePerms = permissions[moduleId] || {}
  
  if (!modulePerms.enabled) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this module.</p>
          <p className="text-sm text-gray-500 mt-2">Please contact your administrator for access.</p>
        </div>
      </div>
    )
  }
  
  // Check specific features if required
  const features = modulePerms.features || []
  if (requiredFeature && !features.includes(requiredFeature)) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this feature.</p>
          <p className="text-sm text-gray-500 mt-2">Please contact your administrator for access.</p>
        </div>
      </div>
    )
  }
  
  return children
}

