import { useEffect, useState } from 'react'
import AdminQr from '../../components/admin/AdminQr'
import { useCertify } from '../../context/certify'
import { buildUniversalQrUrl, generateQrDataUrl } from '../../services/qrService'

export default function AdminQrPage() {
  const { db, showToast, rotateQr } = useCertify()

  const [qrDataUrl, setQrDataUrl] = useState('')
  const [confirmRotateQr, setConfirmRotateQr] = useState(false)

  const qrUrl = buildUniversalQrUrl(db.qrVersion)

  useEffect(() => {
    let active = true
    generateQrDataUrl(qrUrl)
      .then((url) => {
        if (active) setQrDataUrl(url)
      })
      .catch(() => {
        if (active) setQrDataUrl('')
      })
    return () => {
      active = false
    }
  }, [qrUrl])

  const handleDownloadQr = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `certify-universal-qr-v${db.qrVersion}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    showToast(`ดาวน์โหลด QR (v${db.qrVersion}) แล้ว`, 'success')
  }

  const handleConfirmRotateQr = async () => {
    await rotateQr()
    setConfirmRotateQr(false)
  }

  return (
    <AdminQr
      qrVersion={db.qrVersion}
      qrUrl={qrUrl}
      qrDataUrl={qrDataUrl}
      confirmRotate={confirmRotateQr}
      onDownloadQr={handleDownloadQr}
      onPrintQr={() => window.print()}
      onRequestRotate={() => setConfirmRotateQr(true)}
      onCancelRotate={() => setConfirmRotateQr(false)}
      onConfirmRotate={handleConfirmRotateQr}
    />
  )
}
