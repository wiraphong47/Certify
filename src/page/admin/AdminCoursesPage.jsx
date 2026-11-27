import { useEffect, useMemo, useState } from 'react'
import { Card } from '@mui/material'
import { useOutletContext } from 'react-router-dom'
import AdminCourses from '../../components/admin/AdminCourses'
import CourseSettingsForm from '../../components/common/CourseSettingsForm'
import { useCertify } from '../../context/certify'
import { useCourseForm } from '../../hooks/useCourseForm'

export default function AdminCoursesPage() {
  const { db, showToast, saveCourse, deleteCourse } = useCertify()
  const { setHideChrome } = useOutletContext()

  const [isEditingCourse, setIsEditingCourse] = useState(false)
  const [courseFilter, setCourseFilter] = useState('all')
  const [confirmDelCourseId, setConfirmDelCourseId] = useState(0)

  useEffect(() => {
    setHideChrome(isEditingCourse)
    return () => setHideChrome(false)
  }, [isEditingCourse, setHideChrome])

  const { resetForm, courseFormProps } = useCourseForm({
    initialCourse: null,
    role: 'admin',
    db,
    saveCourse,
    showToast,
    onSaved: () => setIsEditingCourse(false),
  })

  const handleCreateCourse = () => {
    const freeDsr = db.dsr.find((d) => !db.courses.some((c) => c.owner === d.id))
    resetForm({
      id: 0,
      name: '',
      date: '',
      type: 'DSR',
      mode: 'checkout',
      hasNet: true,
      owner: freeDsr?.id || '',
      ci: 0,
      got: 0,
      net: 0,
      codeIn: '',
      code: '',
      outWait: 0,
      exp: '',
      txt: '',
      signer: '',
      sig: '',
      signer2: '',
      sig2: '',
      bg: '',
      bgv: false,
    })
    setIsEditingCourse(true)
  }

  const handleEditCourse = (course) => {
    resetForm({ ...course })
    setIsEditingCourse(true)
  }

  const handleConfirmDeleteCourse = async (courseId) => {
    await deleteCourse(courseId)
    setConfirmDelCourseId(0)
  }

  const courseFilters = useMemo(
    () => [
      { key: 'all', label: 'ทั้งหมด', count: db.courses.length },
      {
        key: 'DSR',
        label: 'หลักสูตร DSR',
        count: db.courses.filter((c) => c.type === 'DSR').length,
      },
      {
        key: 'ไม่ใช่ DSR',
        label: 'ไม่ใช่ DSR',
        count: db.courses.filter((c) => c.type === 'ไม่ใช่ DSR').length,
      },
    ],
    [db.courses],
  )

  const filteredCourses = useMemo(
    () =>
      courseFilter === 'all'
        ? db.courses
        : db.courses.filter((c) => c.type === courseFilter),
    [courseFilter, db.courses],
  )

  if (isEditingCourse) {
    return (
      <Card sx={{ p: { xs: 2, sm: 3 } }}>
        <CourseSettingsForm
          {...courseFormProps}
          onCancel={() => setIsEditingCourse(false)}
        />
      </Card>
    )
  }

  return (
    <AdminCourses
      filter={courseFilter}
      filters={courseFilters}
      courses={filteredCourses}
      confirmDelId={confirmDelCourseId}
      onFilterChange={setCourseFilter}
      onCreateCourse={handleCreateCourse}
      onEditCourse={handleEditCourse}
      onRequestDelete={setConfirmDelCourseId}
      onCancelDelete={() => setConfirmDelCourseId(0)}
      onConfirmDelete={handleConfirmDeleteCourse}
    />
  )
}
