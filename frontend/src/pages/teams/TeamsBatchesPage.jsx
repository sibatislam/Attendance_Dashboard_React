import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listTeamsFiles, deleteTeamsFiles } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

export default function TeamsBatchesPage() {
  const [selected, setSelected] = useState([])
  const [showConfirm, setShowConfirm] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['teams_files'],
    queryFn: listTeamsFiles
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTeamsFiles,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams_files'] })
      setSelected([])
      setShowConfirm(false)
      alert('Files deleted successfully')
    }
  })

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    setSelected(selected.length === files.length ? [] : files.map(f => f.id))
  }

  const handleDelete = () => {
    if (selected.length === 0) return
    setShowConfirm(true)
  }

  const confirmDelete = () => {
    deleteMutation.mutate(selected)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Uploaded MS Teams Files</h2>
        <p className="text-gray-600 mt-1">View and manage uploaded MS Teams activity files</p>
      </div>

      {isLoading && <div className="card p-6 text-center text-gray-600">Loading...</div>}

      {!isLoading && files.length === 0 && (
        <div className="card p-6 text-center text-gray-600">
          No files uploaded yet
        </div>
      )}

      {!isLoading && files.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.length === files.length}
                onChange={toggleAll}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-600">
                {selected.length > 0 ? `${selected.length} selected` : 'Select all'}
              </span>
            </div>
            {selected.length > 0 && (
              <button onClick={handleDelete} className="btn-outline text-red-600 border-red-600 hover:bg-red-50">
                Delete Selected
              </button>
            )}
          </div>

              <div className="overflow-x-auto max-h-[600px]">
                <table className="table">
                  <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr className="bg-gray-50">
                  <th className="th px-4 py-3 w-12"></th>
                  <th className="th px-4 py-3">Filename</th>
                  <th className="th px-4 py-3">Data Period</th>
                  <th className="th px-4 py-3">Total Rows</th>
                  <th className="th px-4 py-3">Uploaded At</th>
                  <th className="th px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="td px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(file.id)}
                        onChange={() => toggleSelect(file.id)}
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="td px-4 py-3 font-medium">{file.filename}</td>
                    <td className="td px-4 py-3">
                      {file.from_month && file.to_month 
                        ? `${file.from_month} to ${file.to_month}`
                        : file.from_month || file.to_month || '-'
                      }
                    </td>
                    <td className="td px-4 py-3">{file.total_rows}</td>
                    <td className="td px-4 py-3">{new Date(file.uploaded_at).toLocaleString()}</td>
                    <td className="td px-4 py-3">
                      <button
                        onClick={() => navigate(`/teams/files/${file.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selected.length} file(s)? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-outline"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

