import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { uploadFiles } from '../lib/api'

export default function FileUploadCard({ onUploaded }) {
  const [dragOver, setDragOver] = useState(false)
  const [selected, setSelected] = useState([])

  const mutation = useMutation({
    mutationFn: uploadFiles,
    onSuccess: (data) => {
      setSelected([])
      onUploaded?.(data)
    },
  })

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files || [])
    setSelected(prev => [...prev, ...files])
  }

  function onBrowse(e) {
    const files = Array.from(e.target.files || [])
    setSelected(prev => [...prev, ...files])
  }

  function onUpload() {
    if (!selected.length) return
    mutation.mutate(selected)
  }

  return (
    <div className="card p-6">
      <div
        className={`border-2 border-dashed rounded-md p-8 text-center ${dragOver ? 'bg-blue-50 border-blue-400' : 'border-gray-300'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <p className="text-gray-600">Drag & Drop files here or</p>
        <label className="btn-outline mt-3 cursor-pointer">
          Browse
          <input type="file" className="hidden" multiple accept=".csv,.xlsx,.xls" onChange={onBrowse} />
        </label>
      </div>
      {selected.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">Selected files:</div>
          <ul className="list-disc list-inside text-sm text-gray-800">
            {selected.map((f, idx) => (<li key={idx}>{f.name}</li>))}
          </ul>
          <button className="btn mt-4" disabled={mutation.isPending} onClick={onUpload}>
            {mutation.isPending ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
      {mutation.isSuccess && (
        <div className="mt-3 text-green-700">Uploaded successfully.</div>
      )}
      {mutation.isError && (
        <div className="mt-3 text-red-600">
          {mutation.error?.response?.data?.detail || mutation.error?.message || 'Upload failed'}
        </div>
      )}
    </div>
  )}


