const CONFIGURED_API_URL = String(import.meta.env.VITE_API_URL || '')
  .trim()
  .replace(/\/+$/, '')

export function getApiBaseUrl() {
  if (CONFIGURED_API_URL) return CONFIGURED_API_URL
  if (import.meta.env.DEV) return '/api'
  return ''
}

export function isApiEnabled() {
  return Boolean(getApiBaseUrl())
}

/**
 * Performs a JSON request to the Certify backend with timeout.
 * - Returns `{ reachable: true, status, data }` whenever the backend responds with JSON
 *   (including 4xx business validation errors so they are NOT swallowed by localStorage fallback).
 * - Returns `{ reachable: false }` when the backend is unconfigured, offline, timed out,
 *   or returns a proxy 5xx error without a valid backend JSON body.
 */
export async function apiRequest(path, { method = 'GET', body, timeoutMs = 4000 } = {}) {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    return { reachable: false }
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${baseUrl}${normalizedPath}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return { reachable: false }
    }

    const data = await res.json()
    if (res.status >= 500 && typeof data?.ok !== 'boolean') {
      return { reachable: false }
    }

    return { reachable: true, status: res.status, data }
  } catch {
    return { reachable: false }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Calls the backend API first; if unreachable, executes `fallbackFn` (localStorage).
 * When the backend returns a `db` snapshot, optional `onSyncDb(db)` caches it locally.
 */
export async function callApiWithFallback(path, options, fallbackFn, onSyncDb) {
  const res = await apiRequest(path, options)
  if (res.reachable && res.data && typeof res.data === 'object') {
    if (res.data.db && typeof onSyncDb === 'function') {
      onSyncDb(res.data.db)
    }
    return res.data
  }
  return fallbackFn()
}
