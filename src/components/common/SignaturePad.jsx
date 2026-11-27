import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { Box, Button, Stack, Typography } from '@mui/material'

export default function SignaturePad({
  label = 'ลายเซ็น (เซ็นบนจอ หรืออัปโหลดรูป)',
  ariaLabel = 'พื้นที่เซ็นชื่อ',
  canvasRef,
  fileInputRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onClear,
  onTriggerUpload,
  onUploadFile,
}) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
        {label}
      </Typography>
      <Box
        component="canvas"
        ref={canvasRef}
        aria-label={ariaLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        sx={{
          display: 'block',
          width: '100%',
          height: 120,
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: '#FFFFFF',
          touchAction: 'none',
          cursor: 'crosshair',
        }}
      />
      <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1, flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DeleteOutlineIcon />}
          onClick={onClear}
        >
          ล้างลายเซ็น
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onUploadFile}
        />
        <Button
          size="small"
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={onTriggerUpload}
        >
          อัปโหลดรูปลายเซ็น
        </Button>
      </Stack>
    </Box>
  )
}
