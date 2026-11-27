import { useState } from 'react'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import LoginIcon from '@mui/icons-material/Login'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useCertify } from '../context/certify'
import {
  clearAuthSession,
  getAuthSession,
  loginAdmin,
  loginOrganizer,
  setAuthSession,
} from '../services/authService'

const ORGANIZER_SAMPLES = [
  { id: 'DSR-0123', label: 'DSR-0123 (ผู้พิการ·แจกเน็ต)' },
  { id: 'DSR-0245', label: 'DSR-0245 (ไม่แจกเน็ต)' },
  { id: 'DSR-0412', label: 'DSR-0412 (บุคคลทั่วไป)' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { showToast } = useCertify()

  const [existingSession, setExistingSession] = useState(() => getAuthSession())
  const [role, setRole] = useState('organizer') // 'organizer' | 'admin'
  const [identifier, setIdentifier] = useState('DSR-0123')
  const [password, setPassword] = useState('demo1234')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSelectRole = (nextRole) => {
    setRole(nextRole)
    setError('')
    if (nextRole === 'admin') {
      setIdentifier('admin')
      setPassword('admin1234')
    } else {
      setIdentifier('DSR-0123')
      setPassword('demo1234')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError('')
    setSubmitting(true)

    try {
      if (role === 'admin') {
        const res = await loginAdmin(identifier, password)
        if (!res.ok) {
          setError(res.error || 'เข้าสู่ระบบไม่สำเร็จ')
          return
        }
        setAuthSession(res.session)
        showToast('เข้าสู่ระบบผู้ดูแลระบบ (Admin) สำเร็จ', 'success')
        navigate('/admin/overview', { replace: true })
        return
      }

      const res = await loginOrganizer(identifier, password)
      if (!res.ok) {
        setError(res.error || 'เข้าสู่ระบบไม่สำเร็จ')
        return
      }
      setAuthSession(res.session)
      showToast(`ยินดีต้อนรับ ${res.account.name}`, 'success')
      navigate('/organizer/overview', { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogoutExisting = () => {
    clearAuthSession()
    setExistingSession(null)
    showToast('ออกจากระบบแล้ว', 'info')
  }

  return (
    <Box sx={{ maxWidth: 460, mx: 'auto', my: { xs: 1, sm: 2.5 } }}>
      <Card
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            bgcolor: '#0C2F53',
            color: '#FFFFFF',
            px: { xs: 2.5, sm: 3.5 },
            py: 2.25,
            textAlign: 'center',
            borderBottom: '3px solid #FFF200',
          }}
        >
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: 22, sm: 24 }, fontWeight: 800, mb: 0.35, color: '#FFFFFF' }}
          >
            เข้าสู่ระบบเจ้าหน้าที่
          </Typography>
          <Typography variant="body2" sx={{ color: '#FFC600', fontWeight: 600 }}>
            เลือกบทบาทและลงชื่อเข้าใช้งานระบบจัดการ Certify
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>

        {existingSession && (
          <Alert
            severity="info"
            sx={{ mb: 2.5, borderRadius: '12px' }}
            action={
              <Stack direction="row" spacing={0.5}>
                <Button
                  size="small"
                  color="inherit"
                  variant="outlined"
                  onClick={() =>
                    navigate(
                      existingSession.role === 'admin'
                        ? '/admin/overview'
                        : '/organizer/overview',
                    )
                  }
                >
                  ไปหน้าหลัก
                </Button>
                <Button size="small" color="inherit" onClick={handleLogoutExisting}>
                  ออก
                </Button>
              </Stack>
            }
          >
            เข้าสู่ระบบไว้แล้วในฐานะ{' '}
            <b>{existingSession.role === 'admin' ? 'Admin' : existingSession.id}</b>
          </Alert>
        )}

        {/* Staff Role Selector (Segmented Pill Track) */}
        <Box
          sx={(theme) => ({
            p: 0.5,
            mb: 2.5,
            borderRadius: '14px',
            bgcolor:
              theme.palette.mode === 'dark'
                ? 'rgba(6, 21, 39, 0.65)'
                : 'rgba(12, 47, 83, 0.06)',
            border: '1px solid',
            borderColor: 'divider',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0.5,
          })}
        >
          <Button
            type="button"
            variant={role === 'organizer' ? 'contained' : 'text'}
            color={role === 'organizer' ? 'primary' : 'inherit'}
            startIcon={<ManageAccountsIcon />}
            onClick={() => handleSelectRole('organizer')}
            sx={{
              py: 1.05,
              borderRadius: '11px',
              fontWeight: 800,
              color: role === 'organizer' ? undefined : 'text.secondary',
            }}
          >
            ผู้ดูแลหลักสูตร
          </Button>
          <Button
            type="button"
            variant={role === 'admin' ? 'contained' : 'text'}
            color={role === 'admin' ? 'primary' : 'inherit'}
            startIcon={<AdminPanelSettingsIcon />}
            onClick={() => handleSelectRole('admin')}
            sx={{
              py: 1.05,
              borderRadius: '11px',
              fontWeight: 800,
              color: role === 'admin' ? undefined : 'text.secondary',
            }}
          >
            Admin
          </Button>
        </Box>

        <Stack component="form" onSubmit={handleSubmit} spacing={2}>
          <TextField
            label={role === 'admin' ? 'ชื่อผู้ใช้ Admin' : 'DSR ID'}
            placeholder={role === 'admin' ? 'admin' : 'DSR-0123'}
            value={identifier}
            onChange={(e) => {
              setError('')
              setIdentifier(e.target.value)
            }}
            autoComplete="username"
            fullWidth
          />

          <TextField
            label="รหัสผ่าน"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setError('')
              setPassword(e.target.value)
            }}
            autoComplete="current-password"
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {error && (
            <Alert severity="warning" sx={{ borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />
            }
            fullWidth
            sx={{ minHeight: 50, borderRadius: '14px', fontSize: 16, fontWeight: 800 }}
          >
            {submitting
              ? 'กำลังตรวจสอบ...'
              : role === 'admin'
                ? 'เข้าสู่ระบบ Admin'
                : 'เข้าสู่ระบบผู้ดูแลหลักสูตร'}
          </Button>

          {role === 'organizer' ? (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.75 }}
              >
                เลือกบัญชีทดลองด่วน:
              </Typography>
              <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {ORGANIZER_SAMPLES.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.label}
                    size="small"
                    variant={identifier.toUpperCase() === item.id ? 'filled' : 'outlined'}
                    color={identifier.toUpperCase() === item.id ? 'primary' : 'default'}
                    onClick={() => {
                      setError('')
                      setIdentifier(item.id)
                      setPassword('demo1234')
                    }}
                    sx={{ cursor: 'pointer', fontSize: 12 }}
                  />
                ))}
              </Stack>
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">
              บัญชีทดลอง Admin: <b>admin</b> / <b>admin1234</b>
            </Typography>
          )}
        </Stack>

        <Divider sx={{ my: 2.75 }}>
          <Typography variant="caption" color="text.secondary">
            สำหรับนักเรียน / ผู้เข้าอบรม
          </Typography>
        </Divider>

        <Button
          type="button"
          variant="contained"
          size="large"
          fullWidth
          startIcon={<QrCodeScannerIcon />}
          onClick={() => navigate('/student/scan')}
          sx={{
            minHeight: 52,
            borderRadius: '14px',
            fontSize: 16,
            bgcolor: '#FFF200',
            color: '#0C2F53',
            fontWeight: 800,
            border: '2px solid #FFC600',
            '&:hover': { bgcolor: '#FFC600' },
          }}
        >
          สแกน QR รับใบเกียรติบัตร (นักเรียน)
        </Button>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 1 }}
        >
          ผู้เข้าอบรมยืนยันตัวตนผ่านการสแกน QR และ ThaID โดยไม่ต้องใช้รหัสผ่าน
        </Typography>
        </Box>
      </Card>
    </Box>
  )
}
