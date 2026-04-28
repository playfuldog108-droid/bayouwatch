'use client'

import { useState, useRef, useCallback } from 'react'
import { useClock } from '@/app/hooks/useClock'
import { useApp } from '@/app/context/AppContext'
import { t } from '@/app/lib/i18n'
import { NEIGHBORHOODS } from '@/app/lib/data'
import type { Sensor } from '@/app/lib/types'
import styles from './MapView.module.css'

interface TooltipState {
  sensor: Sensor
  x: number
  y: number
}

export function MapView({ active }: { active: boolean }) {
  const { sensors, currentLang } = useApp()
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const utcTime = useClock()

  const handleSensorEnter = useCallback((sensor: Sensor, e: React.MouseEvent) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const sx = (sensor.x / 1000) * rect.width
    const sy = (sensor.y / 600) * rect.height
    setTooltip({ sensor, x: sx + 12, y: Math.max(0, sy - 60) })
  }, [])

  const handleSensorLeave = useCallback(() => setTooltip(null), [])

  return (
    <div className={`${styles.view} ${active ? styles.active : ''}`}>
      <div className={styles.viewHeader}>
        <div>
          <h1 className={styles.viewTitle}>{t(currentLang, 'mapTitle')}</h1>
          <p className={styles.viewSubtitle}>{t(currentLang, 'mapSub')}</p>
        </div>
      </div>

      <div className={styles.mapContainer}>
        <svg
          ref={svgRef}
          className={styles.mapSvg}
          viewBox="0 0 1000 600"
        >
          <defs>
            <radialGradient id="mapBg" cx="50%" cy="40%">
              <stop offset="0%"   stopColor="#0c1a2e" />
              <stop offset="100%" stopColor="#050b14" />
            </radialGradient>
            <linearGradient id="bayou" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#003a8c" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#0066cc" stopOpacity={0.6} />
            </linearGradient>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1d3654" strokeWidth="0.5" opacity={0.3} />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="1000" height="600" fill="url(#mapBg)" />
          <rect width="1000" height="600" fill="url(#grid)" />

          <path
            d="M 100 300 Q 200 180, 350 200 Q 500 150, 650 200 Q 800 180, 900 300 Q 920 400, 850 480 Q 700 520, 500 500 Q 300 510, 180 470 Q 90 400, 100 300 Z"
            fill="#0a1a2e" stroke="#2a4f7a" strokeWidth="1" opacity={0.7}
          />

          <path d="M 80 350 Q 250 320, 400 360 Q 550 380, 700 350 Q 850 340, 920 380"
                fill="none" stroke="url(#bayou)" strokeWidth="6" opacity={0.7} />
          <path d="M 120 250 Q 300 280, 500 270 Q 700 260, 880 290"
                fill="none" stroke="url(#bayou)" strokeWidth="5" opacity={0.6} />
          <path d="M 200 420 Q 400 450, 600 430 Q 800 410, 900 440"
                fill="none" stroke="url(#bayou)" strokeWidth="4" opacity={0.5} />
          <path d="M 350 200 Q 380 350, 400 480"
                fill="none" stroke="url(#bayou)" strokeWidth="3" opacity={0.5} />
          <path d="M 600 200 Q 580 350, 560 470"
                fill="none" stroke="url(#bayou)" strokeWidth="3" opacity={0.5} />

          <text x="220" y="335" fill="#4a6889" fontFamily="var(--mono)" fontSize="9" fontStyle="italic">Buffalo Bayou</text>
          <text x="350" y="265" fill="#4a6889" fontFamily="var(--mono)" fontSize="9" fontStyle="italic">White Oak Bayou</text>
          <text x="450" y="445" fill="#4a6889" fontFamily="var(--mono)" fontSize="9" fontStyle="italic">Brays Bayou</text>

          {NEIGHBORHOODS.map(n => (
            <text
              key={n.id}
              x={n.x} y={n.y - 12}
              textAnchor="middle"
              fill="#8ba9c8"
              fontFamily="var(--body)"
              fontSize="10"
              fontWeight="600"
            >
              {n.name.toUpperCase()}
            </text>
          ))}

          {sensors.map(s => {
            const color = s.level > 80 ? '#ff3860' : s.level > 60 ? '#ffb547' : '#00d97e'
            return (
              <g key={s.id}>
                {s.level > 80 && (
                  <circle cx={s.x} cy={s.y} r={4} fill={color} opacity={0.3}>
                    <animate attributeName="r" from="4" to="14" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={4}
                  fill={color}
                  stroke="#050b14"
                  strokeWidth="1.5"
                  filter="url(#glow)"
                  style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                  onMouseEnter={e => handleSensorEnter(s, e)}
                  onMouseLeave={handleSensorLeave}
                />
              </g>
            )
          })}
        </svg>

        <div className={styles.mapOverlay}>
          <div>NETWORK STATUS</div>
          <div><strong>{sensors.length}</strong> sensors active</div>
          <div>Last sync: <strong>{utcTime}</strong></div>
        </div>

        <div className={styles.mapLegend}>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'var(--accent-green)' }} />
            Normal (&lt; 60%)
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'var(--accent-amber)' }} />
            Watch (60–80%)
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: 'var(--accent-red)' }} />
            Alert (&gt; 80%)
          </div>
        </div>

        {tooltip && (
          <div
            className={styles.sensorDetail}
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className={styles.sdId}>{tooltip.sensor.id}</div>
            <div className={styles.sdName}>{tooltip.sensor.name}</div>
            <div className={styles.sdRow}>
              <span>Water level</span>
              <span>{tooltip.sensor.level.toFixed(1)}%</span>
            </div>
            <div className={styles.sdRow}>
              <span>Threshold</span>
              <span>{tooltip.sensor.threshold}%</span>
            </div>
            <div className={styles.sdRow}>
              <span>Status</span>
              <span style={{
                color: tooltip.sensor.level > 80
                  ? 'var(--accent-red)'
                  : tooltip.sensor.level > 60
                  ? 'var(--accent-amber)'
                  : 'var(--accent-green)',
              }}>
                {tooltip.sensor.level > 80 ? 'CRITICAL' : tooltip.sensor.level > 60 ? 'WATCH' : 'NORMAL'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
