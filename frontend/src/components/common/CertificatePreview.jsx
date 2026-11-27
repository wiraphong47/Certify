import { forwardRef } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import ImageIcon from '@mui/icons-material/Image'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import { Box, Button, Dialog, Stack, Typography } from '@mui/material'

function SignerBlock({ sig, name, alt }) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        fontSize: '2cqw',
        minWidth: '22cqw',
        maxWidth: '38cqw',
      }}
    >
      {sig ? (
        <Box
          component="img"
          src={sig}
          alt={alt}
          sx={{
            height: '6.8cqw',
            maxWidth: '22cqw',
            display: 'block',
            mx: 'auto',
            objectFit: 'contain',
          }}
        />
      ) : (
        <Box sx={{ height: '6.8cqw' }} />
      )}
      <Box sx={{ borderTop: '0.2cqw solid #0C2F53', pt: '0.4cqw', px: '1cqw' }}>
        {name}
      </Box>
    </Box>
  )
}

export const CertificateCanvas = forwardRef(function CertificateCanvas(
  {
    course,
    formattedDate = '',
    orgName = '',
    studentName = 'สมชาย ใจดี',
    watermark = true,
    sx = {},
  },
  ref,
) {
  const hasSecondSigner = Boolean(course?.signer2 || course?.sig2)

  return (
    <Box
      ref={ref}
      sx={{
        width: '100%',
        containerType: 'inline-size',
        ...sx,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '297 / 210',
          background: course?.bg
            ? `linear-gradient(rgba(255,255,255,${course?.bgv ? '0.6' : '0'}), rgba(255,255,255,${course?.bgv ? '0.6' : '0'})), url(${course.bg}) center / cover`
            : '#FFFFFF',
          color: '#0C2F53',
          border: course?.bg ? 'none' : '1.4cqw double #0C2F53',
          boxSizing: 'border-box',
          overflow: 'hidden',
          fontFamily: '"IBM Plex Sans Thai", system-ui, sans-serif',
          lineHeight: 1.5,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: '1.6cqw',
            border: course?.bg ? 'none' : '0.3cqw solid #FFC600',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: '6cqw',
            pt: '2cqw',
            pb: '14cqw',
          }}
        >
          {watermark && (
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                fontSize: '15cqw',
                fontWeight: 800,
                color: '#0C2F53',
                opacity: 0.07,
                transform: 'rotate(-18deg)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              ตัวอย่าง
            </Box>
          )}

          {orgName && <Box sx={{ fontSize: '2.1cqw', color: '#53677B' }}>{orgName}</Box>}
          <Box sx={{ fontSize: '5.4cqw', fontWeight: 800, color: '#0C2F53', lineHeight: 1.3 }}>
            ใบเกียรติบัตร
          </Box>
          <Box sx={{ fontSize: '2.1cqw', color: '#53677B' }}>ขอมอบให้ไว้เพื่อแสดงว่า</Box>
          <Box
            sx={{
              fontSize: '5.6cqw',
              fontWeight: 800,
              borderBottom: '0.25cqw solid #0C2F53',
              px: '4cqw',
              my: '1cqw',
            }}
          >
            {studentName}
          </Box>
          <Box sx={{ fontSize: '2.4cqw', maxWidth: '82%' }}>
            {course?.txt || `ได้ผ่านการอบรมหลักสูตร ${course?.name || ''}`}
          </Box>
          {formattedDate && (
            <Box sx={{ fontSize: '2.1cqw', color: '#53677B', mt: '1cqw' }}>
              ให้ไว้ ณ วันที่ {formattedDate}
            </Box>
          )}

          <Box
            sx={{
              position: 'absolute',
              left: '7cqw',
              right: '7cqw',
              bottom: '4.2cqw',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: hasSecondSigner ? 'space-around' : 'flex-end',
              gap: '5cqw',
            }}
          >
            <SignerBlock
              sig={course?.sig}
              name={course?.signer || 'ผู้ลงนาม'}
              alt="ลายเซ็นผู้ลงนามคนที่ 1"
            />
            {hasSecondSigner && (
              <SignerBlock
                sig={course?.sig2}
                name={course?.signer2 || 'ผู้ลงนามคนที่ 2'}
                alt="ลายเซ็นผู้ลงนามคนที่ 2"
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
})

export default function CertificatePreview({
  course,
  formattedDate = '',
  orgName = '',
  studentName = 'สมชาย ใจดี',
  watermark = true,
  open = false,
  exporting = false,
  hideInline = false,
  fullCertRef,
  onOpen,
  onClose,
  onExportPdf,
  onExportPng,
}) {
  return (
    <Box>
      {!hideInline && (
        <>
          <Box sx={{ maxWidth: 520, my: 1 }}>
            <CertificateCanvas
              course={course}
              formattedDate={formattedDate}
              orgName={orgName}
              studentName={studentName}
              watermark={watermark}
            />
          </Box>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            startIcon={<ZoomInIcon />}
            onClick={onOpen}
            sx={{ mt: 1 }}
          >
            ดูแบบเต็มหน้า / ทดลองดาวน์โหลด
          </Button>
        </>
      )}

      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: 'rgba(8, 16, 26, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 2,
          },
        }}
      >
        <Box sx={{ width: 'min(100%, calc((100vh - 150px) * 1.4142))' }}>
          <CertificateCanvas
            ref={fullCertRef}
            course={course}
            formattedDate={formattedDate}
            orgName={orgName}
            studentName={studentName}
            watermark={watermark}
          />
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: '#fff',
            opacity: 0.8,
            display: { xs: 'block', md: 'none' },
          }}
        >
          หมุนจอเป็นแนวนอนเพื่อดูให้ใหญ่ขึ้น
        </Typography>

        <Stack
          direction="row"
          spacing={1.5}
          useFlexGap
          sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Button
            variant="contained"
            color="primary"
            disabled={exporting}
            startIcon={<PictureAsPdfIcon />}
            onClick={onExportPdf}
          >
            ดาวน์โหลด PDF
          </Button>
          <Button
            variant="outlined"
            disabled={exporting}
            startIcon={<ImageIcon />}
            onClick={onExportPng}
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.45)' }}
          >
            ดาวน์โหลด PNG
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CloseIcon />}
            onClick={onClose}
          >
            ปิด
          </Button>
        </Stack>
      </Dialog>
    </Box>
  )
}
