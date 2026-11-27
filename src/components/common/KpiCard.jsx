import { Box, Card, Typography } from '@mui/material'

const TONE_BG = {
  t1: 'rgba(14, 124, 134, 0.20)',
  t2: 'rgba(255, 200, 69, 0.35)',
  t3: 'rgba(18, 114, 74, 0.22)',
  t4: 'rgba(96, 120, 230, 0.22)',
}

export default function KpiCard({ icon, value, label, tone = 't1' }) {
  return (
    <Card
      sx={{
        p: 1.75,
        display: 'flex',
        gap: 1.5,
        alignItems: 'center',
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: 46,
          height: 46,
          borderRadius: 3,
          display: 'grid',
          placeItems: 'center',
          fontSize: 22,
          flex: 'none',
          bgcolor: TONE_BG[tone] || TONE_BG.t1,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="div"
          sx={{
            fontWeight: 800,
            fontSize: String(value ?? '').length > 7 ? 17 : 24,
            lineHeight: 1.15,
            overflowWrap: 'anywhere',
          }}
        >
          {String(value ?? '')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Card>
  )
}
