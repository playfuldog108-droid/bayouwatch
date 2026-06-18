'use client'

import { useApp } from '@/app/context/AppContext'
import { t } from '@/app/lib/i18n'
import styles from './DashboardView.module.css'

function buildChartPath(history: number[], w: number, h: number) {
  if (history.length < 2) return { line: '' }
  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * w
    const y = h - (v / 100) * h
    return `${x},${y}`
  })
  return { line: 'M ' + points.join(' L ') }
}

export function DashboardView({ active }: { active: boolean }) {
  const { sensors, activityLog, chartHistory, currentLang, weather, gaugeData } = useApp()

  const atRisk = sensors.filter(s => s.level > 80).length
  const sorted = [...sensors]
    .sort((a, b) => {
      if (a.hasRealData && !b.hasRealData) return -1
      if (!a.hasRealData && b.hasRealData) return 1
      return b.level - a.level
    })
    .slice(0, 10)

  const braysReading = gaugeData?.readings.find(r => r.siteCode === '08075000') ?? null
  const liveGaugeCount = gaugeData?.readings.filter(r => r.level !== null).length ?? 0

  const rain1h = weather?.rain1h ?? null
  const { line } = buildChartPath(chartHistory, 600, 180)

  return (
    <div className={`${styles.view} ${active ? styles.active : ''}`}>

      {/* KPI strip */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t(currentLang, 'activeSensors')}</div>
          <div className={styles.statValue}>47</div>
          <div className={styles.statTrend}>
            <span className={styles.pulseDotGreen} />
            All operational
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t(currentLang, 'atRisk')}</div>
          <div className={`${styles.statValue} ${atRisk > 5 ? styles.numRed : atRisk > 2 ? styles.numAmber : ''}`}>{atRisk}</div>
          <div className={styles.statTrend}>Streets above 80%</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t(currentLang, 'rainfall')}</div>
          <div className={`${styles.statValue} ${rain1h !== null && rain1h > 10 ? styles.numRed : rain1h !== null && rain1h > 2 ? styles.numAmber : ''}`}>
            {rain1h !== null ? `${rain1h.toFixed(1)}` : '—'}
          </div>
          <div className={styles.statTrend}>
            {rain1h === null ? 'Loading…' : rain1h > 0 ? `mm/hr · live` : 'mm/hr · no rain'}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t(currentLang, 'reach')}</div>
          <div className={styles.statValue}>142K</div>
          <div className={styles.statTrend}>Active subscribers</div>
        </div>
      </div>

      {/* Water level chart */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>{t(currentLang, 'waterLevels')}</span>
          {braysReading?.stageFt != null && (
            <span className={styles.sectionMeta}>
              Brays Bayou @ Main St — {braysReading.stageFt.toFixed(2)} ft stage
            </span>
          )}
          <span className={styles.liveBadge}>
            {gaugeData ? `FWS LIVE · ${liveGaugeCount} gauges` : 'LIVE'}
          </span>
        </div>
        <div className={styles.chart}>
          <svg className={styles.chartSvg} viewBox="0 0 600 180" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="45"  x2="600" y2="45"  stroke="#222222" strokeWidth="1" />
            <line x1="0" y1="90"  x2="600" y2="90"  stroke="#222222" strokeWidth="1" />
            <line x1="0" y1="135" x2="600" y2="135" stroke="#222222" strokeWidth="1" />
            {/* Y-axis labels */}
            <text x="4" y="42"  fill="#888888" fontFamily="var(--mono)" fontSize="9">75%</text>
            <text x="4" y="87"  fill="#888888" fontFamily="var(--mono)" fontSize="9">50%</text>
            <text x="4" y="132" fill="#888888" fontFamily="var(--mono)" fontSize="9">25%</text>
            {/* Flood threshold */}
            <line x1="0" y1="54" x2="600" y2="54" stroke="#FF3333" strokeWidth="1" strokeDasharray="4 6" opacity={0.5} />
            <text x="598" y="50" textAnchor="end" fill="#FF3333" fontFamily="var(--mono)" fontSize="8" opacity={0.7}>FLOOD</text>
            {/* Data line */}
            <path className={styles.chartLine} d={line} />
          </svg>
        </div>
        <div className={styles.chartLabels}>
          {gaugeData
            ? <><span>-15h</span><span>-11h</span><span>-7h</span><span>-3h</span><span>NOW</span></>
            : <><span>-60 MIN</span><span>-45</span><span>-30</span><span>-15</span><span>NOW</span></>
          }
        </div>
      </div>

      {/* Sensor + Activity row */}
      <div className={styles.dashRow}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>{t(currentLang, 'sensorStatus')}</span>
            {liveGaugeCount > 0 && <span className={styles.liveBadge}>USGS · {liveGaugeCount} live</span>}
          </div>
          <div className={styles.sensorList}>
            {sorted.map(s => {
              const color = s.level > 80
                ? 'var(--accent-red)'
                : s.level > 60
                ? 'var(--accent-amber)'
                : 'var(--accent-green)'
              return (
                <div key={s.id} className={styles.sensorRow}>
                  <div className={styles.sensorDot} style={{ background: color }} />
                  <div className={styles.sensorName}>
                    {s.name}
                    {s.hasRealData
                      ? <span className={styles.usgsTag}>USGS</span>
                      : <span className={styles.simTag}>SIM</span>
                    }
                  </div>
                  <div className={styles.sensorLevel} style={{ color }}>
                    {s.level.toFixed(0)}%
                    {s.stageFt != null && (
                      <span className={styles.stageFt}>{s.stageFt.toFixed(1)}ft</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>{t(currentLang, 'recentActivity')}</span>
          </div>
          <div className={styles.activityLog}>
            {activityLog.map(entry => {
              const color = entry.type === 'critical'
                ? 'var(--accent-red)'
                : entry.type === 'warning'
                ? 'var(--accent-amber)'
                : '#888888'
              return (
                <div key={entry.id} className={styles.activityRow}>
                  <span className={styles.activityTime}>{entry.time}</span>
                  <span style={{ color }}>{entry.message}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

    </div>
  )
}
