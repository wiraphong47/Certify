export function generatePassword(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
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
