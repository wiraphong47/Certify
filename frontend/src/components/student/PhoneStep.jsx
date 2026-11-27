import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import GraphicEqIcon from '@mui/icons-material/GraphicEq'
import MicIcon from '@mui/icons-material/Mic'
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import { Box, Button, Divider, Stack, TextField, Typography } from '@mui/material'
import { formatPhone } from '../../utils/formatters'

export default function PhoneStep({
  typedPhone,
  statusMsg,
  listening,
  onTypedPhoneChange,
  onListenPhone,
  onSimulatePhoneSpeech,
  onSubmitTypedPhone,
}) {
  const digitsCount = typedPhone.length
  const isComplete = digitsCount === 10

  const handleFormSubmit = (e) => {
    e.preventDefault()
    onSubmitTypedPhone()
  }

  return (
    <Stack useFlexGap spacing={1.75} sx={{ flex: 1 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontSize: 21, fontWeight: 800, lineHeight: 1.25 }}>
          บอกเบอร์โทรศัพท์รับเน็ตฟรี
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, fontSize: 13.5 }}>
          แตะปุ่มไมค์เพื่อพูดเบอร์ 10 หลัก หรือพิมพ์เบอร์ด้านล่าง
        </Typography>
      </Box>

      {/* Clean Flat Voice Card */}
      <Box
        sx={{
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: listening ? 'success.main' : 'divider',
          borderRadius: '14px',
          p: 2,
          textAlign: 'center',
        }}
      >
        <Button
          variant="contained"
          fullWidth
          onClick={onListenPhone}
          aria-label="แตะปุ่มไมค์ เพื่อพูดเบอร์มือถือ"
          sx={(theme) => ({
            minHeight: 108,
            borderRadius: '12px',
            fontSize: 18,
            fontWeight: 800,
            flexDirection: 'column',
            gap: 1,
            bgcolor: listening ? 'success.main' : 'primary.main',
            color: listening
              ? theme.palette.success.contrastText
              : theme.palette.primary.contrastText,
          })}
        >
          <Box
            sx={(theme) => ({
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor:
                !listening && theme.palette.mode === 'dark'
                  ? 'rgba(12, 47, 83, 0.14)'
                  : 'rgba(255, 255, 255, 0.18)',
              display: 'grid',
              placeItems: 'center',
            })}
          >
            {listening ? <GraphicEqIcon sx={{ fontSize: 28 }} /> : <MicIcon sx={{ fontSize: 28 }} />}
          </Box>
          {listening ? 'กำลังฟัง... แตะอีกครั้งเพื่อหยุด' : 'แตะเพื่อพูดเบอร์มือถือ'}
        </Button>

        <Typography
          role="status"
          aria-live="polite"
          variant="caption"
          color={listening ? 'success.main' : 'text.secondary'}
          sx={{
            display: 'block',
            mt: 1.25,
            minHeight: 20,
            fontSize: 13,
            fontWeight: listening ? 700 : 500,
          }}
        >
          {statusMsg || 'พูดเลขทีละตัว เช่น ศูนย์ แปด หนึ่ง สอง สาม สี่...'}
        </Typography>
      </Box>

      <Divider sx={{ my: -0.25 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
          หรือพิมพ์เบอร์มือถือ
        </Typography>
      </Divider>

      {/* Typed Phone Form */}
      <Stack component="form" onSubmit={handleFormSubmit} noValidate spacing={1.25}>
        <TextField
          label="เบอร์มือถือ 10 หลัก"
          placeholder="0812345678"
          value={typedPhone}
          onChange={(e) => onTypedPhoneChange(e.target.value)}
          helperText={
            digitsCount > 0
              ? `รูปแบบ: ${formatPhone(typedPhone)} (${digitsCount}/10 หลัก)`
              : 'กรอกตัวเลข 10 หลัก เริ่มต้นด้วย 0'
          }
          slotProps={{
            htmlInput: {
              inputMode: 'tel',
              maxLength: 10,
              style: { fontSize: 20, fontWeight: 700, letterSpacing: 1.5 },
            },
          }}
          fullWidth
        />

        <Button
          type="submit"
          variant={isComplete ? 'contained' : 'outlined'}
          fullWidth
          disabled={!isComplete}
          endIcon={<ArrowForwardIcon />}
          sx={{
            minHeight: 50,
            fontSize: 16,
            fontWeight: 800,
            borderRadius: '12px',
            borderWidth: 1.5,
          }}
        >
          {isComplete ? 'ใช้เบอร์นี้ดำเนินการต่อ' : `กรอกให้ครบ 10 หลัก (${digitsCount}/10)`}
        </Button>
      </Stack>

      {/* Subtle Demo Utility Strip */}
      <Stack
        sx={{
          mt: 'auto',
          pt: 0.75,
          borderTop: '1px dashed',
          borderColor: 'divider',
          alignItems: 'center',
        }}
      >
        <Button
          variant="text"
          size="small"
          startIcon={<RecordVoiceOverIcon fontSize="small" />}
          onClick={onSimulatePhoneSpeech}
          sx={{ fontSize: 13, py: 0.25, borderRadius: '8px' }}
        >
          ทดลองจำลองการพูดเบอร์ (081-234-5678)
        </Button>
      </Stack>
    </Stack>
  )
}
