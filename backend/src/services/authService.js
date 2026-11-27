import { env } from '../config/env.js'

export function createAuthService(repo) {
  return {
    async loginAdmin(usernameInput, password) {
      const username = String(usernameInput || '').trim().toUpperCase()
      const pw = String(password || '')
      if (!username) {
        return { ok: false, status: 400, error: 'กรุณากรอกชื่อผู้ใช้ Admin' }
      }
      if (username !== env.adminUsername) {
        return { ok: false, status: 401, error: 'ชื่อผู้ใช้ Admin ไม่ถูกต้อง' }
      }
      if (!pw) {
        return { ok: false, status: 400, error: 'กรุณากรอกรหัสผ่าน' }
      }
      if (pw !== env.adminPassword) {
        return { ok: false, status: 401, error: 'รหัสผ่าน Admin ไม่ถูกต้อง' }
      }
      return {
        ok: true,
        session: {
          role: 'admin',
          id: env.adminUsername,
          name: 'ผู้ดูแลระบบ',
        },
      }
    },

    async loginOrganizer(dsrIdInput, password) {
      const id = String(dsrIdInput || '').trim().toUpperCase()
      const account = await repo.getDsrById(id)
      if (!account || !account.on) {
        return { ok: false, status: 401, error: 'DSR ID ไม่ถูกต้อง หรือถูกปิดใช้งาน' }
      }
      if (!String(password || '')) {
        return { ok: false, status: 400, error: 'ใส่รหัสผ่านก่อน' }
      }
      // Note: Replace with bcrypt password hash comparison when moving to production DB
      return {
        ok: true,
        account,
        session: {
          role: 'organizer',
          id: account.id,
          name: account.name,
        },
      }
    },

    async changeOrganizerPassword(dsrId, _currentPw, newPw, confirmPw) {
      if (!newPw || String(newPw).length < 8) {
        return { ok: false, status: 400, error: 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัว' }
      }
      if (newPw !== confirmPw) {
        return { ok: false, status: 400, error: 'รหัสผ่านใหม่ไม่ตรงกัน' }
      }
      const id = String(dsrId || '').trim().toUpperCase()
      await repo.updateDsr(id, { chg: true, pw: '' })
      const db = await repo.getState()
      return { ok: true, db }
    },

    async authenticateWithThaid() {
      return {
        ok: true,
        user: {
          fullName: 'สมชาย ใจดี',
          verifiedAt: Date.now(),
        },
      }
    },
  }
}
