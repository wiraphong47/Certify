import CloseIcon from '@mui/icons-material/Close'
import { Button, Dialog, Typography } from '@mui/material'

export default function FullscreenCodeDialog({ open, onClose, label, code, courseName }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      aria-label={`${label} ${String(code || '').split('').join(' ')}`}
      PaperProps={{
        sx: {
          bgcolor: '#0C2F53',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 2.5,
          p: 3,
        },
      }}
    >
      <Typography sx={{ fontSize: { xs: 20, sm: 24 }, fontWeight: 700 }}>{label}</Typography>
      <Typography
        sx={{
          fontSize: 'clamp(88px, 30vw, 240px)',
          fontWeight: 800,
          letterSpacing: '0.1em',
          lineHeight: 1.05,
        }}
      >
        {code}
      </Typography>
      <Typography sx={{ fontSize: 18, opacity: 0.88, maxWidth: 640 }}>{courseName}</Typography>
      <Button
        variant="contained"
        color="secondary"
        size="large"
        startIcon={<CloseIcon />}
        onClick={onClose}
        sx={{ mt: 1, px: 4 }}
      >
        ปิด
      </Button>
    </Dialog>
  )
}
