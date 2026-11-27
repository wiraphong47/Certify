import { lazy, Suspense } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import AppShell from './components/common/AppShell'
import { useCertify } from './context/certify'
import { useThemeMode } from './context/themeMode'
import LoginPage from './page/LoginPage'
import StudentCertificatePage from './page/student/StudentCertificatePage'
import StudentCodePage from './page/student/StudentCodePage'
import StudentLayout from './page/student/StudentLayout'
import StudentPhonePage from './page/student/StudentPhonePage'
import StudentScanPage from './page/student/StudentScanPage'
import StudentThaidPage from './page/student/StudentThaidPage'

const OrganizerLayout = lazy(() => import('./page/organizer/OrganizerLayout'))
const OrganizerLoginPage = lazy(() => import('./page/organizer/OrganizerLoginPage'))
const OrganizerOverviewPage = lazy(() => import('./page/organizer/OrganizerOverviewPage'))
const OrganizerSettingsPage = lazy(() => import('./page/organizer/OrganizerSettingsPage'))

const AdminLayout = lazy(() => import('./page/admin/AdminLayout'))
const AdminOverviewPage = lazy(() => import('./page/admin/AdminOverviewPage'))
const AdminCoursesPage = lazy(() => import('./page/admin/AdminCoursesPage'))
const AdminDsrPage = lazy(() => import('./page/admin/AdminDsrPage'))
const AdminWalletPage = lazy(() => import('./page/admin/AdminWalletPage'))
const AdminQrPage = lazy(() => import('./page/admin/AdminQrPage'))

function PageFallback() {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  )
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { mode, toggleMode } = useThemeMode()
  const { resetDemo } = useCertify()

  const searchParams = new URLSearchParams(location.search)
  const isKiosk = searchParams.get('kiosk') === '1'
  const showLoginAction = location.pathname.startsWith('/student')

  return (
    <AppShell
      mode={mode}
      isKiosk={isKiosk}
      showLoginAction={showLoginAction}
      onToggleMode={toggleMode}
      onResetDemo={resetDemo}
      onGoHome={() => navigate('/student/scan')}
      onGoLogin={() => navigate('/login')}
    >
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/student/scan" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* นักเรียน */}
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={null} />
            <Route path="scan" element={<StudentScanPage />} />
            <Route path="thaid" element={<StudentThaidPage />} />
            <Route path="code" element={<StudentCodePage />} />
            <Route path="phone" element={<StudentPhonePage />} />
            <Route path="certificate" element={<StudentCertificatePage />} />
            <Route path="*" element={<Navigate to="/student/scan" replace />} />
          </Route>

          {/* ผู้ดูแลหลักสูตร */}
          <Route path="/organizer" element={<OrganizerLayout />}>
            <Route index element={<Navigate to="/organizer/overview" replace />} />
            <Route path="login" element={<OrganizerLoginPage />} />
            <Route path="overview" element={<OrganizerOverviewPage />} />
            <Route path="settings" element={<OrganizerSettingsPage />} />
            <Route path="*" element={<Navigate to="/organizer/overview" replace />} />
          </Route>

          {/* แอดมิน */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<AdminOverviewPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="dsr" element={<AdminDsrPage />} />
            <Route path="wallet" element={<AdminWalletPage />} />
            <Route path="qr" element={<AdminQrPage />} />
            <Route path="*" element={<Navigate to="/admin/overview" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/student/scan" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  )
}
