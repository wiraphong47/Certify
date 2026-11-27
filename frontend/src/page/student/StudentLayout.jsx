import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import StudentShell from '../../components/student/StudentShell'
import { useCertify } from '../../context/certify'
import { useVoice } from '../../hooks/useVoice'

const STEPS_DISABLED = [
  {
    id: 'scan',
    path: '/student/scan',
    label: 'สแกน',
    promptKey: 'scan',
    vo: 'แตะที่ไหนก็ได้ของหน้าจอ เพื่อสแกนเข้าสู่หน้า ไทยไอดี',
  },
  {
    id: 'thaid',
    path: '/student/thaid',
    label: 'ThaID',
    promptKey: 'thaid',
    vo: 'กรุณาเข้าสู่ระบบด้วย ไทยไอดี',
  },
  {
    id: 'checkout',
    path: '/student/code',
    label: 'รหัส',
    promptKey: 'checkout',
    vo: 'ใส่รหัสสี่หลัก พูดทีละตัวเลขได้เลยหลังเสียงนี้จบ หรือกดปุ่มตัวเลข',
  },
  {
    id: 'phone',
    path: '/student/phone',
    label: 'เบอร์โทร',
    promptKey: 'phone',
    vo: 'แตะปุ่มไมค์ตรงกลางหน้าจอ เพื่อพูดเบอร์มือถือ',
  },
  {
    id: 'cert',
    path: '/student/certificate',
    label: 'รับใบเซอร์',
    promptKey: 'cert',
    vo: 'กำลังรับใบเกียรติบัตร',
  },
]

const STEPS_GENERAL = [
  {
    id: 'scan',
    path: '/student/scan',
    label: 'สแกน',
    promptKey: 'scan',
    vo: 'แตะที่ไหนก็ได้ของหน้าจอ เพื่อสแกนเข้าสู่หน้า ไทยไอดี',
  },
  {
    id: 'thaid',
    path: '/student/thaid',
    label: 'ThaID',
    promptKey: 'thaid',
    vo: 'กรุณาเข้าสู่ระบบด้วย ไทยไอดี',
  },
  {
    id: 'checkin',
    path: '/student/code',
    queryStep: 'checkin',
    label: 'รหัสเช็คอิน',
    promptKey: 'checkin',
    vo: 'กรุณากรอกรหัสเช็คอินสี่หลัก',
  },
  {
    id: 'checkout',
    path: '/student/code',
    queryStep: 'checkout',
    label: 'รหัสเช็คเอาท์',
    promptKey: 'checkout_general',
    vo: 'กรุณากรอกรหัสเช็คเอาท์สี่หลักเพื่อรับใบเกียรติบัตร',
  },
  {
    id: 'phone',
    path: '/student/phone',
    label: 'เบอร์โทร',
    promptKey: 'phone',
    vo: 'แตะปุ่มไมค์ตรงกลางหน้าจอ เพื่อพูดเบอร์มือถือ',
  },
  {
    id: 'cert',
    path: '/student/certificate',
    label: 'รับใบเซอร์',
    promptKey: 'cert',
    vo: 'กำลังรับใบเกียรติบัตร',
  },
]

function getStepsForCourse(course) {
  return course?.mode === 'checkin' ? STEPS_GENERAL : STEPS_DISABLED
}

function buildTargetUrl(step, currentSearchParams) {
  const params = new URLSearchParams()
  if (currentSearchParams.get('kiosk') === '1') {
    params.set('kiosk', '1')
  }
  if (step.queryStep) {
    params.set('step', step.queryStep)
  }
  const qs = params.toString()
  return qs ? `${step.path}?${qs}` : step.path
}

function resolveStepIndex(pathname, searchParams, steps, isCheckinMode) {
  if (pathname.startsWith('/student/thaid')) {
    return steps.findIndex((s) => s.id === 'thaid')
  }
  if (pathname.startsWith('/student/code')) {
    if (isCheckinMode) {
      const qStep = searchParams.get('step')
      const targetId = qStep === 'checkout' ? 'checkout' : 'checkin'
      return steps.findIndex((s) => s.id === targetId)
    }
    return steps.findIndex((s) => s.id === 'checkout')
  }
  if (pathname.startsWith('/student/phone')) {
    return steps.findIndex((s) => s.id === 'phone')
  }
  if (pathname.startsWith('/student/certificate')) {
    return steps.findIndex((s) => s.id === 'cert')
  }
  return 0
}

export default function StudentLayout() {
  const { db, showToast } = useCertify()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const voice = useVoice()

  // Shared student flow state across sub-pages
  const [courseId, setCourseId] = useState(() => db.courses[0]?.id || 1)
  const [matchedCourseId, setMatchedCourseId] = useState(null)
  const [studentName, setStudentName] = useState('สมชาย ใจดี')
  const [phone, setPhone] = useState('')
  const [carrier, setCarrier] = useState('')
  const [skippedNet, setSkippedNet] = useState(false)

  const handledQrRef = useRef('')

  const activeCourse = useMemo(
    () => db.courses.find((c) => c.id === courseId) || db.courses[0] || null,
    [db.courses, courseId],
  )
  const matchedCourse = useMemo(
    () => db.courses.find((c) => c.id === matchedCourseId) || activeCourse,
    [db.courses, matchedCourseId, activeCourse],
  )

  const isCheckinMode = activeCourse?.mode === 'checkin'
  const steps = useMemo(() => getStepsForCourse(activeCourse), [activeCourse])

  const rawStepIndex = resolveStepIndex(location.pathname, searchParams, steps, isCheckinMode)
  const safeStepIndex = Math.max(0, Math.min(rawStepIndex < 0 ? 0 : rawStepIndex, steps.length - 1))
  const currentStep = steps[safeStepIndex]

  // Handle Universal QR deep-link (?qr=vN) and index redirect (/student -> /student/scan)
  useEffect(() => {
    const qrParam = searchParams.get('qr')
    if (qrParam) {
      const qrKey = `${location.pathname}?${searchParams.toString()}`
      if (handledQrRef.current !== qrKey) {
        handledQrRef.current = qrKey
        const versionNum = Number.parseInt(qrParam.replace(/^v/i, ''), 10)
        const isExpired = !Number.isNaN(versionNum) && versionNum !== db.qrVersion
        if (isExpired) {
          showToast(`QR เวอร์ชันเก่า (v${versionNum}) กรุณาสแกน QR ล่าสุด`, 'warning')
        } else {
          showToast('สแกน QR สำเร็จ เข้าสู่ขั้นตอนยืนยันตัวตน ThaID', 'success')
        }
        const targetStep = isExpired ? STEPS_DISABLED[0] : STEPS_DISABLED[1]
        navigate(buildTargetUrl(targetStep, searchParams), { replace: true })
      }
      return
    }

    if (location.pathname === '/student' || location.pathname === '/student/') {
      navigate(buildTargetUrl(STEPS_DISABLED[0], searchParams), { replace: true })
    }
  }, [db.qrVersion, location.pathname, navigate, searchParams, showToast])

  const goToStep = useCallback(
    (nextTarget, options = {}) => {
      voice.stopMic()
      const targetCourse = options.courseOverride || activeCourse
      const targetSteps = getStepsForCourse(targetCourse)
      const resolvedIdx =
        typeof nextTarget === 'string'
          ? targetSteps.findIndex((s) => s.id === nextTarget)
          : nextTarget
      const clamped = Math.max(
        0,
        Math.min(resolvedIdx < 0 ? 0 : resolvedIdx, targetSteps.length - 1),
      )
      const targetStep = targetSteps[clamped]

      if (options.courseOverride) {
        setCourseId(options.courseOverride.id)
      }
      if (options.carrierOverride !== undefined) {
        setCarrier(options.carrierOverride)
      }
      if (options.phoneOverride !== undefined) {
        setPhone(options.phoneOverride)
      }
      if (options.skippedOverride !== undefined) {
        setSkippedNet(options.skippedOverride)
      }

      const targetUrl = buildTargetUrl(targetStep, searchParams)
      const isCodeStep = targetStep.id === 'checkin' || targetStep.id === 'checkout'

      navigate(targetUrl, {
        replace: Boolean(options.replace),
        state: isCodeStep ? { announceToken: Date.now() } : undefined,
      })

      if (!isCodeStep && voice.autoVoice) {
        voice.speak(targetStep.vo, { promptKey: targetStep.promptKey })
      }
    },
    [activeCourse, navigate, searchParams, voice],
  )

  const handleGoHome = useCallback(() => {
    voice.stop()
    setPhone('')
    setCarrier('')
    setSkippedNet(false)
    setMatchedCourseId(null)
    navigate(buildTargetUrl(STEPS_DISABLED[0], searchParams))
  }, [navigate, searchParams, voice])

  const outletContext = useMemo(
    () => ({
      steps,
      stepIndex: safeStepIndex,
      currentStep,
      voice,
      courseId,
      setCourseId,
      matchedCourseId,
      setMatchedCourseId,
      activeCourse,
      matchedCourse,
      isCheckinMode,
      studentName,
      setStudentName,
      phone,
      setPhone,
      carrier,
      setCarrier,
      skippedNet,
      setSkippedNet,
      goToStep,
      handleGoHome,
    }),
    [
      activeCourse,
      carrier,
      courseId,
      currentStep,
      goToStep,
      handleGoHome,
      isCheckinMode,
      matchedCourse,
      matchedCourseId,
      phone,
      safeStepIndex,
      skippedNet,
      steps,
      studentName,
      voice,
    ],
  )

  return (
    <StudentShell
      steps={steps}
      stepIndex={safeStepIndex}
      onJump={(idx) => goToStep(idx)}
      autoVoice={voice.autoVoice}
      onToggleVoice={() => voice.toggleAutoVoice(currentStep.vo, currentStep.promptKey)}
    >
      <Outlet context={outletContext} />
    </StudentShell>
  )
}
