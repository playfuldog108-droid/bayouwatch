'use client'

import { useApp } from '@/app/context/AppContext'
import { t } from '@/app/lib/i18n'
import type { AlertEntry, Language } from '@/app/lib/types'
import styles from './RightPanel.module.css'

function AlertItem({ alert, lang }: { alert: AlertEntry; lang: Language }) {
  const severityKey = `alert${alert.severity.charAt(0).toUpperCase()}${alert.severity.slice(1)}` as 'alertCritical' | 'alertWarning' | 'alertInfo'
  return (
    <div className={`${styles.alertItem} ${styles[alert.severity]}`}>
      <div className={styles.alertMeta}>
        <span className={`${styles.alertSeverity} ${styles[alert.severity]}`}>
          ● {t(lang, severityKey)}
        </span>
        <span>{alert.time}</span>
      </div>
      <div className={styles.alertMessage}>{alert.message}</div>
      <div className={styles.alertLocation}>{alert.location}</div>
    </div>
  )
}

export function RightPanel() {
  const { alerts, currentLang } = useApp()

  return (
    <aside className={styles.rightPanel}>
      <div className={styles.rightHeader}>
        <div className={styles.rightTitle}>{t(currentLang, 'liveAlerts')}</div>
        <div className={styles.liveBadge}>
          <div className={styles.pulseDot} />
          <span>LIVE</span>
        </div>
      </div>
      <div className={styles.alertsList}>
        {alerts.length === 0 ? (
          <div className={styles.emptyState}>
            {t(currentLang, 'noAlerts')}<br />{t(currentLang, 'systemNormal')}
          </div>
        ) : (
          alerts.map(a => <AlertItem key={a.id} alert={a} lang={currentLang} />)
        )}
      </div>
    </aside>
  )
}
