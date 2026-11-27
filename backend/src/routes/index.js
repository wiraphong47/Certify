import { Router } from 'express'
import { env } from '../config/env.js'
import { createAuthService } from '../services/authService.js'
import { createCourseService } from '../services/courseService.js'
import { createDsrService } from '../services/dsrService.js'
import { createQrService } from '../services/qrService.js'
import { createWalletService } from '../services/walletService.js'
import { createAuthRoutes } from './authRoutes.js'
import { createCourseRoutes } from './courseRoutes.js'
import { createDsrRoutes } from './dsrRoutes.js'
import { createQrRoutes } from './qrRoutes.js'
import { createWalletRoutes } from './walletRoutes.js'

export function createApiRouter(repo) {
  const router = Router()

  const authService = createAuthService(repo)
  const courseService = createCourseService(repo)
  const dsrService = createDsrService(repo)
  const walletService = createWalletService(repo)
  const qrService = createQrService(repo)

  router.get('/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'certify-backend',
      driver: env.dbDriver,
      timestamp: new Date().toISOString(),
    })
  })

  router.get('/state', async (_req, res, next) => {
    try {
      const db = await repo.getState()
      res.json({ ok: true, db })
    } catch (err) {
      next(err)
    }
  })

  router.post('/reset', async (_req, res, next) => {
    try {
      const db = await repo.resetState()
      res.json({ ok: true, db })
    } catch (err) {
      next(err)
    }
  })

  router.use('/auth', createAuthRoutes(authService))
  router.use('/courses', createCourseRoutes(courseService))
  router.use('/dsr', createDsrRoutes(dsrService))
  router.use('/wallet', createWalletRoutes(walletService))
  router.use('/qr', createQrRoutes(qrService))

  return router
}
