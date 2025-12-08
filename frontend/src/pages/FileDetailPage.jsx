import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getFileDetail } from '../lib/api'
import DataTable from '../components/DataTable'

export default function FileDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useQuery({ queryKey: ['file', id], queryFn: () => getFileDetail(id) })

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div className="text-red-600">Failed to load file</div>
  if (!data) return null

  const headerRename = {
    'Comapny Name': 'Company Name',
  }
  const columns = data.header_order.map((h) => ({ key: h, label: headerRename[h] || h }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{data.filename}</div>
          <div className="text-sm text-gray-600">Uploaded: {new Date(data.uploaded_at).toLocaleString()}</div>
        </div>
        <button className="btn-outline" onClick={() => navigate(-1)}>Back</button>
      </div>
      <DataTable columns={columns} rows={data.rows} />
    </div>
  )
}


