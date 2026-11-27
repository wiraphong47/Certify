import { useMemo, useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import OrganizerOverview from '../../components/organizer/OrganizerOverview'
import { useCertify } from '../../context/certify'
import { buildCourseBuckets, generateCourseRecords } from '../../services/analyticsService'
import {
  downloadCertificatePdf,
  downloadCertificatePng,
} from '../../services/certificateExportService'
import { getCourseChecklist } from '../../services/courseService'
import { thDate } from '../../utils/formatters'

export default function OrganizerOverviewPage() {
  const { regenerateCourseCode, showToast } = useCertify()
  const { loggedInId, org, course, isCheckin, expiryText } = useOutletContext()
  const navigate = useNavigate()

  const [fsDialog, setFsDialog] = useState({ open: false, kind: 'out' })
  const [ovPreviewOpen, setOvPreviewOpen] = useState(false)
  const [ovExporting, setOvExporting] = useState(false)
  const ovCertRef = useRef(null)

  const checklist = useMemo(() => (course ? getCourseChecklist(course) : []), [course])
  const completedCount = useMemo(() => checklist.filter((x) => x.done).length, [checklist])
  const records = useMemo(() => (course ? generateCourseRecords(course) : []), [course])
  const chart = useMemo(() => buildCourseBuckets(course, records, 'h'), [course, records])

  if (!course) return null

  const handleRegenerateCode = async (kind) => {
    await regenerateCourseCode(loggedInId, kind)
  }

  const handleOverviewExport = async (format) => {
    if (!ovCertRef.current || !course) return
    setOvExporting(true)
    try {
      const safeName = (course.name || 'certificate').slice(0, 32).replace(/\s+/g, '-')
      if (format === 'pdf') {
        await downloadCertificatePdf(ovCertRef.current, `certify-${safeName}.pdf`)
        showToast('ดาวน์โหลดไฟล์ PDF เรียบร้อยแล้ว', 'success')
      } else {
        await downloadCertificatePng(ovCertRef.current, `certify-${safeName}.png`)
        showToast('ดาวน์โหลดรูปภาพ PNG เรียบร้อยแล้ว', 'success')
      }
    } catch {
      showToast('ไม่สามารถสร้างไฟล์ได้ในขณะนี้', 'error')
    } finally {
      setOvExporting(false)
    }
  }

  const fsLabel =
    fsDialog.kind === 'in'
      ? 'รหัส Check-in 4 หลัก (ตอนเริ่มเรียน)'
      : isCheckin
        ? 'รหัส Check-out 4 หลัก (รับใบเกียรติบัตร)'
        : 'รหัส 4 หลัก (รับใบเกียรติบัตร)'
  const fsCode = fsDialog.kind === 'in' ? course.codeIn : course.code

  return (
    <OrganizerOverview
      course={course}
      isCheckin={isCheckin}
      checklist={checklist}
      completedCount={completedCount}
      expiryText={expiryText}
      chart={chart}
      hasRecords={records.length > 0}
      fsDialogOpen={fsDialog.open}
      fsLabel={fsLabel}
      fsCode={fsCode}
      previewProps={{
        course,
        orgName: org?.name || '',
        formattedDate: thDate(course.date),
        watermark: true,
        open: ovPreviewOpen,
        exporting: ovExporting,
        fullCertRef: ovCertRef,
        onClose: () => setOvPreviewOpen(false),
        onExportPdf: () => handleOverviewExport('pdf'),
        onExportPng: () => handleOverviewExport('png'),
      }}
      onOpenFullscreen={(kind) => setFsDialog({ open: true, kind })}
      onCloseFullscreen={() => setFsDialog((prev) => ({ ...prev, open: false }))}
      onRegenerateCode={handleRegenerateCode}
      onGoSettings={() => navigate('/organizer/settings')}
      onOpenPreview={() => setOvPreviewOpen(true)}
    />
  )
}
