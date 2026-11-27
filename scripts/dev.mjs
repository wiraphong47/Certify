import { spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'
const npmCmd = isWindows ? 'npm.cmd' : 'npm'

const procs = [
  spawn(npmCmd, ['--prefix', 'backend', 'run', 'dev'], { stdio: 'inherit', shell: isWindows }),
  spawn(npmCmd, ['--prefix', 'frontend', 'run', 'dev'], { stdio: 'inherit', shell: isWindows }),
]

let shuttingDown = false
function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of procs) {
    try {
      if (!child.killed) {
        child.kill('SIGTERM')
      }
    } catch {
      // ignore
    }
  }
  process.exit(code)
}

for (const child of procs) {
  child.on('exit', (code) => {
    if (!shuttingDown && code && code !== 0) {
      shutdown(code)
    }
  })
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
