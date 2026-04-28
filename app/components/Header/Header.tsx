'use client'

import { useApp } from '@/app/context/AppContext'
import { useClock } from '@/app/hooks/useClock'
import { type Language } from '@/app/lib/types'
import styles from './Header.module.css'

export function Header() {
  const { currentLang, setCurrentLang, weather } = useApp()
  const localTime = useClock()

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

      {weather ? (
        <div className={styles.weatherChip}>
          <span className={styles.weatherCity}>HOUSTON</span>
          <span className={styles.weatherTemp}>{weather.temp}°F</span>
          <span className={styles.weatherSep}>|</span>
          <span>
            {weather.rain1h > 0 ? (
              <span className={weather.rain1h > 10 ? styles.weatherRainHeavy : styles.weatherRainLight}>
                {weather.rain1h.toFixed(1)}mm/hr
              </span>
            ) : (
              'no rain'
            )}
          </span>
          <span className={styles.weatherSep}>|</span>
          <span>{weather.clouds}% cld</span>
          <span className={styles.weatherSep}>|</span>
          <span>{weather.description}</span>
        </div>
      ) : (
        <div className={styles.weatherLoading}>WEATHER ···</div>
      )}

      <div className={styles.meta}>
        <div>SENSORS: <b>47/47</b></div>
        <div>UPTIME: <b>99.97%</b></div>
        <div>LOCAL: <b>{localTime}</b></div>
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
