'use client'
import { useState, useEffect } from 'react'

export function useClock(): string {
  const [time, setTime] = useState('--:--:--')
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString())
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}
