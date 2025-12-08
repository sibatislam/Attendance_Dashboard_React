import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { getEmployeeFileDetail } from '../../lib/api'
import DataTable from '../../components/DataTable'

export default function EmployeeFileDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['employee_file_detail', id],
    queryFn: () => getEmployeeFileDetail(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading file details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4">
        Error loading file details: {error.message}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-gray-600 text-center p-4">File not found.</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{data.filename}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Uploaded: {new Date(data.uploaded_at).toLocaleString()} · {data.rows.length} employees
          </p>
        </div>
        <button
          onClick={() => navigate('/teams/employee/batches')}
          className="btn-outline flex items-center gap-2"
        >
          <span className="lnr lnr-arrow-left"></span>
          Back to Employee Files
        </button>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Employee List</h3>
        <DataTable headers={data.header_order} rows={data.rows} />
      </div>
    </div>
  )
}

