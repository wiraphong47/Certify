import { useMemo, useState } from 'react'
import { useTheme } from '@mui/material'
import AdminWallet from '../../components/admin/AdminWallet'
import { useCertify } from '../../context/certify'

const DONUT_CIRC = 2 * Math.PI * 38

export default function AdminWalletPage() {
  const theme = useTheme()
  const { db, adjustWallet } = useCertify()

  const [walletAmounts, setWalletAmounts] = useState({ AIS: 100, True: 100, dtac: 100 })

  const walletItems = useMemo(
    () =>
      Object.entries(db.wallet).map(([carrier, info]) => {
        const remaining = info.total - info.used
        const usedPct = info.total > 0 ? Math.round((info.used / info.total) * 100) : 0
        return {
          carrier,
          total: info.total,
          remaining,
          usedPct,
          lowStock: remaining < info.total * 0.1,
          amount: walletAmounts[carrier] ?? 100,
          strokeColor: usedPct >= 90 ? theme.palette.warning.main : theme.palette.primary.main,
          dashArray: `${(DONUT_CIRC * usedPct) / 100} ${DONUT_CIRC}`,
        }
      }),
    [db.wallet, theme.palette.primary.main, theme.palette.warning.main, walletAmounts],
  )

  return (
    <AdminWallet
      walletItems={walletItems}
      dividerColor={theme.palette.divider}
      onAmountChange={(carrier, rawVal) =>
        setWalletAmounts((prev) => ({
          ...prev,
          [carrier]: Math.max(1, Number(rawVal) || 0),
        }))
      }
      onAddStock={(carrier, amount) => adjustWallet(carrier, Math.abs(amount))}
      onCutStock={(carrier, amount) => adjustWallet(carrier, -Math.abs(amount))}
    />
  )
}
