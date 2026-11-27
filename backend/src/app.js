import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { createApiRouter } from './routes/index.js'

export function createApp(repo) {
  const app = express()

  const corsOptions =
    env.corsOrigin === '*'
      ? { origin: true, credentials: true }
      : {
          origin: env.corsOrigin.split(',').map((s) => s.trim()),
          credentials: true,
        }

  app.use(cors(corsOptions))
  app.use(express.json({ limit: '15mb' }))

  app.get('/', (_req, res) => {
    res.json({
      ok: true,
      service: 'certify-backend',
      apiBase: '/api',
      health: '/api/health',
    })
  })

  app.use('/api', createApiRouter(repo))

  app.use((_req, res) => {
    res.status(404).json({ ok: false, error: 'Endpoint not found' })
  })

  app.use((err, _req, res, _next) => {
    console.error('[certify-backend] Error:', err)
    res.status(500).json({ ok: false, error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' })
  })

  return app
}
