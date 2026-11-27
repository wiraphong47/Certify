import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import { Box, Button, IconButton, Paper, Stack } from '@mui/material'

export default function StudentShell({
  steps,
  stepIndex,
  onJump,
  autoVoice,
  onToggleVoice,
  children,
}) {
  return (
    <Box>
      <Stack
        direction="row"
        spacing={0.75}
        useFlexGap
        aria-label="ข้ามไปขั้นตอน"
        sx={{ mb: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}
      >
        {steps.map((st, idx) => (
          <Button
            key={st.id}
            size="small"
            variant={idx === stepIndex ? 'contained' : 'outlined'}
            onClick={() => onJump(idx)}
            sx={{
              borderRadius: 5,
              py: 0.4,
              px: 1.5,
              fontSize: 13.5,
              borderWidth: 2,
              borderColor: idx === stepIndex ? 'primary.main' : 'divider',
              bgcolor: idx === stepIndex ? 'primary.main' : 'background.paper',
              color: idx === stepIndex ? '#fff' : 'text.primary',
            }}
          >
            {idx + 1}. {st.label}
          </Button>
        ))}
      </Stack>

      <Paper
        elevation={0}
        sx={{
          maxWidth: 410,
          mx: 'auto',
          border: '2px solid',
          borderColor: 'divider',
          borderRadius: 7,
          p: 2.5,
          minHeight: 650,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.25,
            position: 'relative',
            zIndex: 3,
          }}
        >
          <Box sx={{ fontWeight: 800, fontSize: 20 }}>
            <Box
              component="span"
              sx={(theme) => ({
                bgcolor: theme.palette.certify.sun,
                color: '#0C2F53',
                px: 1,
                borderRadius: 1.2,
              })}
            >
              Certify
            </Box>
          </Box>

          <IconButton
            onClick={onToggleVoice}
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
              width: 48,
              height: 48,
              border: '2px solid',
              borderColor: 'primary.main',
              bgcolor: 'background.default',
              color: 'text.primary',
              opacity: autoVoice ? 1 : 0.7,
            }}
          >
            {autoVoice ? <VolumeUpIcon /> : <VolumeOffIcon />}
          </IconButton>
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ mb: 2, position: 'relative', zIndex: 3 }}
          aria-hidden="true"
        >
          {steps.map((st, idx) => (
            <Box
              key={st.id}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 2,
                bgcolor: idx <= stepIndex ? 'primary.main' : 'divider',
                transition: 'background-color 0.2s',
              }}
            />
          ))}
        </Stack>

        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>{children}</Box>
      </Paper>
    </Box>
  )
}
