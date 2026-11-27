/**
 * Hybrid Voice Service (Static MP3 clips + Web Speech API TTS/STT)
 * - Master mute gate (`voiceEnabled`) guarantees 100% silence across every screen
 *   whenever the user toggles voice OFF, and cancels active TTS/Audio/Mic immediately.
 * - Cross-platform iOS + Android + Desktop support:
 *   synchronous speechSynthesis.speak() inside user gestures (no blank-primer poisoning),
 *   AudioContext wake on first gesture, utterance GC guard, and onEnd safety net.
 * - Static prompts can optionally be placed in `public/audio/th/<promptKey>.mp3`.
 * - Dynamic prompts or missing clips automatically fall back to Web Speech API.
 */

const AUDIO_BASE = `${import.meta.env.BASE_URL}audio/th/`

const AUDIO_CLIP_MAP = {
  scan: `${AUDIO_BASE}scan.mp3`,
  scan_loading: `${AUDIO_BASE}scan_loading.mp3`,
  scan_gallery: `${AUDIO_BASE}scan_gallery.mp3`,
  scan_ok: `${AUDIO_BASE}scan_ok.mp3`,
  thaid: `${AUDIO_BASE}thaid.mp3`,
  checkin: `${AUDIO_BASE}checkin.mp3`,
  checkout: `${AUDIO_BASE}checkout.mp3`,
  checkout_general: `${AUDIO_BASE}checkout_general.mp3`,
  checkout_wait: `${AUDIO_BASE}checkout_wait.mp3`,
  phone: `${AUDIO_BASE}phone.mp3`,
  phone_edit: `${AUDIO_BASE}phone_edit.mp3`,
  carrier_intro: `${AUDIO_BASE}carrier_intro.mp3`,
  cert: `${AUDIO_BASE}cert.mp3`,
}

const missingClips = new Set()
let voiceEnabled = true
let activeRec = null
let activeAudio = null
let currentUtterance = null
let speechOnEndFallbackTimer = null
let voiceEngineUnlocked = false
let unlockListenersAttached = false
let spkId = 0

export function unlockVoiceEngine() {
  if (typeof window === 'undefined') return

  if (!voiceEngineUnlocked) {
    voiceEngineUnlocked = true
    // Wake Web Audio session silently without poisoning the speechSynthesis queue
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {})
        }
        const buffer = ctx.createBuffer(1, 1, 22050)
        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.connect(ctx.destination)
        source.start(0)
        setTimeout(() => {
          try {
            ctx.close()
          } catch {
            // ignore
          }
        }, 250)
      }
    } catch {
      // ignore
    }
  }

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.getVoices()
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      }
    } catch {
      // ignore
    }
  }
}

export function initVoiceUnlock() {
  if (typeof window === 'undefined' || unlockListenersAttached) return
  unlockListenersAttached = true

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.getVoices()
    } catch {
      // ignore
    }
  }

  const events = ['touchstart', 'touchend', 'pointerdown', 'click', 'keydown']
  const onFirstGesture = () => {
    unlockVoiceEngine()
    for (const evt of events) {
      window.removeEventListener(evt, onFirstGesture, true)
    }
  }

  for (const evt of events) {
    window.addEventListener(evt, onFirstGesture, { capture: true, passive: true })
  }
}

function clearSpeechTimers() {
  if (speechOnEndFallbackTimer) {
    clearTimeout(speechOnEndFallbackTimer)
    speechOnEndFallbackTimer = null
  }
}

function stopAudioClip() {
  if (activeAudio) {
    try {
      activeAudio.onplaying = null
      activeAudio.onended = null
      activeAudio.onerror = null
      activeAudio.pause()
      activeAudio.currentTime = 0
    } catch {
      // ignore
    }
    activeAudio = null
  }
}

export function stopListen() {
  if (activeRec) {
    try {
      activeRec.onresult = null
      activeRec.onerror = null
      activeRec.onend = null
      activeRec.abort()
    } catch {
      // ignore
    }
    activeRec = null
  }
}

export function stopAllVoice() {
  stopListen()
  stopAudioClip()
  clearSpeechTimers()
  currentUtterance = null
  spkId += 1
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // ignore
    }
  }
}

export function isVoiceEnabled() {
  return voiceEnabled
}

export function setVoiceEnabled(enabled) {
  voiceEnabled = Boolean(enabled)
  if (!voiceEnabled) {
    stopAllVoice()
  }
  return voiceEnabled
}

function speakWithSynthesis(text, myId, onEnd, callbacks = {}) {
  const { onStart, onBlocked } = callbacks
  clearSpeechTimers()

  if (!voiceEnabled) {
    if (onEnd && myId === spkId) setTimeout(onEnd, 0)
    return
  }
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd && myId === spkId) setTimeout(onEnd, 0)
    return
  }

  try {
    const synth = window.speechSynthesis
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'th-TH'
    utterance.rate = 0.8
    utterance.volume = 1

    // Keep strong module reference so Safari/Chrome cannot GC utterance mid-speech
    currentUtterance = utterance

    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      clearSpeechTimers()
      if (currentUtterance === utterance) {
        currentUtterance = null
      }
      if (onEnd && myId === spkId && voiceEnabled) onEnd()
    }

    utterance.onstart = () => {
      if (myId === spkId && voiceEnabled && onStart) onStart()
    }
    utterance.onend = finish
    utterance.onerror = (event) => {
      if (event?.error === 'not-allowed' && myId === spkId && onBlocked) {
        onBlocked()
      }
      finish()
    }

    // Call speak() synchronously inside user gesture (do NOT wrap in setTimeout)
    if (synth.speaking || synth.pending) {
      synth.cancel()
    }
    if (synth.paused) {
      synth.resume()
    }
    synth.speak(utterance)

    if (onEnd) {
      const maxMs = Math.min(16000, Math.max(3000, String(text || '').length * 160 + 2000))
      speechOnEndFallbackTimer = setTimeout(finish, maxMs)
    }
  } catch {
    if (onEnd && myId === spkId && voiceEnabled) onEnd()
  }
}

export function speakText(text, options = {}) {
  const {
    promptKey = '',
    onStart,
    onEnd,
    onBlocked,
    allowSynthFallbackOnBlocked = true,
  } = options
  stopListen()
  stopAudioClip()
  clearSpeechTimers()

  // Hard master mute gate: never emit sound when muted
  if (!voiceEnabled) {
    return false
  }

  const myId = ++spkId

  const clipUrl = promptKey ? AUDIO_CLIP_MAP[promptKey] : ''
  if (clipUrl && !missingClips.has(clipUrl) && typeof Audio !== 'undefined') {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel()
        } catch {
          // ignore
        }
      }
      const audio = new Audio(clipUrl)
      activeAudio = audio
      audio.onplaying = () => {
        if (myId === spkId && voiceEnabled && onStart) onStart()
      }
      audio.onended = () => {
        if (activeAudio === audio) activeAudio = null
        if (onEnd && myId === spkId && voiceEnabled) onEnd()
      }
      audio.onerror = () => {
        if (activeAudio === audio) activeAudio = null
        missingClips.add(clipUrl)
        if (myId === spkId && voiceEnabled) {
          speakWithSynthesis(text, myId, onEnd, { onStart, onBlocked })
        }
      }
      const playPromise = audio.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err) => {
          if (activeAudio === audio) activeAudio = null
          const errName = String(err?.name || '')
          if (errName === 'AbortError') {
            return
          }
          if (errName === 'NotAllowedError') {
            if (myId !== spkId || !voiceEnabled) return
            if (allowSynthFallbackOnBlocked) {
              speakWithSynthesis(text, myId, onEnd, { onStart, onBlocked })
            } else if (onBlocked) {
              onBlocked()
            }
            return
          }
          missingClips.add(clipUrl)
          if (myId === spkId && voiceEnabled) {
            speakWithSynthesis(text, myId, onEnd, { onStart, onBlocked })
          }
        })
      }
      return true
    } catch {
      missingClips.add(clipUrl)
    }
  }

  speakWithSynthesis(text, myId, onEnd, { onStart, onBlocked })
  return true
}

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function startListening({ onResult, onInterim, onError, onEnd, onStatus }) {
  stopListen()
  stopAudioClip()
  clearSpeechTimers()

  const SR =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null

  if (!SR) {
    const msg = 'เครื่องนี้ไม่รองรับการฟังเสียง ใช้ปุ่มทดลองหรือกดตัวเลขแทน'
    if (onStatus) onStatus(msg)
    if (onError) onError(msg)
    return false
  }

  try {
    spkId += 1
    currentUtterance = null
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    const rec = new SR()
    activeRec = rec
    rec.lang = 'th-TH'
    rec.interimResults = true
    rec.continuous = false
    rec.maxAlternatives = 1

    let delivered = false
    let latestInterim = ''

    rec.onresult = (event) => {
      if (activeRec !== rec) return
      let finalText = ''
      let interimText = ''

      for (let i = 0; i < event.results.length; i += 1) {
        const res = event.results[i]
        const text = res?.[0]?.transcript ?? ''
        if (res.isFinal) {
          finalText += `${text} `
        } else {
          interimText += `${text} `
        }
      }

      const trimmedFinal = finalText.trim()
      const trimmedInterim = interimText.trim()

      if (trimmedInterim) {
        latestInterim = trimmedInterim
        if (onInterim) onInterim(trimmedInterim)
        else if (onStatus) onStatus(`กำลังฟัง: "${trimmedInterim}"`)
      }

      if (trimmedFinal) {
        delivered = true
        activeRec = null
        try {
          rec.stop()
        } catch {
          // ignore
        }
        if (onResult) onResult(trimmedFinal)
      }
    }

    rec.onerror = (event) => {
      if (activeRec !== rec) return
      activeRec = null
      const code = String(event?.error || '')
      if (code === 'aborted') {
        if (onEnd) onEnd()
        return
      }

      let msg = 'ไม่ได้ยิน ลองแตะไมค์อีกครั้ง'
      let speechMsg = 'ไม่ได้ยิน ลองอีกครั้ง'

      if (code === 'not-allowed' || code === 'service-not-allowed') {
        msg = 'ยังไม่ได้อนุญาตสิทธิ์ไมโครโฟน กรุณากดอนุญาตไมค์ที่เบราว์เซอร์'
        speechMsg = ''
      } else if (code === 'audio-capture') {
        msg = 'ไม่พบไมโครโฟนในอุปกรณ์นี้ กดปุ่มตัวเลขด้านล่างแทนได้'
        speechMsg = ''
      } else if (code === 'language-not-supported') {
        msg = 'เครื่องนี้ไม่รองรับการรับฟังเสียงภาษาไทย กดปุ่มตัวเลขด้านล่างแทนได้'
        speechMsg = ''
      } else if (code === 'network') {
        msg = 'เชื่อมต่อระบบรับฟังเสียงไม่ได้ กดปุ่มตัวเลขด้านล่างแทนได้'
        speechMsg = ''
      }

      delivered = true
      if (onStatus) onStatus(msg)
      if (onError) onError(msg)
      if (voiceEnabled && speechMsg) {
        speakText(speechMsg)
      }
    }

    rec.onend = () => {
      if (activeRec === rec) {
        activeRec = null
        if (!delivered && latestInterim) {
          delivered = true
          if (onResult) onResult(latestInterim)
          return
        }
        if (!delivered && onStatus) {
          onStatus('ไม่ได้ยิน ลองแตะไมค์อีกครั้ง')
        }
        if (onEnd) onEnd()
      }
    }

    rec.start()
    if (onStatus) onStatus('กำลังฟัง พูดตัวเลขได้เลย...')
    return true
  } catch {
    activeRec = null
    const msg = 'เปิดไมค์ไม่ได้ ใช้ปุ่มทดลองหรือกดตัวเลขแทน'
    if (onStatus) onStatus(msg)
    if (onError) onError(msg)
    return false
  }
}

export function getAudioClipMap() {
  return { ...AUDIO_CLIP_MAP }
}
