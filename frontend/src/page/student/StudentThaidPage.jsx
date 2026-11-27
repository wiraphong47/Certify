import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ThaidStep from '../../components/student/ThaidStep'
import { authenticateWithThaid } from '../../services/authService'
import { fmtMMSS } from '../../utils/formatters'

const THAID_MOCK_TTL_SEC = 60

function generateRefCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const digits = '0123456789'
  let out = ''
  for (let i = 0; i < 4; i += 1) {
    out += letters[Math.floor(Math.random() * letters.length)]
  }
  for (let i = 0; i < 2; i += 1) {
    out += digits[Math.floor(Math.random() * digits.length)]
  }
  return out
}

export default function StudentThaidPage() {
  const { isCheckinMode, voice, setStudentName, goToStep } = useOutletContext()

  const [viewMode, setViewMode] = useState('intro') // 'intro' | 'thaidMock' | 'manual'
  const [mockRefCode, setMockRefCode] = useState('PLGR83')
  const [mockRemainSec, setMockRemainSec] = useState(THAID_MOCK_TTL_SEC)

  const [fullName, setFullName] = useState('')
  const [nameError, setNameError] = useState('')

  const startThaidMockSession = useCallback(() => {
    setMockRefCode(generateRefCode())
    setMockRemainSec(THAID_MOCK_TTL_SEC)
  }, [])

  // Live 1-second countdown timer on ThaID mockup screen
  useEffect(() => {
    if (viewMode !== 'thaidMock' || mockRemainSec <= 0) return undefined
    const timer = setInterval(() => {
      setMockRemainSec((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [mockRemainSec, viewMode])

  const handleOpenThaidMock = () => {
    startThaidMockSession()
    setViewMode('thaidMock')
    if (voice.autoVoice) {
      voice.speak('กรุณาสแกนคิวอาร์โค้ดด้วยแอป ไทยไอดี เมื่อสแกนเสร็จแล้ว กดปุ่ม สแกนเสร็จแล้ว ด้านล่าง')
    }
  }

  const handleCompleteThaid = async () => {
    const res = await authenticateWithThaid()
    if (res.ok && res.user?.fullName) {
      setStudentName(res.user.fullName)
    }
    goToStep(2)
  }

  const handleOpenManual = () => {
    setViewMode('manual')
    setNameError('')
    if (voice.autoVoice) {
      voice.speak('กรุณากรอกชื่อและนามสกุล เพื่อดำเนินการต่อ')
    }
  }

  const handleBackToIntro = () => {
    setViewMode('intro')
    setNameError('')
  }

  const handleFullNameChange = (value) => {
    setFullName(value)
    if (nameError) setNameError('')
  }

  const handleSubmitManual = (e) => {
    e.preventDefault()
    const normalized = fullName.trim().replace(/\s+/g, ' ')
    if (!normalized) {
      const msg = 'กรุณากรอกชื่อ-นามสกุลก่อนดำเนินการต่อ'
      setNameError(msg)
      if (voice.autoVoice) voice.speak(msg)
      return
    }
    if (normalized.split(' ').length < 2) {
      const msg = 'กรุณากรอกทั้งชื่อและนามสกุล (เว้นวรรคระหว่างชื่อกับนามสกุล)'
      setNameError(msg)
      if (voice.autoVoice) voice.speak(msg)
      return
    }

    setNameError('')
    setStudentName(normalized)
    goToStep(2)
  }

  return (
    <ThaidStep
      isCheckinMode={isCheckinMode}
      viewMode={viewMode}
      mockRefCode={mockRefCode}
      mockRemainText={fmtMMSS(mockRemainSec)}
      mockExpired={mockRemainSec <= 0}
      fullName={fullName}
      nameError={nameError}
      onOpenThaidMock={handleOpenThaidMock}
      onCompleteThaid={handleCompleteThaid}
      onRefreshThaidMock={startThaidMockSession}
      onBackToIntro={handleBackToIntro}
      onOpenManual={handleOpenManual}
      onFullNameChange={handleFullNameChange}
      onSubmitManual={handleSubmitManual}
    />
  )
}
