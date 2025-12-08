import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTeamsFileDetail } from '../../lib/api'

export default function TeamsFileDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['teams_file', id],
    queryFn: () => getTeamsFileDetail(id)
  })

  if (isLoading) {
    return <div className="card p-6 text-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="card p-6 text-center text-red-600">
        Error: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{data.filename}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Uploaded: {new Date(data.uploaded_at).toLocaleString()} · {data.rows.length} rows
            {(data.from_month || data.to_month) && (
              <span className="ml-2">
                · Period: {data.from_month && data.to_month 
                  ? `${data.from_month} to ${data.to_month}`
                  : data.from_month || data.to_month
                }
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => navigate('/teams/batches')}
          className="btn-outline flex items-center gap-2"
        >
          <span className="lnr lnr-arrow-left"></span>
          Back to Files
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {data.header_order.map((header) => (
                  <th key={header} className="th px-4 py-3 whitespace-nowrap text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {data.header_order.map((header) => (
                    <td key={header} className="td px-4 py-3 whitespace-nowrap text-sm">
                      {row[header] || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

