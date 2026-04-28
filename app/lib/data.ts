import type { Neighborhood, Sensor, HarveyPoint } from './types'

export const NEIGHBORHOODS: Neighborhood[] = [
  { id: 'kg', name: 'Kashmere Gardens', x: 540, y: 270, risk: 'high', pop: 12400 },
  { id: 'ah', name: 'Acres Homes',       x: 380, y: 220, risk: 'high', pop: 20600 },
  { id: 'fw', name: 'Fifth Ward',        x: 510, y: 330, risk: 'high', pop: 11500 },
  { id: 'gp', name: 'Greenspoint',       x: 470, y: 180, risk: 'high', pop: 35800 },
  { id: 'my', name: 'Meyerland',         x: 440, y: 430, risk: 'med',  pop: 23300 },
  { id: 'dt', name: 'Downtown',          x: 470, y: 350, risk: 'med',  pop: 18000 },
  { id: 'eh', name: 'East End',          x: 600, y: 380, risk: 'med',  pop: 27000 },
  { id: 'ws', name: 'West Houston',      x: 250, y: 350, risk: 'low',  pop: 45000 },
  { id: 'cl', name: 'Clear Lake',        x: 720, y: 470, risk: 'low',  pop: 30000 },
  { id: 'sg', name: 'Sugar Land',        x: 200, y: 450, risk: 'low',  pop: 118000 },
]

export const SENSOR_POSITIONS: [number, number][] = [
  [120,345],[180,335],[240,330],[300,335],[360,345],[420,360],[480,365],[540,360],[600,350],[660,345],[720,350],[780,350],[840,360],
  [150,260],[220,270],[290,275],[360,270],[430,268],[500,265],[570,265],[640,268],[710,275],[780,280],[850,290],
  [220,425],[290,435],[360,442],[430,445],[500,438],[570,432],[640,425],[720,420],[800,425],
  [350,200],[380,220],[540,270],[510,330],[470,180],[440,430],[600,380],[250,350],
  [580,210],[620,230],[680,250],[730,270],
]

export const SENSOR_NAMES: string[] = [
  'Memorial Park','Allen Pkwy','Sabine St','Smith St','Main St','Polk St','Lockwood','Wayside','610 East',
  'Eastex Fwy','Wallisville','I-10 Bridge','Beltway 8 East',
  'TC Jester','Pinemont','W 34th','Heights Blvd','Studemont','I-45 N','N Main','Hardy Toll','Aldine','I-45 NE','E Mt Houston',
  'Cullen Blvd','MLK Blvd','Scott St','Stella Link','S Braeswood','Buffalo Spdway','Kirby Dr','Westpark','Eldridge',
  'Barker Reservoir','Bear Creek','Antoine','W Little York','I-45 N at Aldine','S Post Oak','Brays Crossing','Hardy Yards',
  'Greens Rd','Aldine-Westfield','Lee Rd','Bush Airport',
]

export function makeInitialSensors(): Sensor[] {
  return SENSOR_POSITIONS.map((pos, i) => ({
    id: 'BW-' + String(i + 1).padStart(3, '0'),
    name: SENSOR_NAMES[i] ?? `Sensor ${i + 1}`,
    x: pos[0],
    y: pos[1],
    level: 35,
    threshold: 80,
  }))
}

export const INITIAL_CHART_HISTORY: number[] = Array.from({ length: 60 }, () => 35)

export const HARVEY_DATA: HarveyPoint[] = [
  { hour:0,   rainfall:5,  waterLevel:25 },
  { hour:6,   rainfall:15, waterLevel:30 },
  { hour:12,  rainfall:25, waterLevel:38 },
  { hour:18,  rainfall:35, waterLevel:48 },
  { hour:24,  rainfall:50, waterLevel:60 },
  { hour:30,  rainfall:70, waterLevel:75 },
  { hour:36,  rainfall:85, waterLevel:88 },
  { hour:42,  rainfall:95, waterLevel:95 },
  { hour:48,  rainfall:90, waterLevel:98 },
  { hour:54,  rainfall:80, waterLevel:96 },
  { hour:60,  rainfall:65, waterLevel:92 },
  { hour:66,  rainfall:50, waterLevel:85 },
  { hour:72,  rainfall:40, waterLevel:78 },
  { hour:78,  rainfall:35, waterLevel:72 },
  { hour:84,  rainfall:30, waterLevel:68 },
  { hour:90,  rainfall:25, waterLevel:62 },
  { hour:96,  rainfall:20, waterLevel:56 },
  { hour:102, rainfall:15, waterLevel:50 },
  { hour:108, rainfall:10, waterLevel:45 },
  { hour:114, rainfall:8,  waterLevel:40 },
  { hour:120, rainfall:5,  waterLevel:35 },
  { hour:126, rainfall:3,  waterLevel:30 },
  { hour:132, rainfall:2,  waterLevel:28 },
  { hour:144, rainfall:1,  waterLevel:25 },
]

export const HARVEY_TIMELINE: string[] = [
  'Aug 25, 06:00','Aug 25, 12:00','Aug 25, 18:00','Aug 26, 00:00',
  'Aug 26, 06:00','Aug 26, 12:00','Aug 26, 18:00','Aug 27, 00:00',
  'Aug 27, 06:00','Aug 27, 12:00','Aug 27, 18:00','Aug 28, 00:00',
  'Aug 28, 06:00','Aug 28, 12:00','Aug 28, 18:00','Aug 29, 00:00',
  'Aug 29, 06:00','Aug 29, 12:00','Aug 29, 18:00','Aug 30, 00:00',
  'Aug 30, 12:00','Aug 31, 00:00','Aug 31, 12:00','Sept 1',
]
