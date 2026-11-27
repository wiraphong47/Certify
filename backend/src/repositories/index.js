import { env } from '../config/env.js'
import { JsonRepository } from './jsonRepository.js'

/**
 * Repository factory.
 *
 * To migrate to PostgreSQL / MySQL / MongoDB / Prisma in the future:
 * 1. Create a new class extending BaseRepository (e.g. `postgresRepository.js`).
 * 2. Add a case below for `env.dbDriver === 'postgres'` and set DB_DRIVER=postgres in `.env`.
 * Routes and services require zero changes.
 */
export function createRepository() {
  switch (env.dbDriver) {
    case 'json':
      return new JsonRepository(env.dataFile)
    default:
      throw new Error(
        `Unsupported DB_DRIVER="${env.dbDriver}". Implement a BaseRepository adapter in src/repositories/ and register it here.`,
      )
  }
}
