import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ThaidStep from '../../components/student/ThaidStep'
import { authenticateWithThaid } from '../../services/authService'

export default function StudentThaidPage() {
  const { isCheckinMode, voice, setStudentName, goToStep } = useOutletContext()
  const [manualMode, setManualMode] = useState(false)
  const [fullName, setFullName] = useState('')
  const [nameError, setNameError] = useState('')

  const handleConfirmThaid = async () => {
    const res = await authenticateWithThaid()
    if (res.ok && res.user?.fullName) {
      setStudentName(res.user.fullName)
    }
    goToStep(2)
  }

  const handleOpenManual = () => {
    setManualMode(true)
    setNameError('')
    if (voice.autoVoice) {
      voice.speak('กรุณากรอกชื่อและนามสกุล เพื่อดำเนินการต่อ')
    }
  }

  const handleCloseManual = () => {
    setManualMode(false)
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
      manualMode={manualMode}
      fullName={fullName}
      nameError={nameError}
      onConfirmThaid={handleConfirmThaid}
      onOpenManual={handleOpenManual}
      onCloseManual={handleCloseManual}
      onFullNameChange={handleFullNameChange}
      onSubmitManual={handleSubmitManual}
    />
  )
}
