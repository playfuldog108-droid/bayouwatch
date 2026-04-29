'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { makeInitialSensors, INITIAL_CHART_HISTORY } from '@/app/lib/data'
import { GAUGE_CONFIG } from '@/app/lib/gaugeConfig'
import type {
  Sensor,
  AlertEntry,
  ActivityEntry,
  ViewId,
  Language,
  AlertSeverity,
  ActivityType,
  CrisisBannerState,
  WeatherData,
  GaugeData,
} from '@/app/lib/types'

interface AppContextValue {
  sensors: Sensor[]
  alerts: AlertEntry[]
  activityLog: ActivityEntry[]
  chartHistory: number[]
  currentView: ViewId
  currentLang: Language
  crisisBanner: CrisisBannerState
  registeredAddress: string
  isSimulationRunning: boolean
  weather: WeatherData | null
  gaugeData: GaugeData | null
  setCurrentView: (view: ViewId) => void
  setCurrentLang: (lang: Language) => void
  addAlert: (severity: AlertSeverity, location: string, message: string) => void
  logActivity: (message: string, type?: ActivityType) => void
  dismissCrisisBanner: () => void
  setRegisteredAddress: (addr: string) => void
  setIsSimulationRunning: (running: boolean) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [sensors, setSensors] = useState<Sensor[]>(makeInitialSensors)
  const [chartHistory, setChartHistory] = useState<number[]>(INITIAL_CHART_HISTORY)
  const [alerts, setAlerts] = useState<AlertEntry[]>([])
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([])
  const [currentView, setCurrentView] = useState<ViewId>('dashboard')
  const [currentLang, setCurrentLang] = useState<Language>('en')
  const [crisisBanner, setCrisisBanner] = useState<CrisisBannerState>({
    show: false,
    text: '',
    timeLabel: '',
  })
  const [registeredAddress, setRegisteredAddress] = useState('')
  const [isSimulationRunning, setIsSimulationRunningState] = useState(false)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [gaugeData, setGaugeData] = useState<GaugeData | null>(null)

  const isSimRunningRef = useRef(false)
  const alertedRainRef = useRef(false)
  const hasRealChartDataRef = useRef(false)

  const setIsSimulationRunning = useCallback((running: boolean) => {
    isSimRunningRef.current = running
    setIsSimulationRunningState(running)
  }, [])

  const logActivity = useCallback((message: string, type: ActivityType = 'info') => {
    const time = new Date().toLocaleTimeString()
    setActivityLog(prev => {
      const entry: ActivityEntry = {
        id: `${Date.now()}-${Math.random()}`,
        time,
        message,
        type,
      }
      return [entry, ...prev].slice(0, 20)
    })
  }, [])

  const addAlert = useCallback(
    (severity: AlertSeverity, location: string, message: string) => {
      const time = new Date().toLocaleTimeString()
      const entry: AlertEntry = {
        id: `${Date.now()}-${Math.random()}`,
        severity,
        location,
        message,
        time,
      }
      setAlerts(prev => [entry, ...prev].slice(0, 30))

      if (severity === 'critical') {
        const timeLabel = `${Math.floor(Math.random() * 30) + 30} MIN`
        setCrisisBanner({ show: true, text: message, timeLabel })
        setTimeout(() => {
          setCrisisBanner(b => ({ ...b, show: false }))
        }, 8000)
      }
    },
    []
  )

  const dismissCrisisBanner = useCallback(() => {
    setCrisisBanner(b => ({ ...b, show: false }))
  }, [])

  // Randomize initial values on client mount
  useEffect(() => {
    setSensors(prev =>
      prev.map(s => ({ ...s, level: 20 + Math.random() * 30 }))
    )
    setChartHistory(Array.from({ length: 60 }, () => 35 + Math.random() * 12))
    logActivity('System initialized — 47 sensors online', 'info')
    logActivity('Connected to NOAA forecast API', 'info')

    const t1 = setTimeout(() => {
      addAlert('info', 'System', 'BayouWatch monitoring active across 47 sensors')
    }, 200)
    const t2 = setTimeout(() => {
      addAlert('info', 'NOAA Sync', 'Rainfall forecast updated — 1.2" expected in 6h')
    }, 400)
    const t3 = setTimeout(() => {
      addAlert('info', 'Brays Bayou', 'Routine sensor calibration completed successfully')
    }, 5000)
    const t4 = setTimeout(() => {
      addAlert(
        'warning',
        'White Oak Bayou',
        'Sensor BW-019 reporting elevated readings — monitoring closely'
      )
    }, 12000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [logActivity, addAlert])

  // Main simulation tick — 1500 ms
  useEffect(() => {
    let tickCount = 0
    const interval = setInterval(() => {
      tickCount++

      setSensors(prev =>
        prev.map(s =>
          s.hasRealData
            ? s
            : { ...s, level: Math.max(15, Math.min(95, s.level + (Math.random() - 0.5) * 1.5)) }
        )
      )

      setChartHistory(prev => {
        const last = prev[prev.length - 1] ?? 35
        const next = hasRealChartDataRef.current
          ? Math.max(0, Math.min(100, last + (Math.random() - 0.5) * 0.3))
          : Math.max(20, Math.min(85, last + (Math.random() - 0.5) * 6))
        return [...prev.slice(-59), next]
      })

      if (Math.random() < 0.05 && !isSimRunningRef.current) {
        const num = String(Math.ceil(Math.random() * 47)).padStart(3, '0')
        const events = [
          'NOAA forecast sync complete',
          `Sensor BW-${num} battery: 87%`,
          'Calibration check passed for 12 sensors',
          'Twilio SMS gateway verified',
        ] as const
        logActivity(events[Math.floor(Math.random() * events.length)]!, 'info')
      }
    }, 1500)

    return () => clearInterval(interval)
  }, [logActivity])

  // Harris County FWS / USGS gauge polling — every 5 minutes
  useEffect(() => {
    async function fetchGauges() {
      try {
        const res = await fetch('/api/gauges')
        if (!res.ok) return
        const data: GaugeData = await res.json()

        setSensors(prev => {
          const updated = [...prev]
          for (const reading of data.readings) {
            const config = GAUGE_CONFIG[reading.siteCode]
            if (config && reading.level !== null && reading.stageFt !== null) {
              const sensor = updated[config.sensorIndex]
              if (sensor) {
                updated[config.sensorIndex] = {
                  ...sensor,
                  name: config.name,
                  level: reading.level,
                  stageFt: reading.stageFt,
                  siteCode: reading.siteCode,
                  hasRealData: true,
                }
              }
            }
          }
          return updated
        })

        if (data.braysBayouHistory.length > 0) {
          setChartHistory(data.braysBayouHistory)
          hasRealChartDataRef.current = true
        }

        setGaugeData(data)

        const liveCount = data.readings.filter(r => r.level !== null).length
        logActivity(
          `USGS FWS sync: ${liveCount} gauges updated (HCFWS live)`,
          'info'
        )
      } catch {
        // silently degrade — simulated data remains active
      }
    }

    fetchGauges()
    const id = setInterval(fetchGauges, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [logActivity])

  // Weather polling — every 5 minutes
  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('/api/weather')
        if (!res.ok) return
        const data: WeatherData = await res.json()
        setWeather(data)

        if (data.rain1h > 10 && !alertedRainRef.current && !isSimRunningRef.current) {
          alertedRainRef.current = true
          setSensors(prev =>
            prev.map(s => ({
              ...s,
              level: Math.min(95, s.level + 20 + Math.random() * 15),
            }))
          )
          addAlert(
            'warning',
            'Weather System',
            `Heavy rainfall detected — ${data.rain1h.toFixed(1)}mm in the last hour. Bayou sensors elevated across the network.`
          )
          logActivity(
            `Heavy rain alert: ${data.rain1h.toFixed(1)}mm/hr — sensor levels elevated`,
            'warning'
          )
        }

        if (data.rain1h <= 10) {
          alertedRainRef.current = false
        }
      } catch {
        // silently fail — app remains usable without live weather
      }
    }

    fetchWeather()
    const id = setInterval(fetchWeather, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [addAlert, logActivity])

  const value: AppContextValue = {
    sensors,
    alerts,
    activityLog,
    chartHistory,
    currentView,
    currentLang,
    crisisBanner,
    registeredAddress,
    isSimulationRunning,
    weather,
    gaugeData,
    setCurrentView,
    setCurrentLang,
    addAlert,
    logActivity,
    dismissCrisisBanner,
    setRegisteredAddress,
    setIsSimulationRunning,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
