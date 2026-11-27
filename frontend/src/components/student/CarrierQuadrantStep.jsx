import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Box, Stack, Typography } from '@mui/material'
import { CARRIER_LIST, CARRIER_SPEECH } from '../../utils/thaiSpeech'

const QUAD_STYLES = [
  {
    base: 'rgba(120, 190, 32, 0.30)',
    active: 'rgba(120, 190, 32, 0.82)',
    pt: '96px',
    pb: '12px',
    borderRight: '1px solid rgba(255,255,255,0.22)',
    borderBottom: '1px solid rgba(255,255,255,0.22)',
  },
  {
    base: 'rgba(230, 50, 50, 0.28)',
    active: 'rgba(230, 50, 50, 0.80)',
    pt: '96px',
    pb: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.22)',
  },
  {
    base: 'rgba(0, 160, 220, 0.28)',
    active: 'rgba(0, 160, 220, 0.80)',
    pt: '12px',
    pb: '32px',
    borderRight: '1px solid rgba(255,255,255,0.22)',
  },
  {
    base: 'rgba(150, 120, 220, 0.28)',
    active: 'rgba(150, 120, 220, 0.80)',
    pt: '12px',
    pb: '32px',
  },
]

export default function CarrierQuadrantStep({
  phone,
  carrier,
  statusMsg,
  onPickCarrier,
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        flex: 1,
        mx: { xs: -2, sm: -2.5 },
        my: { xs: -2, sm: -2.5 },
        pt: 1.5,
        minHeight: 520,
      }}
    >
      <Box
        role="group"
        aria-label="เลือกเครือข่าย"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          zIndex: 1,
        }}
      >
        {CARRIER_LIST.map((name, idx) => {
          const isSelected = carrier === name
          const style = QUAD_STYLES[idx]
          return (
            <Box
              key={name}
              component="button"
              type="button"
              onClick={() => onPickCarrier(name)}
              aria-label={
                isSelected
                  ? `${CARRIER_SPEECH[name]} เลือกแล้ว แตะอีกครั้งเพื่อยืนยันและรับเน็ตฟรี`
                  : CARRIER_SPEECH[name]
              }
              sx={(theme) => ({
                border: 0,
                borderRight: style.borderRight || 0,
                borderBottom: style.borderBottom || 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                fontFamily: 'inherit',
                fontWeight: 800,
                fontSize: { xs: 26, sm: 30 },
                color: isSelected ? '#FFFFFF' : 'text.primary',
                cursor: 'pointer',
                px: 1.25,
                pt: style.pt,
                pb: style.pb,
                bgcolor: isSelected ? style.active : style.base,
                outline: isSelected ? `4px solid ${theme.palette.certify.sun}` : 'none',
                outlineOffset: '-4px',
                transition: 'background-color 0.15s ease',
              })}
            >
              <span>{name}</span>
              {isSelected && (
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    alignItems: 'center',
                    bgcolor: 'rgba(11, 23, 34, 0.72)',
                    color: '#FFF200',
                    px: 1.25,
                    py: 0.45,
                    borderRadius: '99px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 15 }} />
                  <span>แตะซ้ำเพื่อยืนยัน</span>
                </Stack>
              )}
            </Box>
          )
        })}
      </Box>

      {/* High-contrast flat header card so instructions are always legible */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          pointerEvents: 'none',
          mx: { xs: 1.5, sm: 2 },
          px: 2,
          py: 1.25,
          borderRadius: '12px',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1.25 }}>
          เลือกเครือข่ายมือถือ
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, mt: 0.25 }}>
          เบอร์ <b>{phone}</b> · แตะ 1 ครั้งเพื่อเลือก แตะซ้ำเพื่อยืนยัน
        </Typography>
        {statusMsg && (
          <Typography
            role="status"
            aria-live="polite"
            variant="caption"
            color="primary.main"
            sx={{ display: 'block', fontWeight: 700, mt: 0.35 }}
          >
            {statusMsg}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
