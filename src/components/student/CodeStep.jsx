import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import GraphicEqIcon from '@mui/icons-material/GraphicEq'
import LockClockIcon from '@mui/icons-material/LockClock'
import MicIcon from '@mui/icons-material/Mic'
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import { Alert, Box, Button, Chip, Divider, Stack, Typography } from '@mui/material'

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
  if (remainSec > 0 && course) {
    return (
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Box sx={{ textAlign: 'center', pt: 0.5 }}>
          <Typography variant="h1" sx={{ fontSize: 22, fontWeight: 800 }}>
            ยังไม่ถึงเวลา Check-out
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            กรุณารอให้ครบเวลาเรียนก่อนรับใบเกียรติบัตร
          </Typography>
        </Box>

        <Box
          sx={{
            border: '2px solid',
            borderColor: 'primary.main',
            bgcolor: 'background.default',
            borderRadius: '18px',
            p: 2.5,
            textAlign: 'center',
          }}
        >
          <Chip
            icon={<CheckCircleIcon />}
            label="Check-in เริ่มเรียนแล้ว"
            color="success"
            size="small"
            sx={{ mb: 1.25 }}
          />
          <Typography variant="h3" sx={{ mb: 1.5, fontSize: 17 }}>
            {course.name}
          </Typography>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ justifyContent: 'center', alignItems: 'center', color: 'text.secondary' }}
          >
            <LockClockIcon fontSize="small" />
            <Typography variant="body2">เปิดให้กรอกรหัส Check-out ในอีก</Typography>
          </Stack>
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
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {remainText}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            เปิดให้กรอกเวลา {unlockTimeText} น. (รอครบ {course.outWait} นาทีหลัง Check-in)
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ mt: 'auto' }}>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={onUnlockWaitDemo}
            sx={{ py: 1.3, borderRadius: '12px', color: '#0C2F53', fontWeight: 800 }}
          >
            ทดลอง: จำลองว่าครบเวลารอแล้ว
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={onGoHome}
            sx={{ py: 1.2, borderWidth: 1.5, borderRadius: '12px' }}
          >
            กลับหน้าหลัก
          </Button>
        </Stack>
      </Stack>
    )
  }

  const hasDigits = code.length > 0

  return (
    <Stack spacing={1.5} sx={{ flex: 1 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center' }}>
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}
        >
          <Typography variant="h1" sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.25 }}>
            {isCiStep ? 'ใส่รหัส Check-in 4 หลัก' : 'ใส่รหัสหลักสูตร 4 หลัก'}
          </Typography>
          {ciDoneBadge && <Chip label="✓ Check-in แล้ว" color="success" size="small" />}
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13.5 }}>
          {isCiStep
            ? `ตอนเริ่มเรียน · ${course?.name || ''}`
            : isCheckinMode
              ? 'กรอกรหัสตอนจบเรียนเพื่อรับใบเกียรติบัตร'
              : 'พูดหรือกดรหัส 4 หลักจากผู้ดูแลหลักสูตร'}
        </Typography>
      </Box>

      {needCiWarn && (
        <Alert
          severity="warning"
          action={
            <Button size="small" color="secondary" variant="contained" onClick={onGoCheckinStep}>
              ไป Check-in
            </Button>
          }
          sx={{ py: 0.5, borderRadius: '12px' }}
        >
          ยังไม่ได้ Check-in ตอนเริ่มเรียน
        </Alert>
      )}

      {/* Primary Focal Point: 4-Digit Code Slots */}
      <Box>
        <Stack direction="row" spacing={1.25} sx={{ justifyContent: 'center' }}>
          {PIN_SLOTS.map((idx) => {
            const digit = code[idx] || ''
            const isFilled = idx < code.length
            const isCurrent = idx === code.length
            return (
              <Box
                key={idx}
                aria-label={`หลักที่ ${idx + 1} ${digit ? `เลข ${digit}` : 'ว่าง'}`}
                sx={(theme) => ({
                  width: 64,
                  height: 68,
                  borderRadius: '14px',
                  border: '2px solid',
                  borderColor: errorText
                    ? 'error.main'
                    : isFilled
                      ? 'primary.main'
                      : isCurrent
                        ? theme.palette.certify.sun2
                        : 'divider',
                  bgcolor: isFilled
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(74, 120, 168, 0.22)'
                      : 'rgba(12, 47, 83, 0.06)'
                    : 'background.default',
                  boxShadow:
                    isCurrent && !errorText
                      ? `0 0 0 3px ${theme.palette.mode === 'dark' ? 'rgba(255, 198, 0, 0.22)' : 'rgba(255, 198, 0, 0.35)'}`
                      : 'none',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 30,
                  fontWeight: 800,
                  color: 'text.primary',
                  fontVariantNumeric: 'tabular-nums',
                  transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s',
                })}
              >
                {digit}
              </Box>
            )
          })}
        </Stack>

        {/* Unified Error / Voice Status Feedback */}
        <Box sx={{ minHeight: 24, mt: 0.75, textAlign: 'center' }}>
          {errorText ? (
            <Typography
              role="alert"
              sx={{ color: 'warning.main', fontWeight: 700, fontSize: 13.5 }}
            >
              {errorText}
            </Typography>
          ) : statusMsg ? (
            <Typography
              role="status"
              aria-live="polite"
              variant="caption"
              color={listening ? 'success.main' : 'text.secondary'}
              sx={{ fontWeight: listening ? 700 : 500, fontSize: 13 }}
            >
              {statusMsg}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12.5 }}>
              กรอกครบ 4 หลัก ระบบจะตรวจสอบให้อัตโนมัติ
            </Typography>
          )}
        </Box>
      </Box>

      {/* Compact, High-Contrast Voice Action Button */}
      <Button
        variant="contained"
        fullWidth
        onClick={onListenCode}
        aria-label="แตะเพื่อพูดรหัสสี่หลัก"
        sx={(theme) => ({
          minHeight: 56,
          px: 2,
          borderRadius: '14px',
          bgcolor: listening ? 'success.main' : 'primary.main',
          color: listening ? theme.palette.success.contrastText : '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.25,
          fontSize: 17,
          fontWeight: 800,
          boxShadow: listening
            ? `0 0 0 4px ${theme.palette.mode === 'dark' ? 'rgba(94, 212, 160, 0.25)' : 'rgba(18, 114, 74, 0.2)'}`
            : 'none',
          transition: 'background-color 0.15s, box-shadow 0.15s',
        })}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          {listening ? <GraphicEqIcon fontSize="small" /> : <MicIcon fontSize="small" />}
        </Box>
        {listening ? 'กำลังฟัง... แตะอีกครั้งเพื่อหยุด' : 'แตะเพื่อพูดรหัส 4 หลัก'}
      </Button>

      <Divider sx={{ my: -0.25 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>
          หรือกดตัวเลข
        </Typography>
      </Divider>

      {/* Tactile 3x4 Numpad */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
        }}
      >
        {NUMPAD_TOP.map((num) => (
          <Button
            key={num}
            variant="outlined"
            aria-label={`เลข ${num}`}
            onClick={() => onDigitPress(String(num))}
            sx={{
              minHeight: 54,
              py: 0.75,
              fontSize: 24,
              fontWeight: 700,
              borderRadius: '14px',
              borderWidth: 1.5,
              borderColor: 'divider',
              color: 'text.primary',
              bgcolor: 'background.default',
              fontVariantNumeric: 'tabular-nums',
              '&:hover': {
                borderWidth: 1.5,
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
              '&:active': {
                transform: 'scale(0.97)',
              },
            }}
          >
            {num}
          </Button>
        ))}

        <Button
          variant="text"
          aria-label="ล้างทั้งหมด"
          disabled={!hasDigits}
          onClick={onClearCode}
          sx={{
            minHeight: 54,
            borderRadius: '14px',
            fontSize: 15,
            fontWeight: 700,
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
          }}
        >
          ล้าง
        </Button>

        <Button
          variant="outlined"
          aria-label="เลข 0"
          onClick={() => onDigitPress('0')}
          sx={{
            minHeight: 54,
            py: 0.75,
            fontSize: 24,
            fontWeight: 700,
            borderRadius: '14px',
            borderWidth: 1.5,
            borderColor: 'divider',
            color: 'text.primary',
            bgcolor: 'background.default',
            fontVariantNumeric: 'tabular-nums',
            '&:hover': {
              borderWidth: 1.5,
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
            '&:active': {
              transform: 'scale(0.97)',
            },
          }}
        >
          0
        </Button>

        <Button
          variant="text"
          aria-label="ลบตัวเลขล่าสุด"
          disabled={!hasDigits}
          onClick={onBackspaceCode}
          sx={{
            minHeight: 54,
            borderRadius: '14px',
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
          }}
        >
          <BackspaceOutlinedIcon />
        </Button>
      </Box>

      {/* Subtle Demo Utility Strip */}
      <Stack
        spacing={0.5}
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
          onClick={onSimulateSampleSpeech}
          sx={{ fontSize: 13, py: 0.25, borderRadius: '10px' }}
        >
          ทดลองจำลองการพูดรหัส ({sampleCode})
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontSize: 11.5 }}>
          รหัสทดลอง — แจกเน็ต: <b>4827</b> · ไม่แจกเน็ต: <b>7302</b> · บุคคลทั่วไป: <b>1501</b> →{' '}
          <b>1593</b>
        </Typography>
      </Stack>
    </Stack>
  )
}
