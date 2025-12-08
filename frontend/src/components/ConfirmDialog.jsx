export default function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="card p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-700">{message}</p>
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}


