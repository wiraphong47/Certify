import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import CodeStep from '../../components/student/CodeStep'
import SwipeConfirmStep from '../../components/student/SwipeConfirmStep'
import { useCertify } from '../../context/certify'
import { useSwipe } from '../../hooks/useSwipe'
import { getCheckoutRemainingSec, verifyStudentCode } from '../../services/courseService'
import { fmtMMSS } from '../../utils/formatters'
import { digitsOf, spellDigits } from '../../utils/thaiSpeech'

export default function StudentCodePage() {
  const { db, showToast, recordCheckIn, unlockCheckoutDemo } = useCertify()
  const {
    currentStep,
    voice,
    setCourseId,
    setMatchedCourseId,
    activeCourse,
    matchedCourse,
    isCheckinMode,
    goToStep,
    handleGoHome,
  } = useOutletContext()

  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [courseConfirm, setCourseConfirm] = useState(false)
  const [nowMs, setNowMs] = useState(() => Date.now())

  const swipeHeadingRef = useRef(null)
  const onSpokenCodeRef = useRef(null)
  const lastAnnouncedTokenRef = useRef(null)
  const mountedRef = useRef(true)
  const checkTimerRef = useRef(null)

  const isCiStep = currentStep.id === 'checkin'
  const isCourseSwipeActive = courseConfirm && Boolean(matchedCourse)

  const stateRef = useRef({
    stepId: currentStep.id,
    courseConfirm,
    code,
    autoVoice: voice.autoVoice,
  })
  useEffect(() => {
    stateRef.current = {
      stepId: currentStep.id,
      courseConfirm,
      code,
      autoVoice: voice.autoVoice,
    }
  }, [currentStep.id, courseConfirm, code, voice.autoVoice])

  // Cleanup mic & pending timers whenever leaving the code page
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (checkTimerRef.current) {
        clearTimeout(checkTimerRef.current)
        checkTimerRef.current = null
      }
      voice.stopMic()
    }
  }, [voice])

  // Live 1s countdown ticker for outWait lock screen
  const checkoutRemainSec =
    currentStep.id === 'checkout' && isCheckinMode && activeCourse
      ? getCheckoutRemainingSec(activeCourse, db.checkedIn || {}, nowMs)
      : 0

  useEffect(() => {
    if (checkoutRemainSec <= 0) return undefined
    const timer = setInterval(() => {
      setNowMs(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [checkoutRemainSec])

  // Focus heading on swipe confirmation screen
  useEffect(() => {
    if (isCourseSwipeActive) {
      swipeHeadingRef.current?.focus()
    }
  }, [isCourseSwipeActive, matchedCourse?.id])

  const startCodeListening = useCallback(() => {
    if (!mountedRef.current || stateRef.current.courseConfirm) return
    setCodeError('')
    voice.listen({
      onStatus: (msg) => {
        if (mountedRef.current) setStatusMsg(msg)
      },
      onInterim: (interim) => {
        if (!mountedRef.current) return
        const heard = digitsOf(interim)
        setStatusMsg(heard ? `กำลังฟัง: ${heard}` : `กำลังฟัง: "${interim}"`)
      },
      onResult: (transcript) => {
        if (mountedRef.current) onSpokenCodeRef.current?.(transcript)
      },
    })
  }, [voice])

  // Announce code step & auto-open mic when arriving via goToStep
  const announceToken = location.state?.announceToken
  useEffect(() => {
    if (!announceToken || lastAnnouncedTokenRef.current === announceToken) return
    lastAnnouncedTokenRef.current = announceToken

    if (checkTimerRef.current) {
      clearTimeout(checkTimerRef.current)
      checkTimerRef.current = null
    }
    stateRef.current.code = ''
    stateRef.current.courseConfirm = false

    setCode('')
    setCodeError('')
    setStatusMsg('')
    setCourseConfirm(false)
    setNowMs(Date.now())

    if (!stateRef.current.autoVoice) return

    if (
      currentStep.id === 'checkout' &&
      activeCourse?.mode === 'checkin' &&
      getCheckoutRemainingSec(activeCourse, db.checkedIn) > 0
    ) {
      voice.speak('ยังไม่ถึงเวลากรอกรหัสเช็กเอาต์ กรุณารอให้ครบเวลาเรียนก่อน', {
        promptKey: 'checkout_wait',
      })
      return
    }

    voice.speak(currentStep.vo, {
      promptKey: currentStep.promptKey,
      onEnd: () => {
        const cur = stateRef.current
        if (
          mountedRef.current &&
          cur.autoVoice &&
          (cur.stepId === 'checkin' || cur.stepId === 'checkout') &&
          !cur.courseConfirm &&
          cur.code.length < 4
        ) {
          startCodeListening()
        }
      },
    })
  }, [
    activeCourse,
    announceToken,
    currentStep.id,
    currentStep.promptKey,
    currentStep.vo,
    db.checkedIn,
    startCodeListening,
    voice,
  ])

  const handleCheckCode = useCallback(
    (digits) => {
      if (!mountedRef.current) return
      voice.stopMic()
      setStatusMsg('')
      const res = verifyStudentCode(digits, db.courses, db.checkedIn, currentStep.id)
      if (!res.ok) {
        stateRef.current.code = ''
        setCode('')
        setMatchedCourseId(null)
        setCourseConfirm(false)
        setCodeError(res.message)
        if (voice.autoVoice) voice.speak(res.speech)
        return
      }

      setCodeError('')
      setCourseId(res.course.id)
      setMatchedCourseId(res.course.id)

      if (res.action === 'in') {
        const params = new URLSearchParams()
        if (searchParams.get('kiosk') === '1') params.set('kiosk', '1')
        params.set('step', 'checkin')
        navigate(`/student/code?${params.toString()}`, { replace: true })
        setCode(digits)
        setCourseConfirm(true)
        if (voice.autoVoice) voice.speak(res.speech)
        return
      }

      if (res.skipConfirm) {
        stateRef.current.code = ''
        setCode('')
        setCourseConfirm(false)
        goToStep(res.course.hasNet === false ? 'cert' : 'phone', { courseOverride: res.course })
        return
      }

      const params = new URLSearchParams()
      if (searchParams.get('kiosk') === '1') params.set('kiosk', '1')
      const qs = params.toString()
      navigate(qs ? `/student/code?${qs}` : '/student/code', { replace: true })
      setCode(digits)
      setCourseConfirm(true)
      if (voice.autoVoice) voice.speak(res.speech)
    },
    [
      currentStep.id,
      db.checkedIn,
      db.courses,
      goToStep,
      navigate,
      searchParams,
      setCourseId,
      setMatchedCourseId,
      voice,
    ],
  )

  const scheduleCodeCheck = useCallback(
    (digits) => {
      if (checkTimerRef.current) clearTimeout(checkTimerRef.current)
      checkTimerRef.current = setTimeout(() => {
        checkTimerRef.current = null
        if (mountedRef.current && !stateRef.current.courseConfirm) {
          handleCheckCode(digits)
        }
      }, 280)
    },
    [handleCheckCode],
  )

  const handleSpokenCode = useCallback(
    (transcript) => {
      if (!mountedRef.current || stateRef.current.courseConfirm) return
      setCodeError('')
      const d = digitsOf(transcript)

      if (!d) {
        const msg = 'ไม่ได้ยินตัวเลข ลองพูดใหม่อีกครั้ง'
        setStatusMsg(msg)
        if (stateRef.current.autoVoice) {
          voice.speak(msg, {
            onEnd: () => {
              const cur = stateRef.current
              if (
                mountedRef.current &&
                cur.autoVoice &&
                (cur.stepId === 'checkin' || cur.stepId === 'checkout') &&
                !cur.courseConfirm &&
                cur.code.length < 4
              ) {
                startCodeListening()
              }
            },
          })
        }
        return
      }

      // If user spoke 4+ digits in one go, take the last/first 4 digits cleanly;
      // if 1-3 digits, accumulate onto the existing code so speaking digit-by-digit works!
      const nextCode =
        d.length >= 4 ? d.slice(0, 4) : `${stateRef.current.code}${d}`.slice(0, 4)

      stateRef.current.code = nextCode
      setCode(nextCode)

      if (nextCode.length === 4) {
        setStatusMsg(`ได้ยินครบ 4 หลัก (${nextCode}) กำลังตรวจสอบ...`)
        scheduleCodeCheck(nextCode)
        return
      }

      const remain = 4 - nextCode.length
      const msg = `ได้ยิน ${spellDigits(d)} (เหลืออีก ${remain} หลัก พูดต่อได้เลย)`
      setStatusMsg(msg)
      if (stateRef.current.autoVoice) {
        voice.speak(`ได้ยิน ${spellDigits(d)} เหลืออีก ${remain} หลัก พูดต่อได้เลย`, {
          onEnd: () => {
            const cur = stateRef.current
            if (
              mountedRef.current &&
              cur.autoVoice &&
              (cur.stepId === 'checkin' || cur.stepId === 'checkout') &&
              !cur.courseConfirm &&
              cur.code.length < 4
            ) {
              startCodeListening()
            }
          },
        })
      }
    },
    [scheduleCodeCheck, startCodeListening, voice],
  )

  useEffect(() => {
    onSpokenCodeRef.current = handleSpokenCode
  }, [handleSpokenCode])

  const handleToggleListen = useCallback(() => {
    if (voice.listening) {
      voice.stopMic()
      setStatusMsg('')
      return
    }
    startCodeListening()
  }, [startCodeListening, voice])

  const handleDigitPress = useCallback(
    (digit) => {
      voice.stopMic()
      setCodeError('')
      setStatusMsg('')
      setCode((prev) => {
        if (prev.length >= 4) return prev
        const next = prev + digit
        stateRef.current.code = next
        if (next.length === 4) {
          scheduleCodeCheck(next)
        }
        return next
      })
    },
    [scheduleCodeCheck, voice],
  )

  const handleClearCode = useCallback(() => {
    if (checkTimerRef.current) {
      clearTimeout(checkTimerRef.current)
      checkTimerRef.current = null
    }
    voice.stopMic()
    stateRef.current.code = ''
    setCode('')
    setCodeError('')
    setStatusMsg('')
  }, [voice])

  const handleBackspaceCode = useCallback(() => {
    if (checkTimerRef.current) {
      clearTimeout(checkTimerRef.current)
      checkTimerRef.current = null
    }
    voice.stopMic()
    setCodeError('')
    setCode((prev) => {
      const next = prev.slice(0, -1)
      stateRef.current.code = next
      return next
    })
  }, [voice])

  // Support physical keyboard input (0-9, Backspace, Escape) for desktop & kiosk UX
  useEffect(() => {
    if (isCourseSwipeActive || checkoutRemainSec > 0) return undefined
    const onKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault()
        handleDigitPress(e.key)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        handleBackspaceCode()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleClearCode()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [checkoutRemainSec, handleBackspaceCode, handleClearCode, handleDigitPress, isCourseSwipeActive])

  const handleConfirmCourseYes = useCallback(async () => {
    setCourseConfirm(false)
    if (currentStep.id === 'checkin' && matchedCourse) {
      await recordCheckIn(matchedCourse.id)
      const w = Number(matchedCourse.outWait || 0)
      showToast(
        w > 0
          ? `Check-in สำเร็จ! กรอก Check-out ได้ในอีก ${w} นาที`
          : 'Check-in เริ่มเรียนสำเร็จ! กรอกรหัส Check-out เมื่อเรียนจบ',
        'success',
      )
      stateRef.current.code = ''
      setCode('')
      goToStep('checkout', { courseOverride: matchedCourse })
      return
    }
    stateRef.current.code = ''
    setCode('')
    goToStep(matchedCourse?.hasNet === false ? 'cert' : 'phone', {
      courseOverride: matchedCourse,
    })
  }, [currentStep.id, goToStep, matchedCourse, recordCheckIn, showToast])

  const handleConfirmCourseNo = useCallback(() => {
    setCourseConfirm(false)
    setMatchedCourseId(null)
    stateRef.current.code = ''
    setCode('')
    setStatusMsg('')
    if (voice.autoVoice) voice.speak('กรุณาใส่รหัสหลักสูตรอีกครั้ง')
  }, [setMatchedCourseId, voice])

  const swipe = useSwipe({
    onSwipeRight: handleConfirmCourseYes,
    onSwipeLeft: handleConfirmCourseNo,
  })
  const leftOpacity =
    swipe.dx < 0 ? 0.35 + 0.65 * swipe.progress : swipe.dx > 0 ? 0.35 * (1 - swipe.progress) : 0.35
  const rightOpacity =
    swipe.dx > 0 ? 0.35 + 0.65 * swipe.progress : swipe.dx < 0 ? 0.35 * (1 - swipe.progress) : 0.35

  const sampleCode = isCiStep
    ? activeCourse?.codeIn || '1501'
    : activeCourse?.code || '4827'
  const checkedInRecord = activeCourse ? db.checkedIn?.[activeCourse.id] : null
  const unlockTimeText = useMemo(() => {
    if (!checkedInRecord || !activeCourse) return ''
    const unlockAt = new Date(checkedInRecord.at + Number(activeCourse.outWait || 0) * 60000)
    return `${String(unlockAt.getHours()).padStart(2, '0')}:${String(unlockAt.getMinutes()).padStart(2, '0')}`
  }, [activeCourse, checkedInRecord])

  if (isCourseSwipeActive) {
    return (
      <SwipeConfirmStep
        title="ตรวจสอบชื่อหลักสูตร"
        badgeText={isCiStep ? 'Check-in เริ่มเรียน' : 'Check-out รับใบเกียรติบัตร'}
        badgeColor={isCiStep ? 'secondary' : 'primary'}
        mainText={matchedCourse.name}
        yesLabel="ใช่ ยืนยันหลักสูตรนี้"
        noLabel="ไม่ใช่หลักสูตรนี้ แก้ไขรหัส"
        headingRef={swipeHeadingRef}
        leftOpacity={leftOpacity}
        rightOpacity={rightOpacity}
        readyDir={swipe.readyDir}
        clampedTranslate={swipe.clampedTranslate}
        isDragging={swipe.dx !== 0}
        swipeHandlers={swipe.bindHandlers}
        onAccessibleConfirm={() => swipe.guardTap(handleConfirmCourseYes)}
        onAccessibleEdit={() => swipe.guardTap(handleConfirmCourseNo)}
      />
    )
  }

  return (
    <CodeStep
      isCiStep={isCiStep}
      course={activeCourse}
      isCheckinMode={isCheckinMode}
      remainSec={checkoutRemainSec}
      remainText={fmtMMSS(checkoutRemainSec)}
      unlockTimeText={unlockTimeText}
      sampleCode={sampleCode}
      needCiWarn={!isCiStep && isCheckinMode && Boolean(activeCourse) && !checkedInRecord}
      ciDoneBadge={!isCiStep && isCheckinMode && Boolean(activeCourse) && Boolean(checkedInRecord)}
      code={code}
      errorText={codeError}
      statusMsg={statusMsg}
      listening={voice.listening}
      onListenCode={handleToggleListen}
      onDigitPress={handleDigitPress}
      onClearCode={handleClearCode}
      onBackspaceCode={handleBackspaceCode}
      onSimulateSampleSpeech={() => handleSpokenCode(spellDigits(sampleCode))}
      onUnlockWaitDemo={() => activeCourse && unlockCheckoutDemo(activeCourse.id)}
      onGoCheckinStep={() => goToStep('checkin')}
      onGoHome={handleGoHome}
    />
  )
}
