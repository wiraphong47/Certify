import { dayLabel, SAMPLE_NAMES, TH_MONTHS_SHORT } from '../utils/formatters.js'

export function generateCourseRecords(course) {
  if (!course) return []
  let seed = course.id * 131 + 7
  const records = []

  function rand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }

  const total = course.got || 0
  const netCount = course.net || 0
  for (let i = 0; i < total; i += 1) {
    records.push({
      name: SAMPLE_NAMES[Math.floor(rand() * SAMPLE_NAMES.length)],
      day: Math.floor(rand() * rand() * 4),
      hour: 9 + Math.floor(rand() * 9),
      min: Math.floor(rand() * 60),
      phone: `08${Math.floor(rand() * 10)}-xxx-${1000 + Math.floor(rand() * 9000)}`,
      carrier: ['AIS', 'True', 'dtac'][Math.floor(rand() * 3)],
      hasNet: i < netCount,
    })
  }

  return records.sort((a, b) => a.day - b.day || a.hour - b.hour || a.min - b.min)
}

export function buildCourseBuckets(course, records, mode = 'h') {
  const buckets = []
  if (mode === 'd') {
    for (let i = 0; i < 4; i += 1) {
      buckets.push({ label: dayLabel(course?.date, i), value: 0 })
    }
    records.forEach((r) => {
      if (buckets[r.day]) buckets[r.day].value += 1
    })
  } else {
    for (let h = 9; h <= 17; h += 1) {
      buckets.push({ label: `${h} น.`, value: 0 })
    }
    records.forEach((r) => {
      const idx = r.hour - 9
      if (buckets[idx]) buckets[idx].value += 1
    })
  }
  const max = Math.max(1, ...buckets.map((b) => b.value))
  return { buckets, max }
}

export function getMonthlyStats(monthly = []) {
  const n = monthly.length
  const now = new Date()
  const labels = []
  for (let i = 0; i < n; i += 1) {
    const dt = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1)
    labels.push(TH_MONTHS_SHORT[dt.getMonth()])
  }
  const totals = monthly.map((m) => m[0] + m[1])
  const latest = totals[n - 1] || 0
  const previous = totals[n - 2] || 0
  const growthPct = previous ? Math.round(((latest - previous) / previous) * 100) : 0
  const sum = totals.reduce((acc, v) => acc + v, 0)
  const maxSeries = Math.max(1, ...monthly.map((m) => Math.max(m[0], m[1])))

  return { labels, totals, latest, growthPct, sum, maxSeries, count: n }
}

export function getTopCourses(courses = [], limit = 5) {
  const sorted = [...courses].sort((a, b) => (b.got || 0) - (a.got || 0)).slice(0, limit)
  const max = sorted.length ? Math.max(1, sorted[0].got || 0) : 1
  return { rows: sorted, max }
}

export function getDsrBreakdown(courses = [], mode = 'c') {
  const byPeople = mode === 'g'
  const countOf = (type) =>
    courses
      .filter((c) => c.type === type)
      .reduce((acc, c) => acc + (byPeople ? c.got || 0 : 1), 0)

  const dsr = countOf('DSR')
  const nonDsr = countOf('ไม่ใช่ DSR')
  const total = dsr + nonDsr
  return {
    dsr,
    nonDsr,
    total,
    unit: byPeople ? 'คน' : 'หลักสูตร',
    dsrPct: total ? Math.round((dsr / total) * 100) : 0,
    nonDsrPct: total ? Math.round((nonDsr / total) * 100) : 0,
  }
}

export function getCarrierBreakdown(wallet = {}) {
  const keys = Object.keys(wallet)
  const total = keys.reduce((acc, k) => acc + (wallet[k]?.used || 0), 0)
  const items = keys.map((k) => {
    const used = wallet[k]?.used || 0
    return {
      carrier: k,
      used,
      pct: total ? Math.round((used / total) * 100) : 0,
    }
  })
  return { items, total }
}
