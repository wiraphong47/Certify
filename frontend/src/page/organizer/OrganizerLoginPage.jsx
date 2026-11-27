import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import OrganizerLogin from '../../components/organizer/OrganizerLogin'
import { loginOrganizer } from '../../services/authService'

export default function OrganizerLoginPage() {
  const { onLoginSuccess } = useOutletContext()

  const [loginDsrId, setLoginDsrId] = useState('DSR-0123')
  const [loginPassword, setLoginPassword] = useState('demo1234')
  const [loginError, setLoginError] = useState('')

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const res = await loginOrganizer(loginDsrId, loginPassword)
    if (!res.ok) {
      setLoginError(res.error || 'เข้าสู่ระบบไม่สำเร็จ')
      return
    }
    setLoginError('')
    onLoginSuccess(res.account.id, res.account.name)
  }

  return (
    <OrganizerLogin
      dsrId={loginDsrId}
      password={loginPassword}
      error={loginError}
      onDsrIdChange={setLoginDsrId}
      onPasswordChange={setLoginPassword}
      onSubmit={handleLoginSubmit}
    />
  )
}
