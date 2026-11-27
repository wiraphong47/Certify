import { useCallback, useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import CarrierQuadrantStep from '../../components/student/CarrierQuadrantStep'
import PhoneStep from '../../components/student/PhoneStep'
import SwipeConfirmStep from '../../components/student/SwipeConfirmStep'
import { useSwipe } from '../../hooks/useSwipe'
import { formatPhone, isValidThaiPhone } from '../../utils/formatters'
import { CARRIER_SPEECH, digitsOf, spellDigits } from '../../utils/thaiSpeech'

export default function StudentPhonePage() {
  const {
    steps,
    voice,
    phone,
    setPhone,
    carrier,
    setCarrier,
    setSkippedNet,
    goToStep,
  } = useOutletContext()

  const [phoneSubStep, setPhoneSubStep] = useState('say') // 'say' | 'conf' | 'car'
  const [typedPhone, setTypedPhone] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [micPrompting, setMicPrompting] = useState(false)

  const swipeHeadingRef = useRef(null)
  const autoVoiceRef = useRef(voice.autoVoice)
  const mountedRef = useRef(true)
  const micPendingRef = useRef(false)
  const micPromptTimerRef = useRef(null)

  const {
    autoVoice,
    listening,
    listen: voiceListen,
    speak: voiceSpeak,
    stop: voiceStop,
    stopMic: voiceStopMic,
  } = voice

  const cancelMicPrompt = useCallback(() => {
    micPendingRef.current = false
    setMicPrompting(false)
    if (micPromptTimerRef.current) {
      clearTimeout(micPromptTimerRef.current)
      micPromptTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    autoVoiceRef.current = autoVoice
  }, [autoVoice])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      cancelMicPrompt()
      voiceStopMic()
    }
  }, [cancelMicPrompt, voiceStopMic])

  useEffect(() => {
    if (phoneSubStep === 'conf') {
      swipeHeadingRef.current?.focus()
    }
  }, [phoneSubStep, phone])

  const handlePhoneInput = useCallback(
    (rawText) => {
      cancelMicPrompt()
      const d = digitsOf(rawText)
      if (!isValidThaiPhone(d)) {
        const msg = `ได้ยินเป็น ${d || 'ไม่มีตัวเลข'} ไม่ครบสิบหลัก ลองพูดใหม่`
        setStatusMsg(msg)
        voice.speak(msg)
        return
      }
      setPhone(d)
      setStatusMsg('')
      setPhoneSubStep('conf')
      voice.speak(`เบอร์ ${spellDigits(d)} ถูกต้องไหม ปัดขวาเพื่อยืนยัน ปัดซ้ายเพื่อแก้ไข`)
    },
    [cancelMicPrompt, setPhone, voice],
  )

  const startPhoneListening = useCallback(() => {
    if (!mountedRef.current) return
    voiceListen({
      onStatus: (msg) => {
        if (mountedRef.current) setStatusMsg(msg)
      },
      onInterim: (interim) => {
        if (!mountedRef.current) return
        const heard = digitsOf(interim)
        setStatusMsg(heard ? `กำลังฟัง: ${heard}` : `กำลังฟัง: "${interim}"`)
      },
      onResult: (transcript) => {
        if (mountedRef.current) handlePhoneInput(transcript)
      },
    })
  }, [handlePhoneInput, voiceListen])

  const handleTogglePhoneListen = useCallback(() => {
    if (listening || micPendingRef.current) {
      cancelMicPrompt()
      voiceStop()
      setStatusMsg('หยุดรับฟังแล้ว')
      return
    }

    if (!autoVoice) {
      startPhoneListening()
      return
    }

    cancelMicPrompt()
    micPendingRef.current = true
    setMicPrompting(true)
    setStatusMsg('พูดได้เลยครับ...')

    const beginListening = () => {
      if (!micPendingRef.current || !mountedRef.current) return
      cancelMicPrompt()
      startPhoneListening()
    }

    voiceSpeak('พูดได้เลยครับ', {
      onEnd: () => {
        if (!micPendingRef.current || !mountedRef.current) return
        if (micPromptTimerRef.current) clearTimeout(micPromptTimerRef.current)
        micPromptTimerRef.current = setTimeout(beginListening, 250)
      },
    })
    micPromptTimerRef.current = setTimeout(beginListening, 2500)
  }, [autoVoice, cancelMicPrompt, listening, startPhoneListening, voiceSpeak, voiceStop])

  const handlePhoneEdit = useCallback(() => {
    cancelMicPrompt()
    setPhone('')
    setPhoneSubStep('say')
    if (autoVoiceRef.current) {
      voice.speak('พูดเบอร์ใหม่ได้เลย', {
        promptKey: 'phone_edit',
        onEnd: () => {
          if (mountedRef.current && autoVoiceRef.current) {
            startPhoneListening()
          }
        },
      })
    }
  }, [cancelMicPrompt, setPhone, startPhoneListening, voice])

  const handlePhoneConfirm = useCallback(() => {
    cancelMicPrompt()
    setPhoneSubStep('car')
    voice.speak(
      'ยืนยันเบอร์แล้ว แตะมุมจอที่เป็นเครือข่ายของคุณ ซ้ายบนเอไอเอส ขวาบนทรู ซ้ายล่างดีแทค ขวาล่างเครือข่ายอื่น แตะซ้ำเพื่อยืนยัน',
      { promptKey: 'carrier_intro' },
    )
  }, [cancelMicPrompt, voice])

  const handlePickCarrier = (nextCarrier) => {
    if (carrier === nextCarrier) {
      setSkippedNet(false)
      goToStep(steps.length - 1, { carrierOverride: nextCarrier, skippedOverride: false })
      return
    }
    setCarrier(nextCarrier)
    voice.speak(`เลือก ${CARRIER_SPEECH[nextCarrier]} แตะอีกครั้งเพื่อยืนยัน และรับเน็ตฟรี`)
  }

  const swipe = useSwipe({
    onSwipeRight: handlePhoneConfirm,
    onSwipeLeft: handlePhoneEdit,
  })
  const leftOpacity =
    swipe.dx < 0 ? 0.35 + 0.65 * swipe.progress : swipe.dx > 0 ? 0.35 * (1 - swipe.progress) : 0.35
  const rightOpacity =
    swipe.dx > 0 ? 0.35 + 0.65 * swipe.progress : swipe.dx < 0 ? 0.35 * (1 - swipe.progress) : 0.35

  if (phoneSubStep === 'conf') {
    return (
      <SwipeConfirmStep
        title="ฟังเบอร์ให้ถูกต้อง"
        mainText={formatPhone(phone)}
        mainFontSize="clamp(26px, 8vw, 34px)"
        letterSpacing={3}
        yesLabel="ถูกต้อง ยืนยันเบอร์"
        noLabel="ผิด แก้ไขเบอร์ แล้วพูดใหม่"
        headingRef={swipeHeadingRef}
        leftOpacity={leftOpacity}
        rightOpacity={rightOpacity}
        readyDir={swipe.readyDir}
        clampedTranslate={swipe.clampedTranslate}
        isDragging={swipe.dx !== 0}
        swipeHandlers={swipe.bindHandlers}
        onAccessibleConfirm={() => swipe.guardTap(handlePhoneConfirm)}
        onAccessibleEdit={() => swipe.guardTap(handlePhoneEdit)}
      />
    )
  }

  if (phoneSubStep === 'car') {
    return (
      <CarrierQuadrantStep
        phone={formatPhone(phone)}
        carrier={carrier}
        statusMsg={statusMsg}
        onPickCarrier={handlePickCarrier}
      />
    )
  }

  return (
    <PhoneStep
      typedPhone={typedPhone}
      statusMsg={statusMsg}
      listening={voice.listening || micPrompting}
      onTypedPhoneChange={(val) => setTypedPhone(val.replace(/\D/g, '').slice(0, 10))}
      onListenPhone={handleTogglePhoneListen}
      onSimulatePhoneSpeech={() =>
        handlePhoneInput('ศูนย์ แปด หนึ่ง สอง สาม สี่ ห้า หก เจ็ด แปด')
      }
      onSubmitTypedPhone={() => handlePhoneInput(typedPhone)}
    />
  )
}
