export function createWalletService(repo) {
  return {
    async getWallet() {
      return repo.getWallet()
    },

    async adjustWalletStock(carrier, delta) {
      const amount = Number(delta)
      if (!Number.isFinite(amount) || amount === 0) {
        return { ok: false, status: 400, error: 'กรุณาระบุจำนวนที่มากกว่า 0' }
      }
      const wallet = await repo.getWallet()
      const item = wallet[carrier]
      if (!item) {
        return { ok: false, status: 404, error: 'ไม่พบเครือข่ายที่ระบุ' }
      }
      const remaining = item.total - item.used
      if (amount < 0 && Math.abs(amount) > remaining) {
        return { ok: false, status: 400, error: `ตัดได้ไม่เกินโค้ดที่เหลือ (${remaining})` }
      }
      await repo.updateWalletCarrier(carrier, { total: item.total + amount })
      const db = await repo.getState()
      return { ok: true, db }
    },
  }
}
