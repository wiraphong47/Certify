import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HomeIcon from '@mui/icons-material/Home'
import ImageIcon from '@mui/icons-material/Image'
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutlined'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import WifiIcon from '@mui/icons-material/Wifi'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import { CertificateCanvas } from '../common/CertificatePreview'
import NetCodeGuideCard from '../common/NetCodeGuideCard'

export default function CertificateStep({
  phase,
  hasNet = true,
  loadingText,
  autoSaveStatus,
  countdown,
  paused,
  exporting,
  certExportRef,
  netGuideExportRef,
  course,
  formattedDate,
  orgName,
  studentName = 'สมชาย ใจดี',
  netGuide,
  onDownloadPdf,
  onDownloadPng,
  onDownloadNetGuidePng,
  onPauseCountdown,
  onGoHome,
}) {
  return phase === 'loading' ? (
    <Stack spacing={2.5} sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h1" sx={{ fontSize: 24, textAlign: 'center' }}>
        กำลังรับใบเกียรติบัตร
      </Typography>
      <CircularProgress size={56} thickness={5} />
      <Typography
        role="status"
        aria-live="polite"
        variant="body1"
        color="text.secondary"
        sx={{ textAlign: 'center' }}
      >
        {loadingText}
      </Typography>
    </Stack>
  ) : (
    <Stack spacing={1.5} sx={{ flex: 1 }}>
      <Typography variant="h1" sx={{ fontSize: 24 }}>
        รับเรียบร้อย
      </Typography>

      {autoSaveStatus === 'saving' && (
        <Alert severity="info" icon={<CircularProgress size={18} />}>
          {hasNet
            ? 'กำลังบันทึกรูปใบเกียรติบัตรและรูปขั้นตอนรับโค้ดเน็ตลงเครื่องให้อัตโนมัติ...'
            : 'กำลังบันทึกรูปใบเกียรติบัตรลงเครื่องให้อัตโนมัติ...'}
        </Alert>
      )}
      {autoSaveStatus === 'done' && (
        <Alert severity="success" icon={<CheckCircleIcon />}>
          {hasNet
            ? 'บันทึกรูปใบเกียรติบัตร และรูปขั้นตอนรับโค้ดเน็ตลงเครื่องให้แล้ว (2 ไฟล์)'
            : 'บันทึกรูปใบเกียรติบัตรลงเครื่องให้แล้ว'}
        </Alert>
      )}
      {autoSaveStatus === 'error' && (
        <Alert severity="warning">
          เบราว์เซอร์บล็อกการบันทึกอัตโนมัติ กรุณากดปุ่มด้านล่างเพื่อบันทึกรูปด้วยตนเอง
        </Alert>
      )}

      {/* 1. Real A4 Certificate Canvas (auto-saved as PNG) */}
      <Box
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CertificateCanvas
          ref={certExportRef}
          course={course}
          formattedDate={formattedDate}
          orgName={orgName}
          studentName={studentName}
          watermark={false}
        />
      </Box>

      <Stack direction="row" spacing={1}>
       
        <Button
          variant="contained"
          size="small"
          color="primary"
          fullWidth
          disabled={exporting}
          startIcon={<PictureAsPdfIcon />}
          onClick={onDownloadPdf}
        >
          โหลด PDF
        </Button>
      </Stack>

      {/* 2. Net Code & Step-by-Step Guide Card (only when course provides net) */}
      {hasNet && (
        <NetCodeGuideCard
          ref={netGuideExportRef}
          guide={netGuide}
          studentName={studentName}
          courseName={course?.name || ''}
          issuedDate={formattedDate}
        />
      )}

   

      {!paused && countdown !== null && (
        <Box aria-live="polite" aria-atomic="true" sx={{ textAlign: 'center', pt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            กำลังจะออกจากแอปในอีก
          </Typography>
          {typeof countdown === 'number' && (
            <Typography sx={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1 }}>
              {countdown}
            </Typography>
          )}
          <Button
            size="small"
            startIcon={<PauseCircleOutlineIcon />}
            onClick={onPauseCountdown}
            sx={{ mt: 0.25 }}
          >
            หยุดนับถอยหลังเพื่อดูรูปต่อ
          </Button>
        </Box>
      )}

      <Button
        variant="contained"
        fullWidth
        startIcon={<HomeIcon />}
        onClick={onGoHome}
        sx={{ mt: 'auto', py: 1.4, fontSize: 17, borderRadius: 3.5 }}
      >
        กลับหน้าหลักเลย
      </Button>
    </Stack>
  )
}
