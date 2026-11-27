import { forwardRef } from 'react'
import { Box, Chip, Divider, Stack, Typography } from '@mui/material'

export const NetCodeGuideCard = forwardRef(function NetCodeGuideCard(
  {
    guide,
    studentName = 'สมชาย ใจดี',
    courseName = '',
    issuedDate = '',
  },
  ref,
) {
  return (
    <Box
      ref={ref}
      sx={{
        bgcolor: '#FFFFFF',
        color: '#0C2F53',
        border: '2px solid #0C2F53',
        borderRadius: 3,
        overflow: 'hidden',
        fontFamily: '"IBM Plex Sans Thai", system-ui, sans-serif',
        textAlign: 'left',
      }}
    >
      {/* Navy header with yellow accent stripe */}
      <Box
        sx={{
          bgcolor: '#0C2F53',
          color: '#FFFFFF',
          px: 2,
          py: 1.5,
          borderBottom: '4px solid #FFF200',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Box
            component="span"
            sx={{
              bgcolor: '#FFF200',
              color: '#0C2F53',
              fontWeight: 800,
              fontSize: 14,
              px: 1,
              py: 0.25,
              borderRadius: 1,
            }}
          >
            Certify
          </Box>
          <Chip
            size="small"
            label={guide?.skipped ? 'เก็บไว้รับภายหลัง' : 'พร้อมกดรับสิทธิ์'}
            sx={{
              bgcolor: guide?.skipped ? '#FFC600' : '#12724A',
              color: guide?.skipped ? '#0C2F53' : '#FFFFFF',
              fontWeight: 700,
              height: 24,
            }}
          />
        </Stack>
        <Typography sx={{ fontSize: 18, fontWeight: 800, mt: 0.75, color: '#FFFFFF' }}>
          ขั้นตอนการกดรับโค้ดอินเทอร์เน็ตฟรี
        </Typography>
        <Typography sx={{ fontSize: 12.5, opacity: 0.9, color: '#FFFFFF' }}>
          ผู้รับสิทธิ์: {studentName}
          {courseName ? ` · ${courseName}` : ''}
        </Typography>
      </Box>

      {/* USSD Net Code Highlight */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            bgcolor: '#F7F8FA',
            border: '2px dashed #0C2F53',
            borderRadius: 2,
            p: 1.5,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: 13.5, color: '#53677B', fontWeight: 600 }}>
            เครือข่าย: {guide?.carrierLabel || '-'} · เบอร์ {guide?.formattedPhone || '-'}
          </Typography>
          <Typography
            sx={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 1.5,
              color: '#0C2F53',
              mt: 0.5,
              fontFamily: 'ui-monospace, Consolas, monospace',
            }}
          >
            {guide?.ussd || '*777*00000000#'}
          </Typography>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#12724A', mt: 0.25 }}>
            กดรหัสนี้ในแอปโทรศัพท์แล้วกดโทรออก
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5, borderColor: '#D6DEE7' }} />

        <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: '#0C2F53', mb: 1 }}>
          วิธีใช้งานทีละขั้นตอน
        </Typography>

        <Stack spacing={1}>
          {(guide?.steps || []).map((stepText, idx) => (
            <Stack
              key={idx}
              direction="row"
              spacing={1.25}
              sx={{ alignItems: 'flex-start' }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: '#0C2F53',
                  color: '#FFF200',
                  fontSize: 13,
                  fontWeight: 800,
                  display: 'grid',
                  placeItems: 'center',
                  flex: 'none',
                  mt: 0.15,
                }}
              >
                {idx + 1}
              </Box>
              <Typography sx={{ fontSize: 13.5, lineHeight: 1.45, color: '#0C2F53' }}>
                {stepText}
              </Typography>
            </Stack>
          ))}
        </Stack>

        <Typography sx={{ fontSize: 11.5, color: '#53677B', mt: 1.5, textAlign: 'center' }}>
          {issuedDate ? `ออกสิทธิ์วันที่ ${issuedDate} · ` : ''}
          บันทึกรูปภาพนี้ไว้ในเครื่องสำหรับเปิดดูหรือกดรับสิทธิ์ภายหลังได้
        </Typography>
      </Box>
    </Box>
  )
})

export default NetCodeGuideCard
