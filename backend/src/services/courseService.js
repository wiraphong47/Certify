import { generateUniqueCode, validateCourseInput } from '../utils/helpers.js'

export function createCourseService(repo) {
  return {
    async listCourses() {
      return repo.listCourses()
    },

    async getCourseById(id) {
      return repo.getCourseById(id)
    },

    async saveCourse(courseInput, role = 'organizer') {
      const allCourses = await repo.listCourses()
      const normalized = {
        ...courseInput,
        name: String(courseInput?.name || '').trim(),
        hasNet: courseInput?.hasNet !== false,
        outWait:
          courseInput?.mode === 'checkin'
            ? Math.max(0, Number.parseInt(courseInput.outWait, 10) || 0)
            : 0,
        codeIn: courseInput?.mode === 'checkin' ? String(courseInput.codeIn || '').trim() : '',
        code: String(courseInput?.code || '').trim(),
      }

      const err = validateCourseInput(normalized, allCourses, role)
      if (err) {
        return { ok: false, status: 400, error: err }
      }

      const savedCourse = await repo.upsertCourse(normalized)
      const db = await repo.getState()
      return { ok: true, course: savedCourse, db }
    },

    async deleteCourse(courseId) {
      await repo.deleteCourse(courseId)
      const db = await repo.getState()
      return { ok: true, db }
    },

    async regenerateCourseCode(ownerId, kind = 'out') {
      const allCourses = await repo.listCourses()
      const course = allCourses.find((c) => c.owner === ownerId)
      if (!course) {
        return { ok: false, status: 404, error: 'ไม่พบหลักสูตรของผู้ดูแลรายนี้' }
      }

      if (kind === 'in') {
        course.codeIn = generateUniqueCode(allCourses, course.id, course.code)
      } else {
        course.code = generateUniqueCode(allCourses, course.id, course.codeIn)
      }

      const updated = await repo.upsertCourse(course)
      const db = await repo.getState()
      return { ok: true, course: updated, db }
    },

    async recordCheckIn(courseId) {
      const course = await repo.recordCheckIn(courseId)
      if (!course) {
        return { ok: false, status: 404, error: 'ไม่พบหลักสูตร' }
      }
      const db = await repo.getState()
      return { ok: true, course, db }
    },

    async unlockCheckoutDemo(courseId) {
      await repo.unlockCheckout(courseId)
      const db = await repo.getState()
      return { ok: true, db }
    },

    async recordCertificateClaim({ courseId, carrier, skipped }) {
      const course = await repo.recordCertificateClaim({ courseId, carrier, skipped })
      const db = await repo.getState()
      return { ok: true, course, db }
    },
  }
}
