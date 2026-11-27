import { generatePassword } from '../utils/formatters.js'
import { loadDb, saveDb } from './storageService.js'

export async function createDsrAccount(orgName) {
  const cleanName = String(orgName || '').trim()
  if (!cleanName) {
    return { ok: false, error: 'ใส่ชื่อหน่วยงานก่อน' }
  }
  const db = loadDb()
  let id = ''
  do {
    id = `DSR-${Math.floor(1000 + Math.random() * 9000)}`
  } while (db.dsr.some((d) => d.id === id))

  const pw = generatePassword(8)
  const created = { id, name: cleanName, on: true, pw, chg: false }
  db.dsr.push(created)
  const saved = saveDb(db)
  return { ok: true, account: created, db: saved }
}

export async function updateDsrAccountName(id, nextName) {
  const cleanName = String(nextName || '').trim()
  if (!cleanName) {
    return { ok: false, error: 'ชื่อห้ามว่าง' }
  }
  const db = loadDb()
  const target = db.dsr.find((d) => d.id === id)
  if (!target) return { ok: false, error: 'ไม่พบ DSR ID' }
  target.name = cleanName
  const saved = saveDb(db)
  return { ok: true, db: saved }
}

export async function toggleDsrAccount(id) {
  const db = loadDb()
  const target = db.dsr.find((d) => d.id === id)
  if (!target) return { ok: false, error: 'ไม่พบ DSR ID' }
  target.on = !target.on
  const saved = saveDb(db)
  return { ok: true, account: target, db: saved }
}

export async function resetDsrAccountPassword(id) {
  const db = loadDb()
  const target = db.dsr.find((d) => d.id === id)
  if (!target) return { ok: false, error: 'ไม่พบ DSR ID' }
  target.pw = generatePassword(8)
  target.chg = false
  const saved = saveDb(db)
  return { ok: true, account: target, db: saved }
}

export async function deleteDsrAccount(id) {
  const db = loadDb()
  db.dsr = db.dsr.filter((d) => d.id !== id)
  const saved = saveDb(db)
  return { ok: true, db: saved }
}
