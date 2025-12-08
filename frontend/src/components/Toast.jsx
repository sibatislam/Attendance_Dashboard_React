export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null
  const color = type === 'error' ? 'bg-red-600' : 'bg-green-600'
  return (
    <div className={`fixed bottom-4 right-4 text-white px-4 py-2 rounded ${color} shadow`} onClick={onClose}>
      {message}
    </div>
  )
}


