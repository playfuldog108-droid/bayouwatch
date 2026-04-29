'use client'

import { useApp } from '@/app/context/AppContext'
import { t } from '@/app/lib/i18n'
import styles from './DashboardView.module.css'

function buildChartPath(history: number[], w: number, h: number) {
  if (history.length < 2) return { line: '', area: '' }
  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * w
    const y = h - (v / 100) * h
    return `${x},${y}`
  })
  const line = 'M ' + points.join(' L ')
  const area = line + ` L ${w},${h} L 0,${h} Z`
  return { line, area }
}

export function DashboardView({ active }: { active: boolean }) {
  const { sensors, activityLog, chartHistory, currentLang, weather, gaugeData } = useApp()

  const atRisk = sensors.filter(s => s.level > 80).length
  const atRiskClass = atRisk > 5 ? styles.cardAlert : atRisk > 2 ? styles.cardWarn : styles.cardOk
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
  const rainfallClass = rain1h !== null && rain1h > 10
    ? styles.cardAlert
    : rain1h !== null && rain1h > 2
    ? styles.cardWarn
    : styles.cardOk

  const { line, area } = buildChartPath(chartHistory, 600, 200)

  return (
    <div className={`${styles.view} ${active ? styles.active : ''}`}>
      <div className={styles.viewHeader}>
        <div>
          <h1 className={styles.viewTitle}>{t(currentLang, 'dashboardTitle')}</h1>
          <p className={styles.viewSubtitle}>{t(currentLang, 'dashboardSub')}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.cardOk}`}>
          <div className={styles.statLabel}>{t(currentLang, 'activeSensors')}</div>
          <div className={styles.statValue}>47</div>
          <div className={styles.statTrend}>
            <span className={styles.pulseDotGreen} />
            All operational
          </div>
        </div>
        <div className={`${styles.statCard} ${atRiskClass}`}>
          <div className={styles.statLabel}>{t(currentLang, 'atRisk')}</div>
          <div className={styles.statValue}>{atRisk}</div>
          <div className={`${styles.statTrend} ${styles.trendDown}`}>↓ Within normal range</div>
        </div>
        <div className={`${styles.statCard} ${rainfallClass}`}>
          <div className={styles.statLabel}>{t(currentLang, 'rainfall')}</div>
          <div className={styles.statValue}>
            {rain1h !== null ? `${rain1h.toFixed(1)}mm` : '···'}
          </div>
          <div className={`${styles.statTrend} ${rain1h !== null && rain1h > 0 ? styles.trendUp : ''}`}>
            {rain1h === null
              ? 'Loading live data...'
              : rain1h > 0
              ? `↑ ${rain1h.toFixed(1)}mm past hour · OWM live`
              : 'No rain · OWM live'}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t(currentLang, 'reach')}</div>
          <div className={styles.statValue}>142K</div>
          <div className={styles.statTrend}>↑ Active subscribers</div>
        </div>
      </div>

      <div className={styles.dashRow}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>{t(currentLang, 'waterLevels')}</div>
              {braysReading?.stageFt != null && (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Brays Bayou @ Main St — {braysReading.stageFt.toFixed(2)} ft stage
                </div>
              )}
            </div>
            <div className={styles.liveBadge}>
              {gaugeData ? `● FWS LIVE (${liveGaugeCount})` : '● LIVE'}
            </div>
          </div>
          <div className={styles.chart}>
            <svg className={styles.chartSvg} viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#00e5ff" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <line className={styles.thresholdLine} x1="0" y1="60" x2="600" y2="60" />
              <text x="595" y="55" textAnchor="end" fill="#ff3860" fontFamily="var(--mono)" fontSize="9">FLOOD THRESHOLD</text>
              <path d={area} fill="url(#chartGrad)" opacity={0.4} />
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

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>{t(currentLang, 'sensorStatus')}</div>
            {liveGaugeCount > 0 && (
              <div className={styles.liveBadge}>● USGS ({liveGaugeCount})</div>
            )}
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
                  <div className={styles.sensorDot} style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                  <div className={styles.sensorId}>{s.id}</div>
                  <div className={styles.sensorName}>
                    {s.name}
                    {s.hasRealData && (
                      <span style={{ fontSize: '9px', color: 'var(--accent-cyan)', marginLeft: '4px' }}>USGS</span>
                    )}
                  </div>
                  <div className={styles.sensorLevel} style={{ color }}>
                    {s.level.toFixed(0)}%
                    {s.stageFt != null && (
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                        {s.stageFt.toFixed(1)}ft
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>{t(currentLang, 'recentActivity')}</div>
        </div>
        <div className={styles.activityLog}>
          {activityLog.map(entry => {
            const color = entry.type === 'critical'
              ? 'var(--accent-red)'
              : entry.type === 'warning'
              ? 'var(--accent-amber)'
              : 'var(--text-secondary)'
            return (
              <div key={entry.id} className={styles.activityRow}>
                <span className={styles.activityTime}>[{entry.time}]</span>
                {' '}
                <span style={{ color }}>{entry.message}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
