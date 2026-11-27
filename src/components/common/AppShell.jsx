import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import LoginIcon from '@mui/icons-material/Login'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import {
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'

export default function AppShell({
  mode,
  isKiosk,
  showLoginAction,
  onToggleMode,
  onResetDemo,
  onGoHome,
  onGoLogin,
  children,
}) {
  return (
    <Box sx={{ minHeight: '100svh', bgcolor: 'background.default', pb: 5 }}>
      {!isKiosk && (
        <Container maxWidth="md" sx={{ pt: 2, px: { xs: 1.5, sm: 2 } }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Box>
              <Typography
                component="h1"
                sx={{ fontSize: 26, fontWeight: 800, lineHeight: 1.25, m: 0 }}
              >
                <Box
                  component="button"
                  type="button"
                  onClick={onGoHome}
                  aria-label="กลับหน้าหลัก Certify"
                  sx={(theme) => ({
                    bgcolor: theme.palette.certify.sun,
                    color: '#0C2F53',
                    px: 1,
                    py: 0.15,
                    borderRadius: 1.2,
                    border: 0,
                    cursor: 'pointer',
                    font: 'inherit',
                  })}
                >
                  Certify
                </Box>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                สแกนรับใบเกียรติบัตรและโค้ดเน็ตฟรี สำหรับผู้พิการและผู้เข้าอบรม
              </Typography>
            </Box>

            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              {showLoginAction && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<LoginIcon />}
                  onClick={onGoLogin}
                  sx={{ borderWidth: 1.5, whiteSpace: 'nowrap' }}
                >
                  เข้าสู่ระบบ
                </Button>
              )}
              <Tooltip title={mode === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}>
                <IconButton
                  onClick={onToggleMode}
                  aria-label="สลับธีมสว่างและมืด"
                  sx={{ border: 1, borderColor: 'divider' }}
                >
                  {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="รีเซ็ตข้อมูลทดลองกลับค่าเริ่มต้น">
                <IconButton
                  onClick={onResetDemo}
                  aria-label="รีเซ็ตข้อมูลทดลอง"
                  sx={{ border: 1, borderColor: 'divider' }}
                >
                  <RestartAltIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Container>
      )}

      <Container maxWidth="md" component="main" sx={{ mt: 2, px: { xs: 1.5, sm: 2 } }}>
        {children}
      </Container>
    </Box>
  )
}
