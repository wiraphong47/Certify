import { useMemo, useState } from 'react'
import { useTheme } from '@mui/material'
import AdminOverview from '../../components/admin/AdminOverview'
import { useCertify } from '../../context/certify'
import {
  getCarrierBreakdown,
  getDsrBreakdown,
  getMonthlyStats,
  getTopCourses,
} from '../../services/analyticsService'
import { CARRIER_COLORS } from '../../utils/thaiSpeech'

const DONUT_CIRC = 2 * Math.PI * 38

export default function AdminOverviewPage() {
  const theme = useTheme()
  const { db } = useCertify()

  const [dsrMode, setDsrMode] = useState('c')

  const tealColor = theme.palette.primary.main
  const lineColor = theme.palette.divider

  const totalGot = useMemo(
    () => db.courses.reduce((sum, c) => sum + (c.got || 0), 0),
    [db.courses],
  )
  const monthly = useMemo(() => getMonthlyStats(db.monthly), [db.monthly])
  const topCourses = useMemo(() => getTopCourses(db.courses, 5), [db.courses])
  const dsrStats = useMemo(() => getDsrBreakdown(db.courses, dsrMode), [db.courses, dsrMode])
  const carrierStats = useMemo(() => getCarrierBreakdown(db.wallet), [db.wallet])

  const monthlyChartGeom = useMemo(() => {
    const x0 = 30
    const x1 = 292
    const y0 = 135
    const y1 = 24
    const bw = monthly.count ? (x1 - x0) / monthly.count : 40
    const yPos = (v) => y0 - (v / monthly.maxSeries) * (y0 - y1)

    const gridLines = [0, 0.5, 1].map((frac) => {
      const val = Math.round(monthly.maxSeries * frac)
      return { key: String(frac), x0, x1, y: yPos(val), val }
    })

    const series = [0, 1].map((idx) => {
      const color = idx === 0 ? tealColor : '#FFC600'
      const dots = db.monthly.map((m, i) => ({
        key: `${idx}-${i}`,
        x: x0 + bw * i + bw / 2,
        y: yPos(m[idx]),
        val: m[idx],
      }))
      return {
        key: String(idx),
        color,
        dots,
        polylinePoints: dots.map((d) => `${d.x},${d.y}`).join(' '),
      }
    })

    const labelCoords = monthly.labels.map((label, i) => ({
      key: `${label}-${i}`,
      x: x0 + bw * i + bw / 2,
      label,
    }))

    return { gridLines, series, labelCoords }
  }, [db.monthly, monthly, tealColor])

  const dsrArc = dsrStats.total ? (DONUT_CIRC * dsrStats.dsr) / dsrStats.total : 0
  const nonDsrArc = dsrStats.total ? (DONUT_CIRC * dsrStats.nonDsr) / dsrStats.total : 0

  const carrierArcs = useMemo(() => {
    return carrierStats.items.reduce((acc, item) => {
      const prevOffset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].arcLen : 0
      const arcLen = carrierStats.total ? (DONUT_CIRC * item.used) / carrierStats.total : 0
      acc.push({
        ...item,
        arcLen,
        offset: prevOffset,
        color: CARRIER_COLORS[item.carrier] || tealColor,
      })
      return acc
    }, [])
  }, [carrierStats, tealColor])

  return (
    <AdminOverview
      totalGot={totalGot}
      courseCount={db.courses.length}
      dsrCount={db.dsr.length}
      monthly={monthly}
      monthlyGridLines={monthlyChartGeom.gridLines}
      monthlySeries={monthlyChartGeom.series}
      monthlyLabelCoords={monthlyChartGeom.labelCoords}
      topCourses={topCourses}
      dsrMode={dsrMode}
      dsrStats={dsrStats}
      dsrArc={dsrArc}
      nonDsrArc={nonDsrArc}
      carrierStats={carrierStats}
      carrierArcs={carrierArcs}
      donutCirc={DONUT_CIRC}
      tealColor={tealColor}
      lineColor={lineColor}
      onDsrModeChange={setDsrMode}
    />
  )
}
