import DownloadIcon from '@mui/icons-material/Download'
import PrintIcon from '@mui/icons-material/Print'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Alert, Box, Button, Card, Chip, Stack, Typography } from '@mui/material'

export default function AdminQr({
  qrVersion,
  qrUrl,
  qrDataUrl,
  confirmRotate,
  onDownloadQr,
  onPrintQr,
  onRequestRotate,
  onCancelRotate,
  onConfirmRotate,
}) {
  return (
    <Card sx={{ p: 3, textAlign: 'center' }}>
      <Box className="certify-printable" sx={{ display: 'inline-block', p: 2, borderRadius: 3 }}>
        <Chip label={`Universal QR · เวอร์ชัน v${qrVersion}`} color="secondary" sx={{ mb: 1.5 }} />
        {qrDataUrl ? (
          <Box
            component="img"
            src={qrDataUrl}
            alt={`QR Code ระบบ Certify เวอร์ชัน ${qrVersion}`}
            sx={{
              display: 'block',
              mx: 'auto',
              width: 240,
              height: 240,
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'divider',
              bgcolor: '#fff',
              p: 1,
            }}
          />
        ) : (
          <Box
            sx={{
              width: 240,
              height: 240,
              mx: 'auto',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'divider',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            กำลังสร้าง QR...
          </Box>
        )}

        <Typography variant="h3" sx={{ mt: 2, mb: 0.75 }}>
          QR เดียวสำหรับทุกหลักสูตร
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto' }}>
          ผู้เรียนสแกน QR นี้ แล้วใส่รหัส 4 หลักที่ผู้ดูแลหลักสูตรบอก ระบบจะรู้เองว่าเป็นหลักสูตรไหน
          ไม่ต้องสร้าง QR แยกรายหลักสูตร
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1, wordBreak: 'break-all' }}
        >
          ลิงก์ปลายทาง: {qrUrl}
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={1.25}
        useFlexGap
        sx={{ justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}
      >
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={!qrDataUrl}
          onClick={onDownloadQr}
        >
          ดาวน์โหลด PNG
        </Button>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={onPrintQr}>
          พิมพ์
        </Button>
        {!confirmRotate && (
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRequestRotate}>
            สร้างใหม่
          </Button>
        )}
      </Stack>

      {confirmRotate && (
        <Box sx={{ maxWidth: 480, mx: 'auto', mt: 2, textAlign: 'left' }}>
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            สร้างใหม่แล้ว QR เดิมที่แจกหรือพิมพ์ไปแล้วจะใช้ไม่ได้ ยืนยันหรือไม่?
          </Alert>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
            <Button variant="contained" color="warning" onClick={onConfirmRotate}>
              ยืนยันสร้างใหม่
            </Button>
            <Button variant="outlined" onClick={onCancelRotate}>
              ยกเลิก
            </Button>
          </Stack>
        </Box>
      )}
    </Card>
  )
}
