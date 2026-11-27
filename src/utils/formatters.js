export const TH_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
]

export const TH_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
]

export const SAMPLE_NAMES = [
  'สมชาย ใจดี',
  'สมหญิง รักเรียน',
  'ประเสริฐ มั่นคง',
  'วิไล สุขใจ',
  'อนุชา แสงทอง',
  'มาลี ศรีสุข',
  'ธนากร เพชรดี',
  'สุดา พูนผล',
  'กิตติ ทองคำ',
  'นภา สายชล',
  'วีระ ชัยมงคล',
  'รัตนา บุญมา',
]

export function thDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getDate()} ${TH_MONTHS[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`
}

export function fmtMMSS(totalSec) {
  const safe = Math.max(0, Math.floor(totalSec))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatPhone(phone = '') {
  return String(phone).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
}

export function isValidThaiPhone(phone = '') {
  return /^0\d{9}$/.test(String(phone))
}

export function generatePassword(length = 8) {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export function dayLabel(courseDate, offsetDays) {
  if (!courseDate) return `วันที่ ${offsetDays + 1}`
  const d = new Date(courseDate)
  if (Number.isNaN(d.getTime())) return `วันที่ ${offsetDays + 1}`
  d.setDate(d.getDate() + offsetDays)
  return `${d.getDate()}/${d.getMonth() + 1}`
}
