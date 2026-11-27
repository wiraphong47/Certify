import { useCallback, useEffect, useState } from 'react'
import {
  isSpeechRecognitionSupported,
  isVoiceEnabled,
  setVoiceEnabled,
  speakText,
  startListening,
  stopAllVoice,
  stopListen,
} from '../services/voiceService'

export function useVoice() {
  const [autoVoice, setAutoVoiceState] = useState(() => isVoiceEnabled())
  const [listening, setListening] = useState(false)

  useEffect(() => {
    return () => {
      stopAllVoice()
    }
  }, [])

  const setAutoVoice = useCallback((nextVal) => {
    const enabled = Boolean(nextVal)
    setVoiceEnabled(enabled)
    if (!enabled) setListening(false)
    setAutoVoiceState(enabled)
  }, [])

  const speak = useCallback((text, options = {}) => {
    setListening(false)
    return speakText(text, options)
  }, [])

  const stop = useCallback(() => {
    setListening(false)
    stopAllVoice()
  }, [])

  const stopMic = useCallback(() => {
    setListening(false)
    stopListen()
  }, [])

  const listen = useCallback(({ onResult, onError, onStatus }) => {
    const started = startListening({
      onResult: (transcript) => {
        setListening(false)
        if (onResult) onResult(transcript)
      },
      onError: (err) => {
        setListening(false)
        if (onError) onError(err)
      },
      onStatus,
    })
    setListening(started)
    return started
  }, [])

  const toggleAutoVoice = useCallback((announcement, promptKey = '') => {
    const next = !isVoiceEnabled()
    setVoiceEnabled(next)
    setAutoVoiceState(next)
    if (next) {
      if (announcement) {
        speakText(announcement, { promptKey })
      }
    } else {
      setListening(false)
      stopAllVoice()
    }
  }, [])

  return {
    autoVoice,
    setAutoVoice,
    listening,
    speechSupported: isSpeechRecognitionSupported(),
    speak,
    listen,
    stop,
    stopMic,
    toggleAutoVoice,
  }
}
