import { useState } from 'react'
import { Card, Stack } from '@mui/material'
import { useOutletContext } from 'react-router-dom'
import CourseSettingsForm from '../../components/common/CourseSettingsForm'
import PasswordChangeCard from '../../components/organizer/PasswordChangeCard'
import { useCertify } from '../../context/certify'
import { useCourseForm } from '../../hooks/useCourseForm'

export default function OrganizerSettingsPage() {
  const { db, saveCourse, changePassword, showToast } = useCertify()
  const { loggedInId, course } = useOutletContext()

  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confPw, setConfPw] = useState('')
  const [pwError, setPwError] = useState('')

  const { courseFormProps } = useCourseForm({
    initialCourse: course,
    role: 'organizer',
    db,
    saveCourse,
    showToast,
  })

  if (!course) return null

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    const res = await changePassword(loggedInId, curPw, newPw, confPw)
    if (!res.ok) {
      setPwError(res.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
      return
    }
    setPwError('')
    setCurPw('')
    setNewPw('')
    setConfPw('')
  }

  return (
    <Stack spacing={2}>
      <Card sx={{ p: { xs: 2, sm: 2.75 } }}>
        <CourseSettingsForm {...courseFormProps} />
      </Card>
      <PasswordChangeCard
        curPw={curPw}
        newPw={newPw}
        confPw={confPw}
        error={pwError}
        onCurPwChange={setCurPw}
        onNewPwChange={setNewPw}
        onConfPwChange={setConfPw}
        onSubmit={handlePasswordSubmit}
      />
    </Stack>
  )
}
