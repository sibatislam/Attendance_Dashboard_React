/**
 * Frontend computation for Leave Analysis KPIs.
 * This mirrors the backend logic in services/leave_analysis.py.
 */

function monthOf(dateStr) {
  if (!dateStr) return ""
  const s = String(dateStr)
  let m = s.match(/(20\d{2})[-/](\d{1,2})/)
  if (m) {
    return `${m[1]}-${String(parseInt(m[2], 10)).padStart(2, '0')}`
  }
  m = s.match(/(\d{1,2})[-/](\d{1,2})[-/](20\d{2})/)
  if (m) {
    return `${m[3]}-${String(parseInt(m[2], 10)).padStart(2, '0')}`
  }
  const monthMap = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'sept': 9, 'oct': 10, 'nov': 11, 'dec': 12,
    'january': 1, 'february': 2, 'march': 3, 'april': 4, 'june': 6, 'july': 7,
    'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
  }
  const lower = s.toLowerCase()
  const ym = lower.match(/(20\d{2})/)
  const mm = lower.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december)/)
  if (ym && mm) {
    return `${ym[1]}-${String(monthMap[mm[1]]).padStart(2, '0')}`
  }
  return s
}

function parseDate(dateStr) {
  if (!dateStr) return [0, 0, 0]
  const s = String(dateStr).trim()
  let m = s.match(/(\d{1,2})[-/](\w{3,})[-/](20\d{2})/i)
  if (m) {
    const monthMap = {
      'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
      'jul': 7, 'aug': 8, 'sep': 9, 'sept': 9, 'oct': 10, 'nov': 11, 'dec': 12,
      'january': 1, 'february': 2, 'march': 3, 'april': 4, 'june': 6, 'july': 7,
      'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
    }
    const month = monthMap[m[2].toLowerCase().substring(0, 3)] || 0
    const day = parseInt(m[1], 10)
    const year = parseInt(m[3], 10)
    return [year, month, day]
  }
  m = s.match(/(20\d{2})[-/](\d{1,2})[-/](\d{1,2})/)
  if (m) {
    return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)]
  }
  return [0, 0, 0]
}

function isConsecutiveDay(date1, date2) {
  const [y1, m1, d1] = date1
  const [y2, m2, d2] = date2
  if (d2 === 1 && (d1 === 30 || d1 === 31)) {
    if ((m2 === m1 + 1 && y2 === y1) || (m2 === 1 && m1 === 12 && y2 === y1 + 1)) {
      return true
    }
  }
  return false
}

export function computeLeaveAnalysis(allRows, groupBy) {
  const keyMap = {
    function: "Function Name",
    company: "Comapny Name",
    location: "Job Location",
  }
  const groupKey = keyMap[groupBy]
  if (!groupKey) {
    throw new Error("Invalid group_by")
  }

  // Organize data by employee for adjacency checking
  const empData = {}
  for (const r of allRows) {
    const empCode = String(r["Employee Code"] || "").trim()
    const empName = String(r["Name"] || "").trim()
    const memberId = empCode || empName
    if (memberId) {
      const dateStr = String(r["Attendance Date"] || "")
      const month = monthOf(dateStr)
      const groupVal = String(r[groupKey] || "")
      const flag = String(r["Flag"] || "").trim()
      const dateKey = parseDate(dateStr)
      const key = `${memberId}|${groupVal}`
      if (!empData[key]) {
        empData[key] = []
      }
      empData[key].push({
        month,
        date: dateKey,
        flag,
        groupVal
      })
    }
  }

  // Sort each employee's data by date
  for (const key in empData) {
    empData[key].sort((a, b) => {
      const [y1, m1, d1] = a.date
      const [y2, m2, d2] = b.date
      if (y1 !== y2) return y1 - y2
      if (m1 !== m2) return m1 - m2
      return d1 - d2
    })
  }

  // Aggregate by month and group
  const members = {}
  const membersWithW = {}  // Members with W flag
  const membersWithH = {}  // Members with H flag
  const membersWithSL = {}  // Members with SL flag (for percentage calculation)
  const membersWithCL = {}  // Members with CL flag (for percentage calculation)
  const membersWithA = {}  // Members with A flag (for percentage calculation)
  const membersWithP = {}  // Members with P flag
  const membersWithOD = {}  // Members with OD flag
  const membersWithEL = {}  // Members with EL flag
  const membersWithWHF = {}  // Members with WHF flag
  // Count flag occurrences (not unique members) for workdays
  const countA = {}
  const countCL = {}
  const countEL = {}
  const countOD = {}
  const countP = {}
  const countSL = {}
  const countWHF = {}
  const slAdjacentW = {}
  const clAdjacentW = {}
  const slAdjacentH = {}
  const clAdjacentH = {}

  function getKey(month, groupVal) {
    return `${month}|${groupVal}`
  }

  // Check adjacency for each employee
  // Filter out P and OD flags - only count W, H, SL, CL, blank, etc.
  for (const [empKey, records] of Object.entries(empData)) {
    if (records.length < 2) {
      continue // Need at least 2 records to check adjacency
    }

    // Filter out P and OD records for adjacency checking
    const filteredRecords = records.filter(r => r.flag !== "P" && r.flag !== "OD")

    // Get groupVal from first record (all records have same groupVal)
    const groupVal = records[0].groupVal

    // Add member to all months they have records in
    for (const record of records) {
      const key = getKey(record.month, groupVal)
      if (!members[key]) {
        members[key] = new Set()
      }
      const memberId = empKey.split('|')[0]
      members[key].add(memberId)
      
      // Track members with W flag
      if (record.flag === "W") {
        if (!membersWithW[key]) {
          membersWithW[key] = new Set()
        }
        membersWithW[key].add(memberId)
      }
      // Track members with H flag
      if (record.flag === "H") {
        if (!membersWithH[key]) {
          membersWithH[key] = new Set()
        }
        membersWithH[key].add(memberId)
      }
      // Track members with SL flag
      if (record.flag === "SL") {
        if (!membersWithSL[key]) {
          membersWithSL[key] = new Set()
        }
        membersWithSL[key].add(memberId)
      }
      // Track members with CL flag
      if (record.flag === "CL") {
        if (!membersWithCL[key]) {
          membersWithCL[key] = new Set()
        }
        membersWithCL[key].add(memberId)
      }
      // Track members with A flag
      if (record.flag === "A") {
        if (!membersWithA[key]) {
          membersWithA[key] = new Set()
        }
        membersWithA[key].add(memberId)
        countA[key] = (countA[key] || 0) + 1
      }
      // Track members with P flag
      if (record.flag === "P") {
        if (!membersWithP[key]) {
          membersWithP[key] = new Set()
        }
        membersWithP[key].add(memberId)
        countP[key] = (countP[key] || 0) + 1
      }
      // Track members with OD flag
      if (record.flag === "OD") {
        if (!membersWithOD[key]) {
          membersWithOD[key] = new Set()
        }
        membersWithOD[key].add(memberId)
        countOD[key] = (countOD[key] || 0) + 1
      }
      // Track members with EL flag
      if (record.flag === "EL") {
        if (!membersWithEL[key]) {
          membersWithEL[key] = new Set()
        }
        membersWithEL[key].add(memberId)
        countEL[key] = (countEL[key] || 0) + 1
      }
      // Track members with WHF flag
      if (record.flag === "WHF") {
        if (!membersWithWHF[key]) {
          membersWithWHF[key] = new Set()
        }
        membersWithWHF[key].add(memberId)
        countWHF[key] = (countWHF[key] || 0) + 1
      }
      // Track CL occurrences for workdays
      if (record.flag === "CL") {
        countCL[key] = (countCL[key] || 0) + 1
      }
      // Track SL occurrences for workdays
      if (record.flag === "SL") {
        countSL[key] = (countSL[key] || 0) + 1
      }
    }

    // Check adjacency for each pair of consecutive filtered records
    if (filteredRecords.length < 2) {
      continue
    }

    for (let i = 0; i < filteredRecords.length - 1; i++) {
      const curr = filteredRecords[i]
      const nextRec = filteredRecords[i + 1]

      // Check if dates are consecutive (difference of 1 day)
      const currDate = curr.date
      const nextDate = nextRec.date

      // Simple check: if year, month, day difference is exactly 1 day
      let isConsecutive = false
      if (currDate[0] === nextDate[0] && 
          currDate[1] === nextDate[1] && 
          nextDate[2] - currDate[2] === 1) {
        isConsecutive = true
      } else if (nextDate[1] > 0 && currDate[1] > 0 && 
                 isConsecutiveDay(currDate, nextDate)) {
        isConsecutive = true
      }

      if (isConsecutive) {
        // Get groupVal from current record (all records in this emp have same groupVal)
        const groupVal = curr.groupVal
        const key = getKey(curr.month, groupVal)

        // Initialize if needed
        if (!slAdjacentW[key]) slAdjacentW[key] = 0
        if (!clAdjacentW[key]) clAdjacentW[key] = 0
        if (!slAdjacentH[key]) slAdjacentH[key] = 0
        if (!clAdjacentH[key]) clAdjacentH[key] = 0

        // Check SL adjacent to W
        if (curr.flag === "SL" && nextRec.flag === "W") {
          slAdjacentW[key]++
        } else if (curr.flag === "W" && nextRec.flag === "SL") {
          slAdjacentW[key]++
        }

        // Check CL adjacent to W
        if (curr.flag === "CL" && nextRec.flag === "W") {
          clAdjacentW[key]++
        } else if (curr.flag === "W" && nextRec.flag === "CL") {
          clAdjacentW[key]++
        }

        // Check SL adjacent to H
        if (curr.flag === "SL" && nextRec.flag === "H") {
          slAdjacentH[key]++
        } else if (curr.flag === "H" && nextRec.flag === "SL") {
          slAdjacentH[key]++
        }

        // Check CL adjacent to H
        if (curr.flag === "CL" && nextRec.flag === "H") {
          clAdjacentH[key]++
        } else if (curr.flag === "H" && nextRec.flag === "CL") {
          clAdjacentH[key]++
        }
      }
    }
  }

  // Calculate percentages and build results
  const results = []
  for (const [monthGroupKey, memberSet] of Object.entries(members)) {
    const [month, groupVal] = monthGroupKey.split('|')
    const key = getKey(month, groupVal)
    const slW = slAdjacentW[key] || 0
    const clW = clAdjacentW[key] || 0
    const slH = slAdjacentH[key] || 0
    const clH = clAdjacentH[key] || 0

    // Calculate percentages
    // SL % = (SL adjacent to W + SL adjacent to H) / Total SL * 100
    // CL % = CL adjacent to W / Total CL * 100
    const totalMembers = memberSet ? memberSet.size : 0
    const totalMembersSL = membersWithSL[key] ? membersWithSL[key].size : 0
    const totalMembersCL = membersWithCL[key] ? membersWithCL[key].size : 0
    const totalMembersA = membersWithA[key] ? membersWithA[key].size : 0
    
    // Workdays = Flag occurrences (A + CL + EL + OD + P + SL + WHF)
    const workdays = (countA[key] || 0) + (countCL[key] || 0) + (countEL[key] || 0) + (countOD[key] || 0) + (countP[key] || 0) + (countSL[key] || 0) + (countWHF[key] || 0)
    
    const slPct = totalMembersSL > 0 ? Number((((slW + slH) / totalMembersSL) * 100.0).toFixed(2)) : 0.0
    const clPct = totalMembersCL > 0 ? Number(((clW / totalMembersCL) * 100.0).toFixed(2)) : 0.0
    const aPct = workdays > 0 ? Number(((totalMembersA / workdays) * 100.0).toFixed(2)) : 0.0
    
    results.push({
      month,
      group: groupVal,
      members: totalMembers,
      total_sl: totalMembersSL,
      total_cl: totalMembersCL,
      workdays: workdays,
      total_a: totalMembersA,
      sl_adjacent_w: slW,
      cl_adjacent_w: clW,
      sl_adjacent_h: slH,
      cl_adjacent_h: clH,
      sl_pct: slPct,
      cl_pct: clPct,
      a_pct: aPct,
    })
  }

  results.sort((a, b) => {
    if (a.month !== b.month) return a.month.localeCompare(b.month)
    return a.group.localeCompare(b.group)
  })

  return results
}

