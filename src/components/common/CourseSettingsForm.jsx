import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CasinoIcon from '@mui/icons-material/Casino'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import SaveIcon from '@mui/icons-material/Save'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CertificatePreview from './CertificatePreview'
import SignaturePad from './SignaturePad'

export default function CourseSettingsForm({
  form,
  role = 'organizer',
  error = '',
  isCheckin = false,
  availableDsr = [],
  bgFileRef,
  signaturePadProps,
  signaturePad2Props,
  previewProps,
  onFieldChange,
  onModeChange,
  onRandomCode,
  onTriggerBgUpload,
  onBgUpload,
  onClearBg,
  onSubmit,
  onCancel,
}) {
  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      {role === 'admin' && onCancel && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onCancel}
          sx={{ mb: 1.5 }}
        >
          กลับ
        </Button>
      )}

      <Typography variant="h2" sx={{ mb: 2 }}>
        {role === 'admin'
          ? form.id
            ? 'ดู/แก้ไขหลักสูตร'
            : 'เพิ่มหลักสูตร'
          : 'ตั้งค่าหลักสูตร'}
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <TextField
              label="ชื่อหลักสูตร"
              value={form.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="วันที่จัด"
              type="date"
              value={form.date}
              onChange={(e) => onFieldChange('date', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="course-mode-label">รูปแบบการเช็กชื่อรับใบเกียรติบัตร</InputLabel>
              <Select
                labelId="course-mode-label"
                label="รูปแบบการเช็กชื่อรับใบเกียรติบัตร"
                value={form.mode}
                onChange={(e) => onModeChange(e.target.value)}
              >
                <MenuItem value="checkout">
                  ผู้พิการ — สแกน Check-out เพื่อรับใบเซอร์เลย
                </MenuItem>
                <MenuItem value="checkin">
                  บุคคลทั่วไป — ต้อง Check-in ตอนเริ่มเรียนก่อน แล้วค่อย Check-out
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="course-net-label">การแจกโค้ดเน็ตฟรีในหลักสูตร</InputLabel>
              <Select
                labelId="course-net-label"
                label="การแจกโค้ดเน็ตฟรีในหลักสูตร"
                value={form.hasNet === false ? 'no' : 'yes'}
                onChange={(e) => onFieldChange('hasNet', e.target.value === 'yes')}
              >
                <MenuItem value="yes">
                  แจกโค้ดเน็ต — ผู้เรียนกรอกเบอร์โทรและเลือกเครือข่ายก่อนรับใบเซอร์
                </MenuItem>
                <MenuItem value="no">
                  ไม่แจกโค้ดเน็ต — ผู้เรียนรับใบเกียรติบัตรได้ทันทีหลังใส่รหัส
                </MenuItem>
              </Select>
            </FormControl>

            {role === 'admin' && (
              <>
                <FormControl fullWidth>
                  <InputLabel id="course-type-label">ประเภท</InputLabel>
                  <Select
                    labelId="course-type-label"
                    label="ประเภท"
                    value={form.type}
                    onChange={(e) => onFieldChange('type', e.target.value)}
                  >
                    <MenuItem value="DSR">DSR</MenuItem>
                    <MenuItem value="ไม่ใช่ DSR">ไม่ใช่ DSR</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="course-owner-label">
                    DSR ID ผู้ดูแล (1 ID ต่อ 1 หลักสูตร)
                  </InputLabel>
                  <Select
                    labelId="course-owner-label"
                    label="DSR ID ผู้ดูแล (1 ID ต่อ 1 หลักสูตร)"
                    value={form.owner}
                    onChange={(e) => onFieldChange('owner', e.target.value)}
                  >
                    {availableDsr.map((d) => (
                      <MenuItem key={d.id} value={d.id}>
                        {d.id} — {d.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            {isCheckin && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                <TextField
                  label="รหัส Check-in 4 หลัก (ตอนเริ่มเรียน)"
                  value={form.codeIn}
                  onChange={(e) =>
                    onFieldChange('codeIn', e.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                  slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 4 } }}
                  fullWidth
                />
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<CasinoIcon />}
                  onClick={() => onRandomCode('in')}
                  sx={{ minWidth: 96, height: 56 }}
                >
                  สุ่ม
                </Button>
              </Stack>
            )}

            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
              <TextField
                label={
                  isCheckin
                    ? 'รหัส Check-out 4 หลัก (ตอนจบเรียน / รับใบเซอร์)'
                    : 'รหัส Check-out 4 หลัก (รับใบเซอร์เลย)'
                }
                value={form.code}
                onChange={(e) =>
                  onFieldChange('code', e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 4 } }}
                fullWidth
              />
              <Button
                variant="contained"
                color="secondary"
                startIcon={<CasinoIcon />}
                onClick={() => onRandomCode('out')}
                sx={{ minWidth: 96, height: 56 }}
              >
                สุ่ม
              </Button>
            </Stack>

            {isCheckin && (
              <TextField
                label="เวลารอหลัง Check-in ก่อนกรอก Check-out (นาที)"
                type="number"
                value={form.outWait}
                onChange={(e) =>
                  onFieldChange('outWait', Math.max(0, Number(e.target.value) || 0))
                }
                slotProps={{ htmlInput: { min: 0 } }}
                helperText="เช่น 60 = ต้องรอ 60 นาทีหลัง Check-in จึงจะกรอกรหัส Check-out ได้ (0 = กรอกได้ทันที)"
                fullWidth
              />
            )}

            <TextField
              label="วันหมดอายุรหัส"
              type="date"
              value={form.exp}
              onChange={(e) => onFieldChange('exp', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />

            <TextField
              label="ข้อความบนใบเกียรติบัตร"
              value={form.txt}
              onChange={(e) => onFieldChange('txt', e.target.value)}
              fullWidth
            />
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h3" sx={{ mb: 1.5 }}>
          ผู้ลงนามบนใบเกียรติบัตร (รองรับสูงสุด 2 คน)
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack
              spacing={1.5}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                height: '100%',
              }}
            >
              <TextField
                label="ผู้ลงนามคนที่ 1"
                placeholder="เช่น ผอ.ศูนย์ฯ ขอนแก่น"
                value={form.signer}
                onChange={(e) => onFieldChange('signer', e.target.value)}
                fullWidth
              />
              <SignaturePad
                label="ลายเซ็นผู้ลงนามคนที่ 1 (เซ็นบนจอ หรืออัปโหลดรูป)"
                ariaLabel="พื้นที่เซ็นชื่อผู้ลงนามคนที่ 1"
                {...signaturePadProps}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack
              spacing={1.5}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                height: '100%',
              }}
            >
              <TextField
                label="ผู้ลงนามคนที่ 2 (ไม่บังคับ)"
                placeholder="เช่น วิทยากรประจำหลักสูตร"
                value={form.signer2 || ''}
                onChange={(e) => onFieldChange('signer2', e.target.value)}
                fullWidth
              />
              <SignaturePad
                label="ลายเซ็นผู้ลงนามคนที่ 2 (เซ็นบนจอ หรืออัปโหลดรูป)"
                ariaLabel="พื้นที่เซ็นชื่อผู้ลงนามคนที่ 2"
                {...signaturePad2Props}
              />
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
          พื้นหลังใบเกียรติบัตร (อัปโหลดรูปแนวนอนสัดส่วน A4)
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            ref={bgFileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onBgUpload}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={onTriggerBgUpload}
          >
            เลือกรูปพื้นหลัง
          </Button>
          {form.bg && (
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<DeleteOutlineIcon />}
              onClick={onClearBg}
            >
              ลบพื้นหลัง
            </Button>
          )}
        </Stack>

        <FormControlLabel
          sx={{ mt: 0.5 }}
          control={
            <Checkbox
              checked={Boolean(form.bgv)}
              onChange={(e) => onFieldChange('bgv', e.target.checked)}
            />
          }
          label="ทำพื้นหลังให้จางลงเพื่อให้อ่านตัวอักษรง่าย"
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          แนะนำรูปแนวนอนสัดส่วน A4 (เช่น 297×210) ถ้ารูปมีกรอบของตัวเองอยู่แล้ว ระบบจะไม่ใส่กรอบเดิมซ้ำ
        </Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h3" sx={{ mb: 1 }}>
          ตัวอย่างใบเกียรติบัตร
        </Typography>
        <CertificatePreview {...previewProps} />
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
        <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
          บันทึก
        </Button>
        {role === 'admin' && onCancel && (
          <Button variant="outlined" onClick={onCancel}>
            ยกเลิก
          </Button>
        )}
      </Stack>
    </Box>
  )
}
