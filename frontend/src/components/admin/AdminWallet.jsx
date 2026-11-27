import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { Box, Button, Card, Chip, Grid, Stack, TextField, Typography } from '@mui/material'

export default function AdminWallet({
  walletItems,
  dividerColor,
  onAmountChange,
  onAddStock,
  onCutStock,
}) {
  return (
    <Grid container spacing={2}>
      {walletItems.map((item) => (
        <Grid key={item.carrier} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card sx={{ p: 2.25, height: '100%' }}>
            <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center', mb: 2 }}>
              <svg
                viewBox="0 0 100 100"
                width="90"
                height="90"
                role="img"
                aria-label={`${item.carrier} ${item.usedPct}%`}
              >
                <circle cx="50" cy="50" r="38" fill="none" stroke={dividerColor} strokeWidth="12" />
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke={item.strokeColor}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={item.dashArray}
                  transform="rotate(-90 50 50)"
                />
                <text
                  x="50"
                  y="57"
                  textAnchor="middle"
                  fontSize="22"
                  fontWeight="800"
                  fill="currentColor"
                >
                  {item.usedPct}%
                </text>
              </svg>
              <Box>
                <Typography variant="h3" sx={{ fontSize: 20 }}>
                  {item.carrier}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  คงเหลือ <b>{item.remaining}</b> / {item.total}
                </Typography>
                {item.lowStock && (
                  <Chip
                    icon={<WarningAmberIcon />}
                    label="ใกล้หมด เติมโค้ด"
                    color="warning"
                    size="small"
                    sx={{ mt: 0.75 }}
                  />
                )}
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <TextField
                type="number"
                size="small"
                value={item.amount}
                onChange={(e) => onAmountChange(item.carrier, e.target.value)}
                slotProps={{ htmlInput: { min: 1 } }}
                sx={{ width: 96 }}
              />
              <Button
                size="small"
                variant="contained"
                onClick={() => onAddStock(item.carrier, item.amount)}
              >
                เติม
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onCutStock(item.carrier, item.amount)}
              >
                ตัดออก
              </Button>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}
