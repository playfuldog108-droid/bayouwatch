export type ViewId = 'dashboard' | 'map' | 'lookup' | 'simulation' | 'settings' | 'about'
export type Language = 'en' | 'es' | 'vi' | 'zh' | 'ar'
export type AlertSeverity = 'critical' | 'warning' | 'info'
export type ActivityType = 'critical' | 'warning' | 'info'

export interface Sensor {
  id: string
  name: string
  x: number
  y: number
  level: number
  threshold: number
  stageFt?: number   // real USGS stage reading in feet
  siteCode?: string  // USGS site code when backed by real data
  hasRealData?: boolean
}

export interface GaugeReading {
  siteCode: string
  siteName: string
  stageFt: number | null
  level: number | null
  timestamp: string | null
}

export interface GaugeData {
  readings: GaugeReading[]
  braysBayouHistory: number[]
  fetchedAt: number
}

export interface Neighborhood {
  id: string
  name: string
  x: number
  y: number
  risk: 'high' | 'med' | 'low'
  pop: number
}

export interface AlertEntry {
  id: string
  severity: AlertSeverity
  location: string
  message: string
  time: string
}

export interface ActivityEntry {
  id: string
  time: string
  message: string
  type: ActivityType
}

export interface CrisisBannerState {
  show: boolean
  text: string
  timeLabel: string
}

export interface HarveyPoint {
  hour: number
  rainfall: number
  waterLevel: number
}

export interface WeatherData {
  temp: number        // °F
  feelsLike: number   // °F
  humidity: number    // %
  description: string
  icon: string
  clouds: number      // %
  rain1h: number      // mm
  wind: number        // mph
  fetchedAt: number   // ms epoch
}
