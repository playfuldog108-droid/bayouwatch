'use client'

import { useState } from 'react'
import { useApp } from '@/app/context/AppContext'
import { t } from '@/app/lib/i18n'
import { NEIGHBORHOODS } from '@/app/lib/data'
import { FloodMap, type SensorPin } from './FloodMap'
import styles from './LookupView.module.css'

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

// Real lat/lng for each active USGS/Harris County FWS gauge
const GAUGE_LOCATIONS: Record<string, { lat: number; lng: number; sensorIndex: number; name: string; bayou: string }> = {
  '08073600': { lat: 29.7483, lng: -95.5372, sensorIndex: 0,  name: 'Buffalo Bayou at West Belt Dr', bayou: 'Buffalo Bayou' },
  '08073700': { lat: 29.7603, lng: -95.4847, sensorIndex: 1,  name: 'Buffalo Bayou at Piney Point',  bayou: 'Buffalo Bayou' },
  '08074250': { lat: 29.7725, lng: -95.3894, sensorIndex: 13, name: 'Brickhouse Gully',               bayou: 'White Oak Bayou' },
  '08074500': { lat: 29.7794, lng: -95.4000, sensorIndex: 17, name: 'White Oak Bayou at Houston',     bayou: 'White Oak Bayou' },
  '08075000': { lat: 29.7189, lng: -95.3886, sensorIndex: 28, name: 'Brays Bayou at Houston',         bayou: 'Brays Bayou' },
  '08075500': { lat: 29.6905, lng: -95.3536, sensorIndex: 26, name: 'Sims Bayou at Houston',          bayou: 'Sims Bayou' },
  '08076000': { lat: 29.7689, lng: -95.2831, sensorIndex: 41, name: 'Greens Bayou at Houston',        bayou: 'Greens Bayou' },
  '08076700': { lat: 29.8008, lng: -95.2100, sensorIndex: 43, name: 'Greens Bayou at Ley Rd',         bayou: 'Greens Bayou' },
}

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface LookupResult {
  status: 'safe' | 'watch' | 'alert'
  neighborhood: string
  formattedAddress: string
  lat: number
  lng: number
  sensorName: string
  bayou: string
  sensorLevel: number
  stageFt?: number
  distanceMiles: number
  siteCode: string
  isLive: boolean
  nearbyPins: SensorPin[]
}

export function LookupView({ active }: { active: boolean }) {
  const { sensors, currentLang, setRegisteredAddress } = useApp()
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LookupResult | null>(null)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [subscribeState, setSubscribeState] = useState<'idle' | 'entering' | 'done'>('idle')

  async function runLookup(addr: string) {
    if (!addr.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setSubscribeState('idle')
    setPhone('')
    setPhoneError(null)

    try {
      console.log('[LookupView] MAPS_KEY:', MAPS_KEY ? `${MAPS_KEY.slice(0, 8)}...` : 'UNDEFINED — restart dev server')
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addr)}&key=${MAPS_KEY}`
      console.log('[LookupView] Geocoding URL:', url)
      const res = await fetch(url)
      const data = await res.json()
      console.log('[LookupView] Geocoding response status:', data.status, '| error_message:', data.error_message ?? 'none')

      if (data.status !== 'OK' || !data.results?.length) {
        setError('Address not found. Please enter a valid Houston, TX address.')
        return
      }

      const geocodeResult = data.results[0]
      const { lat, lng } = geocodeResult.geometry.location as { lat: number; lng: number }
      const formattedAddress: string = geocodeResult.formatted_address

      const isHouston =
        formattedAddress.includes('Houston, TX') ||
        formattedAddress.includes('Houston, Texas')

      if (!isHouston) {
        setError("That address isn't in Houston, TX. Please enter a Houston address.")
        return
      }

      // Extract neighborhood label from Google components
      const components = geocodeResult.address_components as Array<{
        long_name: string
        types: string[]
      }>
      const neighborhoodComp = components.find(c => c.types.includes('neighborhood'))
      const sublocalityComp = components.find(c => c.types.includes('sublocality_level_1'))
      const neighborhood = neighborhoodComp?.long_name ?? sublocalityComp?.long_name ?? 'Houston'

      // Sort all gauges by distance, take nearest 4
      const sorted = Object.entries(GAUGE_LOCATIONS)
        .map(([code, coords]) => ({
          code,
          coords,
          dist: haversineMiles(lat, lng, coords.lat, coords.lng),
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 4)

      const nearbyPins: SensorPin[] = sorted.map(({ code, coords, dist }) => {
        const gauge = GAUGE_LOCATIONS[code]!
        const sensor = sensors.find(s => s.siteCode === code) ?? sensors[gauge.sensorIndex]
        const level = sensor?.level ?? 35
        return {
          lat: coords.lat,
          lng: coords.lng,
          name: gauge.name,
          bayou: gauge.bayou,
          siteCode: code,
          level,
          stageFt: sensor?.stageFt,
          status: level > 80 ? 'alert' : level > 60 ? 'watch' : 'safe',
          distanceMiles: dist,
        }
      })

      // Primary sensor is the nearest one
      const primary = nearbyPins[0]!
      const status = primary.status

      setResult({
        status,
        neighborhood,
        formattedAddress,
        lat,
        lng,
        sensorName: primary.name,
        bayou: primary.bayou,
        sensorLevel: primary.level,
        stageFt: primary.stageFt,
        distanceMiles: primary.distanceMiles,
        siteCode: primary.siteCode,
        isLive: sensors.find(s => s.siteCode === primary.siteCode)?.hasRealData ?? false,
        nearbyPins,
      })
    } catch {
      setError('Failed to validate address. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSubscribe() {
    if (subscribeState === 'idle') {
      setSubscribeState('entering')
      return
    }
    if (subscribeState === 'entering') {
      const digits = phone.replace(/\D/g, '')
      if (digits.length < 10) {
        setPhoneError('Please enter a valid 10-digit phone number.')
        return
      }
      setPhoneError(null)
      localStorage.setItem('bw_registered_address', result!.formattedAddress)
      localStorage.setItem('bw_registered_phone', phone)
      setRegisteredAddress(result!.formattedAddress)
      setSubscribeState('done')
    }
  }

  const subscribeLabel =
    subscribeState === 'entering' ? 'Confirm Subscription' : 'Subscribe to Alerts'

  const subscribeClass =
    result?.status === 'alert'
      ? styles.buttonSecondary
      : result?.status === 'watch'
      ? styles.buttonAmber
      : styles.buttonSecondary

  return (
    <div className={`${styles.view} ${active ? styles.active : ''}`}>
      <div className={styles.viewHeader}>
        <div>
          <h1 className={styles.viewTitle}>{t(currentLang, 'lookupTitle')}</h1>
          <p className={styles.viewSubtitle}>{t(currentLang, 'lookupSub')}</p>
        </div>
      </div>

      <div className={styles.lookupCard}>
        <label className={styles.inputLabel}>{t(currentLang, 'enterAddress')}</label>
        <input
          type="text"
          className={styles.input}
          placeholder="e.g., 4200 Lockwood Dr, Houston, TX"
          value={address}
          onChange={e => setAddress(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && runLookup(address)}
        />
        <button className={styles.button} onClick={() => runLookup(address)} disabled={loading}>
          {loading ? 'Validating...' : t(currentLang, 'checkRisk')}
        </button>

        {error && <div className={styles.errorBox}>{error}</div>}

        {result && (
          <>
            <div className={styles.resultBox}>
              <div className={`${styles.resultStatus} ${styles[result.status]}`}>
                {result.status === 'alert'
                  ? '⚠ FLOOD ALERT'
                  : result.status === 'watch'
                  ? '◐ WATCH'
                  : '✓ SAFE'}
              </div>
              <p className={styles.resultDetail}>
                <strong>{result.neighborhood}</strong> — nearest sensor:{' '}
                <strong>{result.sensorName}</strong> ({result.distanceMiles.toFixed(1)} mi away)
                {result.isLive && <span className={styles.liveBadge}> LIVE</span>}
              </p>
              <p className={styles.resultDetail}>
                {result.bayou} is at{' '}
                <strong
                  style={{
                    color:
                      result.status === 'alert'
                        ? 'var(--accent-red)'
                        : result.status === 'watch'
                        ? 'var(--accent-amber)'
                        : 'var(--accent-green)',
                  }}
                >
                  {result.sensorLevel.toFixed(0)}% capacity
                </strong>
                {result.stageFt !== undefined && ` (${result.stageFt.toFixed(1)} ft)`}
                {result.status === 'alert' && ' — Flooding likely within 30–60 minutes.'}
                {result.status === 'watch' && ' — Monitor conditions closely.'}
                {result.status === 'safe' && ' — Normal water levels.'}
              </p>

              {subscribeState === 'done' ? (
                <div className={styles.subscribeSuccess}>
                  ✓ Subscribed! Flood alerts for <strong>{result.neighborhood}</strong> will
                  be sent to {phone}.
                </div>
              ) : (
                <div className={styles.resultActions}>
                  {subscribeState === 'entering' && (
                    <>
                      <input
                        type="tel"
                        className={`${styles.input} ${styles.phoneInput}`}
                        placeholder="Phone number (e.g., 713-555-0100)"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                        autoFocus
                      />
                      {phoneError && <div className={styles.errorBox}>{phoneError}</div>}
                    </>
                  )}
                  <div className={styles.actionGrid}>
                    {result.status === 'alert' && (
                      <button className={`${styles.button} ${styles.buttonDanger}`}>
                        View Evacuation Routes
                      </button>
                    )}
                    <button
                      className={`${styles.button} ${subscribeClass}`}
                      onClick={handleSubscribe}
                    >
                      {subscribeLabel}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <FloodMap
              lat={result.lat}
              lng={result.lng}
              formattedAddress={result.formattedAddress}
              sensorPins={result.nearbyPins}
            />
          </>
        )}
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>{t(currentLang, 'quickAccess')}</div>
        </div>
        <div className={styles.quickGrid}>
          {NEIGHBORHOODS.map(n => (
            <button
              key={n.id}
              className={styles.quickBtn}
              onClick={() => {
                const addr = `${n.name}, Houston, TX`
                setAddress(addr)
                runLookup(addr)
              }}
            >
              <div className={styles.quickBtnName}>{n.name}</div>
              <div className={styles.quickBtnPop}>Pop: {n.pop.toLocaleString()}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
