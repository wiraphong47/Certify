import QRCode from 'qrcode'
import { loadDb, saveDb } from './storageService.js'

export function buildUniversalQrUrl(qrVersion) {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://certify.local'
  return `${origin}/student?qr=v${qrVersion}`
}

export async function generateQrDataUrl(text) {
  return QRCode.toDataURL(text, {
    width: 360,
    margin: 2,
    color: {
      dark: '#0C2F53',
      light: '#FFFFFF',
    },
  })
}

export async function rotateUniversalQr() {
  const db = loadDb()
  db.qrVersion = (db.qrVersion || 1) + 1
  const saved = saveDb(db)
  return { ok: true, qrVersion: saved.qrVersion, db: saved }
}

export function validateScannedQrPayload(decodedText, currentVersion) {
  const raw = String(decodedText || '').trim()
  if (!raw) {
    return { ok: false, reason: 'empty', message: 'ไม่พบข้อมูลใน QR Code นี้' }
  }

  try {
    const url = new URL(raw)
    const qrParam = url.searchParams.get('qr')
    if (qrParam) {
      const versionNum = Number.parseInt(qrParam.replace(/^v/i, ''), 10)
      if (!Number.isNaN(versionNum) && currentVersion && versionNum !== currentVersion) {
        return {
          ok: false,
          reason: 'expired_qr',
          message: `QR นี้เป็นเวอร์ชันเก่า (v${versionNum}) กรุณาสแกน QR ล่าสุดจากผู้จัดอบรม`,
        }
      }
      return { ok: true, payload: raw, qrParam }
    }
  } catch {
    // non-URL payload allowed if matches certify prefix
  }

  if (/certify/i.test(raw)) {
    return { ok: true, payload: raw }
  }

  return {
    ok: true,
    payload: raw,
    externalNotice: true,
  }
}
