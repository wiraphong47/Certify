import { generatePassword } from '../utils/helpers.js'

export function createDsrService(repo) {
  return {
    async listDsr() {
      return repo.listDsr()
    },

    async createDsrAccount(orgName) {
      const cleanName = String(orgName || '').trim()
      if (!cleanName) {
        return { ok: false, status: 400, error: 'ใส่ชื่อหน่วยงานก่อน' }
      }
      const existing = await repo.listDsr()
      let id = ''
      do {
        id = `DSR-${Math.floor(1000 + Math.random() * 9000)}`
      } while (existing.some((d) => d.id === id))

      const pw = generatePassword(8)
      const account = await repo.createDsr({ id, name: cleanName, on: true, pw, chg: false })
      const db = await repo.getState()
      return { ok: true, account, db }
    },

    async updateDsrAccountName(id, nextName) {
      const cleanName = String(nextName || '').trim()
      if (!cleanName) {
        return { ok: false, status: 400, error: 'ชื่อห้ามว่าง' }
      }
      const updated = await repo.updateDsr(id, { name: cleanName })
      if (!updated) {
        return { ok: false, status: 404, error: 'ไม่พบ DSR ID' }
      }
      const db = await repo.getState()
      return { ok: true, account: updated, db }
    },

    async toggleDsrAccount(id) {
      const current = await repo.getDsrById(id)
      if (!current) {
        return { ok: false, status: 404, error: 'ไม่พบ DSR ID' }
      }
      const updated = await repo.updateDsr(id, { on: !current.on })
      const db = await repo.getState()
      return { ok: true, account: updated, db }
    },

    async resetDsrAccountPassword(id) {
      const current = await repo.getDsrById(id)
      if (!current) {
        return { ok: false, status: 404, error: 'ไม่พบ DSR ID' }
      }
      const updated = await repo.updateDsr(id, { pw: generatePassword(8), chg: false })
      const db = await repo.getState()
      return { ok: true, account: updated, db }
    },

    async deleteDsrAccount(id) {
      await repo.deleteDsr(id)
      const db = await repo.getState()
      return { ok: true, db }
    },
  }
}
