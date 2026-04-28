'use client'

import { useApp } from '@/app/context/AppContext'
import { t } from '@/app/lib/i18n'
import type { AlertEntry } from '@/app/lib/types'
import styles from './RightPanel.module.css'

function AlertItem({ alert }: { alert: AlertEntry }) {
  return (
    <div className={`${styles.alertItem} ${styles[alert.severity]}`}>
      <div className={styles.alertMeta}>
        <span className={`${styles.alertSeverity} ${styles[alert.severity]}`}>
          ● {alert.severity}
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
            No active alerts.<br />System monitoring normally.
          </div>
        ) : (
          alerts.map(a => <AlertItem key={a.id} alert={a} />)
        )}
      </div>
    </aside>
  )
}
