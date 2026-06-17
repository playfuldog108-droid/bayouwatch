'use client'

import { useApp } from '@/app/context/AppContext'
import { useClock } from '@/app/hooks/useClock'
import type { ViewId } from '@/app/lib/types'
import styles from './Header.module.css'

const NAV_ITEMS: { view: ViewId; label: string }[] = [
  { view: 'dashboard',  label: 'Dashboard' },
  { view: 'map',        label: 'Live Map' },
  { view: 'lookup',     label: 'Check My Address' },
  { view: 'simulation', label: 'Harvey Simulation' },
  { view: 'settings',   label: 'Settings' },
  { view: 'about',      label: 'About' },
]

export function Header() {
  const { sensors, currentView, setCurrentView } = useApp()
  const localTime = useClock()
  const onlineCount = sensors.length || 47

  return (
    <header className={styles.header}>
      <div className={styles.wordmark}>BAYOUWATCH</div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.view}
            className={`${styles.navLink} ${currentView === item.view ? styles.active : ''}`}
            onClick={() => setCurrentView(item.view)}
          >
            {item.label}
            {currentView === item.view && <span className={styles.activeDot} />}
          </button>
        ))}
      </nav>

      <div className={styles.right}>
        <span className={styles.statusDot} />
        <span className={styles.statusText}>{onlineCount} ONLINE</span>
        <span className={styles.sep} />
        <span className={styles.clock}>{localTime}</span>
      </div>
    </header>
  )
}
