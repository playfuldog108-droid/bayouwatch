'use client'

import { useApp } from '@/app/context/AppContext'
import styles from './CrisisBanner.module.css'

export function CrisisBanner() {
  const { crisisBanner, dismissCrisisBanner } = useApp()

  if (!crisisBanner.show) return null

  return (
    <div className={styles.banner}>
      <div className={styles.icon}>⚠</div>
      <div className={styles.text}>{crisisBanner.text}</div>
      <div className={styles.time}>{crisisBanner.timeLabel}</div>
      <button className={styles.close} onClick={dismissCrisisBanner}>×</button>
    </div>
  )
}
