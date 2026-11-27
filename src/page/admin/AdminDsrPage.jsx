import { useMemo, useState } from 'react'
import AdminDsr from '../../components/admin/AdminDsr'
import { useCertify } from '../../context/certify'

export default function AdminDsrPage() {
  const {
    db,
    showToast,
    createDsr,
    updateDsrName,
    toggleDsr,
    resetDsrPassword,
    deleteDsr,
  } = useCertify()

  const [newOrgName, setNewOrgName] = useState('')
  const [editDsrId, setEditDsrId] = useState('')
  const [editDsrName, setEditDsrName] = useState('')
  const [delDsrId, setDelDsrId] = useState('')
  const [revealedPw, setRevealedPw] = useState({})

  const handleAddDsr = async () => {
    const res = await createDsr(newOrgName)
    if (res.ok && res.account) {
      setNewOrgName('')
      setRevealedPw((prev) => ({ ...prev, [res.account.id]: true }))
    }
  }

  const handleSaveDsrEdit = async (id) => {
    const res = await updateDsrName(id, editDsrName)
    if (res.ok) setEditDsrId('')
  }

  const handleResetDsrPw = async (id) => {
    await resetDsrPassword(id)
    setRevealedPw((prev) => ({ ...prev, [id]: true }))
  }

  const handleConfirmDeleteDsr = async (id) => {
    await deleteDsr(id)
    setDelDsrId('')
  }

  const handleCopyPw = async (pw) => {
    try {
      await navigator.clipboard.writeText(pw)
      showToast('คัดลอกรหัสผ่านแล้ว', 'success')
    } catch {
      showToast('คัดลอกไม่ได้ ให้จดจากหน้าจอ', 'warning')
    }
  }

  const dsrRows = useMemo(
    () =>
      db.dsr.map((d) => {
        const owned = db.courses.filter((c) => c.owner === d.id)
        return {
          ...d,
          ownedCount: owned.length,
          courseName: owned.length > 0 ? owned[0].name : '',
        }
      }),
    [db.courses, db.dsr],
  )

  return (
    <AdminDsr
      dsrRows={dsrRows}
      newOrgName={newOrgName}
      editId={editDsrId}
      editName={editDsrName}
      delId={delDsrId}
      revealed={revealedPw}
      onNewOrgNameChange={setNewOrgName}
      onAddDsr={handleAddDsr}
      onStartEdit={(id, name) => {
        setEditDsrId(id)
        setEditDsrName(name)
      }}
      onEditNameChange={setEditDsrName}
      onSaveEdit={handleSaveDsrEdit}
      onCancelEdit={() => setEditDsrId('')}
      onToggleDsr={toggleDsr}
      onResetPw={handleResetDsrPw}
      onToggleRevealPw={(id) =>
        setRevealedPw((prev) => ({ ...prev, [id]: !prev[id] }))
      }
      onCopyPw={handleCopyPw}
      onRequestDelete={setDelDsrId}
      onCancelDelete={() => setDelDsrId('')}
      onConfirmDelete={handleConfirmDeleteDsr}
    />
  )
}
