import { Suspense, useMemo, useState } from 'react'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import BadgeIcon from '@mui/icons-material/Badge'
import BarChartIcon from '@mui/icons-material/BarChart'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import { Box, Button, Card, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { clearAuthSession, getAuthSession } from '../../services/authService'

const ADMIN_NAV = [
  { path: '/admin/overview', label: 'ภาพรวม', icon: <BarChartIcon fontSize="small" /> },
  { path: '/admin/courses', label: 'หลักสูตร', icon: <MenuBookIcon fontSize="small" /> },
  { path: '/admin/dsr', label: 'DSR ID', icon: <BadgeIcon fontSize="small" /> },
  { path: '/admin/wallet', label: 'คลังโค้ดเน็ต', icon: <AccountBalanceWalletIcon fontSize="small" /> },
  { path: '/admin/qr', label: 'QR', icon: <QrCode2Icon fontSize="small" /> },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [hideChrome, setHideChrome] = useState(false)

  const outletContext = useMemo(() => ({ setHideChrome }), [])

  const session = getAuthSession()
  if (!session || session.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    clearAuthSession()
    navigate('/login', { replace: true })
  }

  return (
    <Stack spacing={2}>
      {!hideChrome && (
        <Box
          sx={{
            bgcolor: '#0C2F53',
            color: '#FFFFFF',
            borderRadius: 2.5,
            borderBottom: '4px solid #FFF200',
            p: { xs: 2, sm: 2.75 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="h2" sx={{ color: '#fff', fontSize: { xs: 19, sm: 22 } }}>
              แผงควบคุม Admin
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Certify · จัดการหลักสูตร DSR ID โค้ดเน็ต และ QR
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Chip label="ผู้ดูแลระบบ" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }} />
            <Button
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                bgcolor: 'rgba(255,255,255,0.18)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
              }}
            >
              ออกจากระบบ
            </Button>
          </Stack>
        </Box>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: hideChrome ? '1fr' : { xs: '1fr', md: '195px 1fr' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {!hideChrome && (
          <Card
            sx={{
              p: 1,
              display: 'flex',
              flexDirection: { xs: 'row', md: 'column' },
              gap: 0.5,
              overflowX: { xs: 'auto', md: 'visible' },
              position: { md: 'sticky' },
              top: { md: 12 },
            }}
          >
            {ADMIN_NAV.map((item) => {
              const isActive = location.pathname.startsWith(item.path)
              return (
                <Button
                  key={item.path}
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    justifyContent: 'flex-start',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    px: 1.5,
                    py: 1.25,
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? '#fff' : 'text.primary',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  {item.label}
                </Button>
              )
            })}
          </Card>
        )}

        <Box sx={{ minWidth: 0 }}>
          <Suspense
            fallback={
              <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            }
          >
            <Outlet context={outletContext} />
          </Suspense>
        </Box>
      </Box>
    </Stack>
  )
}
