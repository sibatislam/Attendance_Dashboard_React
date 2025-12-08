import { useState } from 'react'
import FileUploadCard from '../components/FileUploadCard'
import DataTable from '../components/DataTable'

export default function UploadPage() {
  const [summary, setSummary] = useState([])

  return (
    <div className="space-y-6">
      <FileUploadCard onUploaded={(data) => setSummary(data)} />
      {summary.length > 0 && (
        <div className="card p-4">
          <div className="text-sm text-gray-600 mb-2">Upload Summary</div>
          <div className="overflow-auto max-h-[400px]">
            <table className="table">
              <thead className="sticky top-0 z-10 bg-gray-100">
                <tr>
                  <th className="th px-3 py-2">Filename</th>
                  <th className="th px-3 py-2">Rows</th>
                  <th className="th px-3 py-2">Uploaded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summary.map((s) => (
                  <tr key={s.id}>
                    <td className="td px-3 py-2">{s.filename}</td>
                    <td className="td px-3 py-2">{s.total_rows ?? 0}</td>
                    <td className="td px-3 py-2">{new Date(s.uploaded_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


