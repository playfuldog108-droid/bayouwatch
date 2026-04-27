'use client'

import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/app/context/AppContext'
import { t } from '@/app/lib/i18n'
import { HARVEY_DATA, HARVEY_TIMELINE } from '@/app/lib/data'
import styles from './SimulationView.module.css'

interface SimAlert { id: string; severity: 'critical' | 'warning'; label: string; message: string }
interface SimStats { lives: string; warning: string; streets: string }

function buildSimPath(data: number[], w: number, h: number) {
  if (data.length < 2) return { line: '', area: '' }
  const points = data.map((v, i) => {
    const x = (i / Math.max(1, HARVEY_DATA.length - 1)) * w
    const y = h - (v / 100) * h
    return `${x},${y}`
  })
  const line = 'M ' + points.join(' L ')
  const area = line + ` L ${(data.length - 1) / Math.max(1, HARVEY_DATA.length - 1) * w},${h} L 0,${h} Z`
  return { line, area }
}

export function SimulationView({ active }: { active: boolean }) {
  const { currentLang, setIsSimulationRunning } = useApp()
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(0)
  const [chartData, setChartData] = useState<number[]>([])
  const [simAlerts, setSimAlerts] = useState<SimAlert[]>([])
  const [stats, setStats] = useState<SimStats | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stepRef = useRef(0)
  const t60Ref = useRef(false)
  const t80Ref = useRef(false)
  const t95Ref = useRef(false)

  function addSimAlert(severity: 'critical' | 'warning', label: string, message: string) {
    const id = `${Date.now()}-${Math.random()}`
    setSimAlerts(prev => [{ id, severity, label, message }, ...prev])
  }

  function advanceStep(currentStep: number) {
    if (currentStep >= HARVEY_DATA.length) {
      stopSim()
      return
    }
    const data = HARVEY_DATA[currentStep]!
    const time = HARVEY_TIMELINE[currentStep] ?? ''
    const level = data.waterLevel

    setChartData(prev => [...prev, level])
    setStep(currentStep + 1)
    stepRef.current = currentStep + 1

    if (level >= 60 && level < 80 && !t60Ref.current) {
      addSimAlert('warning', 'WATCH ALERT',
        `${time}: Water levels approaching critical at Brays, Buffalo, and White Oak Bayous. Residents advised to monitor.`)
      t60Ref.current = true
    }
    if (level >= 80 && level < 95 && !t80Ref.current) {
      addSimAlert('critical', 'FLOOD ALERT',
        `${time}: CRITICAL — flooding imminent in Kashmere Gardens, Acres Homes, Fifth Ward. SMS sent to 142,000 residents in 5 languages.`)
      t80Ref.current = true
      setStats({ lives: '~52', warning: '47', streets: '1,847' })
    }
    if (level >= 95 && !t95Ref.current) {
      addSimAlert('critical', 'CATASTROPHIC FLOODING',
        `${time}: All-clear for non-essential travel. Residents in pilot zones evacuated 47 minutes ahead of street flooding.`)
      t95Ref.current = true
    }
  }

  function startSim() {
    if (stepRef.current >= HARVEY_DATA.length) return
    setRunning(true)
    setIsSimulationRunning(true)
    const currentStep = stepRef.current
    let s = currentStep
    intervalRef.current = setInterval(() => {
      if (s >= HARVEY_DATA.length) {
        stopSim()
        return
      }
      advanceStep(s)
      s++
    }, 800)
  }

  function stopSim() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    setIsSimulationRunning(false)
  }

  function toggle() {
    if (running) stopSim()
    else startSim()
  }

  function reset() {
    stopSim()
    stepRef.current = 0
    t60Ref.current = false
    t80Ref.current = false
    t95Ref.current = false
    setStep(0)
    setChartData([])
    setSimAlerts([])
    setStats(null)
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const timeLabel = step > 0 && step <= HARVEY_TIMELINE.length
    ? `${HARVEY_TIMELINE[step - 1]} CST`
    : 'Aug 25, 2017 — 06:00 CST'

  const progress = (step / HARVEY_DATA.length) * 100
  const { line, area } = buildSimPath(chartData, 600, 200)

  return (
    <div className={`${styles.view} ${active ? styles.active : ''}`}>
      <div className={styles.viewHeader}>
        <div>
          <h1 className={styles.viewTitle}>{t(currentLang, 'simTitle')}</h1>
          <p className={styles.viewSubtitle}>{t(currentLang, 'simSub')}</p>
        </div>
      </div>

      <div className={styles.simControls}>
        <button className={styles.simBtn} onClick={toggle} disabled={step >= HARVEY_DATA.length && !running}>
          {running ? '❚❚ Pause' : step === 0 ? t(currentLang, 'runSim') : '▶ Resume'}
        </button>
        <button className={`${styles.simBtn} ${styles.simBtnDanger}`} onClick={reset}>
          {t(currentLang, 'reset')}
        </button>
        <div className={styles.simTime}>{timeLabel}</div>
      </div>

      <div className={styles.dashRow}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>{t(currentLang, 'rainfallSim')}</div>
            <div className={styles.panelTitle} style={{ color: running ? 'var(--accent-green)' : 'var(--text-dim)' }}>
              {running ? '● RUNNING' : 'PAUSED'}
            </div>
          </div>
          <div className={styles.chart}>
            <svg className={styles.chartSvg} viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#ff3860" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#ff3860" stopOpacity={0} />
                </linearGradient>
              </defs>
              <line className={styles.thresholdLine} x1="0" y1="40" x2="600" y2="40" />
              <text x="595" y="35" textAnchor="end" fill="#ff3860" fontFamily="var(--mono)" fontSize="9">CRITICAL</text>
              <path d={area} fill="url(#simGrad)" opacity={0.4} />
              <path d={line} stroke="#ff3860" strokeWidth="2" fill="none" style={{ filter: 'drop-shadow(0 0 4px #ff3860)' }} />
            </svg>
          </div>
          <div className={styles.simProgress}>
            <div className={styles.simProgressFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.chartLabels}>
            <span>AUG 25</span><span>AUG 27</span><span>AUG 29</span><span>AUG 31</span>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>{t(currentLang, 'alertsTriggered')}</div>
          </div>
          <div className={styles.simAlertLog}>
            {simAlerts.map(a => (
              <div key={a.id} className={`${styles.alertItem} ${styles[a.severity]}`}>
                <div className={styles.alertMeta}>
                  <span className={`${styles.alertSeverity} ${styles[a.severity]}`}>● {a.label}</span>
                </div>
                <div className={styles.alertMessage}>{a.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`${styles.panel} ${styles.impactPanel}`}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>{t(currentLang, 'impactStats')}</div>
        </div>
        <div className={styles.impactGrid}>
          <div>
            <div className={styles.impactLabel}>With BayouWatch</div>
            <div className={`${styles.impactValue} ${styles.green}`}>{stats?.lives ?? '--'}</div>
            <div className={styles.impactDesc}>lives potentially saved</div>
          </div>
          <div>
            <div className={styles.impactLabel}>Avg Warning</div>
            <div className={`${styles.impactValue} ${styles.cyan}`}>{stats?.warning ?? '--'}</div>
            <div className={styles.impactDesc}>minutes ahead</div>
          </div>
          <div>
            <div className={styles.impactLabel}>Streets Notified</div>
            <div className={`${styles.impactValue} ${styles.amber}`}>{stats?.streets ?? '--'}</div>
            <div className={styles.impactDesc}>in advance of flooding</div>
          </div>
          <div>
            <div className={styles.impactLabel}>Languages</div>
            <div className={styles.impactValue}>5</div>
            <div className={styles.impactDesc}>simultaneous broadcast</div>
          </div>
        </div>
      </div>
    </div>
  )
}
