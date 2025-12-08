export default function DataTable({ columns, headers, rows }) {
  // Support both 'columns' and 'headers' props for backwards compatibility
  const cols = columns || headers || []
  const normalized = cols.map(c => typeof c === 'string' ? { key: c, label: c } : c)
  
  // Add safety check for rows
  const safeRows = rows || []
  
  return (
    <div className="overflow-auto border rounded-md max-w-full max-h-[600px]">
      <table className="table">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            {normalized.map((c, idx) => (
              <th key={idx} className="th px-3 py-2 bg-gray-100">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {safeRows.map((r, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {normalized.map((c, cidx) => (
                <td key={cidx} className="td px-3 py-2">{String(r[c.key] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


