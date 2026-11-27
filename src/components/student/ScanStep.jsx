import CameraAltIcon from '@mui/icons-material/CameraAlt'
import CameraswitchIcon from '@mui/icons-material/Cameraswitch'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material'

const SCAN_CORNERS = [
  { top: 24, left: 24, borderRight: 0, borderBottom: 0, borderRadius: '8px 0 0 0' },
  { top: 24, right: 24, borderLeft: 0, borderBottom: 0, borderRadius: '0 8px 0 0' },
  { bottom: 24, left: 24, borderRight: 0, borderTop: 0, borderRadius: '0 0 0 8px' },
  { bottom: 24, right: 24, borderLeft: 0, borderTop: 0, borderRadius: '0 0 8px 0' },
]

export default function ScanStep({
  scanMode,
  statusMsg,
  cameraError,
  activeCameraLabel,
  canSwitchCamera,
  fileInputRef,
  onStartLiveCamera,
  onCameraBoxKeyDown,
  onSwitchCamera,
  onStartDemoScan,
  onCancelScan,
  onTriggerGallery,
  onGalleryFileChange,
}) {
  return (
    <Stack sx={{ flex: 1 }} spacing={1.5}>
      <Box id="certify-qr-file-decoder" sx={{ display: 'none' }} />

      {/* Always-mounted viewfinder so Html5Qrcode starts immediately inside user tap gesture */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Box
          onClick={scanMode === 'idle' ? onStartLiveCamera : undefined}
          role={scanMode === 'idle' ? 'button' : undefined}
          tabIndex={scanMode === 'idle' ? 0 : undefined}
          onKeyDown={scanMode === 'idle' ? onCameraBoxKeyDown : undefined}
          aria-label={
            scanMode === 'idle'
              ? 'แตะที่ไหนก็ได้บนกรอบกล้องเพื่อเริ่มสแกน QR'
              : 'หน้าจอกล้องสแกน QR'
          }
          sx={(theme) => ({
            position: 'relative',
            width: '100%',
            height: 270,
            borderRadius: 5,
            bgcolor: theme.palette.certify.cam,
            mb: 1.75,
            overflow: 'hidden',
            cursor: scanMode === 'idle' ? 'pointer' : 'default',
          })}
        >
          {/* Live html5-qrcode video mount target */}
          <Box
            id="certify-qr-reader"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: scanMode === 'camera' ? 1 : 0,
              pointerEvents: scanMode === 'camera' ? 'auto' : 'none',
            }}
          />

          {/* Idle icon overlay */}
          {scanMode === 'idle' && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <CameraAltIcon sx={{ fontSize: 64, color: '#fff' }} />
            </Box>
          )}

          {/* Yellow scanner corner brackets */}
          {SCAN_CORNERS.map((pos, idx) => (
            <Box
              key={idx}
              sx={(theme) => ({
                position: 'absolute',
                width: 30,
                height: 30,
                border: `4px solid ${theme.palette.certify.sun}`,
                pointerEvents: 'none',
                zIndex: 2,
                ...pos,
              })}
            />
          ))}

          {/* Animated scan line while active */}
          {scanMode !== 'idle' && (
            <Box
              className="certify-scan-line"
              sx={(theme) => ({
                position: 'absolute',
                left: 24,
                right: 24,
                height: 3,
                bgcolor: theme.palette.certify.sun,
                animation: 'scanLine 1.6s ease-in-out infinite alternate',
                pointerEvents: 'none',
                zIndex: 2,
              })}
            />
          )}

          {/* Active camera label pill */}
          {scanMode === 'camera' && activeCameraLabel && (
            <Chip
              label={activeCameraLabel}
              size="small"
              sx={{
                position: 'absolute',
                top: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 3,
                bgcolor: 'rgba(12, 47, 83, 0.78)',
                color: '#fff',
                maxWidth: '85%',
              }}
            />
          )}
        </Box>

        {scanMode === 'idle' ? (
          <Box
            component="button"
            type="button"
            onClick={onStartLiveCamera}
            aria-label="แตะที่ไหนก็ได้บนหน้าจอเพื่อเริ่มสแกน QR"
            sx={{
              border: 0,
              bgcolor: 'transparent',
              color: 'text.primary',
              cursor: 'pointer',
              p: 0,
              fontFamily: 'inherit',
            }}
          >
            <Typography variant="h1" sx={{ fontSize: 24, mb: 0.75 }}>
              แตะที่ไหนก็ได้
              <br />
              เพื่อเริ่มสแกน QR
            </Typography>
            <Typography variant="body2" color="text.secondary">
              แตะหน้าจอเพื่อเปิดกล้องสแกน QR เข้าสู่หน้า ThaID
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.25} sx={{ alignItems: 'center' }}>
            <Typography variant="h2" aria-live="polite">
              {scanMode === 'gallery' ? 'กำลังอ่านรูป...' : 'กำลังสแกน...'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {statusMsg}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ justifyContent: 'center', flexWrap: 'wrap' }}
            >
              {scanMode === 'camera' && canSwitchCamera && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CameraswitchIcon />}
                  onClick={onSwitchCamera}
                >
                  สลับกล้อง
                </Button>
              )}
              <Button variant="contained" color="secondary" size="small" onClick={onStartDemoScan}>
                จำลองว่าสแกนสำเร็จ
              </Button>
              <Button variant="outlined" size="small" onClick={onCancelScan}>
                ปิดกล้อง
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>

      {cameraError && (
        <Alert severity="warning" sx={{ textAlign: 'left', fontSize: 14 }}>
          {cameraError}
        </Alert>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onGalleryFileChange}
      />

      <Button
        variant="outlined"
        fullWidth
        startIcon={<PhotoLibraryIcon />}
        onClick={onTriggerGallery}
        sx={{ minHeight: 58, fontSize: 18, borderWidth: 2, borderRadius: 3.5 }}
      >
        เลือกรูป QR จากแกลเลอรี
      </Button>

      {scanMode === 'idle' && (
        <Button
          variant="text"
          size="small"
          startIcon={<PlayArrowIcon />}
          onClick={onStartDemoScan}
          sx={{ color: 'text.secondary' }}
        >
          ทดลองสแกน (กรณีไม่มีกล้อง)
        </Button>
      )}
    </Stack>
  )
}
