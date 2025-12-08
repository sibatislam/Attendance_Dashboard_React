import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listFiles, deleteFiles } from '../lib/api'
import { Link } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'

export default function BatchesPage() {
  const qc = useQueryClient()
  const { data = [], isLoading, isError } = useQuery({ queryKey: ['files'], queryFn: listFiles })
  const [selected, setSelected] = useState([])
  const [confirmOpen, setConfirmOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: (ids) => deleteFiles(ids),
    onSuccess: () => {
      setSelected([])
      qc.invalidateQueries({ queryKey: ['files'] })
    },
  })

  const allChecked = useMemo(() => selected.length > 0 && selected.length === data.length, [selected, data])
  function toggleAll() {
    if (allChecked) setSelected([])
    else setSelected(data.map(d => d.id))
  }
  function toggleOne(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div className="text-red-600">Failed to load files</div>

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm text-gray-600">{data.length} batch(es)</div>
        <button className="btn" disabled={selected.length === 0} onClick={() => setConfirmOpen(true)}>
          Delete Selected
        </button>
      </div>
      <div className="overflow-auto max-h-[600px]">
        <table className="table">
          <thead className="sticky top-0 z-10 bg-gray-100">
            <tr>
              <th className="th px-3 py-2">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} />
              </th>
              <th className="th px-3 py-2">Filename</th>
              <th className="th px-3 py-2">Uploaded</th>
              <th className="th px-3 py-2">Rows</th>
              <th className="th px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((f) => (
              <tr key={f.id}>
                <td className="td px-3 py-2">
                  <input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggleOne(f.id)} />
                </td>
                <td className="td px-3 py-2">{f.filename}</td>
                <td className="td px-3 py-2">{new Date(f.uploaded_at).toLocaleString()}</td>
                <td className="td px-3 py-2">{f.total_rows ?? 0}</td>
                <td className="td px-3 py-2">
                  <Link className="btn-outline" to={`/attendance/files/${f.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Files"
        message={`Are you sure you want to delete ${selected.length} file(s)? This cannot be undone.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => { setConfirmOpen(false); mutation.mutate(selected) }}
      />
    </div>
  )
}


