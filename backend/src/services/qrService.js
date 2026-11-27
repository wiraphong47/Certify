export function createQrService(repo) {
  return {
    async getQrVersion() {
      return repo.getQrVersion()
    },

    async rotateUniversalQr() {
      const current = await repo.getQrVersion()
      const qrVersion = await repo.setQrVersion(current + 1)
      const db = await repo.getState()
      return { ok: true, qrVersion, db }
    },
  }
}
