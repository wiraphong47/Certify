import { Router } from 'express'

function sendResult(res, result) {
  const { status, ...body } = result
  return res.status(result.ok ? 200 : status || 400).json(body)
}

export function createAuthRoutes(authService) {
  const router = Router()

  router.post('/admin/login', async (req, res, next) => {
    try {
      const { username, password } = req.body || {}
      return sendResult(res, await authService.loginAdmin(username, password))
    } catch (err) {
      return next(err)
    }
  })

  router.post('/organizer/login', async (req, res, next) => {
    try {
      const { dsrId, password } = req.body || {}
      return sendResult(res, await authService.loginOrganizer(dsrId, password))
    } catch (err) {
      return next(err)
    }
  })

  router.post('/organizer/password', async (req, res, next) => {
    try {
      const { dsrId, currentPw, newPw, confirmPw } = req.body || {}
      return sendResult(
        res,
        await authService.changeOrganizerPassword(dsrId, currentPw, newPw, confirmPw),
      )
    } catch (err) {
      return next(err)
    }
  })

  router.post('/thaid', async (_req, res, next) => {
    try {
      return sendResult(res, await authService.authenticateWithThaid())
    } catch (err) {
      return next(err)
    }
  })

  return router
}
