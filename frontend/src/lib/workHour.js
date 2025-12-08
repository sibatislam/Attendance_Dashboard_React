export function computeWorkHourCompletion(rows, groupBy) {
  const keyMap = {
    function: 'Function Name',
    company: 'Comapny Name',
    location: 'Job Location',
  }
  const groupKey = keyMap[groupBy]
  const members = new Map()
  const presentCount = new Map()
  const odCount = new Map()
  const shiftHoursSum = new Map()
  const workHoursSum = new Map()
  const completedCount = new Map()
  const totalCount = new Map()

  const monthOf = (dateStr) => {
    if (!dateStr) return ''
    const m1 = String(dateStr).match(/(20\d{2})[-/](\d{1,2})/)
    if (m1) return `${m1[1]}-${String(m1[2]).padStart(2, '0')}`
    const m2 = String(dateStr).match(/(\d{1,2})[-/](\d{1,2})[-/](20\d{2})/)
    if (m2) return `${m2[3]}-${String(m2[2]).padStart(2, '0')}`
    const monthNames = {
      jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
      jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
      january: 1, february: 2, march: 3, april: 4, june: 6, july: 7,
      august: 8, september: 9, october: 10, november: 11, december: 12,
    }
    const lower = String(dateStr).toLowerCase()
    const yearMatch = lower.match(/(20\d{2})/)
    const monthMatch = lower.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)/)
    if (yearMatch && monthMatch) {
      const year = yearMatch[1]
      const month = String(monthNames[monthMatch[1]]).padStart(2, '0')
      return `${year}-${month}`
    }
    return String(dateStr)
  }

  const timeToHours = (timeStr) => {
    if (!timeStr) return 0.0
    const s = String(timeStr).trim()
    const parts = s.split(/[:.]/)
    if (parts.length >= 2) {
      try {
        const h = parseInt(parts[0], 10)
        const m = parseInt(parts[1], 10)
        const sec = parts.length > 2 ? parseInt(parts[2], 10) : 0
        return h + m / 60.0 + sec / 3600.0
      } catch (e) {
        return 0.0
      }
    }
    return 0.0
  }

  for (const r of rows) {
    const month = monthOf(r['Attendance Date'] || '')
    const groupVal = String(r[groupKey] || '')
    const emp = String(r['Employee Code'] || r['Name'] || '')
    const flag = String(r['Flag'] || '').trim()
    const shiftIn = String(r['Shift In Time'] || '').trim()
    const shiftOut = String(r['Shift Out Time'] || '').trim()
    const inTime = String(r['In Time'] || '').trim()
    const outTime = String(r['Out Time'] || '').trim()

    const k = `${month}||${groupVal}`
    if (emp) {
      if (!members.has(k)) members.set(k, new Set())
      members.get(k).add(emp)
    }
    if (flag === 'P') {
      presentCount.set(k, (presentCount.get(k) || 0) + 1)
    }
    if (flag === 'OD') {
      odCount.set(k, (odCount.get(k) || 0) + 1)
    }

    const shiftInH = timeToHours(shiftIn)
    const shiftOutH = timeToHours(shiftOut)
    const inH = timeToHours(inTime)
    const outH = timeToHours(outTime)

    const shiftHrs = shiftOutH > shiftInH ? Math.max(0, shiftOutH - shiftInH) : 0
    const workHrs = outH > inH ? Math.max(0, outH - inH) : 0

    if (shiftHrs > 0 || workHrs > 0) {
      shiftHoursSum.set(k, (shiftHoursSum.get(k) || 0) + shiftHrs)
      workHoursSum.set(k, (workHoursSum.get(k) || 0) + workHrs)
      totalCount.set(k, (totalCount.get(k) || 0) + 1)
      if ((flag === 'P' || flag === 'OD') && workHrs >= shiftHrs && shiftHrs > 0) {
        completedCount.set(k, (completedCount.get(k) || 0) + 1)
      }
    }
  }

  const results = []
  for (const [k, memberSet] of members.entries()) {
    const [month, group] = k.split('||')
    const present = presentCount.get(k) || 0
    const od = odCount.get(k) || 0
    const shiftTotal = shiftHoursSum.get(k) || 0
    const workTotal = workHoursSum.get(k) || 0
    const completed = completedCount.get(k) || 0
    const total = totalCount.get(k) || 0
    const completionPct = (present + od) > 0 ? Number(((completed / (present + od)) * 100).toFixed(2)) : 0
    results.push({
      month,
      group,
      members: memberSet.size,
      present,
      od,
      shift_hours: Number(shiftTotal.toFixed(2)),
      work_hours: Number(workTotal.toFixed(2)),
      completed,
      completion_pct: completionPct,
    })
  }
  results.sort((a, b) => (a.month + a.group).localeCompare(b.month + b.group))
  return results
}

