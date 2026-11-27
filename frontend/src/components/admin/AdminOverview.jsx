import { Box, Button, Card, Chip, Grid, Stack, Typography } from '@mui/material'
import KpiCard from '../common/KpiCard'

export default function AdminOverview({
  totalGot,
  courseCount,
  dsrCount,
  monthly,
  monthlyGridLines,
  monthlySeries,
  monthlyLabelCoords,
  topCourses,
  dsrMode,
  dsrStats,
  dsrArc,
  nonDsrArc,
  carrierStats,
  carrierArcs,
  donutCirc,
  tealColor,
  lineColor,
  onDsrModeChange,
}) {
  return (
    <Stack spacing={2}>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard icon="🎓" value={totalGot} label="รับใบเกียรติบัตรทั้งหมด" tone="t1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiCard icon="📚" value={courseCount} label="จำนวนหลักสูตร" tone="t4" />
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
          <KpiCard icon="🪪" value={dsrCount} label="หน่วยงาน DSR ID" tone="t2" />
        </Grid>
      </Grid>

      <Card sx={{ p: 2.25 }}>
        <Typography variant="h3">ผู้รับใบเกียรติบัตรรายเดือน</Typography>
        <Typography sx={{ mt: 1 }}>
          <Box component="b" sx={{ fontSize: 28 }}>
            {monthly.latest}
          </Box>{' '}
          คนเดือนนี้{' '}
          <Box
            component="b"
            sx={{ color: monthly.growthPct >= 0 ? 'success.main' : 'warning.main' }}
          >
            {monthly.growthPct >= 0 ? '▲' : '▼'} {Math.abs(monthly.growthPct)}%
          </Box>{' '}
          <Typography component="span" variant="body2" color="text.secondary">
            จากเดือนก่อน · รวม {monthly.count} เดือน {monthly.sum} คน
          </Typography>
        </Typography>

        <Box
          component="svg"
          viewBox="0 0 300 165"
          role="img"
          aria-label="กราฟผู้รับใบเกียรติบัตรรายเดือน"
          sx={{ width: '100%', maxHeight: 270, mt: 1 }}
        >
          {monthlyGridLines.map((row) => (
            <g key={row.key}>
              <line x1={row.x0} y1={row.y} x2={row.x1} y2={row.y} stroke={lineColor} />
              <text
                x={row.x0 - 4}
                y={row.y + 3}
                textAnchor="end"
                fontSize="10"
                fill="currentColor"
                opacity="0.7"
              >
                {row.val}
              </text>
            </g>
          ))}

          {monthlySeries.map((series) => (
            <g key={series.key}>
              <polyline
                points={series.polylinePoints}
                fill="none"
                stroke={series.color}
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {series.dots.map((dot) => (
                <g key={dot.key}>
                  <circle cx={dot.x} cy={dot.y} r="3.5" fill={series.color} />
                  <text x={dot.x} y={dot.y - 7} textAnchor="middle" fontSize="10" fill="currentColor">
                    {dot.val}
                  </text>
                </g>
              ))}
            </g>
          ))}

          {monthlyLabelCoords.map((item) => (
            <text
              key={item.key}
              x={item.x}
              y="152"
              textAnchor="middle"
              fontSize="10"
              fill="currentColor"
              opacity="0.8"
            >
              {item.label}
            </text>
          ))}
        </Box>

        <Stack direction="row" spacing={2.5} useFlexGap sx={{ flexWrap: 'wrap', fontSize: 14 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 14, height: 14, borderRadius: 0.75, bgcolor: tealColor }} />
            <span>หลักสูตร DSR</span>
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 14, height: 14, borderRadius: 0.75, bgcolor: '#FFC600' }} />
            <span>ไม่ใช่ DSR</span>
          </Stack>
        </Stack>
      </Card>

      <Card sx={{ p: 2.25 }}>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Typography variant="h3">5 หลักสูตรที่มีผู้รับใบประกาศมากที่สุด</Typography>
          <Chip label="อัปเดตตามข้อมูลปัจจุบัน" size="small" variant="outlined" />
        </Stack>

        <Stack spacing={1.5} sx={{ mt: 2 }}>
          {topCourses.rows.map((c) => (
            <Box
              key={c.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(100px, 1fr) minmax(60px, 1.4fr) 38px',
                  sm: 'minmax(140px, 1.2fr) minmax(90px, 2fr) 44px',
                },
                gap: 1.5,
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" noWrap title={c.name}>
                {c.name}
              </Typography>
              <Box
                role="img"
                aria-label={`${c.name}: ${c.got} คน`}
                sx={{ height: 14, borderRadius: 2, bgcolor: 'divider', overflow: 'hidden' }}
              >
                <Box
                  sx={{
                    width: `${Math.round(((c.got || 0) / topCourses.max) * 100)}%`,
                    minWidth: 3,
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                  }}
                />
              </Box>
              <Typography sx={{ fontWeight: 700, textAlign: 'right' }}>{c.got}</Typography>
            </Box>
          ))}
        </Stack>
      </Card>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2.25, height: '100%' }}>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Typography variant="h3">สัดส่วน DSR / ไม่ใช่ DSR</Typography>
              <Stack direction="row" spacing={0.5}>
                {[
                  { key: 'c', label: 'ตามหลักสูตร' },
                  { key: 'g', label: 'ตามผู้รับ' },
                ].map((opt) => (
                  <Button
                    key={opt.key}
                    size="small"
                    variant={dsrMode === opt.key ? 'contained' : 'outlined'}
                    color={dsrMode === opt.key ? 'secondary' : 'inherit'}
                    onClick={() => onDsrModeChange(opt.key)}
                    sx={{ py: 0.4, px: 1.2, fontSize: 13 }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </Stack>
            </Stack>

            <Stack
              direction="row"
              spacing={2.5}
              useFlexGap
              sx={{ alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}
            >
              <svg viewBox="0 0 100 100" width="156" height="156" role="img" aria-label="สัดส่วน DSR">
                <circle cx="50" cy="50" r="38" fill="none" stroke={lineColor} strokeWidth="16" />
                {dsrArc > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke={tealColor}
                    strokeWidth="16"
                    strokeDasharray={`${dsrArc} ${donutCirc}`}
                    transform="rotate(-90 50 50)"
                  />
                )}
                {nonDsrArc > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#FFC600"
                    strokeWidth="16"
                    strokeDasharray={`${nonDsrArc} ${donutCirc}`}
                    strokeDashoffset={-dsrArc}
                    transform="rotate(-90 50 50)"
                  />
                )}
                <text x="50" y="52" textAnchor="middle" fontSize="22" fontWeight="800" fill="currentColor">
                  {dsrStats.total}
                </text>
                <text x="50" y="66" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.7">
                  {dsrStats.unit}
                </text>
              </svg>

              <Stack spacing={1} sx={{ flex: 1, minWidth: 170 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 14, height: 14, borderRadius: 0.75, bgcolor: tealColor }} />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    หลักสูตร DSR
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{dsrStats.dsr}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({dsrStats.dsrPct}%)
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 14, height: 14, borderRadius: 0.75, bgcolor: '#FFC600' }} />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    ไม่ใช่ DSR
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{dsrStats.nonDsr}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({dsrStats.nonDsrPct}%)
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2.25, height: '100%' }}>
            <Typography variant="h3">เครือข่ายที่ผู้ใช้เลือก</Typography>

            <Stack
              direction="row"
              spacing={2.5}
              useFlexGap
              sx={{ alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}
            >
              <svg viewBox="0 0 100 100" width="156" height="156" role="img" aria-label="สัดส่วนเครือข่าย">
                <circle cx="50" cy="50" r="38" fill="none" stroke={lineColor} strokeWidth="16" />
                {carrierArcs.map((seg) =>
                  seg.arcLen > 0 ? (
                    <circle
                      key={seg.carrier}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="16"
                      strokeDasharray={`${seg.arcLen} ${donutCirc}`}
                      strokeDashoffset={-seg.offset}
                      transform="rotate(-90 50 50)"
                    />
                  ) : null,
                )}
                <text x="50" y="52" textAnchor="middle" fontSize="22" fontWeight="800" fill="currentColor">
                  {carrierStats.total}
                </text>
                <text x="50" y="66" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.7">
                  โค้ด
                </text>
              </svg>

              <Stack spacing={1} sx={{ flex: 1, minWidth: 170 }}>
                {carrierArcs.map((item) => (
                  <Stack key={item.carrier} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: 0.75,
                        bgcolor: item.color,
                      }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {item.carrier}
                    </Typography>
                    <Typography sx={{ fontWeight: 700 }}>{item.used}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({item.pct}%)
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
