import { Suspense, useCallback, useMemo, useState } from 'react'
import BarChartIcon from '@mui/icons-material/BarChart'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import { Alert, Box, Button, Card, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useCertify } from '../../context/certify'
import { clearAuthSession, getAuthSession, setAuthSession } from '../../services/authService'
import { getCourseStatus } from '../../services/courseService'

const ORGANIZER_NAV = [
  { path: '/organizer/overview', label: 'ภาพรวม', icon: <BarChartIcon /> },
  { path: '/organizer/settings', label: 'ตั้งค่า', icon: <SettingsIcon /> },
]

function readStoredOrganizerId() {
  const session = getAuthSession()
  return session?.role === 'organizer' ? session.id : ''
}

export default function OrganizerLayout() {
  const { db } = useCertify()
  const location = useLocation()
  const navigate = useNavigate()

  const [loggedInId, setLoggedInId] = useState(() => readStoredOrganizerId())

  const org = useMemo(
    () => db.dsr.find((d) => d.id === loggedInId && d.on) || null,
    [db.dsr, loggedInId],
  )
  const activeLoggedInId = org ? org.id : ''

  const course = useMemo(
    () => (activeLoggedInId ? db.courses.find((c) => c.owner === activeLoggedInId) || null : null),
    [activeLoggedInId, db.courses],
  )

  const handleLoginSuccess = useCallback(
    (accountId, accountName = '') => {
      setLoggedInId(accountId)
      setAuthSession({ role: 'organizer', id: accountId, name: accountName })
      navigate('/organizer/overview', { replace: true })
    },
    [navigate],
  )

  const handleLogout = useCallback(() => {
    setLoggedInId('')
    clearAuthSession()
    navigate('/login', { replace: true })
  }, [navigate])

  const status = useMemo(() => (course ? getCourseStatus(course) : null), [course])
  const isCheckin = course?.mode === 'checkin'
  const expiryText = useMemo(() => {
    if (!course?.exp || !status) return 'ไม่ได้กำหนดวันหมดอายุ'
    if (status.daysLeft < 0) return `หมดอายุแล้ว เมื่อ ${course.exp}`
    if (status.daysLeft === 0) return 'หมดอายุวันนี้'
    return `เหลืออีก ${status.daysLeft} วัน (ถึง ${course.exp})`
  }, [course, status])

  const outletContext = useMemo(
    () => ({
      loggedInId: activeLoggedInId,
      org,
      course,
      status,
      isCheckin,
      expiryText,
      onLoginSuccess: handleLoginSuccess,
      onLogout: handleLogout,
    }),
    [activeLoggedInId, course, expiryText, handleLoginSuccess, handleLogout, isCheckin, org, status],
  )

  const isLoginRoute = location.pathname.startsWith('/organizer/login')

  if (!activeLoggedInId && !isLoginRoute) {
    return <Navigate to="/login" replace />
  }

  if (activeLoggedInId && isLoginRoute) {
    return <Navigate to="/organizer/overview" replace />
  }

  if (isLoginRoute) {
    return <Outlet context={outletContext} />
  }

  if (!course) {
    return (
      <Card sx={{ p: 3 }}>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
        >
          <Box>
            <Typography variant="h2">{org?.name || activeLoggedInId}</Typography>
            <Typography variant="body2" color="text.secondary">
              {activeLoggedInId}
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout}>
            ออกจากระบบ
          </Button>
        </Stack>
        <Alert severity="warning">DSR ID นี้ยังไม่มีหลักสูตรผูกอยู่ กรุณาติดต่อ Admin</Alert>
      </Card>
    )
  }

  const modeLabel = isCheckin
    ? 'บุคคลทั่วไป · Check-in + Check-out'
    : 'ผู้พิการ · Check-out'

  return (
    <Stack spacing={2}>
      {/* Hero Banner */}
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
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h2" sx={{ color: '#fff', fontSize: { xs: 19, sm: 22 } }}>
            {org?.name || activeLoggedInId}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.92, mt: 0.5 }}>
            <Chip
              label={activeLoggedInId}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                mr: 1,
                height: 24,
              }}
            />
            {course.name}
            {course.date ? ` · ${course.date}` : ''}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: 1.25 }}>
            <Chip
              size="small"
              label={`● ${status.text}`}
              sx={{
                bgcolor: status.kind === 'ok' ? 'rgba(94, 212, 160, 0.35)' : '#FFC600',
                color: status.kind === 'ok' ? '#fff' : '#0C2F53',
              }}
            />
            <Chip
              size="small"
              label={modeLabel}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            />
            <Chip
              size="small"
              label={course.hasNet === false ? 'รับเฉพาะใบเซอร์ (ไม่แจกเน็ต)' : 'แจกโค้ดเน็ต'}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            />
          </Stack>
        </Box>

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
      </Box>

      {/* Sub-navigation */}
      <Stack direction="row" spacing={1}>
        {ORGANIZER_NAV.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <Button
              key={item.path}
              variant={isActive ? 'contained' : 'outlined'}
              color={isActive ? 'secondary' : 'inherit'}
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                flex: 1,
                borderWidth: 2,
                borderColor: isActive ? 'secondary.main' : 'divider',
                bgcolor: isActive ? 'secondary.main' : 'background.paper',
                color: isActive ? '#0C2F53' : 'text.primary',
              }}
            >
              {item.label}
            </Button>
          )
        })}
      </Stack>

      <Suspense
        fallback={
          <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        }
      >
        <Outlet context={outletContext} />
      </Suspense>
    </Stack>
  )
}
