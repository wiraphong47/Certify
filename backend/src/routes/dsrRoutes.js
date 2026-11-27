import { Router } from 'express'

function sendResult(res, result) {
  const { status, ...body } = result
  return res.status(result.ok ? 200 : status || 400).json(body)
}

export function createDsrRoutes(dsrService) {
  const router = Router()

  router.get('/', async (_req, res, next) => {
    try {
      const dsr = await dsrService.listDsr()
      return res.json({ ok: true, dsr })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
      const { orgName, name } = req.body || {}
      return sendResult(res, await dsrService.createDsrAccount(orgName ?? name))
    } catch (err) {
      return next(err)
    }
  })

  router.patch('/:id', async (req, res, next) => {
    try {
      const { name } = req.body || {}
      return sendResult(res, await dsrService.updateDsrAccountName(req.params.id, name))
    } catch (err) {
      return next(err)
    }
  })

  router.post('/:id/toggle', async (req, res, next) => {
    try {
      return sendResult(res, await dsrService.toggleDsrAccount(req.params.id))
    } catch (err) {
      return next(err)
    }
  })

  router.post('/:id/reset-password', async (req, res, next) => {
    try {
      return sendResult(res, await dsrService.resetDsrAccountPassword(req.params.id))
    } catch (err) {
      return next(err)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      return sendResult(res, await dsrService.deleteDsrAccount(req.params.id))
    } catch (err) {
      return next(err)
    }
  })

  return router
}
