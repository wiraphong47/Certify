import { fmtMMSS } from '../utils/formatters.js'
import { apiRequest, callApiWithFallback } from './apiClient.js'
import { loadDb, saveDb } from './storageService.js'

export async function listCourses() {
  const res = await apiRequest('/courses')
  if (res.reachable && res.data?.ok && Array.isArray(res.data.courses)) {
    return res.data.courses
  }
  return loadDb().courses
}

export async function getCourseById(id) {
  const res = await apiRequest(`/courses/${encodeURIComponent(id)}`)
  if (res.reachable && res.data?.ok) {
    return res.data.course || null
  }
  return loadDb().courses.find((c) => c.id === id) || null
}

export async function getCourseByOwner(ownerId) {
  const courses = await listCourses()
  return courses.find((c) => c.owner === ownerId) || null
}

export function generateUniqueCode(courses, excludeCourseId = 0, avoidCode = '') {
  let candidate = ''
  let attempts = 0
  do {
    candidate = String(Math.floor(1000 + Math.random() * 9000))
    attempts += 1
  } while (
    attempts < 500 &&
    (candidate === avoidCode ||
      courses.some(
        (x) =>
          x.id !== excludeCourseId &&
          (x.code === candidate || (x.mode === 'checkin' && x.codeIn === candidate)),
      ))
  )
  return candidate
}

export function validateCourseInput(course, allCourses, role = 'organizer') {
  if (!String(course.name || '').trim()) {
    return 'ใส่ชื่อหลักสูตรก่อน'
  }
  if (role === 'admin' && !course.owner) {
    return 'ไม่มี DSR ID ว่าง ให้สร้าง DSR ID ใหม่ก่อน'
  }
  if (course.code && !/^\d{4}$/.test(course.code)) {
    return 'รหัส Check-out ต้องเป็นตัวเลข 4 หลัก'
  }
  if (course.mode === 'checkin' && course.codeIn && !/^\d{4}$/.test(course.codeIn)) {
    return 'รหัส Check-in ต้องเป็นตัวเลข 4 หลัก'
  }
  if (course.mode === 'checkin' && course.code && course.codeIn && course.code === course.codeIn) {
    return 'รหัส Check-in และ Check-out ห้ามซ้ำกัน'
  }
  if (
    course.code &&
    allCourses.some(
      (x) =>
        x.id !== course.id &&
        (x.code === course.code || (x.mode === 'checkin' && x.codeIn === course.code)),
    )
  ) {
    return 'รหัส Check-out นี้ซ้ำกับหลักสูตรอื่น ลองรหัสใหม่'
  }
  if (
    course.mode === 'checkin' &&
    course.codeIn &&
    allCourses.some(
      (x) =>
        x.id !== course.id &&
        (x.code === course.codeIn || (x.mode === 'checkin' && x.codeIn === course.codeIn)),
    )
  ) {
    return 'รหัส Check-in นี้ซ้ำกับหลักสูตรอื่น ลองรหัสใหม่'
  }
  return ''
}

function saveCourseLocal(courseInput, role = 'organizer') {
  const db = loadDb()
  const normalized = {
    ...courseInput,
    name: String(courseInput.name || '').trim(),
    hasNet: courseInput.hasNet !== false,
    outWait:
      courseInput.mode === 'checkin'
        ? Math.max(0, Number.parseInt(courseInput.outWait, 10) || 0)
        : 0,
    codeIn: courseInput.mode === 'checkin' ? String(courseInput.codeIn || '').trim() : '',
    code: String(courseInput.code || '').trim(),
  }

  const err = validateCourseInput(normalized, db.courses, role)
  if (err) {
    return { ok: false, error: err }
  }

  if (normalized.id) {
    const idx = db.courses.findIndex((c) => c.id === normalized.id)
    if (idx >= 0) {
      db.courses[idx] = { ...db.courses[idx], ...normalized }
    } else {
      db.courses.push(normalized)
    }
  } else {
    normalized.id = Date.now()
    normalized.ci = normalized.ci || 0
    normalized.got = normalized.got || 0
    normalized.net = normalized.net || 0
    db.courses.push(normalized)
  }

  const saved = saveDb(db)
  return { ok: true, course: normalized, db: saved }
}

export async function saveCourse(courseInput, role = 'organizer') {
  const path = courseInput?.id ? `/courses/${encodeURIComponent(courseInput.id)}` : '/courses'
  const method = courseInput?.id ? 'PUT' : 'POST'
  return callApiWithFallback(
    path,
    { method, body: { course: courseInput, role } },
    () => saveCourseLocal(courseInput, role),
    saveDb,
  )
}

function deleteCourseLocal(courseId) {
  const db = loadDb()
  db.courses = db.courses.filter((c) => c.id !== courseId)
  if (db.checkedIn && db.checkedIn[courseId]) {
    delete db.checkedIn[courseId]
  }
  const saved = saveDb(db)
  return { ok: true, db: saved }
}

export async function deleteCourse(courseId) {
  return callApiWithFallback(
    `/courses/${encodeURIComponent(courseId)}`,
    { method: 'DELETE' },
    () => deleteCourseLocal(courseId),
    saveDb,
  )
}

function regenerateCourseCodeLocal(ownerId, kind = 'out') {
  const db = loadDb()
  const course = db.courses.find((c) => c.owner === ownerId)
  if (!course) return { ok: false, error: 'ไม่พบหลักสูตรของผู้ดูแลรายนี้' }

  if (kind === 'in') {
    course.codeIn = generateUniqueCode(db.courses, course.id, course.code)
  } else {
    course.code = generateUniqueCode(db.courses, course.id, course.codeIn)
  }
  const saved = saveDb(db)
  return { ok: true, course, db: saved }
}

export async function regenerateCourseCode(ownerId, kind = 'out') {
  return callApiWithFallback(
    '/courses/regenerate-code',
    { method: 'POST', body: { ownerId, kind } },
    () => regenerateCourseCodeLocal(ownerId, kind),
    saveDb,
  )
}

export function getCheckoutRemainingSec(course, checkedInMap = {}, now = Date.now()) {
  if (!course || course.mode !== 'checkin') return 0
  const rec = checkedInMap[course.id]
  if (!rec || rec.unlocked) return 0
  const waitMin = Number(course.outWait || 0)
  if (waitMin <= 0) return 0
  return Math.max(0, Math.ceil((rec.at + waitMin * 60000 - now) / 1000))
}

export function verifyStudentCode(
  digits,
  courses,
  checkedInMap = {},
  stepId = 'checkout',
  now = Date.now(),
) {
  const cIn = courses.find((x) => x.mode === 'checkin' && x.codeIn === digits)
  if (cIn) {
    return {
      ok: true,
      action: 'in',
      course: cIn,
      skipConfirm: false,
      speech: `รหัสเช็กอินเริ่มเรียน หลักสูตร ${cIn.name} ถ้าใช่ปัดขวาเพื่อยืนยันเช็กอิน ถ้าไม่ใช่ปัดซ้ายเพื่อแก้ไข`,
    }
  }

  const cOut = courses.find((x) => x.code === digits)
  if (!cOut) {
    return {
      ok: false,
      reason: 'not_found',
      message:
        stepId === 'checkin'
          ? 'รหัส Check-in ไม่ถูกต้อง ลองตรวจสอบแล้วกรอกใหม่'
          : 'ไม่พบหลักสูตรจากรหัสนี้ ลองตรวจสอบแล้วกรอกใหม่',
      speech: 'ไม่พบหลักสูตรจากรหัสนี้ ลองตรวจสอบแล้วกรอกใหม่',
    }
  }

  if (cOut.mode === 'checkin' && !checkedInMap[cOut.id]) {
    return {
      ok: false,
      reason: 'need_checkin',
      course: cOut,
      message: `หลักสูตรบุคคลทั่วไปต้องกรอกรหัส Check-in ตอนเริ่มเรียนก่อน (รหัส Check-in: ${cOut.codeIn || '-'})`,
      speech: 'หลักสูตรนี้ต้องเช็กอินตอนเริ่มเรียนก่อน กรุณาเช็กอินก่อนรับใบเกียรติบัตร',
    }
  }

  const remSec = getCheckoutRemainingSec(cOut, checkedInMap, now)
  if (cOut.mode === 'checkin' && remSec > 0) {
    return {
      ok: false,
      reason: 'wait_checkout',
      course: cOut,
      remainSec: remSec,
      message: `ยังไม่ถึงเวลากรอกรหัส Check-out (กรุณารออีก ${fmtMMSS(remSec)} นาที)`,
      speech: 'ยังไม่ถึงเวลากรอกรหัสเช็กเอาต์ กรุณารอให้ครบเวลาเรียนก่อน',
    }
  }

  return {
    ok: true,
    action: 'out',
    course: cOut,
    skipConfirm: cOut.mode === 'checkin',
    speech: `รหัสเช็กเอาต์ หลักสูตร ${cOut.name} ถ้าใช่ปัดขวาเพื่อยืนยัน ถ้าไม่ใช่ปัดซ้ายเพื่อแก้ไข`,
  }
}

function recordCheckInLocal(courseId) {
  const db = loadDb()
  const course = db.courses.find((c) => c.id === courseId)
  if (!course) return { ok: false, error: 'ไม่พบหลักสูตร' }

  if (!db.checkedIn) db.checkedIn = {}
  if (!db.checkedIn[courseId]) {
    db.checkedIn[courseId] = { at: Date.now(), unlocked: false }
    course.ci = (course.ci || 0) + 1
  }
  const saved = saveDb(db)
  return { ok: true, course, db: saved }
}

export async function recordCheckIn(courseId) {
  return callApiWithFallback(
    `/courses/${encodeURIComponent(courseId)}/checkin`,
    { method: 'POST' },
    () => recordCheckInLocal(courseId),
    saveDb,
  )
}

function unlockCheckoutDemoLocal(courseId) {
  const db = loadDb()
  if (db.checkedIn && db.checkedIn[courseId]) {
    db.checkedIn[courseId].unlocked = true
  }
  const saved = saveDb(db)
  return { ok: true, db: saved }
}

export async function unlockCheckoutDemo(courseId) {
  return callApiWithFallback(
    `/courses/${encodeURIComponent(courseId)}/unlock-demo`,
    { method: 'POST' },
    () => unlockCheckoutDemoLocal(courseId),
    saveDb,
  )
}

function recordCertificateClaimLocal({ courseId, carrier, skipped }) {
  const db = loadDb()
  const course = db.courses.find((c) => c.id === courseId)
  if (course) {
    course.got = (course.got || 0) + 1
    if (course.hasNet !== false && !skipped) {
      course.net = (course.net || 0) + 1
      if (carrier && db.wallet[carrier] && db.wallet[carrier].used < db.wallet[carrier].total) {
        db.wallet[carrier].used += 1
      }
    }
  }
  const saved = saveDb(db)
  return { ok: true, course, db: saved }
}

export async function recordCertificateClaim({ courseId, carrier, skipped }) {
  return callApiWithFallback(
    `/courses/${encodeURIComponent(courseId)}/claim`,
    { method: 'POST', body: { carrier, skipped } },
    () => recordCertificateClaimLocal({ courseId, carrier, skipped }),
    saveDb,
  )
}

export function getCourseStatus(course) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysLeft = course.exp
    ? Math.ceil((new Date(course.exp).getTime() - today.getTime()) / 86400000)
    : null

  if (course.mode === 'checkin' && !course.codeIn) {
    return { text: 'ยังไม่ตั้งรหัส Check-in', kind: 'warn', daysLeft }
  }
  if (!course.code) {
    return { text: 'ยังไม่ตั้งรหัส Check-out', kind: 'warn', daysLeft }
  }
  if (daysLeft !== null && daysLeft < 0) {
    return { text: 'รหัสหมดอายุแล้ว', kind: 'warn', daysLeft }
  }
  return { text: 'พร้อมรับใบเกียรติบัตร', kind: 'ok', daysLeft }
}

export function getCourseChecklist(course) {
  const items = []
  if (course.mode === 'checkin') {
    items.push({ label: 'ตั้งรหัส Check-in 4 หลัก (เริ่มเรียน)', done: Boolean(course.codeIn) })
  }
  items.push(
    { label: 'ตั้งรหัส Check-out 4 หลัก (รับใบเซอร์)', done: Boolean(course.code) },
    { label: 'ตั้งวันหมดอายุรหัส', done: Boolean(course.exp) },
    { label: 'ใส่ข้อความบนใบเกียรติบัตร', done: Boolean(course.txt) },
    { label: 'ใส่ชื่อผู้ลงนามคนที่ 1', done: Boolean(course.signer) },
    { label: 'ใส่ลายเซ็นผู้ลงนามคนที่ 1', done: Boolean(course.sig) },
  )
  if (course.signer2 || course.sig2) {
    items.push(
      { label: 'ใส่ชื่อผู้ลงนามคนที่ 2', done: Boolean(course.signer2) },
      { label: 'ใส่ลายเซ็นผู้ลงนามคนที่ 2', done: Boolean(course.sig2) },
    )
  }
  return items
}
