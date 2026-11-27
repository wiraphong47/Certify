import LockResetIcon from '@mui/icons-material/LockReset'
import { Alert, Button, Card, Grid, TextField, Typography } from '@mui/material'

export default function PasswordChangeCard({
  curPw,
  newPw,
  confPw,
  error,
  onCurPwChange,
  onNewPwChange,
  onConfPwChange,
  onSubmit,
}) {
  return (
    <Card sx={{ p: 2.5 }} component="form" onSubmit={onSubmit}>
      <Typography variant="h3" sx={{ mb: 2 }}>
        เปลี่ยนรหัสผ่าน
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="รหัสผ่านเดิม"
            type="password"
            value={curPw}
            onChange={(e) => onCurPwChange(e.target.value)}
            autoComplete="current-password"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)"
            type="password"
            value={newPw}
            onChange={(e) => onNewPwChange(e.target.value)}
            autoComplete="new-password"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label="ยืนยันรหัสผ่านใหม่"
            type="password"
            value={confPw}
            onChange={(e) => onConfPwChange(e.target.value)}
            autoComplete="new-password"
            fullWidth
          />
        </Grid>
      </Grid>

      {error && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Button type="submit" variant="contained" startIcon={<LockResetIcon />} sx={{ mt: 2 }}>
        เปลี่ยนรหัสผ่าน
      </Button>
    </Card>
  )
}
