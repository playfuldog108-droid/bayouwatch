import { GAUGE_CONFIG, BRAYS_BAYOU_SITE, normalizeStage } from '@/app/lib/gaugeConfig'

export const revalidate = 300

const SITES = Object.keys(GAUGE_CONFIG).join(',')

interface USGSValue {
  value: string
  qualifiers: string[]
  dateTime: string
}

interface USGSTimeSeries {
  sourceInfo: {
    siteName: string
    siteCode: Array<{ value: string }>
  }
  values: Array<{ value: USGSValue[] }>
}

interface USGSResponse {
  value: { timeSeries: USGSTimeSeries[] }
}

export interface GaugeReading {
  siteCode: string
  siteName: string
  stageFt: number | null
  level: number | null
  timestamp: string | null
}

export interface GaugeApiResponse {
  readings: GaugeReading[]
  braysBayouHistory: number[]
  fetchedAt: number
}

function parseLatest(ts: USGSTimeSeries): USGSValue | null {
  const vals = ts.values[0]?.value ?? []
  for (let i = vals.length - 1; i >= 0; i--) {
    if (vals[i]!.value !== '') return vals[i]!
  }
  return null
}

export async function GET() {
  try {
    const currentUrl =
      `https://waterservices.usgs.gov/nwis/iv/` +
      `?sites=${SITES}&parameterCd=00065&format=json&period=PT1H`
    const historyUrl =
      `https://waterservices.usgs.gov/nwis/iv/` +
      `?sites=${BRAYS_BAYOU_SITE}&parameterCd=00065&format=json&period=PT15H`

    const [currentRes, historyRes] = await Promise.all([
      fetch(currentUrl, { next: { revalidate: 300 } }),
      fetch(historyUrl, { next: { revalidate: 300 } }),
    ])

    if (!currentRes.ok || !historyRes.ok) {
      return Response.json({ error: 'USGS API error' }, { status: 502 })
    }

    const [currentData, historyData]: [USGSResponse, USGSResponse] = await Promise.all([
      currentRes.json(),
      historyRes.json(),
    ])

    const readings: GaugeReading[] = currentData.value.timeSeries.map(ts => {
      const siteCode = ts.sourceInfo.siteCode[0]?.value ?? ''
      const config = GAUGE_CONFIG[siteCode]
      const latest = parseLatest(ts)
      const stageFt = latest ? parseFloat(latest.value) : null

      return {
        siteCode,
        siteName: ts.sourceInfo.siteName,
        stageFt: stageFt !== null && !isNaN(stageFt) ? stageFt : null,
        level:
          stageFt !== null && !isNaN(stageFt) && config
            ? normalizeStage(stageFt, config)
            : null,
        timestamp: latest?.dateTime ?? null,
      }
    })

    const braysSeries = historyData.value.timeSeries[0]
    const braysConfig = GAUGE_CONFIG[BRAYS_BAYOU_SITE]!
    const rawHistory = braysSeries?.values[0]?.value ?? []

    const validHistory = rawHistory
      .filter(pt => pt.value !== '' && !isNaN(parseFloat(pt.value)))
      .slice(-60)
      .map(pt => normalizeStage(parseFloat(pt.value), braysConfig))

    while (validHistory.length < 60) {
      validHistory.unshift(validHistory[0] ?? 20)
    }

    return Response.json({
      readings,
      braysBayouHistory: validHistory,
      fetchedAt: Date.now(),
    } satisfies GaugeApiResponse)
  } catch (err) {
    console.error('[gauges] fetch error:', err)
    return Response.json(
      { error: 'Failed to fetch gauge data', detail: String(err) },
      { status: 502 }
    )
  }
}
