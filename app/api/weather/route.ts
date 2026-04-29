export const revalidate = 300

export async function GET() {
  const apiKey = process.env.OPENWEATHER_KEY
  console.log('[weather] OPENWEATHER_KEY present:', !!apiKey, '| length:', apiKey?.length ?? 0)
  if (!apiKey) {
    return Response.json({ error: 'Weather API not configured' }, { status: 500 })
  }

  const url =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=29.7604&lon=-95.3698&units=imperial&appid=${apiKey}`

  console.log('[weather] fetching OWM url (key redacted):', url.replace(apiKey, '<REDACTED>'))

  let raw: Record<string, unknown>
  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    console.log('[weather] OWM response status:', res.status, res.statusText)
    if (!res.ok) {
      const body = await res.text().catch(() => '(unreadable)')
      console.error('[weather] OWM error body:', body)
      return Response.json({ error: `OWM error ${res.status}`, detail: body }, { status: 502 })
    }
    raw = await res.json() as Record<string, unknown>
    console.log('[weather] OWM raw keys:', Object.keys(raw))
  } catch (err) {
    console.error('[weather] fetch threw:', err)
    return Response.json({ error: 'Network error reaching OWM', detail: String(err) }, { status: 502 })
  }

  const main = raw.main as Record<string, number>
  const wind = raw.wind as Record<string, number>
  const clouds = raw.clouds as Record<string, number>
  const rain = raw.rain as Record<string, number> | undefined
  const weatherArr = raw.weather as Array<{ description: string; icon: string }>

  return Response.json({
    temp:        Math.round(main.temp),
    feelsLike:   Math.round(main.feels_like),
    humidity:    main.humidity,
    description: weatherArr?.[0]?.description ?? '',
    icon:        weatherArr?.[0]?.icon ?? '',
    clouds:      clouds?.all ?? 0,
    rain1h:      rain?.['1h'] ?? 0,
    wind:        Math.round(wind?.speed ?? 0),
    fetchedAt:   Date.now(),
  })
}
