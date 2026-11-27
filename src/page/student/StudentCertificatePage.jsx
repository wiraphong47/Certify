import { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import CertificateStep from '../../components/student/CertificateStep'
import { useCertify } from '../../context/certify'
import {
  downloadCertificatePdf,
  downloadCertificatePng,
  downloadNetGuidePng,
} from '../../services/certificateExportService'
import { buildNetRedemptionGuide } from '../../services/walletService'
import { thDate } from '../../utils/formatters'
import { TH_COUNTDOWN } from '../../utils/thaiSpeech'

export default function StudentCertificatePage() {
  const { db, showToast, recordCertificateClaim } = useCertify()
  const {
    voice,
    activeCourse,
    matchedCourse,
    studentName,
    phone,
    carrier,
    skippedNet,
    handleGoHome,
  } = useOutletContext()

  const [certPhase, setCertPhase] = useState('loading') // 'loading' | 'done'
  const [certLoadingText, setCertLoadingText] = useState(
    'กำลังเตรียมใบเกียรติบัตร ไม่ต้องกดอะไร',
  )
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle') // 'idle' | 'saving' | 'done' | 'error'
  const [netGuide] = useState(() =>
    buildNetRedemptionGuide({ carrier, phone, skipped: skippedNet }),
  )
  const [certCountdown, setCertCountdown] = useState(null) // null | 'intro' | 3 | 2 | 1
  const [certPaused, setCertPaused] = useState(false)
  const [certExporting, setCertExporting] = useState(false)

  const certExportRef = useRef(null)
  const netGuideExportRef = useRef(null)
  const certClaimedRef = useRef(false)
  const autoSavedRef = useRef(false)

  const displayCourse = matchedCourse || activeCourse
  const courseHasNet = displayCourse?.hasNet !== false

  // Certificate loading stages -> claim -> done
  useEffect(() => {
    if (certPhase !== 'loading') return undefined

    const t1 = setTimeout(() => setCertLoadingText('กำลังตรวจสอบข้อมูล'), 1200)
    const t2 = setTimeout(() => setCertLoadingText('กำลังบันทึกลงเครื่อง'), 2400)
    const t3 = setTimeout(() => {
      if (!certClaimedRef.current) {
        certClaimedRef.current = true
        const target = matchedCourse || activeCourse
        if (target) {
          const targetHasNet = target.hasNet !== false
          recordCertificateClaim({
            courseId: target.id,
            carrier: targetHasNet ? carrier || 'AIS' : '',
            skipped: targetHasNet ? skippedNet : true,
          })
        }
      }
      setCertPhase('done')
    }, 3600)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [activeCourse, carrier, certPhase, matchedCourse, recordCertificateClaim, skippedNet])

  // Auto-save Certificate PNG (and Net Code Redemption Guide PNG if course includes net)
  useEffect(() => {
    if (certPhase !== 'done' || autoSavedRef.current) return undefined
    autoSavedRef.current = true
    let cancelled = false

    const timer = setTimeout(async () => {
      if (cancelled) return
      setAutoSaveStatus('saving')
      try {
        const targetCourse = matchedCourse || activeCourse
        const targetHasNet = targetCourse?.hasNet !== false
        const safeName = (targetCourse?.name || 'certificate').slice(0, 32).replace(/\s+/g, '-')

        if (certExportRef.current) {
          await downloadCertificatePng(certExportRef.current, `certify-ใบเกียรติบัตร-${safeName}.png`)
        }

        if (targetHasNet) {
          await new Promise((r) => setTimeout(r, 650))
          if (cancelled) return

          if (netGuideExportRef.current) {
            const carTag = (carrier || 'net').replace(/\s+/g, '')
            await downloadNetGuidePng(
              netGuideExportRef.current,
              `certify-วิธีรับโค้ดเน็ต-${carTag}.png`,
            )
          }
        }
        if (!cancelled) {
          setAutoSaveStatus('done')
          showToast(
            targetHasNet
              ? 'บันทึกรูปใบเกียรติบัตรและขั้นตอนรับโค้ดเน็ตลงเครื่องแล้ว'
              : 'บันทึกรูปใบเกียรติบัตรลงเครื่องแล้ว',
            'success',
          )
        }
      } catch {
        if (!cancelled) {
          setAutoSaveStatus('error')
        }
      }
    }, 350)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [activeCourse, carrier, certPhase, matchedCourse, showToast])

  // Certificate done speech -> countdown intro (starts only after auto-save settles)
  useEffect(() => {
    if (
      certPhase !== 'done' ||
      certPaused ||
      (autoSaveStatus !== 'done' && autoSaveStatus !== 'error')
    ) {
      return undefined
    }

    let started = false
    const startIntro = () => {
      if (started) return
      started = true
      setCertCountdown('intro')
    }

    const doneSpeech = !courseHasNet
      ? 'บันทึกรูปใบเกียรติบัตรลงเครื่องแล้ว'
      : skippedNet
        ? 'บันทึกรูปใบเกียรติบัตรและรูปขั้นตอนรับโค้ดเน็ตลงเครื่องแล้ว ไปกดรับเน็ตเองภายหลังได้'
        : 'บันทึกรูปใบเกียรติบัตรและรูปขั้นตอนรับโค้ดเน็ตลงเครื่องแล้ว'

    let fallbackTimer = null
    if (voice.autoVoice) {
      voice.speak(doneSpeech, { onEnd: startIntro })
      fallbackTimer = setTimeout(startIntro, 6000)
    } else {
      fallbackTimer = setTimeout(startIntro, 2000)
    }

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer)
    }
  }, [autoSaveStatus, certPaused, certPhase, courseHasNet, skippedNet, voice])

  // Certificate 3-2-1 exit countdown
  useEffect(() => {
    if (certPhase !== 'done' || certPaused || certCountdown === null) {
      return undefined
    }

    if (certCountdown === 'intro') {
      let moved = false
      const go3 = () => {
        if (moved) return
        moved = true
        setCertCountdown(3)
      }
      let t = null
      if (voice.autoVoice) {
        voice.speak('กำลังจะออกจากแอปในอีก', { onEnd: go3 })
        t = setTimeout(go3, 3500)
      } else {
        t = setTimeout(go3, 900)
      }
      return () => {
        if (t) clearTimeout(t)
      }
    }

    if (typeof certCountdown === 'number') {
      if (certCountdown < 1) {
        const doneTimer = setTimeout(handleGoHome, 0)
        return () => clearTimeout(doneTimer)
      }
      if (voice.autoVoice && TH_COUNTDOWN[certCountdown]) {
        voice.speak(TH_COUNTDOWN[certCountdown])
      }
      const t = setTimeout(() => {
        setCertCountdown((prev) => (typeof prev === 'number' ? prev - 1 : prev))
      }, 2000)
      return () => clearTimeout(t)
    }

    return undefined
  }, [certCountdown, certPaused, certPhase, handleGoHome, voice])

  const handleDownloadCert = async (format) => {
    setCertPaused(true)
    if (!certExportRef.current) return
    setCertExporting(true)
    try {
      const targetCourse = matchedCourse || activeCourse
      const safeName = (targetCourse?.name || 'certificate').slice(0, 32).replace(/\s+/g, '-')
      if (format === 'pdf') {
        await downloadCertificatePdf(certExportRef.current, `certify-ใบเกียรติบัตร-${safeName}.pdf`)
        showToast('บันทึกใบเกียรติบัตร (PDF) ลงเครื่องแล้ว', 'success')
      } else {
        await downloadCertificatePng(certExportRef.current, `certify-ใบเกียรติบัตร-${safeName}.png`)
        showToast('บันทึกรูปใบเกียรติบัตร (PNG) ลงเครื่องแล้ว', 'success')
      }
    } catch {
      showToast('ไม่สามารถบันทึกไฟล์ได้ กรุณาลองอีกครั้ง', 'error')
    } finally {
      setCertExporting(false)
    }
  }

  const handleDownloadNetGuide = async () => {
    setCertPaused(true)
    if (!netGuideExportRef.current) return
    setCertExporting(true)
    try {
      const carTag = (carrier || 'net').replace(/\s+/g, '')
      await downloadNetGuidePng(netGuideExportRef.current, `certify-วิธีรับโค้ดเน็ต-${carTag}.png`)
      showToast('บันทึกรูปขั้นตอนรับโค้ดเน็ต (PNG) ลงเครื่องแล้ว', 'success')
    } catch {
      showToast('ไม่สามารถบันทึกรูปขั้นตอนรับโค้ดเน็ตได้ กรุณาลองอีกครั้ง', 'error')
    } finally {
      setCertExporting(false)
    }
  }

  const ownerOrg = db.dsr.find((d) => d.id === displayCourse?.owner)
  const formattedCertDate = thDate(displayCourse?.date)

  return (
    <CertificateStep
      phase={certPhase}
      hasNet={courseHasNet}
      loadingText={certLoadingText}
      autoSaveStatus={autoSaveStatus}
      countdown={certCountdown}
      paused={certPaused}
      exporting={certExporting}
      certExportRef={certExportRef}
      netGuideExportRef={netGuideExportRef}
      course={displayCourse}
      formattedDate={formattedCertDate}
      orgName={ownerOrg?.name || ''}
      studentName={studentName}
      netGuide={netGuide}
      onDownloadPdf={() => handleDownloadCert('pdf')}
      onDownloadPng={() => handleDownloadCert('png')}
      onDownloadNetGuidePng={handleDownloadNetGuide}
      onPauseCountdown={() => setCertPaused(true)}
      onGoHome={handleGoHome}
    />
  )
}
