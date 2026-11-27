import BadgeIcon from '@mui/icons-material/Badge'
import CheckIcon from '@mui/icons-material/Check'
import DialpadIcon from '@mui/icons-material/Dialpad'
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'

const STEP_META = {
  scan: { title: 'สแกน QR เข้าสู่ระบบ', Icon: QrCodeScannerIcon },
  thaid: { title: 'ยืนยันตัวตน ThaID', Icon: BadgeIcon },
  checkin: { title: 'กรอกรหัส Check-in', Icon: DialpadIcon },
  checkout: { title: 'กรอกรหัสหลักสูตร', Icon: DialpadIcon },
  phone: { title: 'รับสิทธิ์อินเทอร์เน็ตฟรี', Icon: PhoneIphoneIcon },
  cert: { title: 'รับใบเกียรติบัตร', Icon: WorkspacePremiumIcon },
}

export default function StudentShell({
  steps,
  stepIndex,
  onJump,
  autoVoice,
  onToggleVoice,
  children,
}) {
  const currentStep = steps[stepIndex]
  const meta = STEP_META[currentStep?.id] || {
    title: currentStep?.label || 'Certify',
    Icon: WorkspacePremiumIcon,
  }
  const StepIcon = meta.Icon

  return (
    <Box>
      <Stack
        direction="row"
        spacing={0.65}
        useFlexGap
        aria-label="ข้ามไปขั้นตอน"
        sx={{ mb: 1.75, justifyContent: 'center', flexWrap: 'wrap' }}
      >
        {steps.map((st, idx) => {
          const isCurrent = idx === stepIndex
          const isDone = idx < stepIndex
          return (
            <Button
              key={st.id}
              size="small"
              variant={isCurrent ? 'contained' : 'outlined'}
              onClick={() => onJump(idx)}
              startIcon={
                isDone ? <CheckIcon sx={{ fontSize: '14px !important', mr: -0.25 }} /> : undefined
              }
              sx={(theme) => ({
                borderRadius: '99px',
                py: 0.4,
                px: 1.35,
                minWidth: 0,
                fontSize: 13,
                fontWeight: isCurrent ? 800 : 600,
                borderWidth: 1,
                borderColor: isCurrent
                  ? theme.palette.mode === 'dark'
                    ? '#FFF200'
                    : '#0C2F53'
                  : isDone
                    ? '#FFC600'
                    : 'divider',
                bgcolor: isCurrent
                  ? theme.palette.mode === 'dark'
                    ? '#FFF200'
                    : '#0C2F53'
                  : isDone
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(255, 198, 0, 0.14)'
                      : 'rgba(255, 242, 0, 0.22)'
                    : 'background.paper',
                color: isCurrent
                  ? theme.palette.mode === 'dark'
                    ? '#0C2F53'
                    : '#FFFFFF'
                  : isDone
                    ? theme.palette.mode === 'dark'
                      ? '#FFF200'
                      : '#0C2F53'
                    : 'text.secondary',
                '&:hover': {
                  borderWidth: 1,
                  borderColor: theme.palette.mode === 'dark' ? '#FFC600' : '#0C2F53',
                  bgcolor: isCurrent
                    ? theme.palette.mode === 'dark'
                      ? '#FFC600'
                      : '#08203A'
                    : theme.palette.certify.hoverTint,
                },
              })}
            >
              {idx + 1}. {st.label}
            </Button>
          )
        })}
      </Stack>

      <Paper
        elevation={0}
        sx={{
          maxWidth: 420,
          mx: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '20px',
          minHeight: { xs: 600, sm: 640 },
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {/* Flat Navy Step Header */}
        <Box
          sx={{
            bgcolor: '#0C2F53',
            color: '#FFFFFF',
            px: { xs: 2, sm: 2.5 },
            pt: 1.6,
            pb: 1.35,
            borderBottom: '3px solid #FFF200',
            position: 'relative',
            zIndex: 3,
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.25,
            }}
          >
            <Stack direction="row" spacing={1.1} sx={{ alignItems: 'center', minWidth: 0 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  bgcolor: 'rgba(255, 242, 0, 0.14)',
                  color: '#FFF200',
                }}
              >
                <StepIcon sx={{ fontSize: 21 }} aria-hidden="true" />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: '#FFC600',
                    lineHeight: 1.2,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  ขั้นตอนที่ {stepIndex + 1} จาก {steps.length}
                </Typography>
                <Typography
                  noWrap
                  sx={{
                    fontSize: 15.5,
                    fontWeight: 800,
                    color: '#FFFFFF',
                    lineHeight: 1.25,
                  }}
                >
                  {meta.title}
                </Typography>
              </Box>
            </Stack>

            <Button
              size="small"
              onClick={onToggleVoice}
              startIcon={
                autoVoice ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />
              }
              aria-label={
                autoVoice
                  ? 'เสียงอ่านอัตโนมัติ: เปิด แตะเพื่อปิด'
                  : 'เสียงอ่านอัตโนมัติ: ปิด แตะเพื่อเปิด'
              }
              aria-pressed={autoVoice}
              title={
                autoVoice
                  ? 'เสียงอ่านอัตโนมัติ: เปิด แตะเพื่อปิด'
                  : 'เสียงอ่านอัตโนมัติ: ปิด แตะเพื่อเปิด'
              }
              sx={{
                minHeight: 36,
                px: 1.25,
                flexShrink: 0,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: autoVoice ? '#FFF200' : 'rgba(255, 255, 255, 0.28)',
                bgcolor: autoVoice ? '#FFF200' : 'transparent',
                color: autoVoice ? '#0C2F53' : '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 800,
                '&:hover': {
                  bgcolor: autoVoice ? '#FFC600' : 'rgba(255, 255, 255, 0.10)',
                  borderColor: '#FFC600',
                },
              }}
            >
              {autoVoice ? 'เสียงเปิด' : 'เสียงปิด'}
            </Button>
          </Stack>

          {/* Clean Flat Segmented Progress Bar */}
          <Stack direction="row" spacing={0.6} aria-hidden="true">
            {steps.map((st, idx) => {
              const isCurrent = idx === stepIndex
              const isDone = idx < stepIndex
              return (
                <Box
                  key={st.id}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: '99px',
                    bgcolor: isCurrent
                      ? '#FFF200'
                      : isDone
                        ? '#FFC600'
                        : 'rgba(255, 255, 255, 0.22)',
                    transition: 'background-color 0.2s ease',
                  }}
                />
              )
            })}
          </Stack>
        </Box>

        <Box
          key={currentStep?.id || stepIndex}
          className="certify-step-enter"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            p: { xs: 2, sm: 2.5 },
            animation: 'stepFadeIn 0.18s ease-out',
          }}
        >
          {children}
        </Box>
      </Paper>
    </Box>
  )
}
