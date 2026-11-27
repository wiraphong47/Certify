/**
 * Hybrid Voice Service (Static MP3 clips + Web Speech API TTS/STT)
 * - Master mute gate (`voiceEnabled`) guarantees 100% silence across every screen
 *   whenever the user toggles voice OFF, and cancels active TTS/Audio/Mic immediately.
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
let spkId = 0

function stopAudioClip() {
  if (activeAudio) {
    try {
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

function speakWithSynthesis(text, myId, onEnd) {
  if (!voiceEnabled) {
    if (onEnd && myId === spkId) setTimeout(onEnd, 0)
    return
  }
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd && myId === spkId) setTimeout(onEnd, 0)
    return
  }
  try {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'th-TH'
    utterance.rate = 0.75
    if (onEnd) {
      utterance.onend = () => {
        if (myId === spkId && voiceEnabled) onEnd()
      }
      utterance.onerror = () => {
        if (myId === spkId && voiceEnabled) onEnd()
      }
    }
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  } catch {
    if (onEnd && myId === spkId && voiceEnabled) onEnd()
  }
}

export function speakText(text, options = {}) {
  const { promptKey = '', onEnd } = options
  stopListen()
  stopAudioClip()

  // Hard master mute gate: never emit sound when muted
  if (!voiceEnabled) {
    return false
  }

  const myId = ++spkId

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // ignore
    }
  }

  const clipUrl = promptKey ? AUDIO_CLIP_MAP[promptKey] : ''
  if (clipUrl && !missingClips.has(clipUrl) && typeof Audio !== 'undefined') {
    try {
      const audio = new Audio(clipUrl)
      activeAudio = audio
      audio.onended = () => {
        if (activeAudio === audio) activeAudio = null
        if (onEnd && myId === spkId && voiceEnabled) onEnd()
      }
      audio.onerror = () => {
        if (activeAudio === audio) activeAudio = null
        missingClips.add(clipUrl)
        if (myId === spkId && voiceEnabled) {
          speakWithSynthesis(text, myId, onEnd)
        }
      }
      const playPromise = audio.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          if (activeAudio === audio) activeAudio = null
          missingClips.add(clipUrl)
          if (myId === spkId && voiceEnabled) {
            speakWithSynthesis(text, myId, onEnd)
          }
        })
      }
      return true
    } catch {
      missingClips.add(clipUrl)
    }
  }

  speakWithSynthesis(text, myId, onEnd)
  return true
}

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export function startListening({ onResult, onError, onStatus }) {
  stopListen()
  stopAudioClip()

  const SR =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null

  if (!SR) {
    const msg = 'เครื่องนี้ไม่รองรับการฟังเสียง ใช้ปุ่มทดลองหรือพิมพ์แทน'
    if (onStatus) onStatus(msg)
    if (onError) onError(msg)
    return false
  }

  try {
    spkId += 1
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }

    const rec = new SR()
    activeRec = rec
    rec.lang = 'th-TH'
    rec.interimResults = false
    rec.maxAlternatives = 1

    rec.onresult = (event) => {
      if (activeRec !== rec) return
      activeRec = null
      const transcript = event?.results?.[0]?.[0]?.transcript ?? ''
      if (onResult) onResult(transcript)
    }

    rec.onerror = () => {
      if (activeRec !== rec) return
      activeRec = null
      const msg = 'ไม่ได้ยิน ลองแตะไมค์อีกครั้ง'
      if (onStatus) onStatus(msg)
      if (onError) onError(msg)
      if (voiceEnabled) {
        speakText('ไม่ได้ยิน ลองอีกครั้ง')
      }
    }

    rec.onend = () => {
      if (activeRec === rec) {
        activeRec = null
      }
    }

    rec.start()
    if (onStatus) onStatus('กำลังฟัง พูดได้เลย')
    return true
  } catch {
    activeRec = null
    const msg = 'เปิดไมค์ไม่ได้ ใช้ปุ่มทดลองหรือพิมพ์แทน'
    if (onStatus) onStatus(msg)
    if (onError) onError(msg)
    return false
  }
}

export function getAudioClipMap() {
  return { ...AUDIO_CLIP_MAP }
}
