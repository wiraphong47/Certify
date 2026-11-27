import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendRoot = path.resolve(__dirname, '..', '..')

export const env = {
  port: Number.parseInt(process.env.PORT || '4000', 10) || 4000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  dbDriver: String(process.env.DB_DRIVER || 'json').trim().toLowerCase(),
  dataFile: path.resolve(backendRoot, process.env.DATA_FILE || './data/db.json'),
  databaseUrl: process.env.DATABASE_URL || '',
  adminUsername: String(process.env.ADMIN_USERNAME || 'ADMIN').trim().toUpperCase(),
  adminPassword: String(process.env.ADMIN_PASSWORD || 'admin1234'),
}
