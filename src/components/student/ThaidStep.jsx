import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import BadgeIcon from '@mui/icons-material/Badge'
import EditNoteIcon from '@mui/icons-material/EditNote'
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material'

export default function ThaidStep({
  isCheckinMode,
  manualMode,
  fullName,
  nameError,
  onConfirmThaid,
  onOpenManual,
  onCloseManual,
  onFullNameChange,
  onSubmitManual,
}) {
  if (manualMode) {
    return (
      <Stack component="form" onSubmit={onSubmitManual} noValidate sx={{ flex: 1 }} spacing={2}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: 24, mb: 0.5 }}>
            กรอกชื่อ-นามสกุล
          </Typography>
          <Typography variant="body2" color="text.secondary">
            สำหรับผู้ที่ยังไม่มี ThaID ชื่อนี้จะแสดงบนใบเกียรติบัตรของคุณ
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: 'background.default',
            border: '2px solid',
            borderColor: 'divider',
            borderRadius: 4,
            p: 2.25,
          }}
        >
          <TextField
            label="ชื่อ-นามสกุล"
            placeholder="เช่น สมชาย ใจดี"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            autoComplete="name"
            autoFocus
            required
            fullWidth
            slotProps={{
              htmlInput: {
                style: { fontSize: 19 },
              },
            }}
          />
          {nameError && (
            <Alert severity="warning" sx={{ mt: 1.5 }}>
              {nameError}
            </Alert>
          )}
        </Box>

        <Stack spacing={1.25} sx={{ mt: 'auto' }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            endIcon={<ArrowForwardIcon />}
            sx={{ py: 1.8, fontSize: 19, borderRadius: 3.5 }}
          >
            ดำเนินการต่อ
          </Button>

          <Button
            type="button"
            variant="outlined"
            fullWidth
            startIcon={<ArrowBackIcon />}
            onClick={onCloseManual}
            sx={{ py: 1.4, fontSize: 17, borderWidth: 2, borderRadius: 3.5 }}
          >
            กลับไปหน้า ThaID
          </Button>
        </Stack>
      </Stack>
    )
  }

  return (
    <Stack sx={{ flex: 1 }} spacing={2}>
      <Typography variant="h1" sx={{ fontSize: 24 }}>
        ยืนยันตัวตนด้วย ThaID
      </Typography>

      <Box
        sx={{
          bgcolor: 'background.default',
          border: '2px solid',
          borderColor: 'divider',
          borderRadius: 5,
          py: 4,
          px: 2.5,
          textAlign: 'center',
          my: 1,
        }}
      >
        <BadgeIcon sx={{ fontSize: 96, color: 'primary.main', mb: 1 }} aria-hidden="true" />
        <Typography sx={{ fontSize: 17 }}>
          เข้าสู่ระบบด้วย ThaID
          <br />
          {isCheckinMode ? 'ก่อน Check-in และรับใบเกียรติบัตร' : 'ก่อนรับใบเกียรติบัตร'}
        </Typography>
      </Box>

      <Box sx={{ mt: 'auto' }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onConfirmThaid}
          sx={{ py: 1.8, fontSize: 19, borderRadius: 3.5 }}
        >
          เข้าสู่ระบบด้วย ThaID
        </Button>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<EditNoteIcon />}
          onClick={onOpenManual}
          sx={{ mt: 1.25, py: 1.4, fontSize: 17, borderWidth: 2, borderRadius: 3.5 }}
        >
          ยังไม่มี ThaID
        </Button>
      </Box>
    </Stack>
  )
}
