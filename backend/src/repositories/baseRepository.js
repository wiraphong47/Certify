/**
 * Abstract Repository Contract for Certify Backend.
 *
 * Every method is async so swapping JsonRepository -> PostgresRepository / MySqlRepository /
 * MongoRepository / PrismaRepository requires ZERO changes in routes or business services.
 */
export class BaseRepository {
  async init() {
    throw new Error('Not implemented: init()')
  }

  async getState() {
    throw new Error('Not implemented: getState()')
  }

  async resetState() {
    throw new Error('Not implemented: resetState()')
  }

  // --- Courses ---
  async listCourses() {
    throw new Error('Not implemented: listCourses()')
  }

  async getCourseById(_id) {
    throw new Error('Not implemented: getCourseById()')
  }

  async getCourseByOwner(_ownerId) {
    throw new Error('Not implemented: getCourseByOwner()')
  }

  async upsertCourse(_course) {
    throw new Error('Not implemented: upsertCourse()')
  }

  async deleteCourse(_id) {
    throw new Error('Not implemented: deleteCourse()')
  }

  // --- Check-in / Claims ---
  async recordCheckIn(_courseId) {
    throw new Error('Not implemented: recordCheckIn()')
  }

  async unlockCheckout(_courseId) {
    throw new Error('Not implemented: unlockCheckout()')
  }

  async recordCertificateClaim(_payload) {
    throw new Error('Not implemented: recordCertificateClaim()')
  }

  // --- DSR Accounts ---
  async listDsr() {
    throw new Error('Not implemented: listDsr()')
  }

  async getDsrById(_id) {
    throw new Error('Not implemented: getDsrById()')
  }

  async createDsr(_account) {
    throw new Error('Not implemented: createDsr()')
  }

  async updateDsr(_id, _patch) {
    throw new Error('Not implemented: updateDsr()')
  }

  async deleteDsr(_id) {
    throw new Error('Not implemented: deleteDsr()')
  }

  // --- Wallet ---
  async getWallet() {
    throw new Error('Not implemented: getWallet()')
  }

  async updateWalletCarrier(_carrier, _patch) {
    throw new Error('Not implemented: updateWalletCarrier()')
  }

  // --- Universal QR ---
  async getQrVersion() {
    throw new Error('Not implemented: getQrVersion()')
  }

  async setQrVersion(_version) {
    throw new Error('Not implemented: setQrVersion()')
  }
}
