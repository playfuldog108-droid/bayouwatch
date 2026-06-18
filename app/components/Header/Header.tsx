'use client'

import { useRef, useState, useEffect } from 'react'
import { useApp } from '@/app/context/AppContext'
import { t } from '@/app/lib/i18n'
import { useClock } from '@/app/hooks/useClock'
import type { Language, ViewId } from '@/app/lib/types'
import styles from './Header.module.css'

const NAV_ITEMS: { view: ViewId; labelKey: string }[] = [
  { view: 'dashboard',  labelKey: 'dashboard' },
  { view: 'map',        labelKey: 'liveMap' },
  { view: 'lookup',     labelKey: 'checkAddress' },
  { view: 'simulation', labelKey: 'simulation' },
  { view: 'settings',   labelKey: 'settings' },
  { view: 'about',      labelKey: 'about' },
]

const LANGS: { code: Language; label: string; short: string }[] = [
  { code: 'en', label: 'English',     short: 'EN' },
  { code: 'es', label: 'Español',     short: 'ES' },
  { code: 'vi', label: 'Tiếng Việt',  short: 'VI' },
  { code: 'zh', label: '中文',        short: 'ZH' },
  { code: 'ar', label: 'العربية',     short: 'AR' },
]

export function Header() {
  const { sensors, currentView, setCurrentView, currentLang, setCurrentLang } = useApp()
  const localTime = useClock()
  const onlineCount = sensors.length || 47
  const [langOpen, setLangOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!langOpen) return
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [langOpen])

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
            {t(currentLang, item.labelKey)}
            {currentView === item.view && <span className={styles.activeDot} />}
          </button>
        ))}
      </nav>

      <div className={styles.right}>
        <div className={styles.langPicker} ref={pickerRef}>
          <button
            className={styles.langBtn}
            onClick={() => setLangOpen(o => !o)}
            aria-label="Select language"
          >
            <span className={styles.langGlobe}>⚬</span>
            <span className={styles.langCode}>{currentLang.toUpperCase()}</span>
            <span className={`${styles.langChevron} ${langOpen ? styles.langChevronOpen : ''}`}>▾</span>
          </button>
          {langOpen && (
            <div className={styles.langDropdown}>
              {LANGS.map(l => (
                <button
                  key={l.code}
                  className={`${styles.langOption} ${currentLang === l.code ? styles.langOptionActive : ''}`}
                  onClick={() => { setCurrentLang(l.code); setLangOpen(false) }}
                >
                  <span className={styles.langOptionShort}>{l.short}</span>
                  <span className={styles.langOptionLabel}>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <span className={styles.sep} />
        <span className={styles.statusDot} />
        <span className={styles.statusText}>{onlineCount} ONLINE</span>
        <span className={styles.sep} />
        <span className={styles.clock}>{localTime}</span>
      </div>
    </header>
  )
}
