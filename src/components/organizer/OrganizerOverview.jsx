import CasinoIcon from '@mui/icons-material/Casino'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import PreviewIcon from '@mui/icons-material/Preview'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import CertificatePreview from '../common/CertificatePreview'
import KpiCard from '../common/KpiCard'
import FullscreenCodeDialog from './FullscreenCodeDialog'

function CodeTiles({ value, ariaLabel }) {
  return !value ? (
    <Typography variant="body2" color="text.secondary" sx={{ my: 1.5 }}>
      ยังไม่ได้ตั้งรหัส
    </Typography>
  ) : (
    <Stack
      direction="row"
      spacing={1.25}
      role="img"
      aria-label={`${ariaLabel} ${value.split('').join(' ')}`}
      sx={{ justifyContent: 'center', my: 1.25 }}
    >
      {value.split('').map((digit, idx) => (
        <Box
          key={idx}
          sx={{
            width: { xs: 54, sm: 68 },
            height: { xs: 66, sm: 82 },
            display: 'grid',
            placeItems: 'center',
            fontSize: { xs: 34, sm: 44 },
            fontWeight: 800,
            bgcolor: 'background.default',
            border: '3px solid',
            borderColor: 'primary.main',
            borderRadius: 2,
          }}
        >
          {digit}
        </Box>
      ))}
    </Stack>
  )
}

export default function OrganizerOverview({
  course,
  isCheckin,
  checklist,
  completedCount,
  expiryText,
  chart,
  hasRecords,
  fsDialogOpen,
  fsLabel,
  fsCode,
  previewProps,
  onOpenFullscreen,
  onCloseFullscreen,
  onRegenerateCode,
  onGoSettings,
  onOpenPreview,
}) {
  const hasNet = course?.hasNet !== false
  const kpiSmCols = isCheckin ? (hasNet ? 4 : 6) : hasNet ? 6 : 12

  return (
    <Stack spacing={2}>
      <Grid container spacing={1.5}>
        {isCheckin && (
          <Grid size={{ xs: 12, sm: kpiSmCols }}>
            <KpiCard icon="📍" value={course.ci || 0} label="Check-in แล้ว" tone="t4" />
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: kpiSmCols }}>
          <KpiCard icon="🎓" value={course.got || 0} label="รับใบเกียรติบัตรแล้ว" tone="t1" />
        </Grid>
        {hasNet && (
          <Grid size={{ xs: 12, sm: kpiSmCols }}>
            <KpiCard icon="🌐" value={course.net || 0} label="รับเน็ตแล้ว" tone="t2" />
          </Grid>
        )}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2.25, textAlign: 'center', height: '100%' }}>
            <Typography variant="h3" sx={{ mb: 1 }}>
              {isCheckin
                ? 'รหัส 4 หลัก (บุคคลทั่วไป · Check-in + Check-out)'
                : 'รหัส Check-out 4 หลัก (ผู้พิการ · รับใบเซอร์เลย)'}
            </Typography>

            {isCheckin && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                  1) รหัส Check-in (ตอนเริ่มเรียน)
                </Typography>
                <CodeTiles value={course.codeIn} ariaLabel="รหัสเช็กอิน" />
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={!course.codeIn}
                    startIcon={<FullscreenIcon />}
                    onClick={() => onOpenFullscreen('in')}
                  >
                    แสดงเต็มจอ
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CasinoIcon />}
                    onClick={() => onRegenerateCode('in')}
                  >
                    สุ่มใหม่
                  </Button>
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                  2) รหัส Check-out (ตอนจบเรียน / รับใบเซอร์)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {course.outWait > 0
                    ? `⏳ เปิดให้กรอกหลัง Check-in ครบ ${course.outWait} นาที`
                    : 'กรอกได้ทันทีหลัง Check-in'}
                </Typography>
              </Box>
            )}

            <CodeTiles value={course.code} ariaLabel="รหัสเช็กเอาต์" />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {expiryText}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
              <Button
                size="small"
                variant="contained"
                disabled={!course.code}
                startIcon={<FullscreenIcon />}
                onClick={() => onOpenFullscreen('out')}
              >
                แสดงเต็มจอ
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CasinoIcon />}
                onClick={() => onRegenerateCode('out')}
              >
                {isCheckin ? 'สุ่มใหม่' : 'สุ่มรหัสใหม่'}
              </Button>
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 2.25, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h3" sx={{ mb: 1 }}>
              ความพร้อม ({completedCount}/{checklist.length})
            </Typography>

            <List dense disablePadding sx={{ mb: 1.5 }}>
              {checklist.map((item) => (
                <ListItem key={item.label} disableGutters divider>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {item.done ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ flexWrap: 'wrap', mt: 'auto' }}
            >
              {completedCount < checklist.length ? (
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  startIcon={<SettingsIcon />}
                  onClick={onGoSettings}
                >
                  ไปตั้งค่า
                </Button>
              ) : (
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 700, py: 0.75 }}>
                  ✓ พร้อมใช้งานครบแล้ว
                </Typography>
              )}
              <Button
                size="small"
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={onOpenPreview}
              >
                ดูตัวอย่างใบเกียรติบัตร
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 2.25 }}>
        <Typography variant="h3" sx={{ mb: 1.5 }}>
          ผู้รับใบเกียรติบัตรรายชั่วโมง
        </Typography>

        {!hasRecords ? (
          <Typography variant="body2" color="text.secondary">
            ยังไม่มีผู้รับใบเกียรติบัตร
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, height: 210, alignItems: 'stretch', pt: 1 }}>
            {chart.buckets.map((bucket) => (
              <Box
                key={bucket.label}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {bucket.value}
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    my: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 38,
                      height: `${Math.round((bucket.value / chart.max) * 100)}%`,
                      minHeight: 3,
                      bgcolor: 'primary.main',
                      borderRadius: '8px 8px 0 0',
                      transition: 'height 0.25s ease',
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {bucket.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Card>

      <FullscreenCodeDialog
        open={fsDialogOpen}
        onClose={onCloseFullscreen}
        label={fsLabel}
        code={fsCode}
        courseName={course.name}
      />

      <CertificatePreview {...previewProps} hideInline />
    </Stack>
  )
}
