'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/app/context/AppContext'
import { t } from '@/app/lib/i18n'
import styles from './SettingsView.module.css'

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
      onClick={onChange}
    />
  )
}

export function SettingsView({ active }: { active: boolean }) {
  const { currentLang, registeredAddress } = useApp()
  const [sms, setSms]     = useState(true)
  const [push, setPush]   = useState(true)
  const [email, setEmail] = useState(false)
  const [watch, setWatch] = useState(true)
  const [critical, setCritical] = useState(false)
  const [registeredPhone, setRegisteredPhone] = useState('')

  useEffect(() => {
    const phone = localStorage.getItem('bw_registered_phone') ?? ''
    setRegisteredPhone(phone)
  }, [active])

  return (
    <div className={`${styles.view} ${active ? styles.active : ''}`}>
      <div className={styles.viewHeader}>
        <div>
          <h1 className={styles.viewTitle}>{t(currentLang, 'settingsTitle')}</h1>
          <p className={styles.viewSubtitle}>{t(currentLang, 'settingsSub')}</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeading}>Notifications</div>
        <div className={styles.settingRow}>
          <div>
            <div className={styles.settingLabel}>{t(currentLang, 'smsAlerts')}</div>
            <div className={styles.settingDesc}>{t(currentLang, 'smsAlertsDesc')}</div>
          </div>
          <Toggle on={sms} onChange={() => setSms(v => !v)} />
        </div>
        <div className={styles.settingRow}>
          <div>
            <div className={styles.settingLabel}>{t(currentLang, 'pushAlerts')}</div>
            <div className={styles.settingDesc}>{t(currentLang, 'pushAlertsDesc')}</div>
          </div>
          <Toggle on={push} onChange={() => setPush(v => !v)} />
        </div>
        <div className={styles.settingRow}>
          <div>
            <div className={styles.settingLabel}>{t(currentLang, 'emailAlerts')}</div>
            <div className={styles.settingDesc}>{t(currentLang, 'emailAlertsDesc')}</div>
          </div>
          <Toggle on={email} onChange={() => setEmail(v => !v)} />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeading}>Alert Thresholds</div>
        <div className={styles.settingRow}>
          <div>
            <div className={styles.settingLabel}>{t(currentLang, 'watchAlerts')}</div>
            <div className={styles.settingDesc}>{t(currentLang, 'watchAlertsDesc')}</div>
          </div>
          <Toggle on={watch} onChange={() => setWatch(v => !v)} />
        </div>
        <div className={styles.settingRow}>
          <div>
            <div className={styles.settingLabel}>{t(currentLang, 'criticalOnly')}</div>
            <div className={styles.settingDesc}>{t(currentLang, 'criticalOnlyDesc')}</div>
          </div>
          <Toggle on={critical} onChange={() => setCritical(v => !v)} />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeading}>Account</div>
        <div className={styles.settingRow}>
          <div>
            <div className={styles.settingLabel}>Phone Number</div>
            <div className={styles.settingDesc}>
              {registeredPhone || 'Not set — subscribe via Check My Address'}
            </div>
          </div>
          <button className={styles.editBtn}>Edit</button>
        </div>
        <div className={styles.settingRow}>
          <div>
            <div className={styles.settingLabel}>Registered Address</div>
            <div className={styles.settingDesc}>
              {registeredAddress || 'Not set — use Check My Address to register'}
            </div>
          </div>
          <button className={styles.editBtn}>Update</button>
        </div>
      </div>
    </div>
  )
}
