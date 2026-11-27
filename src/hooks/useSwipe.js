import { useCallback, useRef, useState } from 'react'

export function useSwipe({ onSwipeRight, onSwipeLeft, threshold = 70 }) {
  const [dx, setDx] = useState(0)
  const startRef = useRef({ x: 0, y: 0, active: false })
  const lastSwipeAtRef = useRef(0)

  const onPointerDown = useCallback((e) => {
    startRef.current = { x: e.clientX, y: e.clientY, active: true }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // ignore pointer capture issues
    }
  }, [])

  const onPointerMove = useCallback((e) => {
    if (!startRef.current.active) return
    const deltaX = e.clientX - startRef.current.x
    const deltaY = e.clientY - startRef.current.y
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setDx(deltaX)
    }
  }, [])

  const reset = useCallback(() => {
    startRef.current.active = false
    setDx(0)
  }, [])

  const onPointerUp = useCallback(
    (e) => {
      if (!startRef.current.active) return
      const deltaX = e.clientX - startRef.current.x
      const deltaY = e.clientY - startRef.current.y
      startRef.current.active = false
      setDx(0)

      if (Math.abs(deltaX) > threshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        lastSwipeAtRef.current = Date.now()
        if (deltaX > 0) {
          if (onSwipeRight) onSwipeRight()
        } else if (onSwipeLeft) {
          onSwipeLeft()
        }
      }
    },
    [onSwipeLeft, onSwipeRight, threshold],
  )

  const guardTap = useCallback((fn) => {
    if (Date.now() - lastSwipeAtRef.current < 500) return
    if (fn) fn()
  }, [])

  const progress = Math.min(1, Math.abs(dx) / threshold)
  const readyDir = dx > threshold ? 'right' : dx < -threshold ? 'left' : ''
  const clampedTranslate = Math.max(-110, Math.min(110, dx / 2))

  return {
    dx,
    progress,
    readyDir,
    clampedTranslate,
    guardTap,
    bindHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: reset,
    },
  }
}
