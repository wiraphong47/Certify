import { createMockSeed } from './mockSeed.js'

const DB_STORAGE_KEY = 'certify_web_db_v1'

let memoryFallback = null

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

function hasLocalStorage() {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage)
  } catch {
    return false
  }
}

export function loadDb() {
  if (hasLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(DB_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && Array.isArray(parsed.courses) && Array.isArray(parsed.dsr) && parsed.wallet) {
          return parsed
        }
      }
    } catch {
      // fall through to seed
    }
    const seed = createMockSeed()
    saveDb(seed)
    return seed
  }

  if (!memoryFallback) {
    memoryFallback = createMockSeed()
  }
  return clone(memoryFallback)
}

export function saveDb(nextDb) {
  const snapshot = clone(nextDb)
  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(snapshot))
    } catch {
      // storage quota exceeded or unavailable
    }
  } else {
    memoryFallback = snapshot
  }
  return snapshot
}

export function resetDb() {
  const seed = createMockSeed()
  return saveDb(seed)
}
