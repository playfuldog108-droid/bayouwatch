'use client'

import { useApp } from '@/app/context/AppContext'
import { t } from '@/app/lib/i18n'
import { NEIGHBORHOODS } from '@/app/lib/data'
import type { ViewId } from '@/app/lib/types'
import styles from './Sidebar.module.css'

const NAV_ITEMS: { view: ViewId; labelKey: string; icon: string }[] = [
  {
    view: 'dashboard',
    labelKey: 'dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    view: 'map',
    labelKey: 'liveMap',
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  },
  {
    view: 'lookup',
    labelKey: 'checkAddress',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  },
  {
    view: 'simulation',
    labelKey: 'simulation',
    icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    view: 'settings',
    labelKey: 'settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M12 15a3 3 0 100-6 3 3 0 000 6z',
  },
  {
    view: 'about',
    labelKey: 'about',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
]

export function Sidebar() {
  const { currentView, setCurrentView, currentLang, sensors } = useApp()

  function getNeighborhoodStatus(nhX: number, nhY: number) {
    const nearby = sensors.filter(s => {
      const dx = s.x - nhX
      const dy = s.y - nhY
      return Math.sqrt(dx * dx + dy * dy) < 100
    })
    const avg = nearby.length
      ? nearby.reduce((a, s) => a + s.level, 0) / nearby.length
      : 30
    return { avg, count: nearby.length }
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.navSection}>
        <div className={styles.navLabel}>{t(currentLang, 'watchlist').replace('Watchlist', 'Navigation')}</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.view}
            className={`${styles.navItem} ${currentView === item.view ? styles.active : ''}`}
            onClick={() => setCurrentView(item.view)}
          >
            <svg
              className={styles.navIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            >
              <path d={item.icon} />
            </svg>
            <span>{t(currentLang, item.labelKey)}</span>
          </button>
        ))}
      </div>

      <div className={styles.navSection}>
        <div className={styles.navLabel}>{t(currentLang, 'watchlist')}</div>
        {NEIGHBORHOODS.map(n => {
          const { avg, count } = getNeighborhoodStatus(n.x, n.y)
          const isAlert = avg > 80
          const isWatch = avg > 60
          const status = isAlert ? 'ALERT' : isWatch ? 'WATCH' : 'SAFE'
          const statusClass = isAlert
            ? styles.statusAlert
            : isWatch
            ? styles.statusWatch
            : styles.statusSafe
          const fillColor = isAlert
            ? 'var(--accent-red)'
            : isWatch
            ? 'var(--accent-amber)'
            : '#2a4a6b'
          return (
            <div
              key={n.id}
              className={`${styles.nhCard} ${isAlert ? styles.nhCardAlert : ''}`}
            >
              <div className={styles.nhName}>
                {n.name}
                <span className={`${styles.nhStatus} ${statusClass}`}>{status}</span>
              </div>
              <div className={styles.nhMeter}>
                <div
                  className={styles.nhMeterFill}
                  style={{ width: `${avg}%`, background: fillColor }}
                />
              </div>
              <div className={styles.nhReadout}>
                <span>{count} sensors</span>
                <span>{avg.toFixed(0)}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
