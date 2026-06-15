export interface GaugeConfig {
  sensorIndex: number
  name: string
  bayou: string
  baseLevel: number       // ft — water level that maps to 0%
  floodStage: number      // ft — NWS minor flood stage
  majorFloodStage: number // ft — maps to 100%
  lat: number             // GPS latitude
  lng: number             // GPS longitude
}

// Active USGS stream gauges in Harris County with flood thresholds from NWS/HCFWS.
// Sensor indices reference the positions array in data.ts.
export const GAUGE_CONFIG: Record<string, GaugeConfig> = {
  '08073600': {
    sensorIndex: 0,
    name: 'Buffalo Bayou at W Belt Dr',
    bayou: 'Buffalo Bayou',
    baseLevel: 25,
    floodStage: 60,
    majorFloodStage: 65,
    lat: 29.7587,
    lng: -95.5975,
  },
  '08073700': {
    sensorIndex: 1,
    name: 'Buffalo Bayou at Piney Point',
    bayou: 'Buffalo Bayou',
    baseLevel: 20,
    floodStage: 52,
    majorFloodStage: 60,
    lat: 29.7524,
    lng: -95.5133,
  },
  '08074250': {
    sensorIndex: 13,
    name: 'Brickhouse Gully at Costa Rica St',
    bayou: 'White Oak Bayou',
    baseLevel: 40,
    floodStage: 54,
    majorFloodStage: 58,
    lat: 29.6987,
    lng: -95.3654,
  },
  '08074500': {
    sensorIndex: 17,
    name: 'White Oak Bayou at Houston',
    bayou: 'White Oak Bayou',
    baseLevel: 0,
    floodStage: 32,
    majorFloodStage: 36,
    lat: 29.7810,
    lng: -95.3987,
  },
  '08075000': {
    sensorIndex: 28,
    name: 'Brays Bayou at Houston',
    bayou: 'Brays Bayou',
    baseLevel: 10,
    floodStage: 41,
    majorFloodStage: 43,
    lat: 29.7235,
    lng: -95.3973,
  },
  '08075500': {
    sensorIndex: 26,
    name: 'Sims Bayou at Houston',
    bayou: 'Sims Bayou',
    baseLevel: 0,
    floodStage: 26,
    majorFloodStage: 28,
    lat: 29.6821,
    lng: -95.3654,
  },
  '08076000': {
    sensorIndex: 41,
    name: 'Greens Bayou at Houston',
    bayou: 'Greens Bayou',
    baseLevel: 30,
    floodStage: 55,
    majorFloodStage: 59,
    lat: 29.8254,
    lng: -95.2540,
  },
  '08076700': {
    sensorIndex: 43,
    name: 'Greens Bayou at Ley Rd',
    bayou: 'Greens Bayou',
    baseLevel: 0,
    floodStage: 18,
    majorFloodStage: 24,
    lat: 29.8654,
    lng: -95.1810,
  },
}

export const BRAYS_BAYOU_SITE = '08075000'

export function normalizeStage(stageFt: number, config: GaugeConfig): number {
  const pct =
    ((stageFt - config.baseLevel) / (config.majorFloodStage - config.baseLevel)) * 100
  return Math.max(0, Math.min(100, pct))
}
