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
  Chip,
  CircularProgress,
  LinearProgress,
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
  const countdownPct =
    typeof countdown === 'number' ? Math.max(0, Math.min(100, (countdown / 3) * 100)) : 0

  return phase === 'loading' ? (
    <Stack useFlexGap spacing={2.5} sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Box
        sx={(theme) => ({
          width: 84,
          height: 84,
          borderRadius: '22px',
          display: 'grid',
          placeItems: 'center',
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(255, 242, 0, 0.14)'
              : 'rgba(12, 47, 83, 0.07)',
        })}
      >
        <CircularProgress size={48} thickness={4.5} />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h1" sx={{ fontSize: 22, fontWeight: 800, mb: 0.75 }}>
          กำลังออกใบเกียรติบัตร
        </Typography>
        <Typography
          role="status"
          aria-live="polite"
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: 14.5 }}
        >
          {loadingText}
        </Typography>
      </Box>
    </Stack>
  ) : (
    <Stack useFlexGap spacing={1.5} sx={{ flex: 1 }}>
      {/* Success Header */}
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}
      >
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 28 }} />
          <Typography variant="h1" sx={{ fontSize: 22, fontWeight: 800 }}>
            รับเรียบร้อยแล้ว
          </Typography>
        </Stack>
        <Chip label={studentName} size="small" color="success" variant="outlined" />
      </Stack>

      {autoSaveStatus === 'saving' && (
        <Alert severity="info" icon={<CircularProgress size={18} />} sx={{ borderRadius: '12px' }}>
          {hasNet
            ? 'กำลังบันทึกรูปใบเกียรติบัตรและรูปขั้นตอนรับโค้ดเน็ตลงเครื่องให้อัตโนมัติ...'
            : 'กำลังบันทึกรูปใบเกียรติบัตรลงเครื่องให้อัตโนมัติ...'}
        </Alert>
      )}
      {autoSaveStatus === 'done' && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ borderRadius: '12px' }}>
          {hasNet
            ? 'บันทึกรูปใบเกียรติบัตร และรูปขั้นตอนรับโค้ดเน็ตลงเครื่องให้แล้ว (2 ไฟล์)'
            : 'บันทึกรูปใบเกียรติบัตรลงเครื่องให้แล้ว'}
        </Alert>
      )}
      {autoSaveStatus === 'error' && (
        <Alert severity="warning" sx={{ borderRadius: '12px' }}>
          เบราว์เซอร์บล็อกการบันทึกอัตโนมัติ กรุณากดปุ่มด้านล่างเพื่อดาวน์โหลดไฟล์ด้วยตนเอง
        </Alert>
      )}

      {/* 1. Real A4 Certificate Canvas (auto-saved as PNG) */}
      <Box
        sx={{
          borderRadius: '12px',
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
          color="primary"
          fullWidth
          disabled={exporting}
          startIcon={exporting ? <CircularProgress size={18} color="inherit" /> : <PictureAsPdfIcon />}
          onClick={onDownloadPdf}
          sx={{ minHeight: 48, borderRadius: '14px', fontSize: 15.5, fontWeight: 800 }}
        >
          {exporting ? 'กำลังสร้างไฟล์ PDF...' : 'ดาวน์โหลด PDF'}
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
        <Box
          aria-live="polite"
          aria-atomic="true"
          sx={{
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '14px',
            p: 1.5,
            textAlign: 'center',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
              กลับหน้าหลักอัตโนมัติในอีก
            </Typography>
            {typeof countdown === 'number' && (
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: 'primary.main',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {countdown} วิ
              </Typography>
            )}
          </Stack>
          {typeof countdown === 'number' && (
            <LinearProgress
              variant="determinate"
              value={countdownPct}
              sx={{ height: 6, borderRadius: '99px', mb: 0.75 }}
            />
          )}
          <Button
            size="small"
            startIcon={<PauseCircleOutlineIcon />}
            onClick={onPauseCountdown}
            sx={{ borderRadius: '10px', fontSize: 13 }}
          >
            หยุดนับถอยหลังเพื่อดูรายละเอียดต่อ
          </Button>
        </Box>
      )}

      <Button
        variant="outlined"
        fullWidth
        startIcon={<HomeIcon />}
        onClick={onGoHome}
        sx={{
          mt: 'auto',
          minHeight: 52,
          fontSize: 16,
          fontWeight: 800,
          borderWidth: 1.5,
          borderRadius: '14px',
        }}
      >
        กลับหน้าหลักเลย
      </Button>
    </Stack>
  )
}
