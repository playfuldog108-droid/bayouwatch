'use client'

import { useApp } from '@/app/context/AppContext'
import { useClock } from '@/app/hooks/useClock'
import styles from './Header.module.css'

export function Header() {
  const { sensors } = useApp()
  const localTime = useClock()
  const onlineCount = sensors.length || 47

  return (
    <header className={styles.header}>
      <div className={styles.wordmark}>BAYOUWATCH</div>
      <div className={styles.center}>
        <span className={styles.statusDot} />
        <span className={styles.statusText}>{onlineCount} SENSORS ONLINE</span>
      </div>
      <div className={styles.clock}>{localTime}</div>
    </header>
  )
}
