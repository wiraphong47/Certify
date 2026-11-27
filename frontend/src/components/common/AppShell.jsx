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
        <Box
          component="header"
          sx={{
            bgcolor: '#0C2F53',
            color: '#FFFFFF',
            borderBottom: '3px solid #FFF200',
          }}
        >
          <Container maxWidth="md" sx={{ py: { xs: 1.25, sm: 1.5 }, px: { xs: 1.5, sm: 2 } }}>
            <Stack
              direction="row"
              spacing={1.25}
              useFlexGap
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                rowGap: 0.75,
              }}
            >
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
                <Box
                  component="button"
                  type="button"
                  onClick={onGoHome}
                  aria-label="กลับหน้าหลัก Certify"
                  sx={{
                    bgcolor: '#FFF200',
                    color: '#0C2F53',
                    px: 1.25,
                    py: 0.3,
                    borderRadius: '8px',
                    border: 0,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: 800,
                    fontSize: { xs: 19, sm: 21 },
                    lineHeight: 1.2,
                    '&:hover': { bgcolor: '#FFC600' },
                  }}
                >
                  Certify
                </Box>

                <Box
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    borderLeft: '1px solid rgba(255, 255, 255, 0.25)',
                    pl: 1.25,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontSize: 13.5, fontWeight: 600, color: '#FFFFFF', lineHeight: 1.25 }}
                  >
                    ระบบรับใบเกียรติบัตรและโค้ดเน็ตฟรี
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontSize: 11.5, color: 'rgba(255, 255, 255, 0.78)', display: 'block' }}
                  >
                    สำหรับผู้พิการและผู้เข้าอบรม
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexShrink: 0 }}>
                {showLoginAction && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<LoginIcon fontSize="small" />}
                    onClick={onGoLogin}
                    sx={{
                      bgcolor: '#FFF200',
                      color: '#0C2F53',
                      fontWeight: 800,
                      borderRadius: '8px',
                      whiteSpace: 'nowrap',
                      minHeight: 36,
                      px: 1.5,
                      '&:hover': { bgcolor: '#FFC600' },
                    }}
                  >
                    เข้าสู่ระบบ
                  </Button>
                )}
                <Tooltip title={mode === 'dark' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด'}>
                  <IconButton
                    onClick={onToggleMode}
                    aria-label="สลับธีมสว่างและมืด"
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#FFF200',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.10)',
                        borderColor: '#FFC600',
                      },
                    }}
                  >
                    {mode === 'dark' ? (
                      <LightModeIcon fontSize="small" />
                    ) : (
                      <DarkModeIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="รีเซ็ตข้อมูลทดลองกลับค่าเริ่มต้น">
                  <IconButton
                    onClick={onResetDemo}
                    aria-label="รีเซ็ตข้อมูลทดลอง"
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#FFFFFF',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.10)',
                        borderColor: '#FFC600',
                      },
                    }}
                  >
                    <RestartAltIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Container>
        </Box>
      )}

      <Container
        maxWidth="md"
        component="main"
        sx={{ mt: { xs: 1.75, sm: 2.25 }, px: { xs: 1.5, sm: 2 } }}
      >
        {children}
      </Container>
    </Box>
  )
}
