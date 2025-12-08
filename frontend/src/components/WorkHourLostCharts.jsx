import { useMemo } from 'react'
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Legend, Bar, Line, CartesianGrid, LabelList } from 'recharts'

function toMonthLabel(m) {
  if (!m) return ''
  const match = String(m).match(/(20\d{2})-(\d{2})/)
  if (!match) return String(m)
  const year = match[1].slice(-2) // Last 2 digits of year
  const month = parseInt(match[2], 10)
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${names[month-1]} ${year}`
}

export default function WorkHourLostCharts({ rows }) {
  const byGroup = useMemo(() => {
    const m = new Map()
    for (const r of rows) {
      const key = r.group || 'Unknown'
      if (!m.has(key)) m.set(key, [])
      m.get(key).push({ ...r, monthLabel: toMonthLabel(r.month) })
    }
    for (const arr of m.values()) arr.sort((a,b) => (a.month + a.group).localeCompare(b.month + b.group))
    return m
  }, [rows])

  const groups = Array.from(byGroup.keys())
  const palette = ['#60a5fa', '#34d399', '#f472b6', '#a78bfa', '#fbbf24', '#38bdf8']

  if (groups.length === 0) return <div className="text-sm text-gray-500">No data for charts.</div>

  const BarValueLabel = (props) => {
    const { x, y, width, height, value } = props
    if (x == null || y == null || width == null || height == null) return null
    const cx = x + width / 2
    const cy = y + height / 2
    return <text x={cx} y={cy} fill="#ffffff" fontSize={12} fontWeight="700" textAnchor="middle" dominantBaseline="middle">{value}</text>
  }

  const PercentLabel = (props) => {
    const { x, y, value } = props
    if (x == null || y == null) return null
    return <text x={x} y={y - 8} fill="#000000" fontSize={12} fontWeight="700" textAnchor="middle" dominantBaseline="bottom">{value}%</text>
  }

  const HoursLabel = (props) => {
    const { x, y, value } = props
    if (x == null || y == null) return null
    return <text x={x} y={y + 24} fill="#000000" fontSize={12} fontWeight="700" textAnchor="middle">{value}h</text>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups.map((g, idx) => (
        <div key={g} className="card p-4">
          <div className="mb-2 font-semibold">{g}</div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <ComposedChart data={byGroup.get(g)} margin={{ top: 30, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#f0f0f0" />
                <XAxis dataKey="monthLabel" />
                <YAxis yAxisId="left" label={{ value: 'Members', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Lost % & Hours', angle: -90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="members" name="Members" fill={palette[idx % palette.length]} fillOpacity={0.5}>
                  <LabelList content={<BarValueLabel />} />
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="lost_pct" name="Work Hour Lost %" stroke="#f59e0b" strokeWidth={2} dot>
                  <LabelList content={<PercentLabel />} />
                </Line>
                <Line yAxisId="right" type="monotone" dataKey="lost" name="Work Hours Lost" stroke="#ef4444" strokeWidth={2} dot>
                  <LabelList content={<HoursLabel />} />
                </Line>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  )
}

