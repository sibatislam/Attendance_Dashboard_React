import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, createUser, updateUser, deleteUser } from '../lib/api'
import { useNavigate } from 'react-router-dom'

const MODULES = [
  { id: 'attendance_dashboard', name: 'Attendance Monitoring Dashboard', description: 'Access to attendance analytics and reports' },
  { id: 'teams_dashboard', name: 'MS Teams User Activity Dashboard', description: 'Access to Teams activity monitoring' }
]

const ATTENDANCE_PERMISSIONS = [
  { id: 'dashboard', name: 'Dashboard', description: 'View dashboard with all charts' },
  { id: 'on_time', name: 'On Time %', description: 'View on-time percentage reports' },
  { id: 'work_hour', name: 'Work Hour Completion', description: 'View work hour completion reports' },
  { id: 'work_hour_lost', name: 'Work Hour Lost', description: 'View work hour lost reports' },
  { id: 'leave_analysis', name: 'Leave Analysis', description: 'View leave analysis reports' },
  { id: 'upload', name: 'Upload Files', description: 'Upload attendance files' },
  { id: 'batches', name: 'Manage Batches', description: 'View and delete uploaded batches' },
  { id: 'export', name: 'Export Reports', description: 'Export reports to PDF' }
]

const TEAMS_PERMISSIONS = [
  { id: 'user_activity', name: 'User Activity Dashboard', description: 'View Teams user activity analytics' },
  { id: 'upload_activity', name: 'Upload Activity Files', description: 'Upload Teams activity files' },
  { id: 'activity_batches', name: 'Activity Files Management', description: 'View and delete uploaded activity files' },
  { id: 'app_activity', name: 'Teams App Activity', description: 'View Teams app usage analytics' },
  { id: 'upload_app', name: 'Upload App Usage', description: 'Upload Teams app usage files' },
  { id: 'app_batches', name: 'App Usage Files Management', description: 'View and delete app usage files' },
  { id: 'employee_list', name: 'Employee List Management', description: 'Upload and manage employee list files' },
  { id: 'export', name: 'Export Reports', description: 'Export Teams reports to PDF' }
]

export default function UserManagementPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentTab, setCurrentTab] = useState('basic') // basic, permissions
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
    phone: '',
    department: '',
    position: '',
    role: 'user',
    is_active: true,
    permissions: {
      attendance_dashboard: {
        enabled: false,
        features: []
      },
      teams_dashboard: {
        enabled: false,
        features: []
      }
    }
  })

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    refetchOnWindowFocus: false,
    retry: false,
    onError: (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Admin access required!\n\nYou must be logged in as an admin to access User Management.\n\nPlease log in with admin credentials:\nUsername: admin\nPassword: admin123')
        setTimeout(() => navigate('/login'), 2000)
      }
    }
  })

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      resetForm()
      setIsModalOpen(false)
    },
    onError: (error) => {
      console.error('Create user error:', error.response?.data)
      let errorMsg = 'Failed to create user'
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMsg = 'Authentication Error: Admin access required to manage users.\n\nPlease log in with an admin account.'
      } else if (error.response?.status === 422) {
        // Validation error
        const detail = error.response?.data?.detail
        if (Array.isArray(detail)) {
          errorMsg = 'Validation Errors:\n' + detail.map(err => `- ${err.loc?.join('.')}: ${err.msg}`).join('\n')
        } else {
          errorMsg = detail || 'Invalid data provided'
        }
      } else {
        errorMsg = error.response?.data?.detail || error.message || errorMsg
      }
      
      alert(errorMsg)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      resetForm()
      setIsModalOpen(false)
    },
    onError: (error) => {
      alert(error.response?.data?.detail || 'Failed to update user')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      alert(error.response?.data?.detail || 'Failed to delete user')
    }
  })

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      full_name: '',
      password: '',
      phone: '',
      department: '',
      position: '',
      role: 'user',
      is_active: true,
      permissions: {
        attendance_dashboard: { enabled: false, features: [] },
        teams_dashboard: { enabled: false, features: [] }
      }
    })
    setEditingUser(null)
    setCurrentTab('basic')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Prepare data
    const submitData = { ...formData }
    
    // Remove password if empty during edit
    if (editingUser && !submitData.password) {
      delete submitData.password
    }
    
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      username: user.username,
      full_name: user.full_name || '',
      password: '',
      phone: user.phone || '',
      department: user.department || '',
      position: user.position || '',
      role: user.role,
      is_active: user.is_active,
      permissions: user.permissions || {
        attendance_dashboard: { enabled: false, features: [] },
        teams_dashboard: { enabled: false, features: [] }
      }
    })
    setIsModalOpen(true)
  }

  const handleDelete = (user) => {
    if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      deleteMutation.mutate(user.id)
    }
  }

  const toggleModulePermission = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: {
          ...prev.permissions[moduleId],
          enabled: !prev.permissions[moduleId].enabled
        }
      }
    }))
  }

  const toggleFeaturePermission = (moduleId, featureId) => {
    setFormData(prev => {
      const features = prev.permissions[moduleId].features || []
      const hasFeature = features.includes(featureId)
      
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleId]: {
            ...prev.permissions[moduleId],
            features: hasFeature 
              ? features.filter(f => f !== featureId)
              : [...features, featureId]
          }
        }
      }
    })
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.role === 'admin').length,
    users: users.filter(u => u.role === 'user').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-700 to-gray-800 shadow-lg border-b border-gray-600 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">User Management</h1>
              <p className="text-sm text-gray-300 mt-1">Manage users, roles, and permissions</p>
            </div>
            <button
              onClick={() => navigate('/modules')}
              className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-md transition-all flex items-center gap-2"
            >
              <span className="lnr lnr-arrow-left"></span>
              Back to Modules
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 transform transition-transform hover:scale-105">
            <div className="text-sm text-blue-100">Total Users</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 transform transition-transform hover:scale-105">
            <div className="text-sm text-green-100">Active</div>
            <div className="text-3xl font-bold text-white">{stats.active}</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-4 transform transition-transform hover:scale-105">
            <div className="text-sm text-red-100">Inactive</div>
            <div className="text-3xl font-bold text-white">{stats.inactive}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 transform transition-transform hover:scale-105">
            <div className="text-sm text-purple-100">Administrators</div>
            <div className="text-3xl font-bold text-white">{stats.admins}</div>
          </div>
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow-lg p-4 transform transition-transform hover:scale-105">
            <div className="text-sm text-gray-100">Regular Users</div>
            <div className="text-3xl font-bold text-white">{stats.users}</div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 lnr lnr-magnifier"></span>
                <input
                  type="text"
                  placeholder="Search by username, email, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="mt-4">
            <button
              onClick={() => {
                resetForm()
                setIsModalOpen(true)
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-md hover:from-blue-700 hover:to-blue-800 shadow-lg transform transition-all hover:scale-105 flex items-center gap-2 font-medium"
            >
              <span className="lnr lnr-plus-circle"></span>
              Add New User
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {isLoading && (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          )}

          {error && (
            <div className="p-8 text-center text-red-600">
              Error loading users: {error.message}
            </div>
          )}

          {!isLoading && !error && (
            <div className="overflow-x-auto max-h-[600px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 z-10 bg-gradient-to-r from-gray-100 to-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No users found matching your criteria
                      </td>
                    </tr>
                  )}
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.full_name || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{user.department || '-'}</div>
                        <div className="text-sm text-gray-500">{user.position || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-1 transition-all hover:scale-105"
                          >
                            <span className="lnr lnr-pencil"></span>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="text-red-600 hover:text-red-900 font-medium flex items-center gap-1 transition-all hover:scale-105"
                            disabled={deleteMutation.isPending}
                          >
                            <span className="lnr lnr-trash"></span>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all animate-scale-in">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-500 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  resetForm()
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <span className="lnr lnr-cross text-xl"></span>
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setCurrentTab('basic')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm ${
                    currentTab === 'basic'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Basic Information
                </button>
                <button
                  onClick={() => setCurrentTab('permissions')}
                  className={`px-6 py-3 border-b-2 font-medium text-sm ${
                    currentTab === 'permissions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Module Permissions
                </button>
              </nav>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
                {currentTab === 'basic' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password {editingUser && <span className="text-gray-500 text-xs">(leave blank to keep current)</span>}
                          {!editingUser && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required={!editingUser}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <input
                          type="text"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Position
                        </label>
                        <input
                          type="text"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentTab === 'permissions' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-2">
                        <span className="lnr lnr-info-circle text-blue-600 text-lg mt-0.5"></span>
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Admin users have access to all modules and features automatically. 
                          These permissions apply to regular users only.
                        </p>
                      </div>
                    </div>

                    {MODULES.map(module => (
                      <div 
                        key={module.id} 
                        className={`border-2 rounded-xl p-5 transition-all ${
                          formData.permissions[module.id]?.enabled 
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 mt-1">
                            <input
                              type="checkbox"
                              checked={formData.permissions[module.id]?.enabled || false}
                              onChange={() => toggleModulePermission(module.id)}
                              className="h-6 w-6 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition-all"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {module.id === 'attendance_dashboard' && (
                                <span className="lnr lnr-calendar-full text-2xl text-blue-600"></span>
                              )}
                              {module.id === 'teams_dashboard' && (
                                <span className="lnr lnr-users text-2xl text-indigo-600"></span>
                              )}
                              <h4 className="text-lg font-bold text-gray-900">{module.name}</h4>
                            </div>
                            <p className="text-sm text-gray-600 ml-9">{module.description}</p>
                          </div>
                          {formData.permissions[module.id]?.enabled && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                              Enabled
                            </span>
                          )}
                        </div>

                        {module.id === 'attendance_dashboard' && formData.permissions[module.id]?.enabled && (
                          <div className="ml-10 mt-4 space-y-3 pl-4 border-l-4 border-blue-400">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="lnr lnr-cog text-blue-600"></span>
                              <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">Specific Features:</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {ATTENDANCE_PERMISSIONS.map(feature => (
                                <label 
                                  key={feature.id} 
                                  className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-all ${
                                    formData.permissions[module.id]?.features?.includes(feature.id)
                                      ? 'bg-blue-100 border-2 border-blue-400 shadow-sm'
                                      : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.permissions[module.id]?.features?.includes(feature.id) || false}
                                    onChange={() => toggleFeaturePermission(module.id, feature.id)}
                                    className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded mt-0.5 cursor-pointer transition-all"
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-semibold text-gray-900 mb-1">{feature.name}</div>
                                    <div className="text-xs text-gray-600">{feature.description}</div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {module.id === 'teams_dashboard' && formData.permissions[module.id]?.enabled && (
                          <div className="ml-10 mt-4 space-y-3 pl-4 border-l-4 border-indigo-400">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="lnr lnr-cog text-indigo-600"></span>
                              <p className="text-sm font-bold text-gray-800 uppercase tracking-wide">Specific Features:</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {TEAMS_PERMISSIONS.map(feature => (
                                <label 
                                  key={feature.id} 
                                  className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-all ${
                                    formData.permissions[module.id]?.features?.includes(feature.id)
                                      ? 'bg-indigo-100 border-2 border-indigo-400 shadow-sm'
                                      : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.permissions[module.id]?.features?.includes(feature.id) || false}
                                    onChange={() => toggleFeaturePermission(module.id, feature.id)}
                                    className="h-5 w-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500 border-gray-300 rounded mt-0.5 cursor-pointer transition-all"
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm font-semibold text-gray-900 mb-1">{feature.name}</div>
                                    <div className="text-xs text-gray-600">{feature.description}</div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    resetForm()
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg transform transition-all hover:scale-105"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
