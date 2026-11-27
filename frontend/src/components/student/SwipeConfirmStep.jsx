import { useEffect } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
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
  leftOpacity = 0.38,
  rightOpacity = 0.38,
  readyDir = '',
  clampedTranslate = 0,
  isDragging = false,
  swipeHandlers = {},
  onAccessibleConfirm,
  onAccessibleEdit,
}) {
  // Keyboard support on desktop: ArrowRight = confirm, ArrowLeft = edit
  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onAccessibleConfirm?.()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onAccessibleEdit?.()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onAccessibleConfirm, onAccessibleEdit])

  const dynamicHint =
    readyDir === 'right'
      ? 'ปล่อยนิ้วเพื่อยืนยัน →'
      : readyDir === 'left'
        ? '← ปล่อยนิ้วเพื่อแก้ไข'
        : helperText

  return (
    <Box
      sx={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        mx: { xs: -2, sm: -2.5 },
        my: { xs: -2, sm: -2.5 },
        px: { xs: 2, sm: 2.5 },
        py: { xs: 2, sm: 2.5 },
      }}
    >
      {/* Left swipe overlay */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: 1,
          pb: 10.5,
          textAlign: 'center',
          fontWeight: 800,
          fontSize: 22,
          lineHeight: 1.35,
          pointerEvents: 'none',
          background:
            'linear-gradient(90deg, rgba(190, 35, 45, 0.88), rgba(190, 35, 45, 0.14))',
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
            fontSize: 48,
            lineHeight: 1,
            mb: 0.25,
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
          top: 0,
          bottom: 0,
          right: 0,
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: 1,
          pb: 10.5,
          textAlign: 'center',
          fontWeight: 800,
          fontSize: 22,
          lineHeight: 1.35,
          pointerEvents: 'none',
          background:
            'linear-gradient(270deg, rgba(18, 114, 74, 0.88), rgba(18, 114, 74, 0.14))',
          color: '#FFFFFF',
          opacity: readyDir === 'right' ? 1 : rightOpacity,
          transition: 'opacity 0.12s',
          zIndex: 0,
        }}
      >
        <Box
          component="span"
          className="certify-nudge-right"
          sx={{
            fontSize: 48,
            lineHeight: 1,
            mb: 0.25,
            animation: 'nudgeRight 1.4s ease-in-out infinite',
          }}
        >
          →
        </Box>
        ปัดขวา
        <br />
        ยืนยัน
      </Box>

      {/* Swipeable foreground */}
      <Stack
        {...swipeHandlers}
        useFlexGap
        spacing={1.5}
        sx={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          touchAction: 'pan-y',
          transform: `translateX(${clampedTranslate}px)`,
          transition: isDragging ? 'none' : 'transform 0.16s ease-out',
          userSelect: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* High-contrast readable foreground card */}
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            border: '1.5px solid',
            borderColor:
              readyDir === 'right'
                ? 'success.main'
                : readyDir === 'left'
                  ? 'error.main'
                  : 'divider',
            borderTopWidth: 4,
            borderTopColor:
              readyDir === 'right'
                ? 'success.main'
                : readyDir === 'left'
                  ? 'error.main'
                  : '#FFC600',
            borderRadius: '16px',
            p: 2.25,
            mt: 1,
            textAlign: 'center',
            transition: 'border-color 0.15s ease',
          }}
        >
          <Typography
            ref={headingRef}
            tabIndex={-1}
            variant="h1"
            sx={{ fontSize: 21, fontWeight: 800, mb: badgeText ? 1 : 0.75 }}
          >
            {title}
          </Typography>

          {badgeText && (
            <Box sx={{ mb: 1.25 }}>
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
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {mainText}
          </Typography>

          <Typography
            variant="body2"
            color={
              readyDir === 'right'
                ? 'success.main'
                : readyDir === 'left'
                  ? 'error.main'
                  : 'text.secondary'
            }
            sx={{ fontWeight: readyDir ? 800 : 500, fontSize: 13.5 }}
          >
            {dynamicHint}
          </Typography>
        </Box>

        {/* Accessible quick-tap controls for desktop / motor accessibility */}
        <Stack direction="row" spacing={1.25} sx={{ mt: 'auto', pt: 1 }}>
          <Button
            variant="outlined"
            fullWidth
            aria-label={noLabel}
            startIcon={<EditOutlinedIcon fontSize="small" />}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onAccessibleEdit?.()
            }}
            sx={(theme) => ({
              minHeight: 48,
              borderRadius: '14px',
              borderWidth: 1.5,
              fontWeight: 700,
              bgcolor:
                theme.palette.mode === 'dark'
                  ? 'rgba(11, 23, 34, 0.85)'
                  : 'rgba(255, 255, 255, 0.92)',
              borderColor: 'error.main',
              color: 'error.main',
              '&:hover': {
                borderWidth: 1.5,
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(240, 106, 106, 0.16)'
                    : 'rgba(198, 40, 40, 0.08)',
              },
            })}
          >
            แก้ไข
          </Button>
          <Button
            variant="contained"
            color="success"
            fullWidth
            aria-label={yesLabel}
            startIcon={<CheckIcon fontSize="small" />}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onAccessibleConfirm?.()
            }}
            sx={{
              minHeight: 48,
              borderRadius: '14px',
              fontWeight: 800,
            }}
          >
            ยืนยัน
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
