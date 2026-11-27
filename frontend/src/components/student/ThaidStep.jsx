import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import BadgeIcon from '@mui/icons-material/Badge'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import EditNoteIcon from '@mui/icons-material/EditNote'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Alert, Box, Button, Divider, Stack, TextField, Typography } from '@mui/material'

export default function ThaidStep({
  isCheckinMode,
  viewMode = 'intro', // 'intro' | 'thaidMock' | 'manual'
  mockRefCode = 'PLGR83',
  mockRemainText = '01:00',
  mockExpired = false,
  fullName = '',
  nameError = '',
  onOpenThaidMock,
  onCompleteThaid,
  onRefreshThaidMock,
  onBackToIntro,
  onOpenManual,
  onFullNameChange,
  onSubmitManual,
}) {
  if (viewMode === 'thaidMock') {
    return (
      <Stack useFlexGap sx={{ flex: 1 }} spacing={1.5}>
        <Box
          sx={{
            bgcolor: '#3C72C9',
            color: '#FFFFFF',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: '0 6px 18px rgba(12, 47, 83, 0.22)',
          }}
        >
          {/* Top header + Plain White Mockup QR */}
          <Box sx={{ px: 2, pt: 2, pb: 2.25, textAlign: 'center' }}>
            <Box sx={{ display: 'inline-block', textAlign: 'right', mb: 0.75 }}>
              <Typography
                component="h1"
                sx={{
                  fontSize: 30,
                  fontWeight: 800,
                  lineHeight: 1.05,
                  color: '#FFFFFF',
                }}
              >
                เข้าสู่ระบบ
              </Typography>
              <Typography
                sx={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: '#FFFFFF',
                  mt: 0.2,
                }}
              >
                ด้วย ThaID
              </Typography>
            </Box>

            <Typography sx={{ fontSize: 17.5, fontWeight: 700, color: '#FFFFFF', mb: 0.4 }}>
              ระบบยืนยันตัวตนแบบรวมศูนย์
            </Typography>
            <Typography
              role="timer"
              aria-live="off"
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: '#FFFFFF',
                mb: 1.75,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              หมดเวลาใน : {mockRemainText}
            </Typography>

            <Box
              aria-label="พื้นที่คิวอาร์โค้ดจำลอง ThaID"
              sx={{
                position: 'relative',
                width: 210,
                height: 210,
                mx: 'auto',
                bgcolor: '#FFFFFF',
                borderRadius: '8px',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {mockExpired && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={onRefreshThaidMock}
                  sx={{ borderRadius: '10px' }}
                >
                  สร้าง QR ใหม่
                </Button>
              )}
            </Box>
          </Box>

          {/* Divider + Reference & DOPA Footer */}
          <Box
            sx={{
              borderTop: '1px solid rgba(255, 255, 255, 0.65)',
              px: 1.75,
              pt: 0.75,
              pb: 1.25,
            }}
          >
            <Typography
              sx={{
                fontSize: 13.5,
                fontWeight: 700,
                textAlign: 'right',
                color: '#FFFFFF',
                mb: 1.25,
              }}
            >
              หมายเลขอ้างอิง : {mockRefCode}
            </Typography>

            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: 700,
                textAlign: 'center',
                color: '#FFFFFF',
                lineHeight: 1.65,
              }}
            >
              คิวอาร์โค้ดนี้เป็นสิ่งยืนยันตัวตนทางดิจิทัล ออกให้โดย
              <br />
              กรมการปกครอง กระทรวงมหาดไทย
            </Typography>

            <Typography
              sx={{
                fontSize: 11,
                textAlign: 'right',
                color: 'rgba(255, 255, 255, 0.72)',
                mt: 0.5,
              }}
            >
              v.1.5.2
            </Typography>
          </Box>
        </Box>

        <Stack useFlexGap spacing={1} sx={{ mt: 'auto' }}>
          <Button
            variant="contained"
            color="success"
            fullWidth
            startIcon={<CheckCircleIcon />}
            onClick={onCompleteThaid}
            sx={{ minHeight: 54, fontSize: 17.5, fontWeight: 800, borderRadius: '14px' }}
          >
            สแกนเสร็จแล้ว
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<ArrowBackIcon />}
            onClick={onBackToIntro}
            sx={{ minHeight: 48, fontSize: 15.5, borderWidth: 1.5, borderRadius: '14px' }}
          >
            ย้อนกลับ
          </Button>
        </Stack>
      </Stack>
    )
  }

  if (viewMode === 'manual') {
    return (
      <Stack
        component="form"
        onSubmit={onSubmitManual}
        noValidate
        useFlexGap
        sx={{ flex: 1 }}
        spacing={2}
      >
        <Box sx={{ textAlign: 'center', pt: 0.5 }}>
          <Box
            sx={(theme) => ({
              width: 60,
              height: 60,
              borderRadius: '16px',
              mx: 'auto',
              mb: 1.25,
              display: 'grid',
              placeItems: 'center',
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 242, 0, 0.14)'
                  : 'rgba(12, 47, 83, 0.08)',
              color: 'primary.main',
            })}
          >
            <PersonOutlineIcon sx={{ fontSize: 34 }} aria-hidden="true" />
          </Box>
          <Typography variant="h1" sx={{ fontSize: 22, fontWeight: 800, mb: 0.5 }}>
            กรอกชื่อ-นามสกุล
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13.5 }}>
            สำหรับผู้ที่ยังไม่มี ThaID ชื่อนี้จะแสดงบนใบเกียรติบัตรของคุณ
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: 'background.default',
            border: '1.5px solid',
            borderColor: 'divider',
            borderRadius: '18px',
            p: 2.25,
          }}
        >
          <TextField
            label="ชื่อ-นามสกุล"
            placeholder="เช่น สมชาย ใจดี"
            helperText="กรุณาเว้นวรรคระหว่างชื่อและนามสกุล"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            autoComplete="name"
            autoFocus
            required
            fullWidth
            slotProps={{
              htmlInput: {
                style: { fontSize: 18 },
              },
            }}
          />
          {nameError && (
            <Alert severity="warning" sx={{ mt: 1.5, borderRadius: '12px' }}>
              {nameError}
            </Alert>
          )}
        </Box>

        <Stack useFlexGap spacing={1.25} sx={{ mt: 'auto' }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            endIcon={<ArrowForwardIcon />}
            sx={{ minHeight: 56, fontSize: 17.5, fontWeight: 800, borderRadius: '14px' }}
          >
            ดำเนินการต่อ
          </Button>

          <Button
            type="button"
            variant="outlined"
            fullWidth
            startIcon={<ArrowBackIcon />}
            onClick={onBackToIntro}
            sx={{ minHeight: 50, fontSize: 15.5, borderWidth: 1.5, borderRadius: '14px' }}
          >
            กลับไปหน้า ThaID
          </Button>
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack useFlexGap sx={{ flex: 1 }} spacing={2}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', pt: 0.5 }}>
        <Typography variant="h1" sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.3 }}>
          ยืนยันตัวตนด้วย ThaID
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: 13.5 }}>
          {isCheckinMode
            ? 'เพื่อยืนยันสิทธิ์ Check-in และออกใบเกียรติบัตร'
            : 'เพื่อออกใบเกียรติบัตรด้วยชื่อ-นามสกุลของคุณ'}
        </Typography>
      </Box>

      {/* Hero Identity Card */}
      <Box
        sx={{
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          px: 2.5,
          py: 2.75,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          my: 'auto',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '18px',
            display: 'grid',
            placeItems: 'center',
            bgcolor: '#0C2F53',
            border: '2px solid #FFC600',
            color: '#FFF200',
          }}
        >
          <BadgeIcon sx={{ fontSize: 42 }} aria-hidden="true" />
        </Box>

        <Box>
          <Typography sx={{ fontSize: 16.5, fontWeight: 800, mb: 0.35 }}>
            ยืนยันตัวตนรวดเร็วผ่านแอป ThaID
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13.5 }}>
            ดึงชื่อ-นามสกุลถูกต้องลงบนใบเกียรติบัตรให้อัตโนมัติ
          </Typography>
        </Box>

        <Stack spacing={0.75} sx={{ width: '100%', textAlign: 'left', pt: 0.25 }}>
          {[
            'ไม่ต้องพิมพ์ชื่อ-นามสกุลด้วยตนเอง',
            'ปลอดภัย รองรับผู้ใช้งานทุกกลุ่ม',
          ].map((item) => (
            <Stack
              key={item}
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                color: 'text.primary',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '10px',
                px: 1.25,
                py: 0.75,
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'success.main', flexShrink: 0 }} />
              <Typography variant="body2" sx={{ fontSize: 13.5, fontWeight: 600 }}>
                {item}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Bottom Action Area */}
      <Stack useFlexGap spacing={1.25} sx={{ mt: 'auto' }}>
        <Button
          variant="contained"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          onClick={onOpenThaidMock}
          sx={{
            minHeight: 56,
            fontSize: 17.5,
            fontWeight: 800,
            borderRadius: '14px',
          }}
        >
          เข้าสู่ระบบด้วย ThaID
        </Button>

        <Divider>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
            หรือ
          </Typography>
        </Divider>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<EditNoteIcon />}
          onClick={onOpenManual}
          sx={{
            minHeight: 50,
            fontSize: 15.5,
            fontWeight: 700,
            borderWidth: 1.5,
            borderRadius: '14px',
            borderColor: 'divider',
            color: 'text.primary',
            bgcolor: 'background.default',
            '&:hover': {
              borderWidth: 1.5,
              borderColor: 'primary.main',
            },
          }}
        >
          ยังไม่มี ThaID · กรอกชื่อ-นามสกุลแทน
        </Button>
      </Stack>
    </Stack>
  )
}
