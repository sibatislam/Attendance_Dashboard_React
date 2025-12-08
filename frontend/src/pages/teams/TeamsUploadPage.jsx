import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadTeamsFiles } from '../../lib/api'

export default function TeamsUploadPage() {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [fromMonth, setFromMonth] = useState('')
  const [toMonth, setToMonth] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ files, fromMonth, toMonth }) => uploadTeamsFiles(files, fromMonth, toMonth),
    onSuccess: (data) => {
      alert(`Successfully uploaded ${data.length} file(s)!`)
      setFiles([])
      setFromMonth('')
      setToMonth('')
      queryClient.invalidateQueries({ queryKey: ['teams_files'] })
    },
    onError: (error) => {
      alert('Upload failed: ' + (error.response?.data?.detail || error.message))
    }
  })

  const handleFiles = (fileList) => {
    const csvFiles = Array.from(fileList).filter(f => 
      f.name.endsWith('.csv')
    )
    if (csvFiles.length < fileList.length) {
      alert('Only CSV files are supported for MS Teams data')
    }
    setFiles(csvFiles)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleUpload = () => {
    if (files.length === 0) {
      alert('Please select at least one file')
      return
    }
    mutation.mutate({ files, fromMonth, toMonth })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Upload MS Teams Activity Files</h2>
        <p className="text-gray-600 mt-1">Upload CSV files containing MS Teams user activity data</p>
      </div>

      <div className="card p-8">
        {/* Month Range Selection */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Data Period (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fromMonth" className="block text-sm text-gray-600 mb-1">From Month</label>
              <input
                type="month"
                id="fromMonth"
                value={fromMonth}
                onChange={(e) => setFromMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="toMonth" className="block text-sm text-gray-600 mb-1">To Month</label>
              <input
                type="month"
                id="toMonth"
                value={toMonth}
                onChange={(e) => setToMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-gray-600 mb-4">
            <span className="lnr lnr-cloud-upload text-5xl text-gray-400"></span>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag and drop MS Teams CSV files here
          </p>
          <p className="text-sm text-gray-500 mb-4">or</p>
          <label className="btn inline-block cursor-pointer">
            <input
              type="file"
              multiple
              accept=".csv"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            Browse Files
          </label>
          <p className="text-xs text-gray-500 mt-4">Supported format: CSV</p>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Selected Files ({files.length})</h3>
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="lnr lnr-file-empty text-blue-600"></span>
                    <div>
                      <div className="text-sm font-medium">{file.name}</div>
                      <div className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                    className="text-red-600 hover:text-red-800"
                  >
                    <span className="lnr lnr-trash"></span>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleUpload}
                disabled={mutation.isPending}
                className="btn"
              >
                {mutation.isPending ? 'Uploading...' : `Upload ${files.length} File(s)`}
              </button>
              <button
                onClick={() => setFiles([])}
                className="btn-outline"
                disabled={mutation.isPending}
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

