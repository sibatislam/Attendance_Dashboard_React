export function computeOnTime(rows, groupBy) {
  const keyMap = {
    function: 'Function Name',
    company: 'Comapny Name',
    location: 'Job Location',
  }
  const groupKey = keyMap[groupBy]
  const members = new Map() // key -> Set of member ids
  const presentCount = new Map()
  const lateCount = new Map()

  const monthOf = (dateStr) => {
    if (!dateStr) return ''
    const s = String(dateStr)
    // 1) YYYY-MM or YYYY/MM or YYYY-MM-DD
    let m = s.match(/(20\d{2})[-/](\d{1,2})/)
    if (m) return `${m[1]}-${String(m[2]).padStart(2, '0')}`
    // 2) DD-MM-YYYY
    m = s.match(/(\d{1,2})[-/](\d{1,2})[-/](20\d{2})/)
    if (m) return `${m[3]}-${String(m[2]).padStart(2, '0')}`
    // 3) Month name with year (e.g., 01-Jul-2025, Jul 1 2025, July 2025)
    const monthNames = {
      jan: 1,feb: 2,mar: 3,apr: 4,may: 5,jun: 6,
      jul: 7,aug: 8,sep: 9,sept: 9,oct: 10,nov: 11,dec: 12,
      january:1,february:2,march:3,april:4,june:6,july:7,august:8,september:9,october:10,november:11,december:12
    }
    const lower = s.toLowerCase()
    const yearMatch = lower.match(/(20\d{2})/)
    const monMatch = lower.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)/)
    if (yearMatch && monMatch) {
      const year = yearMatch[1]
      const month = String(monthNames[monMatch[1]]).padStart(2, '0')
      return `${year}-${month}`
    }
    // Fallback: strip day if looks like date
    return s
  }

  const add = (map, key, delta=1) => map.set(key, (map.get(key)||0)+delta)

  for (const r of rows) {
    const month = monthOf(r['Attendance Date'] || '')
    const groupVal = String(r[groupKey] || '')
    const emp = String(r['Employee Code'] || r['Name'] || '')
    const flag = String(r['Flag'] || '').trim()
    const isLate = String(r['Is Late'] || '').trim().toLowerCase() === 'yes'
    const k = `${month}||${groupVal}`
    if (emp) {
      if (!members.has(k)) members.set(k, new Set())
      members.get(k).add(emp)
    }
    if (flag === 'P') {
      add(presentCount, k, 1)
      if (isLate) add(lateCount, k, 1)
    }
  }

  const results = []
  for (const [k, set] of members.entries()) {
    const [month, group] = k.split('||')
    const present = presentCount.get(k) || 0
    const late = lateCount.get(k) || 0
    const onTime = Math.max(present - late, 0)
    const onTimePct = present > 0 ? Number(((onTime/present)*100).toFixed(2)) : 0
    results.push({ month, group, members: set.size, present, late, on_time: onTime, on_time_pct: onTimePct })
  }
  results.sort((a,b) => (a.month+a.group).localeCompare(b.month+b.group))
  return results
}


