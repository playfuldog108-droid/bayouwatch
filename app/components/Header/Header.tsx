'use client'

import { useApp } from '@/app/context/AppContext'
import { useClock } from '@/app/hooks/useClock'
import { type Language } from '@/app/lib/types'
import styles from './Header.module.css'

export function Header() {
  const { currentLang, setCurrentLang } = useApp()
  const utcTime = useClock()

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoMark} />
        <div className={styles.logoText}>
          Bayou<span>Watch</span>
        </div>
      </div>
      <div className={styles.systemStatus}>
        <div className={styles.pulseDot} />
        <span>SYSTEM ONLINE</span>
      </div>
      <div className={styles.spacer} />
      <div className={styles.meta}>
        <div>SENSORS: <b>47/47</b></div>
        <div>UPTIME: <b>99.97%</b></div>
        <div>UTC: <b>{utcTime}</b></div>
      </div>
      <select
        className={styles.langSelect}
        value={currentLang}
        onChange={e => setCurrentLang(e.target.value as Language)}
      >
        <option value="en">EN — English</option>
        <option value="es">ES — Español</option>
        <option value="vi">VI — Tiếng Việt</option>
        <option value="zh">ZH — 中文</option>
        <option value="ar">AR — العربية</option>
      </select>
    </header>
  )
}
