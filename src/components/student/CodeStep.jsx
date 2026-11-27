import BackspaceIcon from '@mui/icons-material/Backspace'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import MicIcon from '@mui/icons-material/Mic'
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material'

const NUMPAD_TOP = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const PIN_SLOTS = [0, 1, 2, 3]

export default function CodeStep({
  isCiStep,
  course,
  isCheckinMode,
  remainSec,
  remainText,
  unlockTimeText,
  sampleCode,
  needCiWarn,
  ciDoneBadge,
  code,
  errorText,
  statusMsg,
  listening,
  onListenCode,
  onDigitPress,
  onClearCode,
  onBackspaceCode,
  onSimulateSampleSpeech,
  onUnlockWaitDemo,
  onGoCheckinStep,
  onGoHome,
}) {
  return remainSec > 0 && course ? (
    <Stack spacing={2} sx={{ flex: 1 }}>
      <Typography variant="h1" sx={{ fontSize: 24 }}>
        ยังไม่ถึงเวลา Check-out
      </Typography>

      <Box
        sx={{
          border: '3px double',
          borderColor: 'primary.main',
          borderRadius: 3,
          p: 2.5,
          textAlign: 'center',
        }}
      >
        <Chip
          icon={<CheckCircleIcon />}
          label="Check-in เริ่มเรียนแล้ว"
          color="success"
          size="small"
          sx={{ mb: 1 }}
        />
        <Typography variant="h3" sx={{ mb: 1 }}>
          {course.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          จะเปิดให้กรอกรหัส Check-out ในอีก
        </Typography>
        <Typography
          role="timer"
          aria-live="off"
          sx={{
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: 2,
            color: 'primary.main',
            lineHeight: 1.2,
            my: 1,
          }}
        >
          {remainText}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          เปิดให้กรอกเวลา {unlockTimeText} น. (รอครบ {course.outWait} นาทีหลัง Check-in)
        </Typography>
      </Box>

      <Button
        variant="outlined"
        fullWidth
        onClick={onUnlockWaitDemo}
        sx={{ borderWidth: 2, borderRadius: 3 }}
      >
        ทดลอง: จำลองว่าครบเวลารอแล้ว
      </Button>
      <Button
        variant="outlined"
        fullWidth
        onClick={onGoHome}
        sx={{ borderWidth: 2, borderRadius: 3 }}
      >
        กลับหน้าหลัก
      </Button>
    </Stack>
  ) : (
    <Stack spacing={1} sx={{ flex: 1 }}>
      <Typography variant="h1" sx={{ fontSize: 23 }}>
        {isCiStep ? 'ใส่รหัส Check-in 4 หลัก' : 'ใส่รหัส 4 หลัก'}
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {isCiStep
          ? `ตอนเริ่มเรียน · ${course?.name || ''}`
          : isCheckinMode
            ? 'ตอนจบเรียน (เพื่อรับใบเกียรติบัตร)'
            : 'ผู้พิการ · สแกน Check-out เพื่อรับใบเกียรติบัตรเลย'}{' '}
        {ciDoneBadge && <Chip label="✓ Check-in แล้ว" color="success" size="small" />}
      </Typography>

      {needCiWarn && (
        <Alert
          severity="warning"
          action={
            <Button size="small" color="secondary" variant="contained" onClick={onGoCheckinStep}>
              ไป Check-in ก่อน
            </Button>
          }
          sx={{ py: 0.5 }}
        >
          ยังไม่ได้ Check-in ตอนเริ่มเรียน
        </Alert>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={onListenCode}
        aria-label="แตะเพื่อพูดรหัสสี่หลัก"
        sx={{
          minHeight: 88,
          borderRadius: 4,
          fontSize: 20,
          fontWeight: 800,
          flexDirection: 'column',
          gap: 0.25,
          bgcolor: listening ? 'success.main' : 'primary.main',
        }}
      >
        <MicIcon sx={{ fontSize: 32 }} />
        {listening ? 'กำลังฟัง พูดตัวเลขได้เลย...' : 'แตะเพื่อพูดรหัส'}
      </Button>

      <Typography
        role="status"
        aria-live="polite"
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'center', minHeight: 20 }}
      >
        {statusMsg || 'หรือกดปุ่มตัวเลขด้านล่าง'}
      </Typography>

      <Stack direction="row" spacing={1.25} sx={{ justifyContent: 'center', my: 0.75 }}>
        {PIN_SLOTS.map((idx) => (
          <Box
            key={idx}
            sx={(theme) => ({
              width: 60,
              height: 70,
              border: '3px solid',
              borderColor:
                idx < code.length
                  ? 'primary.main'
                  : idx === code.length
                    ? theme.palette.certify.sun2
                    : 'divider',
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              fontSize: 32,
              fontWeight: 800,
            })}
          >
            {idx < code.length ? '●' : ''}
          </Box>
        ))}
      </Stack>

      <Typography
        role="alert"
        sx={{
          color: 'warning.main',
          fontWeight: 700,
          textAlign: 'center',
          fontSize: 14.5,
          minHeight: 22,
        }}
      >
        {errorText}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          my: 0.5,
        }}
      >
        {NUMPAD_TOP.map((num) => (
          <Button
            key={num}
            variant="outlined"
            aria-label={`เลข ${num}`}
            onClick={() => onDigitPress(String(num))}
            sx={{
              py: 1.25,
              fontSize: 23,
              fontWeight: 700,
              borderWidth: 2,
              borderColor: 'divider',
              color: 'text.primary',
              bgcolor: 'background.default',
              borderRadius: 3,
            }}
          >
            {num}
          </Button>
        ))}

        <Button
          variant="outlined"
          aria-label="ล้าง"
          onClick={onClearCode}
          sx={{
            py: 1.25,
            fontSize: 15,
            fontWeight: 700,
            borderWidth: 2,
            borderColor: 'divider',
            color: 'text.primary',
            bgcolor: 'background.default',
            borderRadius: 3,
          }}
        >
          ล้าง
        </Button>

        <Button
          variant="outlined"
          aria-label="เลข 0"
          onClick={() => onDigitPress('0')}
          sx={{
            py: 1.25,
            fontSize: 23,
            fontWeight: 700,
            borderWidth: 2,
            borderColor: 'divider',
            color: 'text.primary',
            bgcolor: 'background.default',
            borderRadius: 3,
          }}
        >
          0
        </Button>

        <Button
          variant="outlined"
          aria-label="ลบ"
          onClick={onBackspaceCode}
          sx={{
            py: 1.25,
            borderWidth: 2,
            borderColor: 'divider',
            color: 'text.primary',
            bgcolor: 'background.default',
            borderRadius: 3,
          }}
        >
          <BackspaceIcon />
        </Button>
      </Box>

      <Button
        variant="outlined"
        size="small"
        fullWidth
        onClick={onSimulateSampleSpeech}
        sx={{ borderWidth: 2, borderRadius: 3 }}
      >
        ทดลอง: จำลองการพูดรหัส ({sampleCode})
      </Button>

      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', pt: 0.25 }}>
        แจกเน็ต: <b>4827</b> · ไม่แจกเน็ต: <b>7302</b> · บุคคลทั่วไป: เข้า <b>1501</b> → ออก{' '}
        <b>1593</b>
      </Typography>
    </Stack>
  )
}
