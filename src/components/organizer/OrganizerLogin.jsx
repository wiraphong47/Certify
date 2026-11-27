import LoginIcon from '@mui/icons-material/Login'
import { Alert, Box, Button, Card, Stack, TextField, Typography } from '@mui/material'

export default function OrganizerLogin({
  dsrId,
  password,
  error,
  onDsrIdChange,
  onPasswordChange,
  onSubmit,
}) {
  return (
    <Card sx={{ maxWidth: 420, mx: 'auto', my: 2.5, p: 3 }}>
      <Box sx={{ fontWeight: 800, fontSize: 22, mb: 1 }}>
        <Box
          component="span"
          sx={(theme) => ({
            bgcolor: theme.palette.certify.sun,
            color: '#0C2F53',
            px: 1,
            borderRadius: 1.2,
          })}
        >
          Certify
        </Box>
      </Box>

      <Typography variant="h2" sx={{ mb: 0.5 }}>
        เข้าสู่ระบบผู้ดูแลหลักสูตร
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        แต่ละ DSR ID เข้าดูได้เฉพาะหลักสูตรของตัวเองหลักสูตรเดียว
      </Typography>

      <Stack component="form" onSubmit={onSubmit} spacing={2}>
        <TextField
          label="DSR ID"
          value={dsrId}
          onChange={(e) => onDsrIdChange(e.target.value)}
          autoComplete="username"
          fullWidth
        />
        <TextField
          label="รหัสผ่าน"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          autoComplete="current-password"
          fullWidth
        />

        {error && <Alert severity="warning">{error}</Alert>}

        <Button type="submit" variant="contained" size="large" startIcon={<LoginIcon />} fullWidth>
          เข้าสู่ระบบ
        </Button>

        <Typography variant="caption" color="text.secondary">
          ตัวอย่าง: DSR-0123 (ผู้พิการ), DSR-0412 (บุคคลทั่วไป Check-in+Out), DSR-0245, DSR-0520
          (DSR-0310 ถูกปิดใช้งาน)
        </Typography>
      </Stack>
    </Card>
  )
}
