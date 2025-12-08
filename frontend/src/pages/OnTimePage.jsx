import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getOnTime } from '../lib/api'
import DataTable from '../components/DataTable'
import OnTimeCharts from '../components/OnTimeCharts'

const tabs = [
  { key: 'function', label: 'Function wise', column: 'Function', mode: 'table', base: 'function' },
  { key: 'company', label: 'Company wise', column: 'Company', mode: 'table', base: 'company' },
  { key: 'location', label: 'Location wise', column: 'Location', mode: 'table', base: 'location' },
  { key: 'function_chart', label: 'Function wise (Chart)', column: 'Function', mode: 'chart', base: 'function' },
  { key: 'company_chart', label: 'Company wise (Chart)', column: 'Company', mode: 'chart', base: 'company' },
  { key: 'location_chart', label: 'Location wise (Chart)', column: 'Location', mode: 'chart', base: 'location' },
]

export default function OnTimePage() {
  const [active, setActive] = useState('function')
  const current = tabs.find(t => t.key === active)
  const baseKey = current?.base || 'function'
  const { data = [], isLoading, isError, error } = useQuery({ queryKey: ['kpi', baseKey], queryFn: () => getOnTime(baseKey), retry: 0 })
  const [fromM, setFromM] = useState('')
  const [toM, setToM] = useState('')

  const cols = [
    { key: 'month', label: 'Month' },
    { key: 'group', label: current?.column || 'Group' },
    { key: 'members', label: 'Members' },
    { key: 'present', label: 'Present' },
    { key: 'late', label: 'Late' },
    { key: 'on_time', label: 'On Time' },
    { key: 'on_time_pct', label: 'On Time %' },
  ]

  function toMonthLabel(m) {
    if (!m) return ''
    const match = String(m).match(/(20\d{2})-(\d{2})/)
    if (!match) return String(m)
    const year = match[1]
    const month = parseInt(match[2], 10)
    const names = ['January','February','March','April','May','June','July','August','September','October','November','December']
    return `${names[month-1]} ${year}`
  }

  const months = Array.from(new Set(data.map(r => r.month))).sort()
  const fromVal = fromM || months[0] || ''
  const toVal = toM || months[months.length - 1] || ''
  const filtered = data.filter(r => (!fromVal || r.month >= fromVal) && (!toVal || r.month <= toVal))

  return (
    <div className="space-y-4">
      <div className="card p-2 flex gap-2">
        {tabs.map(t => (
          <button key={t.key} className={`px-3 py-2 rounded-md ${active === t.key ? 'bg-blue-600 text-white' : 'btn-outline'}`} onClick={() => setActive(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {current?.mode === 'table' && (
        <div className="card p-4">
          {months.length > 0 && (
            <div className="flex items-center gap-3 mb-3">
              <label className="text-sm text-gray-600">From</label>
              <select className="btn-outline" value={fromM || ''} onChange={e => setFromM(e.target.value)}>
                <option value="">(min)</option>
                {months.map(m => <option key={m} value={m}>{toMonthLabel(m)}</option>)}
              </select>
              <label className="text-sm text-gray-600">To</label>
              <select className="btn-outline" value={toM || ''} onChange={e => setToM(e.target.value)}>
                <option value="">(max)</option>
                {months.map(m => <option key={m} value={m}>{toMonthLabel(m)}</option>)}
              </select>
            </div>
          )}
          {isLoading && <div>Loading...</div>}
          {(!isLoading && isError) && (
            <div className="mb-3 text-red-600 text-sm">
              {error?.response?.data?.detail || error?.message || 'Failed to load KPI. Showing empty table.'}
            </div>
          )}
          <DataTable columns={cols} rows={(!isLoading && !isError) ? filtered.map(r => ({ ...r, month: toMonthLabel(r.month) })) : []} />
          {(!isLoading && !isError && data.length === 0) && (
            <div className="mt-2 text-sm text-gray-500">No data yet. Upload attendance files to see results.</div>
          )}
        </div>
      )}

      {current?.mode === 'chart' && !isLoading && !isError && (
        <div className="space-y-3">
          {months.length > 0 && (
            <div className="card p-3 flex items-center gap-3">
              <label className="text-sm text-gray-600">From</label>
              <select className="btn-outline" value={fromM || ''} onChange={e => setFromM(e.target.value)}>
                <option value="">(min)</option>
                {months.map(m => <option key={m} value={m}>{toMonthLabel(m)}</option>)}
              </select>
              <label className="text-sm text-gray-600">To</label>
              <select className="btn-outline" value={toM || ''} onChange={e => setToM(e.target.value)}>
                <option value="">(max)</option>
                {months.map(m => <option key={m} value={m}>{toMonthLabel(m)}</option>)}
              </select>
            </div>
          )}
          <OnTimeCharts rows={filtered} />
        </div>
      )}
    </div>
  )
}


