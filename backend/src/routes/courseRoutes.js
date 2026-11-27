import { Router } from 'express'

function sendResult(res, result) {
  const { status, ...body } = result
  return res.status(result.ok ? 200 : status || 400).json(body)
}

export function createCourseRoutes(courseService) {
  const router = Router()

  router.get('/', async (_req, res, next) => {
    try {
      const courses = await courseService.listCourses()
      return res.json({ ok: true, courses })
    } catch (err) {
      return next(err)
    }
  })

  router.get('/:id', async (req, res, next) => {
    try {
      const course = await courseService.getCourseById(Number(req.params.id))
      if (!course) {
        return res.status(404).json({ ok: false, error: 'ไม่พบหลักสูตร' })
      }
      return res.json({ ok: true, course })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
      const { course, role } = req.body || {}
      const payload = course || req.body || {}
      return sendResult(res, await courseService.saveCourse(payload, role || 'organizer'))
    } catch (err) {
      return next(err)
    }
  })

  router.put('/:id', async (req, res, next) => {
    try {
      const { course, role } = req.body || {}
      const payload = { ...(course || req.body || {}), id: Number(req.params.id) }
      return sendResult(res, await courseService.saveCourse(payload, role || 'organizer'))
    } catch (err) {
      return next(err)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      return sendResult(res, await courseService.deleteCourse(Number(req.params.id)))
    } catch (err) {
      return next(err)
    }
  })

  router.post('/regenerate-code', async (req, res, next) => {
    try {
      const { ownerId, kind } = req.body || {}
      return sendResult(res, await courseService.regenerateCourseCode(ownerId, kind || 'out'))
    } catch (err) {
      return next(err)
    }
  })

  router.post('/:id/checkin', async (req, res, next) => {
    try {
      return sendResult(res, await courseService.recordCheckIn(Number(req.params.id)))
    } catch (err) {
      return next(err)
    }
  })

  router.post('/:id/unlock-demo', async (req, res, next) => {
    try {
      return sendResult(res, await courseService.unlockCheckoutDemo(Number(req.params.id)))
    } catch (err) {
      return next(err)
    }
  })

  router.post('/:id/claim', async (req, res, next) => {
    try {
      const { carrier, skipped } = req.body || {}
      return sendResult(
        res,
        await courseService.recordCertificateClaim({
          courseId: Number(req.params.id),
          carrier: carrier || '',
          skipped: Boolean(skipped),
        }),
      )
    } catch (err) {
      return next(err)
    }
  })

  return router
}
