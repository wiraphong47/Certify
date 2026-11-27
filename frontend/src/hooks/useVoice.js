import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  initVoiceUnlock,
  isSpeechRecognitionSupported,
  isVoiceEnabled,
  setVoiceEnabled,
  speakText,
  startListening,
  stopAllVoice,
  stopListen,
  unlockVoiceEngine,
} from '../services/voiceService'

export function useVoice() {
  const [autoVoice, setAutoVoiceState] = useState(() => isVoiceEnabled())
  const [listening, setListening] = useState(false)

  useEffect(() => {
    initVoiceUnlock()
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

  const listen = useCallback(({ onResult, onInterim, onError, onStatus }) => {
    const started = startListening({
      onResult: (transcript) => {
        setListening(false)
        if (onResult) onResult(transcript)
      },
      onInterim,
      onError: (err) => {
        setListening(false)
        if (onError) onError(err)
      },
      onEnd: () => {
        setListening(false)
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
      unlockVoiceEngine()
      if (announcement) {
        speakText(announcement, { promptKey })
      }
    } else {
      setListening(false)
      stopAllVoice()
    }
  }, [])

  const speechSupported = isSpeechRecognitionSupported()

  return useMemo(
    () => ({
      autoVoice,
      setAutoVoice,
      listening,
      speechSupported,
      speak,
      listen,
      stop,
      stopMic,
      toggleAutoVoice,
    }),
    [
      autoVoice,
      listen,
      listening,
      setAutoVoice,
      speak,
      speechSupported,
      stop,
      stopMic,
      toggleAutoVoice,
    ],
  )
}
