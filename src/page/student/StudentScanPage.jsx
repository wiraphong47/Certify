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
  if (/NotFoundError|DevicesNotFound/i.test(name + msg)) {
    return 'ไม่พบกล้องในอุปกรณ์นี้ — สามารถเลือกรูป QR จากแกลเลอรี หรือกดปุ่มทดลองสแกนแทนได้'
  }
  if (/NotReadableError|TrackStartError/i.test(name + msg)) {
    return 'ไม่สามารถเปิดกล้องได้ เนื่องจากกล้องกำลังถูกใช้งานโดยโปรแกรมหรือแท็บอื่นอยู่'
  }
  return `เปิดกล้องไม่สำเร็จ (${msg || 'ไม่ทราบสาเหตุ'}) — สามารถเลือกรูป QR จากแกลเลอรี หรือกดปุ่มทดลองสแกนแทนได้`
}

export default function StudentScanPage() {
  const { db } = useCertify()
  const { voice, goToStep } = useOutletContext()

  const [scanMode, setScanMode] = useState('idle') // 'idle' | 'camera' | 'gallery' | 'demo'
  const [scanStatusMsg, setScanStatusMsg] = useState('')
  const [cameraError, setCameraError] = useState('')
  const [availableCameras, setAvailableCameras] = useState([])
  const [activeCameraIdx, setActiveCameraIdx] = useState(0)

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
    setScanStatusMsg('กำลังเปิดกล้อง เล็งไปที่ QR Code ของ Certify')
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
      let cameras = []
      try {
        cameras = await Html5Qrcode.getCameras()
      } catch {
        cameras = []
      }

      if (cameras.length > 0) {
        const backIdx = cameras.findIndex((c) => /back|rear|environment/i.test(c.label || ''))
        const chosenIdx = backIdx >= 0 ? backIdx : 0
        setAvailableCameras(cameras)
        setActiveCameraIdx(chosenIdx)
        await startScannerWithTarget(cameras[chosenIdx].id)
        setScanStatusMsg('เล็งกล้องไปที่ QR Code เพื่อเข้าสู่หน้า ThaID')
        return
      }

      try {
        await startScannerWithTarget({ facingMode: 'environment' })
      } catch {
        await startScannerWithTarget({ facingMode: 'user' })
      }
      setScanStatusMsg('เล็งกล้องไปที่ QR Code เพื่อเข้าสู่หน้า ThaID')
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

  const handleSwitchCamera = useCallback(async () => {
    if (availableCameras.length < 2) return
    const nextIdx = (activeCameraIdx + 1) % availableCameras.length
    setActiveCameraIdx(nextIdx)
    setCameraError('')
    setScanStatusMsg('กำลังสลับกล้อง...')
    try {
      await startScannerWithTarget(availableCameras[nextIdx].id)
      setScanStatusMsg('เล็งกล้องไปที่ QR Code เพื่อเข้าสู่หน้า ThaID')
    } catch (err) {
      setCameraError(formatCameraError(err))
    }
  }, [activeCameraIdx, availableCameras, startScannerWithTarget])

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
      activeCameraLabel={availableCameras[activeCameraIdx]?.label || ''}
      canSwitchCamera={availableCameras.length > 1}
      fileInputRef={scanFileRef}
      onStartLiveCamera={handleStartLiveCamera}
      onCameraBoxKeyDown={handleCameraBoxKeyDown}
      onSwitchCamera={handleSwitchCamera}
      onStartDemoScan={handleStartDemoScan}
      onCancelScan={handleCancelScan}
      onTriggerGallery={() => scanFileRef.current?.click()}
      onGalleryFileChange={handleGalleryFileChange}
    />
  )
}
