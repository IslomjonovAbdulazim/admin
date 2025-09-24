import { useState, useEffect, useCallback } from 'react'

interface UseCountdownProps {
  initialTime: number
  onComplete?: () => void
}

export function useCountdown({ initialTime, onComplete }: UseCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isActive, setIsActive] = useState(false)

  const start = useCallback((time?: number) => {
    const startTime = time ?? initialTime
    setTimeLeft(startTime)
    setIsActive(true)
  }, [initialTime])

  const stop = useCallback(() => {
    setIsActive(false)
    setTimeLeft(0)
  }, [])

  const reset = useCallback(() => {
    setIsActive(false)
    setTimeLeft(initialTime)
  }, [initialTime])

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (isActive && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false)
            onComplete?.()
            return 0
          }
          return time - 1000
        })
      }, 1000)
    }

    return () => clearInterval(intervalId)
  }, [isActive, timeLeft, onComplete])

  const formatTime = useCallback((milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${remainingSeconds}s`
  }, [])

  return {
    timeLeft,
    isActive,
    start,
    stop,
    reset,
    formatTime: () => formatTime(timeLeft),
  }
}