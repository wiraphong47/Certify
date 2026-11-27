import { Box, Card, Typography } from '@mui/material'

const TONE_STYLES = {
  t1: {
    bgLight: 'rgba(12, 47, 83, 0.10)',
    bgDark: 'rgba(255, 242, 0, 0.16)',
    accent: '#0C2F53',
    accentDark: '#FFF200',
  },
  t2: {
    bgLight: 'rgba(255, 242, 0, 0.34)',
    bgDark: 'rgba(255, 242, 0, 0.22)',
    accent: '#FFC600',
    accentDark: '#FFF200',
  },
  t3: {
    bgLight: 'rgba(255, 198, 0, 0.26)',
    bgDark: 'rgba(255, 198, 0, 0.22)',
    accent: '#FFC600',
    accentDark: '#FFC600',
  },
  t4: {
    bgLight: 'rgba(12, 47, 83, 0.14)',
    bgDark: 'rgba(255, 198, 0, 0.16)',
    accent: '#0C2F53',
    accentDark: '#FFC600',
  },
}

export default function KpiCard({ icon, value, label, tone = 't1' }) {
  const style = TONE_STYLES[tone] || TONE_STYLES.t1

  return (
    <Card
      sx={(theme) => ({
        p: 1.75,
        display: 'flex',
        gap: 1.5,
        alignItems: 'center',
        borderLeft: `4px solid ${theme.palette.mode === 'dark' ? style.accentDark : style.accent}`,
      })}
    >
      <Box
        aria-hidden="true"
        sx={(theme) => ({
          width: 46,
          height: 46,
          borderRadius: '12px',
          display: 'grid',
          placeItems: 'center',
          fontSize: 22,
          flex: 'none',
          bgcolor: theme.palette.mode === 'dark' ? style.bgDark : style.bgLight,
        })}
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
