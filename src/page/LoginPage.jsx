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

export default function LoginPage() {
  const navigate = useNavigate()
  const { showToast } = useCertify()

  const [existingSession, setExistingSession] = useState(() => getAuthSession())
  const [role, setRole] = useState('organizer') // 'organizer' | 'admin'
  const [identifier, setIdentifier] = useState('DSR-0123')
  const [password, setPassword] = useState('demo1234')
  const [showPassword, setShowPassword] = useState(false)
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
    setError('')

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
  }

  const handleLogoutExisting = () => {
    clearAuthSession()
    setExistingSession(null)
    showToast('ออกจากระบบแล้ว', 'info')
  }

  return (
    <Box sx={{ maxWidth: 460, mx: 'auto', my: { xs: 1, sm: 2.5 } }}>
      <Card sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Box sx={{ textAlign: 'center', mb: 2.5 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: 22, sm: 25 }, mb: 0.5 }}>
            เข้าสู่ระบบ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            เลือกบทบาทและลงชื่อเข้าใช้งานระบบ Certify
          </Typography>
        </Box>

        {existingSession && (
          <Alert
            severity="info"
            sx={{ mb: 2.5 }}
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
            <b>
              {existingSession.role === 'admin'
                ? 'Admin'
                : `${existingSession.id}`}
            </b>
          </Alert>
        )}

        {/* Staff Role Selector */}
        <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
          <Button
            type="button"
            variant={role === 'organizer' ? 'contained' : 'outlined'}
            color={role === 'organizer' ? 'primary' : 'inherit'}
            startIcon={<ManageAccountsIcon />}
            onClick={() => handleSelectRole('organizer')}
            sx={{
              flex: 1,
              py: 1.1,
              borderWidth: 2,
              borderColor: role === 'organizer' ? 'primary.main' : 'divider',
              '&:hover': { borderWidth: 2 },
            }}
          >
            ผู้ดูแลหลักสูตร
          </Button>
          <Button
            type="button"
            variant={role === 'admin' ? 'contained' : 'outlined'}
            color={role === 'admin' ? 'primary' : 'inherit'}
            startIcon={<AdminPanelSettingsIcon />}
            onClick={() => handleSelectRole('admin')}
            sx={{
              flex: 1,
              py: 1.1,
              borderWidth: 2,
              borderColor: role === 'admin' ? 'primary.main' : 'divider',
              '&:hover': { borderWidth: 2 },
            }}
          >
            Admin
          </Button>
        </Stack>

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

          {error && <Alert severity="warning">{error}</Alert>}

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            fullWidth
            sx={{ py: 1.35, fontSize: 16 }}
          >
            {role === 'admin' ? 'เข้าสู่ระบบ Admin' : 'เข้าสู่ระบบผู้ดูแลหลักสูตร'}
          </Button>

          <Typography variant="caption" color="text.secondary">
            {role === 'admin'
              ? 'บัญชีทดลอง Admin: admin / admin1234'
              : 'ตัวอย่าง DSR ID: DSR-0123 (ผู้พิการ), DSR-0412 (บุคคลทั่วไป), DSR-0245, DSR-0520 (DSR-0310 ถูกปิดใช้งาน)'}
          </Typography>
        </Stack>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary">
            สำหรับนักเรียน / ผู้เข้าอบรม
          </Typography>
        </Divider>

        <Button
          type="button"
          variant="contained"
          color="secondary"
          size="large"
          fullWidth
          startIcon={<QrCodeScannerIcon />}
          onClick={() => navigate('/student/scan')}
          sx={{
            py: 1.4,
            fontSize: 16,
            color: '#0C2F53',
            fontWeight: 800,
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
      </Card>
    </Box>
  )
}
