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

function getBayou(sensor: Sensor): string {
  if (sensor.y < 305) return 'White Oak Bayou'
  if (sensor.y < 395) return 'Buffalo Bayou'
  if (sensor.y < 460) return 'Brays Bayou'
  return 'Sims Bayou'
}

export function MapView({ active }: { active: boolean }) {
  const { sensors, currentLang } = useApp()
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const localTime = useClock()

  const handleSensorEnter = useCallback((sensor: Sensor, e: React.MouseEvent) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const sx = (sensor.x / 1000) * rect.width
    const sy = (sensor.y / 600) * rect.height
    setTooltip({ sensor, x: sx + 14, y: Math.max(8, sy - 90) })
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
            <linearGradient id="bayouGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="#003a8c" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#0066cc" stopOpacity={0.65} />
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

          {/* Background */}
          <rect width="1000" height="600" fill="url(#mapBg)" />
          <rect width="1000" height="600" fill="url(#grid)" />

          {/* City boundary */}
          <path
            d="M 100 300 Q 200 180, 350 200 Q 500 150, 650 200 Q 800 180, 900 300 Q 920 400, 850 480 Q 700 520, 500 500 Q 300 510, 180 470 Q 90 400, 100 300 Z"
            fill="#0a1a2e" stroke="#2a4f7a" strokeWidth="1" opacity={0.7}
          />

          {/* ── Highways ── */}

          {/* Beltway 8 (Sam Houston Tollway) */}
          <ellipse cx="490" cy="372" rx="368" ry="213"
            fill="none" stroke="#253a50" strokeWidth="2" strokeDasharray="8,5" opacity={0.5} />
          <rect x="110" y="334" width="52" height="14" rx="3" fill="#152030" stroke="#253a50" strokeWidth="0.8" opacity={0.85} />
          <text x="136" y="345" textAnchor="middle" fill="#4a7090" fontFamily="var(--mono)" fontSize="8" fontWeight="bold">Beltway 8</text>
          <rect x="828" y="334" width="52" height="14" rx="3" fill="#152030" stroke="#253a50" strokeWidth="0.8" opacity={0.85} />
          <text x="854" y="345" textAnchor="middle" fill="#4a7090" fontFamily="var(--mono)" fontSize="8" fontWeight="bold">Beltway 8</text>

          {/* Loop 610 */}
          <ellipse cx="488" cy="358" rx="198" ry="126"
            fill="none" stroke="#2e4a64" strokeWidth="1.8" strokeDasharray="5,4" opacity={0.6} />
          <rect x="278" y="345" width="44" height="14" rx="3" fill="#152030" stroke="#2e4a64" strokeWidth="0.8" opacity={0.85} />
          <text x="300" y="356" textAnchor="middle" fill="#5a8aaa" fontFamily="var(--mono)" fontSize="8" fontWeight="bold">Loop 610</text>
          <rect x="668" y="345" width="44" height="14" rx="3" fill="#152030" stroke="#2e4a64" strokeWidth="0.8" opacity={0.85} />
          <text x="690" y="356" textAnchor="middle" fill="#5a8aaa" fontFamily="var(--mono)" fontSize="8" fontWeight="bold">Loop 610</text>

          {/* I-10 (east-west through Houston) */}
          <path d="M 10,316 Q 200,313 400,315 Q 470,316 540,317 Q 700,314 990,311"
            stroke="#3a5570" strokeWidth="2.5" fill="none" strokeDasharray="10,4" opacity={0.55} />
          <rect x="20" y="304" width="30" height="14" rx="3" fill="#1a2e40" stroke="#3a5570" strokeWidth="0.8" />
          <text x="35" y="315" textAnchor="middle" fill="#5a90b8" fontFamily="var(--mono)" fontSize="8.5" fontWeight="bold">I-10</text>
          <rect x="950" y="299" width="30" height="14" rx="3" fill="#1a2e40" stroke="#3a5570" strokeWidth="0.8" />
          <text x="965" y="310" textAnchor="middle" fill="#5a90b8" fontFamily="var(--mono)" fontSize="8.5" fontWeight="bold">I-10</text>

          {/* I-45 North (north from downtown) */}
          <path d="M 474,90 L 474,314"
            stroke="#3a5570" strokeWidth="2.5" fill="none" strokeDasharray="10,4" opacity={0.5} />
          <rect x="458" y="93" width="30" height="14" rx="3" fill="#1a2e40" stroke="#3a5570" strokeWidth="0.8" />
          <text x="473" y="104" textAnchor="middle" fill="#5a90b8" fontFamily="var(--mono)" fontSize="8.5" fontWeight="bold">I-45</text>

          {/* I-45 South (Gulf Freeway toward Galveston, SE direction) */}
          <path d="M 476,320 Q 530,398 592,456 Q 650,510 718,558"
            stroke="#3a5570" strokeWidth="2" fill="none" strokeDasharray="10,4" opacity={0.4} />
          <rect x="692" y="544" width="40" height="14" rx="3" fill="#1a2e40" stroke="#3a5570" strokeWidth="0.8" opacity={0.85} />
          <text x="712" y="555" textAnchor="middle" fill="#5a90b8" fontFamily="var(--mono)" fontSize="8" fontWeight="bold">I-45 S</text>

          {/* ── Bayous ── */}

          {/* Buffalo Bayou — main east-west channel through downtown */}
          <path
            d="M 20,358 Q 70,354 120,348 Q 180,338 240,332 Q 300,336 360,346 Q 420,360 480,366 Q 540,362 600,352 Q 660,346 720,350 Q 780,350 840,358 Q 900,364 980,361"
            fill="none" stroke="url(#bayouGrad)" strokeWidth="8" opacity={0.7}
          />
          <path
            d="M 20,358 Q 70,354 120,348 Q 180,338 240,332 Q 300,336 360,346 Q 420,360 480,366 Q 540,362 600,352 Q 660,346 720,350 Q 780,350 840,358 Q 900,364 980,361"
            fill="none" stroke="#1a5fa8" strokeWidth="2" opacity={0.45}
          />

          {/* White Oak Bayou — northwest tributary merging into Buffalo */}
          <path
            d="M 55,192 Q 105,212 148,256 Q 185,276 222,270 Q 292,278 362,272 Q 432,266 502,265 Q 532,264 550,277 Q 522,302 492,322 Q 472,336 462,346"
            fill="none" stroke="url(#bayouGrad)" strokeWidth="6" opacity={0.65}
          />
          <path
            d="M 55,192 Q 105,212 148,256 Q 185,276 222,270 Q 292,278 362,272 Q 432,266 502,265 Q 532,264 550,277 Q 522,302 492,322 Q 472,336 462,346"
            fill="none" stroke="#1a5fa8" strokeWidth="1.5" opacity={0.4}
          />

          {/* Brays Bayou — south of downtown */}
          <path
            d="M 20,450 Q 90,452 220,430 Q 290,438 360,444 Q 430,447 500,440 Q 570,434 640,427 Q 720,422 800,428 Q 880,432 980,427"
            fill="none" stroke="url(#bayouGrad)" strokeWidth="6.5" opacity={0.68}
          />
          <path
            d="M 20,450 Q 90,452 220,430 Q 290,438 360,444 Q 430,447 500,440 Q 570,434 640,427 Q 720,422 800,428 Q 880,432 980,427"
            fill="none" stroke="#1a5fa8" strokeWidth="1.8" opacity={0.42}
          />

          {/* Greens Bayou — northeast Houston */}
          <path
            d="M 608,180 Q 648,214 674,252 Q 702,290 724,332 Q 750,370 792,384 Q 842,397 902,402"
            fill="none" stroke="url(#bayouGrad)" strokeWidth="4.5" opacity={0.55}
          />
          <path
            d="M 608,180 Q 648,214 674,252 Q 702,290 724,332 Q 750,370 792,384 Q 842,397 902,402"
            fill="none" stroke="#1a5fa8" strokeWidth="1.2" opacity={0.35}
          />

          {/* Sims Bayou — further south */}
          <path
            d="M 290,512 Q 370,498 448,494 Q 548,490 638,500 Q 720,508 820,506"
            fill="none" stroke="url(#bayouGrad)" strokeWidth="3.5" opacity={0.48}
          />
          <path
            d="M 290,512 Q 370,498 448,494 Q 548,490 638,500 Q 720,508 820,506"
            fill="none" stroke="#1a5fa8" strokeWidth="1" opacity={0.3}
          />

          {/* Bayou labels */}
          <text x="192" y="327" fill="#4a6889" fontFamily="var(--mono)" fontSize="9" fontStyle="italic" transform="rotate(-3,192,327)">Buffalo Bayou</text>
          <text x="238" y="260" fill="#4a6889" fontFamily="var(--mono)" fontSize="9" fontStyle="italic" transform="rotate(-2,238,260)">White Oak Bayou</text>
          <text x="418" y="454" fill="#4a6889" fontFamily="var(--mono)" fontSize="9" fontStyle="italic">Brays Bayou</text>
          <text x="670" y="268" fill="#3e5a70" fontFamily="var(--mono)" fontSize="8" fontStyle="italic" transform="rotate(52,670,268)">Greens Bayou</text>
          <text x="448" y="506" fill="#3e5a70" fontFamily="var(--mono)" fontSize="8" fontStyle="italic">Sims Bayou</text>

          {/* Neighborhoods */}
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

          {/* Sensors */}
          {sensors.map(s => {
            const color = s.level > 80 ? '#ff3860' : s.level > 60 ? '#ffb547' : '#00d97e'
            return (
              <g key={s.id}>
                {/* Pulsing ring for critical */}
                {s.level > 80 && (
                  <circle cx={s.x} cy={s.y} r={5} fill={color} opacity={0.3}>
                    <animate attributeName="r" from="5" to="20" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.55" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Outer ring for watch+ */}
                {s.level > 60 && (
                  <circle cx={s.x} cy={s.y} r={9}
                    fill="none" stroke={color} strokeWidth="1"
                    opacity={0.3}
                  />
                )}
                {/* Main sensor dot */}
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={5}
                  fill={color}
                  stroke="#050b14"
                  strokeWidth="1.5"
                  filter="url(#glow)"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => handleSensorEnter(s, e)}
                  onMouseLeave={handleSensorLeave}
                />
                {/* Inner detail dot */}
                <circle cx={s.x} cy={s.y} r={2} fill="#050b14" style={{ pointerEvents: 'none' }} />
              </g>
            )
          })}
        </svg>

        <div className={styles.mapOverlay}>
          <div>NETWORK STATUS</div>
          <div><strong>{sensors.length}</strong> sensors active</div>
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
            <div className={styles.sdId}>{tooltip.sensor.id}</div>
            <div className={styles.sdName}>{tooltip.sensor.name}</div>
            <div className={styles.sdRow}>
              <span>Bayou</span>
              <span style={{ color: 'var(--accent-cyan)', fontStyle: 'italic' }}>
                {getBayou(tooltip.sensor)}
              </span>
            </div>
            <div className={styles.sdRow}>
              <span>Water level</span>
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
                {tooltip.sensor.level > 80 ? '⚠ CRITICAL' : tooltip.sensor.level > 60 ? '◈ WATCH' : '✓ NORMAL'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
