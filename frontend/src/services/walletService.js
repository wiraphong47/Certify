import { formatPhone } from '../utils/formatters.js'
import { callApiWithFallback } from './apiClient.js'
import { loadDb, saveDb } from './storageService.js'

const CARRIER_USSD_PREFIX = {
  AIS: '*777*',
  True: '*900*',
  dtac: '*104*',
}

export function buildNetRedemptionGuide({ carrier = '', phone = '', skipped = false } = {}) {
  const digits = String(Math.floor(10000000 + Math.random() * 90000000))
  const carrierKey = CARRIER_USSD_PREFIX[carrier] ? carrier : ''
  const carrierLabel = carrier || (skipped ? 'ยังไม่ได้เลือกเครือข่าย (รับภายหลัง)' : 'AIS')
  const ussd = `${CARRIER_USSD_PREFIX[carrierKey] || '*123*'}${digits}#`
  const formattedPhone = phone ? formatPhone(phone) : 'หมายเลขที่ลงทะเบียนไว้'

  const steps = carrierKey
    ? [
        `เปิดแอป "โทรศัพท์" บนมือถือหมายเลข ${formattedPhone} (เครือข่าย ${carrierKey})`,
        `กดรหัส ${ussd} แล้วกดปุ่ม "โทรออก"`,
        'รอรับข้อความ SMS ยืนยันการเปิดใช้งานอินเทอร์เน็ตฟรีภายใน 1–3 นาที',
        'หากไม่สะดวกกดเอง สามารถเปิดรูปภาพนี้ให้เจ้าหน้าที่ศูนย์ฯ หรือผู้ดูแลหลักสูตรช่วยกดรับสิทธิ์ได้',
      ]
    : [
        `เตรียมมือถือหมายเลข ${formattedPhone} และตรวจสอบเครือข่ายที่ใช้งาน (AIS / True / dtac หรือเครือข่ายอื่น)`,
        `เปิดแอป "โทรศัพท์" แล้วกดรหัส ${ussd} จากนั้นกดปุ่ม "โทรออก"`,
        'รอรับข้อความ SMS ยืนยันการเปิดใช้งานอินเทอร์เน็ตฟรีภายใน 1–3 นาที',
        'หากไม่สะดวกกดเอง สามารถนำรูปภาพนี้ให้เจ้าหน้าที่ศูนย์ฯ หรือผู้ดูแลหลักสูตรช่วยกดรับสิทธิ์ได้',
      ]

  return {
    ussd,
    carrierLabel,
    formattedPhone,
    skipped: Boolean(skipped),
    steps,
  }
}

function adjustWalletStockLocal(carrier, delta) {
  const amount = Number(delta)
  if (!Number.isFinite(amount) || amount === 0) {
    return { ok: false, error: 'กรุณาระบุจำนวนที่มากกว่า 0' }
  }
  const db = loadDb()
  const item = db.wallet[carrier]
  if (!item) {
    return { ok: false, error: 'ไม่พบเครือข่ายที่ระบุ' }
  }

  const remaining = item.total - item.used
  if (amount < 0 && Math.abs(amount) > remaining) {
    return { ok: false, error: `ตัดได้ไม่เกินโค้ดที่เหลือ (${remaining})` }
  }

  item.total += amount
  const saved = saveDb(db)
  return { ok: true, db: saved }
}

export async function adjustWalletStock(carrier, delta) {
  return callApiWithFallback(
    '/wallet/adjust',
    { method: 'POST', body: { carrier, delta } },
    () => adjustWalletStockLocal(carrier, delta),
    saveDb,
  )
}
