import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  downloadCertificatePdf,
  downloadCertificatePng,
} from '../services/certificateExportService'
import { generateUniqueCode } from '../services/courseService'
import { thDate } from '../utils/formatters'

function normalizeCourse(initialCourse) {
  return {
    id: 0,
    name: '',
    date: '',
    type: 'DSR',
    mode: 'checkout',
    owner: '',
    ci: 0,
    got: 0,
    net: 0,
    codeIn: '',
    code: '',
    outWait: 60,
    exp: '',
    txt: '',
    signer: '',
    sig: '',
    signer2: '',
    sig2: '',
    bg: '',
    bgv: false,
    ...(initialCourse || {}),
    hasNet: initialCourse?.hasNet !== false,
  }
}

function useSignaturePad(sigValue, onSigChange, syncKey = 0) {
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const drawingRef = useRef(false)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    const width = cv.offsetWidth || 500
    cv.width = width
    cv.height = 120
    ctx.clearRect(0, 0, cv.width, cv.height)
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#0C2F53'

    if (sigValue) {
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, cv.width, cv.height)
        ctx.drawImage(img, 0, 0, cv.width, cv.height)
      }
      img.src = sigValue
    }
  }, [sigValue, syncKey])

  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return [e.clientX - rect.left, e.clientY - rect.top]
  }

  const onPointerDown = useCallback((e) => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    drawingRef.current = true
    const [x, y] = getPoint(e)
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#0C2F53'
    ctx.beginPath()
    ctx.moveTo(x, y)
    try {
      cv.setPointerCapture(e.pointerId)
    } catch {
      // ignore
    }
  }, [])

  const onPointerMove = useCallback((e) => {
    if (!drawingRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    const [x, y] = getPoint(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }, [])

  const onPointerUp = useCallback(() => {
    if (!drawingRef.current || !canvasRef.current) return
    drawingRef.current = false
    onSigChange(canvasRef.current.toDataURL('image/png'))
  }, [onSigChange])

  const onPointerCancel = useCallback(() => {
    drawingRef.current = false
  }, [])

  const onClear = useCallback(() => {
    onSigChange('')
  }, [onSigChange])

  const onUploadFile = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onSigChange(reader.result)
        }
      }
      reader.readAsDataURL(file)
    },
    [onSigChange],
  )

  return {
    canvasRef,
    fileInputRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onClear,
    onTriggerUpload: () => fileInputRef.current?.click(),
    onUploadFile,
  }
}

export function useCourseForm({
  initialCourse,
  role = 'organizer',
  db,
  saveCourse,
  showToast,
  onSaved,
}) {
  const [form, setForm] = useState(() => normalizeCourse(initialCourse))
  const [formVersion, setFormVersion] = useState(0)
  const [error, setError] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const bgFileRef = useRef(null)
  const fullCertRef = useRef(null)

  const resetForm = useCallback((nextCourse) => {
    setForm(normalizeCourse(nextCourse))
    setFormVersion((v) => v + 1)
    setError('')
    setPreviewOpen(false)
  }, [])

  const updateField = useCallback((key, val) => {
    setError('')
    setForm((prev) => ({ ...prev, [key]: val }))
  }, [])

  const updateSig1 = useCallback((val) => updateField('sig', val), [updateField])
  const updateSig2 = useCallback((val) => updateField('sig2', val), [updateField])

  const signaturePadProps = useSignaturePad(form.sig, updateSig1, formVersion)
  const signaturePad2Props = useSignaturePad(form.sig2, updateSig2, formVersion)

  const handleModeChange = useCallback((nextMode) => {
    setError('')
    setForm((prev) => ({
      ...prev,
      mode: nextMode,
      outWait: nextMode === 'checkin' ? prev.outWait || 60 : 0,
    }))
  }, [])

  const handleRandomCode = useCallback(
    (kind) => {
      setError('')
      setForm((prev) => {
        if (kind === 'in') {
          return { ...prev, codeIn: generateUniqueCode(db.courses, prev.id, prev.code) }
        }
        return { ...prev, code: generateUniqueCode(db.courses, prev.id, prev.codeIn) }
      })
    },
    [db.courses],
  )

  const handleBgUpload = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const w = Math.min(1600, img.width)
          const h = Math.round((img.height * w) / img.width)
          const cv = document.createElement('canvas')
          cv.width = w
          cv.height = h
          const ctx = cv.getContext('2d')
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, w, h)
          ctx.drawImage(img, 0, 0, w, h)
          updateField('bg', cv.toDataURL('image/jpeg', 0.85))
        }
        img.onerror = () => {
          showToast('เปิดรูปนี้ไม่ได้ ลองรูปอื่น', 'warning')
        }
        img.src = String(reader.result || '')
      }
      reader.readAsDataURL(file)
    },
    [showToast, updateField],
  )

  const handleExport = useCallback(
    async (format) => {
      if (!fullCertRef.current) return
      setExporting(true)
      try {
        const safeName = (form.name || 'certificate').slice(0, 32).replace(/\s+/g, '-')
        if (format === 'pdf') {
          await downloadCertificatePdf(fullCertRef.current, `certify-${safeName}.pdf`)
          showToast('ดาวน์โหลดไฟล์ PDF เรียบร้อยแล้ว', 'success')
        } else {
          await downloadCertificatePng(fullCertRef.current, `certify-${safeName}.png`)
          showToast('ดาวน์โหลดรูปภาพ PNG เรียบร้อยแล้ว', 'success')
        }
      } catch {
        showToast('ไม่สามารถสร้างไฟล์ได้ในขณะนี้', 'error')
      } finally {
        setExporting(false)
      }
    },
    [form.name, showToast],
  )

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      const res = await saveCourse(form, role)
      if (!res.ok) {
        setError(res.error || 'เกิดข้อผิดพลาดในการบันทึก')
        return
      }
      setError('')
      if (onSaved) onSaved(res.course)
    },
    [form, onSaved, role, saveCourse],
  )

  const availableDsr = useMemo(
    () =>
      db.dsr.filter(
        (d) => d.id === form.owner || !db.courses.some((x) => x.owner === d.id),
      ),
    [db.courses, db.dsr, form.owner],
  )

  const ownerOrg = useMemo(
    () => db.dsr.find((d) => d.id === form.owner),
    [db.dsr, form.owner],
  )

  const formattedDate = useMemo(() => thDate(form.date), [form.date])

  return {
    form,
    error,
    resetForm,
    courseFormProps: {
      form,
      role,
      error,
      isCheckin: form.mode === 'checkin',
      ownerOrgName: ownerOrg?.name || '',
      formattedDate,
      availableDsr,
      bgFileRef,
      onFieldChange: updateField,
      onModeChange: handleModeChange,
      onRandomCode: handleRandomCode,
      onTriggerBgUpload: () => bgFileRef.current?.click(),
      onBgUpload: handleBgUpload,
      onClearBg: () => updateField('bg', ''),
      onSubmit: handleSubmit,
      signaturePadProps,
      signaturePad2Props,
      previewProps: {
        course: form,
        orgName: ownerOrg?.name || '',
        formattedDate,
        watermark: true,
        open: previewOpen,
        exporting,
        fullCertRef,
        onOpen: () => setPreviewOpen(true),
        onClose: () => setPreviewOpen(false),
        onExportPdf: () => handleExport('pdf'),
        onExportPng: () => handleExport('png'),
      },
    },
  }
}
