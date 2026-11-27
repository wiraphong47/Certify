import fs from 'node:fs/promises'
import path from 'node:path'
import { BaseRepository } from './baseRepository.js'
import { createSeedState } from './seed.js'

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * JSON-file implementation of BaseRepository.
 * Uses a serialized write queue + atomic temp-file rename so concurrent requests
 * never leave db.json half-written.
 */
export class JsonRepository extends BaseRepository {
  constructor(filePath) {
    super()
    this.filePath = filePath
    this.state = null
    this.writeQueue = Promise.resolve()
  }

  async init() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true })
    try {
      const raw = await fs.readFile(this.filePath, 'utf8')
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.courses) && Array.isArray(parsed.dsr) && parsed.wallet) {
        this.state = parsed
        return
      }
    } catch {
      // File missing or invalid -> seed fresh data below
    }
    this.state = createSeedState()
    await this._persist()
  }

  async _ensureLoaded() {
    if (!this.state) {
      await this.init()
    }
  }

  _persist() {
    const snapshot = JSON.stringify(this.state, null, 2)
    this.writeQueue = this.writeQueue.then(async () => {
      const tmpPath = `${this.filePath}.tmp`
      await fs.writeFile(tmpPath, snapshot, 'utf8')
      await fs.rename(tmpPath, this.filePath)
    })
    return this.writeQueue
  }

  async getState() {
    await this._ensureLoaded()
    return clone(this.state)
  }

  async resetState() {
    this.state = createSeedState()
    await this._persist()
    return clone(this.state)
  }

  // --- Courses ---
  async listCourses() {
    await this._ensureLoaded()
    return clone(this.state.courses)
  }

  async getCourseById(id) {
    await this._ensureLoaded()
    const found = this.state.courses.find((c) => Number(c.id) === Number(id))
    return found ? clone(found) : null
  }

  async getCourseByOwner(ownerId) {
    await this._ensureLoaded()
    const found = this.state.courses.find((c) => c.owner === ownerId)
    return found ? clone(found) : null
  }

  async upsertCourse(course) {
    await this._ensureLoaded()
    const record = clone(course)
    if (record.id) {
      const idx = this.state.courses.findIndex((c) => Number(c.id) === Number(record.id))
      if (idx >= 0) {
        this.state.courses[idx] = { ...this.state.courses[idx], ...record }
        await this._persist()
        return clone(this.state.courses[idx])
      }
    } else {
      record.id = Date.now()
      record.ci = record.ci || 0
      record.got = record.got || 0
      record.net = record.net || 0
    }
    this.state.courses.push(record)
    await this._persist()
    return clone(record)
  }

  async deleteCourse(id) {
    await this._ensureLoaded()
    const numId = Number(id)
    this.state.courses = this.state.courses.filter((c) => Number(c.id) !== numId)
    if (this.state.checkedIn && this.state.checkedIn[numId]) {
      delete this.state.checkedIn[numId]
    }
    await this._persist()
    return true
  }

  // --- Check-in / Claims ---
  async recordCheckIn(courseId) {
    await this._ensureLoaded()
    const numId = Number(courseId)
    const course = this.state.courses.find((c) => Number(c.id) === numId)
    if (!course) return null
    if (!this.state.checkedIn) this.state.checkedIn = {}
    if (!this.state.checkedIn[numId]) {
      this.state.checkedIn[numId] = { at: Date.now(), unlocked: false }
      course.ci = (course.ci || 0) + 1
    }
    await this._persist()
    return clone(course)
  }

  async unlockCheckout(courseId) {
    await this._ensureLoaded()
    const numId = Number(courseId)
    if (this.state.checkedIn && this.state.checkedIn[numId]) {
      this.state.checkedIn[numId].unlocked = true
      await this._persist()
    }
    return true
  }

  async recordCertificateClaim({ courseId, carrier, skipped }) {
    await this._ensureLoaded()
    const numId = Number(courseId)
    const course = this.state.courses.find((c) => Number(c.id) === numId)
    if (course) {
      course.got = (course.got || 0) + 1
      if (course.hasNet !== false && !skipped) {
        course.net = (course.net || 0) + 1
        if (
          carrier &&
          this.state.wallet[carrier] &&
          this.state.wallet[carrier].used < this.state.wallet[carrier].total
        ) {
          this.state.wallet[carrier].used += 1
        }
      }
      await this._persist()
    }
    return course ? clone(course) : null
  }

  // --- DSR Accounts ---
  async listDsr() {
    await this._ensureLoaded()
    return clone(this.state.dsr)
  }

  async getDsrById(id) {
    await this._ensureLoaded()
    const found = this.state.dsr.find((d) => d.id === id)
    return found ? clone(found) : null
  }

  async createDsr(account) {
    await this._ensureLoaded()
    const record = clone(account)
    this.state.dsr.push(record)
    await this._persist()
    return clone(record)
  }

  async updateDsr(id, patch) {
    await this._ensureLoaded()
    const target = this.state.dsr.find((d) => d.id === id)
    if (!target) return null
    Object.assign(target, patch)
    await this._persist()
    return clone(target)
  }

  async deleteDsr(id) {
    await this._ensureLoaded()
    this.state.dsr = this.state.dsr.filter((d) => d.id !== id)
    await this._persist()
    return true
  }

  // --- Wallet ---
  async getWallet() {
    await this._ensureLoaded()
    return clone(this.state.wallet)
  }

  async updateWalletCarrier(carrier, patch) {
    await this._ensureLoaded()
    const target = this.state.wallet[carrier]
    if (!target) return null
    Object.assign(target, patch)
    await this._persist()
    return clone(target)
  }

  // --- Universal QR ---
  async getQrVersion() {
    await this._ensureLoaded()
    return this.state.qrVersion || 1
  }

  async setQrVersion(version) {
    await this._ensureLoaded()
    this.state.qrVersion = Number(version) || 1
    await this._persist()
    return this.state.qrVersion
  }
}
