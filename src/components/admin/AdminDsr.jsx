import AddIcon from '@mui/icons-material/Add'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import {
  Box,
  Button,
  Card,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

export default function AdminDsr({
  dsrRows,
  newOrgName,
  editId,
  editName,
  delId,
  revealed,
  onNewOrgNameChange,
  onAddDsr,
  onStartEdit,
  onEditNameChange,
  onSaveEdit,
  onCancelEdit,
  onToggleDsr,
  onResetPw,
  onToggleRevealPw,
  onCopyPw,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}) {
  return (
    <Card sx={{ p: 2.25 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.25}
        sx={{ alignItems: 'stretch', mb: 2 }}
      >
        <TextField
          label="ชื่อหน่วยงานใหม่"
          size="small"
          value={newOrgName}
          onChange={(e) => onNewOrgNameChange(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={onAddDsr}
          sx={{ whiteSpace: 'nowrap', px: 2.5 }}
        >
          สร้าง DSR ID
        </Button>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>DSR ID</TableCell>
              <TableCell>ชื่อหน่วยงาน</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell>หลักสูตร</TableCell>
              <TableCell>รหัสผ่านชั่วคราว</TableCell>
              <TableCell align="right">จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dsrRows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{row.id}</TableCell>
                <TableCell sx={{ whiteSpace: 'normal', minWidth: 200 }}>
                  {editId === row.id ? (
                    <TextField
                      size="small"
                      value={editName}
                      onChange={(e) => onEditNameChange(e.target.value)}
                      fullWidth
                    />
                  ) : (
                    row.name
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.on ? 'ใช้งาน' : 'ปิดใช้งาน'}
                    color={row.on ? 'success' : 'default'}
                    variant={row.on ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'normal', minWidth: 160 }}>
                  {row.courseName || 'ยังไม่มีหลักสูตร'}
                </TableCell>
                <TableCell>
                  {row.chg ? (
                    <Chip size="small" label="ผู้ดูแลเปลี่ยนเองแล้ว" variant="outlined" />
                  ) : (
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                      <Box component="code" sx={{ fontSize: 15, letterSpacing: 1, fontWeight: 600 }}>
                        {revealed[row.id] ? row.pw : '••••••••'}
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={revealed[row.id] ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        onClick={() => onToggleRevealPw(row.id)}
                      >
                        {revealed[row.id] ? 'ซ่อน' : 'แสดง'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => onCopyPw(row.pw)}
                      >
                        คัดลอก
                      </Button>
                    </Stack>
                  )}
                </TableCell>
                <TableCell align="right">
                  {editId === row.id ? (
                    <Stack direction="row" spacing={0.75} sx={{ justifyContent: 'flex-end' }}>
                      <Button size="small" variant="contained" onClick={() => onSaveEdit(row.id)}>
                        บันทึก
                      </Button>
                      <Button size="small" variant="outlined" onClick={onCancelEdit}>
                        ยกเลิก
                      </Button>
                    </Stack>
                  ) : delId === row.id ? (
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
                    >
                      <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>
                        ลบ?{row.ownedCount ? ` มี ${row.ownedCount} หลักสูตร` : ''}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        onClick={() => onConfirmDelete(row.id)}
                      >
                        ยืนยันลบ
                      </Button>
                      <Button size="small" variant="outlined" onClick={onCancelDelete}>
                        ยกเลิก
                      </Button>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={0.75} sx={{ justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => onStartEdit(row.id, row.name)}
                      >
                        แก้ไข
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => onToggleDsr(row.id)}>
                        {row.on ? 'ปิด' : 'เปิด'}
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => onResetPw(row.id)}>
                        รีเซ็ตรหัสผ่าน
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => onRequestDelete(row.id)}>
                        ลบ
                      </Button>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}
