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
