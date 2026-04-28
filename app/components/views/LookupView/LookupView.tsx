'use client'

import { useState } from 'react'
import { useApp } from '@/app/context/AppContext'
import { t } from '@/app/lib/i18n'
import { NEIGHBORHOODS } from '@/app/lib/data'
import styles from './LookupView.module.css'

interface LookupResult {
  status: 'safe' | 'watch' | 'alert'
  neighborhood: string
  avgLevel: number
  sensorCount: number
}

export function LookupView({ active }: { active: boolean }) {
  const { sensors, currentLang, setRegisteredAddress } = useApp()
  const [address, setAddress] = useState('')
  const [result, setResult] = useState<LookupResult | null>(null)

  function runLookup(addr: string) {
    if (!addr.trim()) return
    setRegisteredAddress(addr)

    const lower = addr.toLowerCase()
    let nh = NEIGHBORHOODS.find(n => lower.includes(n.name.toLowerCase()))
    if (!nh) nh = NEIGHBORHOODS[Math.floor(Math.random() * NEIGHBORHOODS.length)]!

    const nearby = sensors.filter(s => {
      const dx = s.x - nh!.x
      const dy = s.y - nh!.y
      return Math.sqrt(dx * dx + dy * dy) < 100
    })
    const avg = nearby.length
      ? nearby.reduce((a, s) => a + s.level, 0) / nearby.length
      : 30

    const status: LookupResult['status'] = avg > 80 ? 'alert' : avg > 60 ? 'watch' : 'safe'
    setResult({ status, neighborhood: nh!.name, avgLevel: avg, sensorCount: nearby.length })
  }

  return (
    <div className={`${styles.view} ${active ? styles.active : ''}`}>
      <div className={styles.viewHeader}>
        <div>
          <h1 className={styles.viewTitle}>{t(currentLang, 'lookupTitle')}</h1>
          <p className={styles.viewSubtitle}>{t(currentLang, 'lookupSub')}</p>
        </div>
      </div>

      <div className={styles.lookupCard}>
        <label className={styles.inputLabel}>{t(currentLang, 'enterAddress')}</label>
        <input
          type="text"
          className={styles.input}
          placeholder="e.g., 4200 Lockwood Dr, Kashmere Gardens"
          value={address}
          onChange={e => setAddress(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && runLookup(address)}
        />
        <button className={styles.button} onClick={() => runLookup(address)}>
          {t(currentLang, 'checkRisk')}
        </button>

        {result && (
          <div className={styles.resultBox}>
            <div className={`${styles.resultStatus} ${styles[result.status]}`}>
              {result.status === 'alert' ? '⚠ FLOOD ALERT' : result.status === 'watch' ? '◐ WATCH' : '✓ SAFE'}
            </div>
            <p className={styles.resultDetail}>
              <strong>{result.neighborhood}</strong> is at{' '}
              <strong style={{ color: result.status === 'alert' ? 'var(--accent-red)' : result.status === 'watch' ? 'var(--accent-amber)' : 'var(--accent-green)' }}>
                {result.avgLevel.toFixed(0)}% capacity
              </strong>
              {result.status === 'alert' && '. Flooding likely within 30–60 minutes. '}
              {result.status === 'watch' && `. Monitor conditions. ${result.sensorCount} nearby sensors reporting.`}
              {result.status === 'safe' && `. All ${result.sensorCount} nearby sensors reporting normal water levels.`}
            </p>
            <div className={styles.resultActions}>
              {result.status === 'alert' && (
                <div className={styles.actionGrid}>
                  <button className={`${styles.button} ${styles.buttonDanger}`}>View Evacuation Routes</button>
                  <button className={`${styles.button} ${styles.buttonSecondary}`}>Subscribe to SMS</button>
                </div>
              )}
              {result.status === 'watch' && (
                <button className={`${styles.button} ${styles.buttonAmber}`}>Subscribe to Alerts</button>
              )}
              {result.status === 'safe' && (
                <button className={`${styles.button} ${styles.buttonSecondary}`}>Subscribe to Future Alerts</button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>{t(currentLang, 'quickAccess')}</div>
        </div>
        <div className={styles.quickGrid}>
          {NEIGHBORHOODS.map(n => (
            <button
              key={n.id}
              className={styles.quickBtn}
              onClick={() => {
                const addr = `1234 Main St, ${n.name}, Houston, TX`
                setAddress(addr)
                runLookup(addr)
              }}
            >
              <div className={styles.quickBtnName}>{n.name}</div>
              <div className={styles.quickBtnPop}>Pop: {n.pop.toLocaleString()}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
