'use client'
import { useState, useEffect } from 'react'

export function useClock(): string {
  const [time, setTime] = useState('--:--:--')
  useEffect(() => {
    const update = () => setTime(new Date().toUTCString().slice(17, 25))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}
