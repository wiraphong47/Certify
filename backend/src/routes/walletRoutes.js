import { Router } from 'express'

function sendResult(res, result) {
  const { status, ...body } = result
  return res.status(result.ok ? 200 : status || 400).json(body)
}

export function createWalletRoutes(walletService) {
  const router = Router()

  router.get('/', async (_req, res, next) => {
    try {
      const wallet = await walletService.getWallet()
      return res.json({ ok: true, wallet })
    } catch (err) {
      return next(err)
    }
  })

  router.post('/adjust', async (req, res, next) => {
    try {
      const { carrier, delta } = req.body || {}
      return sendResult(res, await walletService.adjustWalletStock(carrier, delta))
    } catch (err) {
      return next(err)
    }
  })

  return router
}
