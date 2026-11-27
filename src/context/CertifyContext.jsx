import { useCallback, useMemo, useState } from 'react'
import { Alert, Snackbar } from '@mui/material'
import { changeOrganizerPassword } from '../services/authService'
import {
  deleteCourse as deleteCourseSvc,
  recordCertificateClaim as recordClaimSvc,
  recordCheckIn as recordCheckInSvc,
  regenerateCourseCode as regenCodeSvc,
  saveCourse as saveCourseSvc,
  unlockCheckoutDemo as unlockDemoSvc,
} from '../services/courseService'
import {
  createDsrAccount,
  deleteDsrAccount,
  resetDsrAccountPassword,
  toggleDsrAccount,
  updateDsrAccountName,
} from '../services/dsrService'
import { rotateUniversalQr } from '../services/qrService'
import { loadDb, resetDb } from '../services/storageService'
import { adjustWalletStock } from '../services/walletService'
import { CertifyContext } from './certify'

export function CertifyProvider({ children }) {
  const [db, setDb] = useState(() => loadDb())
  const [toastState, setToastState] = useState({ open: false, message: '', severity: 'info' })

  const showToast = useCallback((message, severity = 'info') => {
    setToastState({ open: true, message, severity })
  }, [])

  const closeToast = useCallback(() => {
    setToastState((prev) => ({ ...prev, open: false }))
  }, [])

  const resetDemo = useCallback(() => {
    const fresh = resetDb()
    setDb(fresh)
    showToast('รีเซ็ตข้อมูลทดลองกลับค่าเริ่มต้นแล้ว', 'success')
  }, [showToast])

  const saveCourse = useCallback(
    async (courseInput, role = 'organizer') => {
      const res = await saveCourseSvc(courseInput, role)
      if (res.ok && res.db) {
        setDb(res.db)
        showToast('บันทึกหลักสูตรแล้ว', 'success')
      }
      return res
    },
    [showToast],
  )

  const deleteCourse = useCallback(
    async (courseId) => {
      const res = await deleteCourseSvc(courseId)
      if (res.ok && res.db) {
        setDb(res.db)
        showToast('ลบหลักสูตรแล้ว', 'info')
      }
      return res
    },
    [showToast],
  )

  const regenerateCourseCode = useCallback(
    async (ownerId, kind) => {
      const res = await regenCodeSvc(ownerId, kind)
      if (res.ok && res.db) {
        setDb(res.db)
        showToast(kind === 'in' ? 'สุ่มรหัส Check-in ใหม่แล้ว' : 'สุ่มรหัส Check-out ใหม่แล้ว', 'success')
      }
      return res
    },
    [showToast],
  )

  const recordCheckIn = useCallback(async (courseId) => {
    const res = await recordCheckInSvc(courseId)
    if (res.ok && res.db) setDb(res.db)
    return res
  }, [])

  const unlockCheckoutDemo = useCallback(
    async (courseId) => {
      const res = await unlockDemoSvc(courseId)
      if (res.ok && res.db) {
        setDb(res.db)
        showToast('เปิดให้กรอกรหัส Check-out แล้ว', 'success')
      }
      return res
    },
    [showToast],
  )

  const recordCertificateClaim = useCallback(async (payload) => {
    const res = await recordClaimSvc(payload)
    if (res.ok && res.db) setDb(res.db)
    return res
  }, [])

  const createDsr = useCallback(
    async (orgName) => {
      const res = await createDsrAccount(orgName)
      if (res.ok && res.db) {
        setDb(res.db)
        showToast(`สร้าง ${res.account.id} แล้ว รหัสผ่านชั่วคราว ${res.account.pw}`, 'success')
      } else if (res.error) {
        showToast(res.error, 'warning')
      }
      return res
    },
    [showToast],
  )

  const updateDsrName = useCallback(
    async (id, nextName) => {
      const res = await updateDsrAccountName(id, nextName)
      if (res.ok && res.db) {
        setDb(res.db)
        showToast('บันทึกชื่อหน่วยงานแล้ว', 'success')
      } else if (res.error) {
        showToast(res.error, 'warning')
      }
      return res
    },
    [showToast],
  )

  const toggleDsr = useCallback(async (id) => {
    const res = await toggleDsrAccount(id)
    if (res.ok && res.db) setDb(res.db)
    return res
  }, [])

  const resetDsrPassword = useCallback(
    async (id) => {
      const res = await resetDsrAccountPassword(id)
      if (res.ok && res.db) {
        setDb(res.db)
        showToast(`รีเซ็ตรหัสผ่าน ${id} แล้ว`, 'success')
      }
      return res
    },
    [showToast],
  )

  const deleteDsr = useCallback(
    async (id) => {
      const res = await deleteDsrAccount(id)
      if (res.ok && res.db) {
        setDb(res.db)
        showToast(`ลบ ${id} แล้ว`, 'info')
      }
      return res
    },
    [showToast],
  )

  const adjustWallet = useCallback(
    async (carrier, delta) => {
      const res = await adjustWalletStock(carrier, delta)
      if (res.ok && res.db) {
        setDb(res.db)
        showToast(`${delta > 0 ? 'เติม' : 'ตัด'} ${Math.abs(delta)} โค้ด ${carrier}`, 'success')
      } else if (res.error) {
        showToast(res.error, 'warning')
      }
      return res
    },
    [showToast],
  )

  const rotateQr = useCallback(async () => {
    const res = await rotateUniversalQr()
    if (res.ok && res.db) {
      setDb(res.db)
      showToast(`สร้าง QR ใหม่ (v${res.qrVersion}) แล้ว`, 'success')
    }
    return res
  }, [showToast])

  const changePassword = useCallback(
    async (dsrId, curPw, newPw, confPw) => {
      const res = await changeOrganizerPassword(dsrId, curPw, newPw, confPw)
      if (res.ok && res.db) {
        setDb(res.db)
        showToast('เปลี่ยนรหัสผ่านแล้ว', 'success')
      }
      return res
    },
    [showToast],
  )

  const value = useMemo(
    () => ({
      db,
      showToast,
      resetDemo,
      saveCourse,
      deleteCourse,
      regenerateCourseCode,
      recordCheckIn,
      unlockCheckoutDemo,
      recordCertificateClaim,
      createDsr,
      updateDsrName,
      toggleDsr,
      resetDsrPassword,
      deleteDsr,
      adjustWallet,
      rotateQr,
      changePassword,
    }),
    [
      db,
      showToast,
      resetDemo,
      saveCourse,
      deleteCourse,
      regenerateCourseCode,
      recordCheckIn,
      unlockCheckoutDemo,
      recordCertificateClaim,
      createDsr,
      updateDsrName,
      toggleDsr,
      resetDsrPassword,
      deleteDsr,
      adjustWallet,
      rotateQr,
      changePassword,
    ],
  )

  return (
    <CertifyContext.Provider value={value}>
      {children}
      <Snackbar
        open={toastState.open}
        autoHideDuration={2800}
        onClose={closeToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeToast}
          severity={toastState.severity}
          variant="filled"
          sx={{ borderRadius: 6, fontWeight: 600 }}
        >
          {toastState.message}
        </Alert>
      </Snackbar>
    </CertifyContext.Provider>
  )
}
