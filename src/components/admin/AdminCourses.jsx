import AddIcon from '@mui/icons-material/Add'
import {
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
  Typography,
} from '@mui/material'

export default function AdminCourses({
  filter,
  filters,
  courses,
  confirmDelId,
  onFilterChange,
  onCreateCourse,
  onEditCourse,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}) {
  return (
    <Card sx={{ p: 2.25 }}>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }} useFlexGap>
        {filters.map((f) => (
          <Button
            key={f.key}
            size="small"
            variant={filter === f.key ? 'contained' : 'outlined'}
            color={filter === f.key ? 'secondary' : 'inherit'}
            onClick={() => onFilterChange(f.key)}
            sx={{
              flex: 1,
              minWidth: 120,
              borderWidth: 2,
              borderColor: filter === f.key ? 'secondary.main' : 'divider',
            }}
          >
            {f.label} ({f.count})
          </Button>
        ))}
      </Stack>

      <Button
        size="small"
        variant="contained"
        color="secondary"
        startIcon={<AddIcon />}
        onClick={onCreateCourse}
        sx={{ mb: 1.5 }}
      >
        เพิ่มหลักสูตร
      </Button>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>หลักสูตร</TableCell>
              <TableCell>DSR ID</TableCell>
              <TableCell>ประเภท</TableCell>
              <TableCell>รูปแบบ</TableCell>
              <TableCell>โค้ดเน็ต</TableCell>
              <TableCell>วันที่</TableCell>
              <TableCell align="right">รับใบเซอร์</TableCell>
              <TableCell>รหัสลับ</TableCell>
              <TableCell align="right">จัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    ยังไม่มีหลักสูตร
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              courses.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ whiteSpace: 'normal', minWidth: 180 }}>{c.name}</TableCell>
                  <TableCell>{c.owner}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={c.type}
                      color={c.type === 'DSR' ? 'primary' : 'secondary'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={c.mode === 'checkin' ? 'Check-in + Out' : 'Check-out'}
                      color={c.mode === 'checkin' ? 'secondary' : 'primary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={c.hasNet === false ? 'ไม่แจกเน็ต' : 'แจกเน็ต'}
                      color={c.hasNet === false ? 'default' : 'success'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{c.date || '-'}</TableCell>
                  <TableCell align="right">{c.got}</TableCell>
                  <TableCell>
                    {c.mode === 'checkin'
                      ? `เข้า: ${c.codeIn || '-'} / ออก: ${c.code || '-'}`
                      : c.code || '-'}
                  </TableCell>
                  <TableCell align="right">
                    {confirmDelId === c.id ? (
                      <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
                      >
                        <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>
                          ลบ?{c.got ? ` (มีผู้รับ ${c.got} คน)` : ''}
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          onClick={() => onConfirmDelete(c.id)}
                        >
                          ยืนยันลบ
                        </Button>
                        <Button size="small" variant="outlined" onClick={onCancelDelete}>
                          ยกเลิก
                        </Button>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={0.75} sx={{ justifyContent: 'flex-end' }}>
                        <Button size="small" variant="contained" onClick={() => onEditCourse(c)}>
                          ดู/แก้ไข
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onRequestDelete(c.id)}
                        >
                          ลบ
                        </Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}
