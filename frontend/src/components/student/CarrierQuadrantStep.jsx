import { Box, Typography } from '@mui/material'
import { CARRIER_LIST, CARRIER_SPEECH } from '../../utils/thaiSpeech'

const QUAD_STYLES = [
  { base: 'rgba(120, 190, 32, 0.35)', active: 'rgba(120, 190, 32, 0.80)', pt: '160px', pb: '8px' },
  { base: 'rgba(230, 50, 50, 0.32)', active: 'rgba(230, 50, 50, 0.78)', pt: '160px', pb: '8px' },
  { base: 'rgba(0, 160, 220, 0.32)', active: 'rgba(0, 160, 220, 0.78)', pt: '8px', pb: '85px' },
  { base: 'rgba(150, 120, 220, 0.32)', active: 'rgba(150, 120, 220, 0.78)', pt: '8px', pb: '85px' },
]

export default function CarrierQuadrantStep({
  phone,
  carrier,
  statusMsg,
  onPickCarrier,
}) {
  return (
    <Box sx={{ position: 'relative', flex: 1, mx: -2.5, mb: -2.5, minHeight: 540 }}>
      <Box
        role="group"
        aria-label="เลือกเครือข่าย"
        sx={{
          position: 'absolute',
          inset: 0,
          top: -90,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          zIndex: 1,
        }}
      >
        {CARRIER_LIST.map((name, idx) => (
          <Box
            key={name}
            component="button"
            type="button"
            onClick={() => onPickCarrier(name)}
            aria-label={
              carrier === name
                ? `${CARRIER_SPEECH[name]} เลือกแล้ว แตะอีกครั้งเพื่อยืนยันและรับเน็ตฟรี`
                : CARRIER_SPEECH[name]
            }
            sx={(theme) => ({
              border: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              fontFamily: 'inherit',
              fontWeight: 800,
              fontSize: 30,
              color: 'text.primary',
              cursor: 'pointer',
              px: 1,
              pt: QUAD_STYLES[idx].pt,
              pb: QUAD_STYLES[idx].pb,
              bgcolor: carrier === name ? QUAD_STYLES[idx].active : QUAD_STYLES[idx].base,
              outline: carrier === name ? `5px solid ${theme.palette.certify.sun}` : 'none',
              outlineOffset: '-5px',
              transition: 'background-color 0.15s',
            })}
          >
            <span>{name}</span>
            {carrier === name && (
              <Typography
                component="small"
                sx={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3, textAlign: 'center' }}
              >
                ✓ แตะซ้ำเพื่อยืนยัน
                <br />
                และรับเน็ตฟรี
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <Box sx={{ position: 'relative', zIndex: 2, pointerEvents: 'none', px: 2.5 }}>
        <Typography variant="h1" sx={{ fontSize: 23 }}>
          เลือกเครือข่าย
        </Typography>
        <Typography variant="body2" color="text.secondary">
          เบอร์ {phone} · แตะมุมจอเพื่อฟังชื่อ แตะซ้ำเพื่อยืนยัน
        </Typography>
        {statusMsg && (
          <Typography
            role="status"
            aria-live="polite"
            variant="body2"
            sx={{ fontWeight: 600, mt: 0.5 }}
          >
            {statusMsg}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
