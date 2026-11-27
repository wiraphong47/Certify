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

  const isCiStep = currentStep.id === 'checkin'
  const isCourseSwipeActive = courseConfirm && Boolean(matchedCourse)

  const stateRef = useRef({
    stepId: currentStep.id,
    courseConfirm,
    codeLength: code.length,
    autoVoice: voice.autoVoice,
  })
  useEffect(() => {
    stateRef.current = {
      stepId: currentStep.id,
      courseConfirm,
      codeLength: code.length,
      autoVoice: voice.autoVoice,
    }
  }, [currentStep.id, courseConfirm, code.length, voice.autoVoice])

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

  // Announce code step & auto-open mic when arriving via goToStep
  const announceToken = location.state?.announceToken
  useEffect(() => {
    if (!announceToken || lastAnnouncedTokenRef.current === announceToken) return
    lastAnnouncedTokenRef.current = announceToken

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
          cur.autoVoice &&
          (cur.stepId === 'checkin' || cur.stepId === 'checkout') &&
          !cur.courseConfirm &&
          cur.codeLength < 4
        ) {
          voice.listen({
            onStatus: setStatusMsg,
            onResult: (transcript) => onSpokenCodeRef.current?.(transcript),
          })
        }
      },
    })
  }, [activeCourse, announceToken, currentStep.id, currentStep.promptKey, currentStep.vo, db.checkedIn, voice])

  const handleCheckCode = useCallback(
    (digits) => {
      voice.stopMic()
      const res = verifyStudentCode(digits, db.courses, db.checkedIn, currentStep.id)
      if (!res.ok) {
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

  const handleSpokenCode = useCallback(
    (transcript) => {
      if (stateRef.current.courseConfirm) return
      const d = digitsOf(transcript)
      if (d.length !== 4) {
        const msg = `ได้ยินเป็น ${d ? spellDigits(d) : 'ไม่มีตัวเลข'} ไม่ครบสี่หลัก ลองพูดใหม่`
        setStatusMsg(msg)
        voice.speak(msg, {
          onEnd: () => {
            const cur = stateRef.current
            if (
              cur.autoVoice &&
              (cur.stepId === 'checkin' || cur.stepId === 'checkout') &&
              !cur.courseConfirm
            ) {
              voice.listen({
                onStatus: setStatusMsg,
                onResult: (t) => onSpokenCodeRef.current?.(t),
              })
            }
          },
        })
        return
      }
      setCode(d)
      setTimeout(() => {
        if (!stateRef.current.courseConfirm) {
          handleCheckCode(d)
        }
      }, 300)
    },
    [handleCheckCode, voice],
  )

  useEffect(() => {
    onSpokenCodeRef.current = handleSpokenCode
  }, [handleSpokenCode])

  const handleDigitPress = (digit) => {
    voice.stopMic()
    setCodeError('')
    setCode((prev) => {
      if (prev.length >= 4) return prev
      const next = prev + digit
      if (next.length === 4) {
        setTimeout(() => handleCheckCode(next), 300)
      }
      return next
    })
  }

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
      setCode('')
      goToStep('checkout', { courseOverride: matchedCourse })
      return
    }
    setCode('')
    goToStep(matchedCourse?.hasNet === false ? 'cert' : 'phone', {
      courseOverride: matchedCourse,
    })
  }, [currentStep.id, goToStep, matchedCourse, recordCheckIn, showToast])

  const handleConfirmCourseNo = useCallback(() => {
    setCourseConfirm(false)
    setMatchedCourseId(null)
    setCode('')
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
      onListenCode={() =>
        voice.listen({
          onStatus: setStatusMsg,
          onResult: handleSpokenCode,
        })
      }
      onDigitPress={handleDigitPress}
      onClearCode={() => setCode('')}
      onBackspaceCode={() => setCode((prev) => prev.slice(0, -1))}
      onSimulateSampleSpeech={() => handleSpokenCode(spellDigits(sampleCode))}
      onUnlockWaitDemo={() => activeCourse && unlockCheckoutDemo(activeCourse.id)}
      onGoCheckinStep={() => goToStep('checkin')}
      onGoHome={handleGoHome}
    />
  )
}
