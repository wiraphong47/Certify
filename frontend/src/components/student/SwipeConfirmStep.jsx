import { Box, Button, Chip, Stack, Typography } from '@mui/material'

export default function SwipeConfirmStep({
  title,
  badgeText,
  badgeColor = 'primary',
  mainText,
  mainFontSize = 'clamp(22px, 6vw, 32px)',
  letterSpacing = 0,
  helperText = 'ปัดขวาเพื่อยืนยัน · ปัดซ้ายเพื่อแก้ไข',
  yesLabel = 'ใช่ ยืนยัน',
  noLabel = 'ไม่ใช่ แก้ไข',
  headingRef,
  leftOpacity = 0.35,
  rightOpacity = 0.35,
  readyDir = '',
  clampedTranslate = 0,
  isDragging = false,
  swipeHandlers = {},
  onAccessibleConfirm,
  onAccessibleEdit,
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        mx: -2.5,
        mb: -2.5,
        px: 2.5,
        pb: 2.5,
      }}
    >
      {/* Left swipe overlay */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: -90,
          bottom: 0,
          left: 0,
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: 1,
          pb: 5,
          textAlign: 'center',
          fontWeight: 800,
          fontSize: 24,
          lineHeight: 1.35,
          pointerEvents: 'none',
          background:
            'linear-gradient(90deg, rgba(190, 35, 45, 0.85), rgba(190, 35, 45, 0.10))',
          color: '#FFFFFF',
          opacity: readyDir === 'left' ? 1 : leftOpacity,
          transition: 'opacity 0.12s',
          zIndex: 0,
        }}
      >
        <Box
          component="span"
          className="certify-nudge-left"
          sx={{
            fontSize: 56,
            lineHeight: 1,
            animation: 'nudgeLeft 1.4s ease-in-out infinite',
          }}
        >
          ←
        </Box>
        ปัดซ้าย
        <br />
        แก้ไข
      </Box>

      {/* Right swipe overlay */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: -90,
          bottom: 0,
          right: 0,
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: 1,
          pb: 5,
          textAlign: 'center',
          fontWeight: 800,
          fontSize: 24,
          lineHeight: 1.35,
          pointerEvents: 'none',
          background:
            'linear-gradient(270deg, rgba(18, 114, 74, 0.85), rgba(18, 114, 74, 0.10))',
          color: '#FFFFFF',
          opacity: readyDir === 'right' ? 1 : rightOpacity,
          transition: 'opacity 0.12s',
          zIndex: 0,
        }}
      >
        ปัดขวา
        <br />
        ยืนยัน
        <Box
          component="span"
          className="certify-nudge-right"
          sx={{
            fontSize: 56,
            lineHeight: 1,
            animation: 'nudgeRight 1.4s ease-in-out infinite',
          }}
        >
          →
        </Box>
      </Box>

      {/* Swipeable foreground */}
      <Stack
        {...swipeHandlers}
        spacing={1.5}
        sx={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          touchAction: 'pan-y',
          transform: `translateX(${clampedTranslate}px)`,
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          userSelect: 'none',
          cursor: 'grab',
          px: 1,
        }}
      >
        <Typography ref={headingRef} tabIndex={-1} variant="h1" sx={{ fontSize: 24 }}>
          {title}
        </Typography>

        {badgeText && (
          <Box sx={{ textAlign: 'center' }}>
            <Chip label={badgeText} color={badgeColor} size="small" />
          </Box>
        )}

        <Typography
          role="status"
          aria-live="polite"
          sx={{
            fontSize: mainFontSize,
            fontWeight: 800,
            letterSpacing,
            textAlign: 'center',
            my: 1,
            lineHeight: 1.3,
          }}
        >
          {mainText}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {helperText}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', pt: 1 }}>
          <Button
            className="sr-only sr-only-focusable"
            variant="outlined"
            onClick={onAccessibleEdit}
          >
            {noLabel}
          </Button>
          <Button
            className="sr-only sr-only-focusable"
            variant="contained"
            color="success"
            onClick={onAccessibleConfirm}
          >
            {yesLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
