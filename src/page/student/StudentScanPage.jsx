import { useCallback, useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useOutletContext } from 'react-router-dom'
import ScanStep from '../../components/student/ScanStep'
import { useCertify } from '../../context/certify'
import { validateScannedQrPayload } from '../../services/qrService'

function formatCameraError(err) {
  const name = String(err?.name || '')
  const msg = String(err?.message || err || '')
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return 'เบราว์เซอร์บล็อกกล้องเพราะไม่ได้เปิดผ่าน HTTPS หรือ localhost — หากเปิดจากมือถือให้เข้าผ่าน HTTPS หรือเลือกรูป QR จากแกลเลอรีแทน'
  }
  if (/NotAllowedError|PermissionDenied|Permission dismissed/i.test(name + msg)) {
    return 'ยังไม่ได้อนุญาตสิทธิ์กล้อง กรุณากดอนุญาตกล้องที่แถบที่อยู่ด้านบนของเบราว์เซอร์แล้วแตะเริ่มสแกนอีกครั้ง'
  }
  if (/OverconstrainedError|ConstraintNotSatisfied|no_rear_camera/i.test(name + msg)) {
    return 'ไม่พบกล้องหลังในอุปกรณ์นี้ — กรุณาใช้มือถือที่มีกล้องหลัง หรือเลือกรูป QR จากแกลเลอรีแทน'
  }
  if (/NotFoundError|DevicesNotFound/i.test(name + msg)) {
    return 'ไม่พบกล้องหลังในอุปกรณ์นี้ — สามารถเลือกรูป QR จากแกลเลอรี หรือกดปุ่มทดลองสแกนแทนได้'
  }
  if (/NotReadableError|TrackStartError/i.test(name + msg)) {
    return 'ไม่สามารถเปิดกล้องได้ เนื่องจากกล้องกำลังถูกใช้งานโดยโปรแกรมหรือแท็บอื่นอยู่'
  }
  return `เปิดกล้องหลังไม่สำเร็จ (${msg || 'ไม่ทราบสาเหตุ'}) — สามารถเลือกรูป QR จากแกลเลอรี หรือกดปุ่มทดลองสแกนแทนได้`
}

export default function StudentScanPage() {
  const { db } = useCertify()
  const { voice, goToStep } = useOutletContext()

  const [scanMode, setScanMode] = useState('idle') // 'idle' | 'camera' | 'gallery' | 'demo'
  const [scanStatusMsg, setScanStatusMsg] = useState('')
  const [cameraError, setCameraError] = useState('')

  const scannerRef = useRef(null)
  const scanDoneRef = useRef(false)
  const scanFileRef = useRef(null)
  const scanTimerRef = useRef(null)
  const autoVoiceRef = useRef(voice.autoVoice)

  useEffect(() => {
    autoVoiceRef.current = voice.autoVoice
  }, [voice.autoVoice])

  const stopCamera = useCallback(async () => {
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current)
      scanTimerRef.current = null
    }
    const inst = scannerRef.current
    scannerRef.current = null
    if (inst) {
      try {
        if (inst.isScanning) {
          await inst.stop()
        }
        inst.clear()
      } catch {
        // ignore cleanup errors
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  const completeScan = useCallback(
    (announcement, promptKey = 'scan_ok') => {
      if (scanDoneRef.current) return
      scanDoneRef.current = true
      stopCamera()
      let proceeded = false
      const proceed = () => {
        if (proceeded) return
        proceeded = true
        goToStep(1)
      }
      if (autoVoiceRef.current) {
        voice.speak(announcement, { promptKey, onEnd: proceed })
        scanTimerRef.current = setTimeout(proceed, 2200)
      } else {
        scanTimerRef.current = setTimeout(proceed, 500)
      }
    },
    [goToStep, stopCamera, voice],
  )

  const handleDecodedQr = useCallback(
    (decodedText, sourceLabel = 'สแกนสำเร็จ') => {
      const check = validateScannedQrPayload(decodedText, db.qrVersion)
      if (!check.ok) {
        setCameraError(check.message)
        voice.speak(check.message)
        return
      }
      setScanStatusMsg(sourceLabel)
      completeScan(sourceLabel, 'scan_ok')
    },
    [completeScan, db.qrVersion, voice],
  )

  const startScannerWithTarget = useCallback(
    async (cameraTarget) => {
      await stopCamera()
      const container = document.getElementById('certify-qr-reader')
      if (!container) {
        throw new Error('ไม่พบพื้นที่แสดงผลกล้อง')
      }
      const qr = new Html5Qrcode('certify-qr-reader')
      scannerRef.current = qr
      const config = {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const edge = Math.max(150, Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72))
          return { width: edge, height: edge }
        },
        aspectRatio: 1.333,
      }
      await qr.start(
        cameraTarget,
        config,
        (decodedText) => handleDecodedQr(decodedText, 'สแกนสำเร็จ'),
        () => {},
      )
    },
    [handleDecodedQr, stopCamera],
  )

  const handleStartLiveCamera = useCallback(async () => {
    scanDoneRef.current = false
    setCameraError('')
    setScanStatusMsg('กำลังเปิดกล้องหลัง เล็งไปที่ QR Code ของ Certify')
    setScanMode('camera')
    if (autoVoiceRef.current) {
      voice.speak('กำลังสแกน เล็งกล้องไปที่คิวอาร์โค้ด', { promptKey: 'scan_loading' })
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setScanMode('idle')
      setCameraError(formatCameraError(new Error('เบราว์เซอร์ไม่รองรับการเปิดกล้อง')))
      return
    }

    try {
      // Lock strictly to rear/back camera (never fall back to front camera)
      try {
        await startScannerWithTarget({ facingMode: { exact: 'environment' } })
        setScanStatusMsg('เล็งกล้องหลังไปที่ QR Code เพื่อเข้าสู่หน้า ThaID')
        return
      } catch (exactErr) {
        const errInfo = `${exactErr?.name || ''} ${exactErr?.message || exactErr || ''}`
        if (/NotAllowedError|PermissionDenied|Permission dismissed|NotReadableError|TrackStartError/i.test(errInfo)) {
          throw exactErr
        }

        // Fallback: explicitly look for primary rear camera by label (handles multi-lens Android)
        let cameras = []
        try {
          cameras = await Html5Qrcode.getCameras()
        } catch {
          cameras = []
        }

        const rearCameras = cameras.filter(
          (c) =>
            /back|rear|environment|หลัง/i.test(c.label || '') &&
            !/front|user|หน้า/i.test(c.label || ''),
        )
        const preferredRear =
          rearCameras.find(
            (c) =>
              /camera2\s*0|main|wide/i.test(c.label || '') &&
              !/ultra|macro|tele|depth|tof/i.test(c.label || ''),
          ) ||
          rearCameras.find((c) => !/ultra|macro|tele|depth|tof/i.test(c.label || '')) ||
          rearCameras[0]

        if (!preferredRear) {
          throw new Error('no_rear_camera')
        }

        await startScannerWithTarget(preferredRear.id)
        setScanStatusMsg('เล็งกล้องหลังไปที่ QR Code เพื่อเข้าสู่หน้า ThaID')
      }
    } catch (err) {
      await stopCamera()
      setScanMode('idle')
      setCameraError(formatCameraError(err))
    }
  }, [startScannerWithTarget, stopCamera, voice])

  const handleCameraBoxKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleStartLiveCamera()
    }
  }

  const handleStartDemoScan = useCallback(async () => {
    await stopCamera()
    scanDoneRef.current = false
    setCameraError('')
    setScanStatusMsg('กำลังสแกน QR (โหมดทดลอง)...')
    setScanMode('demo')
    if (autoVoiceRef.current) {
      voice.speak('กำลังสแกน เล็งกล้องไปที่คิวอาร์โค้ด', { promptKey: 'scan_loading' })
    }
    scanTimerRef.current = setTimeout(() => {
      completeScan('สแกนสำเร็จ', 'scan_ok')
    }, 1800)
  }, [completeScan, stopCamera, voice])

  const handleGalleryFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return

      await stopCamera()
      scanDoneRef.current = false
      setCameraError('')
      setScanMode('gallery')
      setScanStatusMsg('กำลังอ่านรูปคิวอาร์โค้ด...')
      if (autoVoiceRef.current) {
        voice.speak('กำลังอ่านรูปคิวอาร์โค้ด', { promptKey: 'scan_gallery' })
      }

      const qr = new Html5Qrcode('certify-qr-file-decoder')
      try {
        const decoded = await qr.scanFile(file, false)
        handleDecodedQr(decoded, 'พบคิวอาร์โค้ดในรูปแล้ว')
      } catch {
        setScanMode('idle')
        const msg = 'ไม่พบคิวอาร์โค้ดในรูปที่เลือก กรุณาเลือกรูป QR ใหม่ หรือลองโหมดทดลองสแกน'
        setCameraError(msg)
        voice.speak(msg)
      } finally {
        try {
          qr.clear()
        } catch {
          // ignore
        }
      }
    },
    [handleDecodedQr, stopCamera, voice],
  )

  const handleCancelScan = useCallback(async () => {
    await stopCamera()
    setScanMode('idle')
    setCameraError('')
    setScanStatusMsg('')
  }, [stopCamera])

  return (
    <ScanStep
      scanMode={scanMode}
      statusMsg={scanStatusMsg}
      cameraError={cameraError}
      fileInputRef={scanFileRef}
      onStartLiveCamera={handleStartLiveCamera}
      onCameraBoxKeyDown={handleCameraBoxKeyDown}
      onStartDemoScan={handleStartDemoScan}
      onCancelScan={handleCancelScan}
      onTriggerGallery={() => scanFileRef.current?.click()}
      onGalleryFileChange={handleGalleryFileChange}
    />
  )
}
