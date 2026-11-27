import { createApp } from './app.js'
import { env } from './config/env.js'
import { createRepository } from './repositories/index.js'

async function start() {
  const repo = createRepository()
  await repo.init()

  const app = createApp(repo)
  app.listen(env.port, () => {
    console.log(
      `[certify-backend] API running on http://localhost:${env.port}/api (driver: ${env.dbDriver})`,
    )
  })
}

start().catch((err) => {
  console.error('[certify-backend] Failed to start:', err)
  process.exit(1)
})
