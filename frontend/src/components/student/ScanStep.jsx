import CameraAltIcon from '@mui/icons-material/CameraAlt'
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import { Alert, Box, Button, Stack, Typography } from '@mui/material'

const SCAN_CORNERS = [
  { top: 18, left: 18, borderRight: 0, borderBottom: 0, borderRadius: '6px 0 0 0' },
  { top: 18, right: 18, borderLeft: 0, borderBottom: 0, borderRadius: '0 6px 0 0' },
  { bottom: 18, left: 18, borderRight: 0, borderTop: 0, borderRadius: '0 0 0 6px' },
  { bottom: 18, right: 18, borderLeft: 0, borderTop: 0, borderRadius: '0 0 6px 0' },
]

export default function ScanStep({
  scanMode,
  statusMsg,
  cameraError,
  fileInputRef,
  onStartLiveCamera,
  onCameraBoxKeyDown,
  onStartDemoScan,
  onCancelScan,
  onTriggerGallery,
  onGalleryFileChange,
}) {
  return (
    <Stack useFlexGap sx={{ flex: 1 }} spacing={1.5}>
      <Box id="certify-qr-file-decoder" sx={{ display: 'none' }} />

      {/* Header */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontSize: 21, fontWeight: 800, lineHeight: 1.25 }}>
          {scanMode === 'idle' ? 'แตะกรอบกล้องเพื่อเริ่มสแกน' : 'กำลังสแกนคิวอาร์โค้ด'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, fontSize: 13.5 }}>
          {scanMode === 'idle'
            ? 'ใช้กล้องหลังสแกน QR หน้าห้องอบรมเพื่อเข้าสู่ระบบ ThaID'
            : scanMode === 'gallery'
              ? 'กำลังอ่านข้อมูลคิวอาร์โค้ดจากรูปภาพที่เลือก'
              : 'เล็งกล้องหลังไปที่คิวอาร์โค้ดให้อยู่ในกรอบสีเหลือง'}
        </Typography>
      </Box>

      {/* Always-mounted clean flat viewfinder */}
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
              ? 'แตะที่ไหนก็ได้บนกรอบกล้องเพื่อเริ่มสแกน QR ด้วยกล้องหลัง'
              : 'หน้าจอกล้องหลังสแกน QR'
          }
          sx={(theme) => ({
            position: 'relative',
            width: '100%',
            height: 270,
            borderRadius: '16px',
            bgcolor: theme.palette.certify.cam,
            border: '2px solid',
            borderColor: scanMode !== 'idle' ? '#FFF200' : 'divider',
            mb: 1.5,
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

          {/* Idle call-to-action overlay */}
          {scanMode === 'idle' && (
            <Stack
              spacing={1.5}
              sx={{
                position: 'absolute',
                inset: 0,
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                px: 2,
              }}
            >
              <Box
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: '16px',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.10)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                }}
              >
                <CameraAltIcon sx={{ fontSize: 40, color: '#FFFFFF' }} />
              </Box>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  bgcolor: '#FFF200',
                  color: '#0C2F53',
                  fontWeight: 800,
                  fontSize: 15,
                  px: 2,
                  py: 0.65,
                  borderRadius: '10px',
                }}
              >
                <QrCodeScannerIcon sx={{ fontSize: 19 }} />
                แตะเพื่อเปิดกล้องสแกน
              </Box>
            </Stack>
          )}

          {/* Crisp flat yellow scanner corner brackets */}
          {SCAN_CORNERS.map((pos, idx) => (
            <Box
              key={idx}
              sx={{
                position: 'absolute',
                width: 28,
                height: 28,
                border: '4px solid #FFF200',
                pointerEvents: 'none',
                zIndex: 2,
                ...pos,
              }}
            />
          ))}

          {/* Clean flat scan line */}
          {scanMode !== 'idle' && (
            <Box
              className="certify-scan-line"
              sx={{
                position: 'absolute',
                left: 20,
                right: 20,
                height: 3,
                bgcolor: '#FFF200',
                animation: 'scanLine 1.6s ease-in-out infinite alternate',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
          )}
        </Box>

        {scanMode !== 'idle' && (
          <Stack spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="h2" aria-live="polite" sx={{ fontSize: 18, fontWeight: 800 }}>
              {scanMode === 'gallery' ? 'กำลังอ่านรูปภาพ...' : 'กำลังสแกน QR...'}
            </Typography>
            {statusMsg && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13.5 }}>
                {statusMsg}
              </Typography>
            )}
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ justifyContent: 'center', flexWrap: 'wrap', pt: 0.25 }}
            >
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={onStartDemoScan}
                sx={{ borderRadius: '8px', fontWeight: 800 }}
              >
                จำลองว่าสแกนสำเร็จ
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={onCancelScan}
                sx={{ borderRadius: '8px', borderWidth: 1.5 }}
              >
                ปิดกล้อง
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>

      {cameraError && (
        <Alert severity="warning" sx={{ textAlign: 'left', fontSize: 13.5, borderRadius: '10px' }}>
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

      {/* Bottom Action Area */}
      <Stack useFlexGap spacing={1} sx={{ mt: 'auto' }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<PhotoLibraryIcon />}
          onClick={onTriggerGallery}
          sx={{
            minHeight: 52,
            fontSize: 16,
            fontWeight: 700,
            borderWidth: 1.5,
            borderRadius: '12px',
            bgcolor: 'background.default',
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              borderWidth: 1.5,
              borderColor: 'primary.main',
            },
          }}
        >
          เลือกรูป QR จากแกลเลอรี
        </Button>

        {scanMode === 'idle' && (
          <Stack
            sx={{
              pt: 0.75,
              borderTop: '1px dashed',
              borderColor: 'divider',
              alignItems: 'center',
            }}
          >
            <Button
              variant="text"
              size="small"
              startIcon={<PlayArrowIcon fontSize="small" />}
              onClick={onStartDemoScan}
              sx={{ color: 'text.secondary', fontSize: 13, borderRadius: '8px' }}
            >
              ทดลองสแกน (กรณีไม่มีกล้อง)
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
