import MicIcon from '@mui/icons-material/Mic'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'

export default function PhoneStep({
  typedPhone,
  statusMsg,
  listening,
  onTypedPhoneChange,
  onListenPhone,
  onSimulatePhoneSpeech,
  onSubmitTypedPhone,
}) {
  return (
    <Stack spacing={1.5} sx={{ flex: 1 }}>
      <Typography variant="h1" sx={{ fontSize: 24 }}>
        บอกเบอร์โทรศัพท์
      </Typography>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Button
          variant="contained"
          fullWidth
          onClick={onListenPhone}
          aria-label="แตะปุ่มไมค์ตรงกลางหน้าจอ เพื่อพูดเบอร์มือถือ"
          sx={{
            minHeight: 190,
            borderRadius: 5,
            fontSize: 24,
            fontWeight: 800,
            flexDirection: 'column',
            gap: 1,
            bgcolor: listening ? 'success.main' : 'primary.main',
          }}
        >
          <MicIcon sx={{ fontSize: 54 }} />
          {listening ? 'กำลังฟัง... แตะอีกครั้งเพื่อหยุด' : 'แตะเพื่อพูดเบอร์มือถือ'}
        </Button>
      </Box>

      <Typography
        role="status"
        aria-live="polite"
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'center' }}
      >
        {statusMsg || 'พูดเลขทีละตัว เช่น ศูนย์ แปด หนึ่ง'}
      </Typography>

      <Button
        variant="outlined"
        fullWidth
        onClick={onSimulatePhoneSpeech}
        sx={{ borderWidth: 2, borderRadius: 3 }}
      >
        ทดลอง: จำลองการพูดเบอร์
      </Button>

      <TextField
        label="หรือพิมพ์เบอร์มือถือ 10 หลัก"
        placeholder="0812345678"
        value={typedPhone}
        onChange={(e) => onTypedPhoneChange(e.target.value)}
        slotProps={{ htmlInput: { inputMode: 'tel', maxLength: 10 } }}
        fullWidth
      />

      <Button
        variant="outlined"
        fullWidth
        onClick={onSubmitTypedPhone}
        sx={{ borderWidth: 2, borderRadius: 3 }}
      >
        ใช้เบอร์ที่พิมพ์
      </Button>
    </Stack>
  )
}
