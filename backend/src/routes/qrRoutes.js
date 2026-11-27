import { Router } from 'express'

export function createQrRoutes(qrService) {
  const router = Router()

  router.get('/', async (_req, res, next) => {
    try {
      const qrVersion = await qrService.getQrVersion()
      return res.json({ ok: true, qrVersion })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/rotate', async (_req, res, next) => {
    try {
      const result = await qrService.rotateUniversalQr()
      return res.json(result)
    } catch (err) {
      return next(err)
    }
  })

  return router
}
