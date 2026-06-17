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

// Calibrated to Houston's Beltway 8 extents on the SVG viewBox (0 0 1000 600).
// Beltway 8 ellipse: cx=490 cy=372 rx=368 ry=213 ↔ ~29.57–29.89 N, ~95.08–95.73 W
const MAP_BOUNDS = { latN: 29.89, latS: 29.57, lngW: -95.73, lngE: -95.08 }
const SVG_BOUNDS = { xL: 122, xR: 858, yT: 159, yB: 585 }

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = SVG_BOUNDS.xL + ((lng - MAP_BOUNDS.lngW) / (MAP_BOUNDS.lngE - MAP_BOUNDS.lngW)) * (SVG_BOUNDS.xR - SVG_BOUNDS.xL)
  const y = SVG_BOUNDS.yT + ((MAP_BOUNDS.latN - lat) / (MAP_BOUNDS.latN - MAP_BOUNDS.latS)) * (SVG_BOUNDS.yB - SVG_BOUNDS.yT)
  return { x: Math.round(x), y: Math.round(y) }
}

export function MapView({ active }: { active: boolean }) {
  const { sensors, currentLang } = useApp()
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const localTime = useClock()

  const liveGauges = sensors.filter(s => s.hasRealData && s.lat != null && s.lng != null)

  const handleSensorEnter = useCallback((sensor: Sensor, svgX: number, svgY: number) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const sx = (svgX / 1000) * rect.width
    const sy = (svgY / 600) * rect.height
    setTooltip({ sensor, x: sx + 14, y: Math.max(8, sy - 90) })
  }, [])

  const handleSensorLeave = useCallback(() => setTooltip(null), [])

  return (
    <div className={`${styles.view} ${active ? styles.active : ''}`}>
      <div className={styles.mapContainer}>
        <svg
          ref={svgRef}
          className={styles.mapSvg}
          viewBox="0 0 1000 600"
        >
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect width="1000" height="600" fill="#000000" />
          <rect width="1000" height="600" fill="url(#grid)" />

          {/* City boundary — very faint */}
          <path
            d="M 100 300 Q 200 180, 350 200 Q 500 150, 650 200 Q 800 180, 900 300 Q 920 400, 850 480 Q 700 520, 500 500 Q 300 510, 180 470 Q 90 400, 100 300 Z"
            fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          />

          {/* Highways — barely visible */}
          <ellipse cx="490" cy="372" rx="368" ry="213"
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="6,5" />
          <ellipse cx="488" cy="358" rx="198" ry="126"
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="4,4" />
          <path d="M 10,316 Q 200,313 400,315 Q 470,316 540,317 Q 700,314 990,311"
            stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none" />
          <path d="M 474,90 L 474,314"
            stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none" />
          <path d="M 476,320 Q 530,398 592,456 Q 650,510 718,558"
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />

          {/* Highway labels */}
          <text x="136" y="326" textAnchor="middle" fill="rgba(255,255,255,0.18)" fontFamily="var(--mono)" fontSize="7">BELTWAY 8</text>
          <text x="300" y="348" textAnchor="middle" fill="rgba(255,255,255,0.18)" fontFamily="var(--mono)" fontSize="7">610</text>
          <text x="35" y="310" textAnchor="middle" fill="rgba(255,255,255,0.18)" fontFamily="var(--mono)" fontSize="7">I-10</text>
          <text x="473" y="104" textAnchor="middle" fill="rgba(255,255,255,0.18)" fontFamily="var(--mono)" fontSize="7">I-45</text>

          {/* Bayous — subtle blue-gray */}
          <path d="M 20,358 Q 70,354 120,348 Q 180,338 240,332 Q 300,336 360,346 Q 420,360 480,366 Q 540,362 600,352 Q 660,346 720,350 Q 780,350 840,358 Q 900,364 980,361"
            fill="none" stroke="rgba(40,100,180,0.25)" strokeWidth="4" />
          <path d="M 55,192 Q 105,212 148,256 Q 185,276 222,270 Q 292,278 362,272 Q 432,266 502,265 Q 532,264 550,277 Q 522,302 492,322 Q 472,336 462,346"
            fill="none" stroke="rgba(40,100,180,0.2)" strokeWidth="3" />
          <path d="M 20,450 Q 90,452 220,430 Q 290,438 360,444 Q 430,447 500,440 Q 570,434 640,427 Q 720,422 800,428 Q 880,432 980,427"
            fill="none" stroke="rgba(40,100,180,0.22)" strokeWidth="3.5" />
          <path d="M 608,180 Q 648,214 674,252 Q 702,290 724,332 Q 750,370 792,384 Q 842,397 902,402"
            fill="none" stroke="rgba(40,100,180,0.16)" strokeWidth="2.5" />
          <path d="M 290,512 Q 370,498 448,494 Q 548,490 638,500 Q 720,508 820,506"
            fill="none" stroke="rgba(40,100,180,0.14)" strokeWidth="2" />

          {/* Bayou labels */}
          <text x="192" y="325" fill="rgba(255,255,255,0.15)" fontFamily="var(--mono)" fontSize="8" fontStyle="italic" transform="rotate(-3,192,325)">Buffalo Bayou</text>
          <text x="238" y="258" fill="rgba(255,255,255,0.15)" fontFamily="var(--mono)" fontSize="8" fontStyle="italic" transform="rotate(-2,238,258)">White Oak Bayou</text>
          <text x="418" y="452" fill="rgba(255,255,255,0.15)" fontFamily="var(--mono)" fontSize="8" fontStyle="italic">Brays Bayou</text>
          <text x="670" y="266" fill="rgba(255,255,255,0.1)" fontFamily="var(--mono)" fontSize="7" fontStyle="italic" transform="rotate(52,670,266)">Greens Bayou</text>
          <text x="448" y="504" fill="rgba(255,255,255,0.1)" fontFamily="var(--mono)" fontSize="7" fontStyle="italic">Sims Bayou</text>

          {/* Neighborhoods */}
          {NEIGHBORHOODS.map(n => (
            <text
              key={n.id}
              x={n.x} y={n.y - 12}
              textAnchor="middle"
              fill="rgba(255,255,255,0.2)"
              fontFamily="var(--mono)"
              fontSize="9"
              letterSpacing="1"
            >
              {n.name.toUpperCase()}
            </text>
          ))}

          {/* Live USGS/Harris County gauges at real GPS coordinates */}
          {liveGauges.map(s => {
            const { x, y } = latLngToSvg(s.lat!, s.lng!)
            const color = s.level > 80 ? '#ef4444' : s.level > 60 ? '#f59e0b' : '#22c55e'
            return (
              <g key={s.id}>
                {/* Pulsing ring for critical */}
                {s.level > 80 && (
                  <circle cx={x} cy={y} r={5} fill={color} opacity={0.25}>
                    <animate attributeName="r" from="5" to="22" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.4" to="0" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Subtle glow ring */}
                <circle cx={x} cy={y} r={10}
                  fill={color} opacity={0.08} />
                {/* Main gauge dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={5}
                  fill={color}
                  stroke="#000000"
                  strokeWidth="1.5"
                  filter="url(#glow)"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => handleSensorEnter(s, x, y)}
                  onMouseLeave={handleSensorLeave}
                />
              </g>
            )
          })}
        </svg>

        <div className={styles.mapOverlay}>
          <div>NETWORK STATUS</div>
          <div><strong>{liveGauges.length}</strong> gauges live</div>
          <div>Last sync: <strong>{localTime}</strong></div>
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
            <div className={styles.sdName}>{tooltip.sensor.name}</div>
            <div className={styles.sdRow}>
              <span>Waterway</span>
              <span style={{ color: 'var(--accent-cyan)', fontStyle: 'italic' }}>
                {tooltip.sensor.bayou ?? '—'}
              </span>
            </div>
            {tooltip.sensor.stageFt != null && (
              <div className={styles.sdRow}>
                <span>Stage</span>
                <span>{tooltip.sensor.stageFt.toFixed(2)} ft</span>
              </div>
            )}
            <div className={styles.sdRow}>
              <span>Flood capacity</span>
              <span>{tooltip.sensor.level.toFixed(1)}%</span>
            </div>
            <div className={styles.sdLevelBar}>
              <div
                className={styles.sdLevelFill}
                style={{
                  width: `${tooltip.sensor.level}%`,
                  background: tooltip.sensor.level > 80
                    ? 'var(--accent-red)'
                    : tooltip.sensor.level > 60
                    ? 'var(--accent-amber)'
                    : 'var(--accent-green)',
                }}
              />
            </div>
            <div className={styles.sdRow}>
              <span>USGS site</span>
              <span style={{ color: 'var(--accent-cyan)' }}>{tooltip.sensor.siteCode ?? '—'}</span>
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
                {tooltip.sensor.level > 80 ? '⚠ CRITICAL' : tooltip.sensor.level > 60 ? '◈ WATCH' : '✓ NORMAL'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
