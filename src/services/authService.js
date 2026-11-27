import { loadDb, saveDb } from './storageService.js'

const AUTH_SESSION_KEY = 'certify_auth_session'
const ADMIN_USERNAME = 'ADMIN'
const ADMIN_DEMO_PASSWORD = 'admin1234'

export function getAuthSession() {
  try {
    if (typeof window === 'undefined') return null
    const raw = window.sessionStorage.getItem(AUTH_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && (parsed.role === 'admin' || parsed.role === 'organizer') && parsed.id) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function setAuthSession(session) {
  try {
    if (typeof window === 'undefined') return
    if (session) {
      window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
    } else {
      window.sessionStorage.removeItem(AUTH_SESSION_KEY)
    }
  } catch {
    // ignore storage errors
  }
}

export function clearAuthSession() {
  setAuthSession(null)
}

export async function loginAdmin(usernameInput, password) {
  const username = String(usernameInput || '').trim().toUpperCase()
  const pw = String(password || '')
  if (!username) {
    return { ok: false, error: 'กรุณากรอกชื่อผู้ใช้ Admin' }
  }
  if (username !== ADMIN_USERNAME) {
    return { ok: false, error: 'ชื่อผู้ใช้ Admin ไม่ถูกต้อง' }
  }
  if (!pw) {
    return { ok: false, error: 'กรุณากรอกรหัสผ่าน' }
  }
  if (pw !== ADMIN_DEMO_PASSWORD) {
    return { ok: false, error: 'รหัสผ่าน Admin ไม่ถูกต้อง' }
  }
  return {
    ok: true,
    session: {
      role: 'admin',
      id: ADMIN_USERNAME,
      name: 'ผู้ดูแลระบบ',
    },
  }
}

export async function loginOrganizer(dsrIdInput, password) {
  const id = String(dsrIdInput || '').trim().toUpperCase()
  const db = loadDb()
  const account = db.dsr.find((d) => d.id === id)
  if (!account || !account.on) {
    return { ok: false, error: 'DSR ID ไม่ถูกต้อง หรือถูกปิดใช้งาน' }
  }
  if (!String(password || '')) {
    return { ok: false, error: 'ใส่รหัสผ่านก่อน' }
  }
  return {
    ok: true,
    account,
    session: {
      role: 'organizer',
      id: account.id,
      name: account.name,
    },
  }
}

export async function changeOrganizerPassword(dsrId, _currentPw, newPw, confirmPw) {
  if (!newPw || newPw.length < 8) {
    return { ok: false, error: 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัว' }
  }
  if (newPw !== confirmPw) {
    return { ok: false, error: 'รหัสผ่านใหม่ไม่ตรงกัน' }
  }
  const db = loadDb()
  const account = db.dsr.find((d) => d.id === dsrId)
  if (account) {
    account.chg = true
    account.pw = ''
  }
  const saved = saveDb(db)
  return { ok: true, db: saved }
}

export async function authenticateWithThaid() {
  return {
    ok: true,
    user: {
      fullName: 'สมชาย ใจดี',
      verifiedAt: Date.now(),
    },
  }
}
