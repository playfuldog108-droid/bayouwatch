export const revalidate = 300

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_KEY
  if (!apiKey) {
    return Response.json({ error: 'Weather API not configured' }, { status: 500 })
  }

  const url =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=29.7604&lon=-95.3698&units=imperial&appid=${apiKey}`

  let raw: Record<string, unknown>
  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) {
      return Response.json({ error: `OWM error ${res.status}` }, { status: 502 })
    }
    raw = await res.json() as Record<string, unknown>
  } catch {
    return Response.json({ error: 'Network error reaching OWM' }, { status: 502 })
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
